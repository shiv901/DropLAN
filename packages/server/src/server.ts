import express, { type Express, type Request, type Response } from 'express';
import { createServer, type Server as HttpServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { randomUUID } from 'crypto';
import { Bonjour } from 'bonjour-service';
import { config } from './config.js';
import { logger } from './logger.js';
import { createUploadRouter, ensureUploadDir, UPLOAD_DIR, setUploadDir } from './routes/upload.js';
import { seedFromDisk, watchUploadDir, changeWatchDir } from './store/fileStore.js';
import { createFilesRouter } from './routes/files.js';
import { createInfoRouter } from './routes/info.js';
import {
  SESSION_CODE,
  isValidCode,
  createSession,
  getSessionFromCookie,
  isValidSession,
  getDeviceIdFromCookie,
} from './session.js';
import { requireAuth } from './middleware/requireAuth.js';
import {
  registerDevice,
  removeDeviceBySocket,
  listDevices,
  getDeviceCount,
} from './store/deviceStore.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/** Set an HttpOnly session cookie + optionally a persistent device ID cookie */
function setSessionCookies(res: Response, sessionToken: string, deviceId: string): void {
  res.setHeader('Set-Cookie', [
    `droplan_sess=${sessionToken}; HttpOnly; SameSite=Strict; Path=/`,
    `droplan_device=${deviceId}; SameSite=Strict; Path=/; Max-Age=31536000`,
  ]);
}

/**
 * Initialize Express server with all routes and Socket.IO
 */
export function createApp(io: SocketIOServer, httpServer: HttpServer): Express {
  const app = express();

  // Ensure upload directory exists, seed from disk, then watch for external changes
  ensureUploadDir();
  seedFromDisk(UPLOAD_DIR);
  watchUploadDir(UPLOAD_DIR, io); // live-sync Finder/AirDrop drops without restart

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS for local network access
  app.use((req: Request, res: Response, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Accept-Ranges', 'bytes');
    if (req.method === 'OPTIONS') { res.sendStatus(200); } else { next(); }
  });

  // ── Public endpoints (no auth required) ──────────────────────────────────

  // Health check — used by Electron to poll until server is ready
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Session code — localhost only (Electron main fetches this to display PIN)
  app.get('/api/session-code', (req: Request, res: Response) => {
    const isLocal = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    if (!isLocal) { res.status(403).json({ error: 'Forbidden' }); return; }
    res.json({ code: SESSION_CODE });
  });

  // PIN authentication — phone submits 4-digit code
  app.post('/api/auth', (req: Request, res: Response) => {
    const { code } = req.body as { code?: string };
    if (!code || !isValidCode(code)) {
      res.status(401).json({ error: 'Invalid code' });
      return;
    }
    const sessionToken = createSession();
    const deviceId = getDeviceIdFromCookie(req.headers.cookie) ?? randomUUID();
    setSessionCookies(res, sessionToken, deviceId);
    res.json({ ok: true });
  });

  // Status endpoint
  app.get('/api/status', (_req: Request, res: Response) => {
    res.json({ status: 'running', port: config.server.port, version: '0.1.0' });
  });

  // ── Protected API routes (require session cookie for non-localhost) ───────

  // Apply requireAuth to all /api routes that aren't already handled above
  app.use('/api', (req: Request, res: Response, next) => {
    // Exempt already-handled public paths
    const publicPaths = ['/health', '/session-code', '/auth', '/status'];
    if (publicPaths.some(p => req.path === p)) return next();
    requireAuth(req, res, next);
  });

  app.use('/api', createUploadRouter(io));
  app.use('/api', createFilesRouter());
  app.use('/api', createInfoRouter());

  // Connected devices list — Electron only (localhost-only via requireAuth)
  app.get('/api/devices', (_req: Request, res: Response) => {
    res.json({ devices: listDevices() });
  });

  // Live folder change — Electron calls this when user changes download folder in Settings.
  // Localhost-only. Updates upload dir + reseeds file list + rewatches without restart.
  app.post('/api/admin/set-download-folder', (req: Request, res: Response) => {
    const isLocal = req.ip === '127.0.0.1' || req.ip === '::1' || req.ip === '::ffff:127.0.0.1';
    if (!isLocal) { res.status(403).json({ error: 'Forbidden' }); return; }

    const { folder } = req.body as { folder?: string };
    if (!folder || typeof folder !== 'string') {
      res.status(400).json({ error: 'folder is required' });
      return;
    }

    setUploadDir(folder);
    changeWatchDir(folder, io);
    res.json({ ok: true, folder });
    logger.info(`Download folder changed to: ${folder}`);
  });

  // Graceful shutdown
  app.post('/api/shutdown', (_req: Request, res: Response) => {
    res.json({ ok: true });
    logger.info('Shutdown requested — stopping server gracefully');
    io.emit('server:stopping', {});
    setTimeout(() => {
      httpServer.close(() => {
        logger.info('HTTP server closed');
        process.exit(0);
      });
    }, 800);
  });

  // ── Browser UI routing ────────────────────────────────────────────────────

  const uploadPagePath = join(__dirname, 'browser-ui', 'index.html');
  const authPagePath   = join(__dirname, 'browser-ui', 'auth.html');

  app.get('/', (req: Request, res: Response) => {
    // Auto-auth: phone opened QR code URL which includes ?c=PIN
    const code = req.query['c'] as string | undefined;
    if (code && isValidCode(code)) {
      const sessionToken = createSession();
      const deviceId = getDeviceIdFromCookie(req.headers.cookie) ?? randomUUID();
      setSessionCookies(res, sessionToken, deviceId);
      // Redirect to strip the ?c= from the URL (cleaner address bar + avoids re-auth on reload)
      res.redirect('/');
      return;
    }

    // Returning device with a valid session → show upload page
    const sessionToken = getSessionFromCookie(req.headers.cookie);
    if (sessionToken && isValidSession(sessionToken)) {
      res.sendFile(uploadPagePath);
    } else {
      // No session → show PIN entry page
      res.sendFile(authPagePath);
    }
  });

  return app;
}

/**
 * Start the server and return HTTP server + Socket.IO instance.
 *
 * Correct setup order:
 *   1. Create Express app (needs io for routes, but io needs server — solved below)
 *   2. Create HTTP server with a placeholder handler
 *   3. Create Socket.IO on top of HTTP server
 *   4. Build Express app (now io exists) and hand it to the HTTP server
 *
 * Why NOT `server.on('request', app)`:
 *   Socket.IO's polling transport uses regular HTTP GET/POST requests to /socket.io/.
 *   When both Socket.IO and Express are attached to the same server via `server.on('request', ...)`
 *   both handlers fire for polling requests → Express tries to set headers on an already-sent
 *   response → ERR_HTTP_HEADERS_SENT spam + broken polling → no device count updates.
 *
 * The correct pattern is `createServer(app)`:
 *   Express becomes the default HTTP handler. Socket.IO intercepts its own path via the
 *   server-level 'upgrade' event (WebSocket) and by overriding the request handler internally
 *   for /socket.io/* paths — Express never sees those requests.
 */
export async function startServer(): Promise<{
  server: ReturnType<typeof createServer>;
  io: SocketIOServer;
  port: number;
}> {
  // Use a mutable handler reference so we can pass a function to createServer()
  // upfront (before the Express app exists) and then swap it in once io is ready.
  // This avoids the chicken-and-egg: createServer needs a handler, createApp needs io,
  // io needs server. With this pattern Socket.IO intercepts /socket.io/* internally
  // before Express ever sees those requests — no ERR_HTTP_HEADERS_SENT.
  let handler: express.Express | null = null;

  const server = createServer((req, res) => {
    if (handler) {
      handler(req, res);
    } else {
      res.writeHead(503);
      res.end('Starting…');
    }
  });

  // Socket.IO — attaches to the HTTP server
  const io = new SocketIOServer(server, {
    cors: { origin: '*', methods: ['GET', 'POST'] },
  });

  // Build the real Express app (needs io for emitting socket events in routes)
  const app = createApp(io, server);

  // Swap in the real handler — from this point all non-socket.io HTTP requests go to Express
  handler = app;

  // Socket.IO auth middleware — phone sockets are accepted at socket level.
  // Device registration is gated on session cookie in the connection handler.
  // Unauthenticated phones can receive broadcast events (server:stopping etc.)
  // but cannot upload (HTTP auth blocks that via requireAuth middleware).
  io.use((socket, next) => {
    const clientType = socket.handshake.query['type'] as string | undefined;

    // Electron renderer is always trusted
    if (clientType === 'renderer') return next();

    // Phone clients — accept all, check session in connection handler
    if (clientType === 'phone') return next();

    // Unknown type — require a valid session
    const sessionToken = getSessionFromCookie(socket.handshake.headers.cookie);
    if (sessionToken && isValidSession(sessionToken)) return next();

    logger.warn(`Socket rejected (unknown type, no valid session): ${socket.id}`);
    next(new Error('Unauthorized'));
  });

  // Connection handler — register/unregister devices
  io.on('connection', (socket) => {
    const clientType = socket.handshake.query['type'] as string | undefined;
    const isPhone = clientType === 'phone';

    logger.info(`Client connected: ${socket.id} (type=${clientType ?? 'unknown'})`);

    if (isPhone) {
      // Only register as a device if the phone has a valid session cookie
      const sessionToken = getSessionFromCookie(socket.handshake.headers.cookie);
      const isAuthenticated = !!(sessionToken && isValidSession(sessionToken));

      if (isAuthenticated) {
        const ua = socket.handshake.headers['user-agent'];
        const existingDeviceId = getDeviceIdFromCookie(socket.handshake.headers.cookie);
        registerDevice(socket.id, ua, existingDeviceId);
        io.emit('server:connections', { count: getDeviceCount(), devices: listDevices() });
        logger.info(`Device registered: ${socket.id} (count=${getDeviceCount()})`);
      } else {
        logger.info(`Phone connected but not yet authenticated: ${socket.id}`);
      }
    }

    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
      if (isPhone) {
        // no-op if socket was never registered (unauthenticated phone)
        removeDeviceBySocket(socket.id);
        io.emit('server:connections', { count: getDeviceCount(), devices: listDevices() });
      }
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(config.server.port, '0.0.0.0', () => {
      const port = (server.address() as { port: number }).port;
      logger.info(`Server listening on port ${port}`);
      logger.info(`Session PIN: ${SESSION_CODE}`);

      const bonjour = new Bonjour();
      bonjour.publish({ name: 'DropLAN', type: 'droplan', protocol: 'tcp', port });

      resolve({ server, io, port });
    });

    server.on('error', (error) => {
      logger.error('Server error:', error);
      reject(error);
    });
  });
}
