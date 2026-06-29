/**
 * Electron Main Process
 * Manages application lifecycle, QR generation, and IPC
 *
 * Architecture: The Express server runs as a separate process (packages/server).
 * Electron discovers its port and exposes server info to the React UI via IPC.
 */

import { app, BrowserWindow, ipcMain, utilityProcess, shell, Notification as ElectronNotification } from 'electron';
import { join } from 'path';
import { get as httpGet } from 'http';
import { networkInterfaces, hostname, homedir } from 'os';
import QRCode from 'qrcode';
import type { ServerStatusMessage, ServerInfo } from '@droplan/types';

let mainWindow: BrowserWindow | null = null;

/** Port where the Express server is running (set via env or default 3000) */
const SERVER_PORT = parseInt(process.env['SERVER_PORT'] ?? '3000', 10);

/* ------------------------------------------------------------------ */
/*  LAN IP detection                                                    */
/* ------------------------------------------------------------------ */

/**
 * Find the first non-loopback IPv4 address — what other devices use to reach this machine
 */
function getLanIp(): string {
  const nets = networkInterfaces();
  for (const ifaces of Object.values(nets)) {
    if (!ifaces) continue;
    for (const iface of ifaces) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return '127.0.0.1';
}

const lanIp = getLanIp();
const lanUrl = `http://${lanIp}:${SERVER_PORT}`;

/* ------------------------------------------------------------------ */
/*  Vite readiness check (dev mode only)                                */
/* ------------------------------------------------------------------ */

/**
 * Poll a URL until it responds successfully.
 * Uses Node's built-in http module (always available in Electron main process),
 * not global fetch which may be unavailable or behave differently.
 */
async function waitForUrl(url: string, timeoutMs = 30_000): Promise<void> {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    const ready = await new Promise<boolean>((resolve) => {
      const req = httpGet(url, () => { resolve(true); });
      req.on('error', () => resolve(false));
      req.setTimeout(1000, () => { req.destroy(); resolve(false); });
    });
    if (ready) return;
    await new Promise<void>((resolve) => setTimeout(resolve, 300));
  }
}

/** Fetch the session PIN from the local server, retrying until the server is ready */
async function fetchSessionCode(): Promise<string> {
  const maxAttempts = 20; // up to 10 s (20 × 500 ms)

  const tryOnce = (): Promise<string> =>
    new Promise((resolve) => {
      // Use 127.0.0.1 explicitly — 'localhost' on macOS resolves to ::1 (IPv6)
      // but the server binds to 0.0.0.0 (IPv4 only), causing ECONNREFUSED.
      const req = httpGet(`http://127.0.0.1:${SERVER_PORT}/api/session-code`, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer) => { data += chunk.toString(); });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data) as { code?: string };
            // Validate: must be a 4-digit numeric string
            resolve(/^\d{4}$/.test(parsed.code ?? '') ? (parsed.code as string) : '');
          } catch {
            resolve('');
          }
        });
      });
      req.on('error', () => resolve(''));
      req.setTimeout(800, () => { req.destroy(); resolve(''); });
    });

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const code = await tryOnce();
    if (code) return code;
    // Wait before retrying (server may not be ready yet)
    await new Promise<void>((r) => setTimeout(r, 500));
  }

  return '0000'; // unreachable in normal operation
}

/* ------------------------------------------------------------------ */
/*  Window                                                              */
/* ------------------------------------------------------------------ */

