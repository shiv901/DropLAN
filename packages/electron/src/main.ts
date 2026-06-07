/**
 * Electron Main Process
 * Manages application lifecycle, QR generation, and IPC
 *
 * Architecture: The Express server runs as a separate process (packages/server).
 * Electron discovers its port and exposes server info to the React UI via IPC.
 */

import { app, BrowserWindow, ipcMain } from 'electron';
import { join } from 'path';
import { networkInterfaces, hostname } from 'os';
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
/*  Window                                                              */
/* ------------------------------------------------------------------ */

function createWindow(): void {
  mainWindow = new BrowserWindow({
    width: 1100,
    height: 720,
    minWidth: 800,
    minHeight: 580,
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      contextIsolation: true,
      sandbox: true,
      nodeIntegration: false,
      webSecurity: true,
      preload: join(__dirname, 'preload.js'),
    },
  });

  const devUrl = process.env['VITE_DEV_SERVER_URL'];
  if (devUrl) {
    mainWindow.loadURL(devUrl);
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(join(__dirname, '../client/dist/index.html'));
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
    const qrDataUrl = await QRCode.toDataURL(lanUrl, {
      width: 200,
      margin: 2,
      color: { dark: '#ffffff', light: '#00000000' },
    });
    return {
      port: SERVER_PORT,
      lanUrl,
      qrDataUrl,
      hostname: hostname(),
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
}

/* ------------------------------------------------------------------ */
/*  App lifecycle                                                        */
/* ------------------------------------------------------------------ */

function setupEventHandlers(): void {
  app.on('ready', () => {
    setupIpcHandlers();
    createWindow();
  });

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (mainWindow === null) {
      createWindow();
    }
  });
}

setupEventHandlers();

export { mainWindow };