async function createWindow(): Promise<void> {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 580,
    titleBarStyle: 'hiddenInset',
    // Position macOS traffic lights so they sit neatly in the 48px titlebar
    // and don't overlap the header content (which has 80px left padding).
    trafficLightPosition: { x: 16, y: 16 },
    webPreferences: {
      contextIsolation: true,
      // sandbox:false is required so the preload's require('./security') resolves correctly.
      // Security is maintained by contextIsolation:true + nodeIntegration:false.
      sandbox: false,
      nodeIntegration: false,
      webSecurity: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  // In dev: load Vite dev server. In production: load from extraResources.
  const devUrl = process.env['VITE_DEV_SERVER_URL'];
  if (devUrl) {
    await waitForUrl(devUrl);
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    // extraResources puts the client build at Resources/client/
    const clientIndex = app.isPackaged
      ? join(process.resourcesPath, 'client', 'index.html')
      : join(__dirname, '..', 'client', 'dist', 'index.html');
    void mainWindow.loadFile(clientIndex);
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/* ------------------------------------------------------------------ */
/*  IPC handlers                                                        */
/* ------------------------------------------------------------------ */

function setupIpcHandlers(): void {
  // Legacy: server status
  ipcMain.handle('server:status', async (): Promise<ServerStatusMessage> => {
    return {
      port: SERVER_PORT,
      bindAddress: '0.0.0.0',
      ready: true,
      pid: process.pid,
    };
  });

  // Server info including QR code as data URL
  ipcMain.handle('app:getServerInfo', async (): Promise<ServerInfo> => {
    const sessionCode = await fetchSessionCode();
    // QR URL includes the PIN so scanning auto-authenticates the phone
    const qrUrl = `${lanUrl}?c=${sessionCode}`;
    const qrDataUrl = await QRCode.toDataURL(qrUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#ffffff', light: '#00000000' },
    });
    const mdnsUrl = `http://${hostname()}.local:${SERVER_PORT}`;
    return {
      port: SERVER_PORT,
      lanUrl,          // clean URL shown in sidebar (without PIN)
      qrDataUrl,       // QR encodes lanUrl + ?c=PIN
      hostname: hostname(),
      sessionCode,     // 4-digit PIN shown in QR panel
      mdnsUrl,
    };
  });

  ipcMain.handle('app:quit', () => {
    app.quit();
  });

  ipcMain.handle('app:getVersion', () => {
    return app.getVersion();
  });

  ipcMain.handle('app:openDevTools', () => {
    if (mainWindow?.webContents) {
      mainWindow.webContents.toggleDevTools();
    }
  });

  // Open a specific file with its default application (Preview, Photos, etc.)
  ipcMain.handle('app:revealFile', (_event, filePath: string) => {
    void shell.openPath(filePath);
  });

  // Open the DropLAN downloads folder in Finder
  ipcMain.handle('app:openDownloadFolder', () => {
    void shell.openPath(join(homedir(), 'Downloads', 'DropLAN'));
  });

  // Show a native macOS notification (called by renderer on file:received)
  ipcMain.handle('app:notify', (_event, { title, body }: { title: string; body: string }) => {
    if (ElectronNotification.isSupported()) {
      new ElectronNotification({ title, body, silent: false }).show();
    }
  });

  // Update the Dock icon badge (file count). Empty string clears the badge.
  ipcMain.handle('app:setDockBadge', (_event, label: string) => {
    app.dock?.setBadge(label);
  });
}

/* ------------------------------------------------------------------ */
/*  Production server                                                    */
/* ------------------------------------------------------------------ */

/**
 * In production (packaged app), fork the Express server as an Electron
 * utility process. utilityProcess runs with Electron's built-in Node.js
 * and supports ESM — no external `node` binary required.
 */
async function startProductionServer(): Promise<void> {
  // In a packaged .app, the server is bundled as an extraResource at Resources/server/
  // In dev (this function is only called in production mode, but guarding anyway):
  const serverMain = app.isPackaged
    ? join(process.resourcesPath, 'server', 'main.js')
    : join(__dirname, '..', 'server', 'main.js');

  const proc = utilityProcess.fork(serverMain, [], {
    env: { ...process.env, PORT: String(SERVER_PORT) },
    stdio: 'pipe',
  });

  proc.stdout?.on('data', (d: Buffer) => process.stdout.write(d));
  proc.stderr?.on('data', (d: Buffer) => process.stderr.write(d));

  // Wait for the server to accept connections before opening the window
  await waitForUrl(`http://localhost:${SERVER_PORT}/api/health`);

  app.on('before-quit', () => {
    proc.kill();
  });
}

/* ------------------------------------------------------------------ */
/*  App lifecycle                                                        */
/* ------------------------------------------------------------------ */

function setupEventHandlers(): void {
  app.on('ready', () => {
    setupIpcHandlers();
    const startup = async () => {
      // In production (no Vite URL), start the Express server via utilityProcess
      if (!process.env['VITE_DEV_SERVER_URL']) {
        await startProductionServer();
      }
      await createWindow();
    };
    startup().catch((err: unknown) => {
      console.error('[electron] Startup failed:', err);
    });
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow().catch((err: unknown) => {
        console.error('[electron] Failed to recreate window:', err);
      });
    }
  });
}

setupEventHandlers();

export { mainWindow };
