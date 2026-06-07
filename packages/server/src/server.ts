import express, { type Express, type Request, type Response } from 'express';
import { createServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { config } from './config.js';
import { logger } from './logger.js';
import { createUploadRouter, ensureUploadDir } from './routes/upload.js';
import { createFilesRouter } from './routes/files.js';
import { createInfoRouter } from './routes/info.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

/**
 * Initialize Express server with all routes and Socket.IO
 */
export function createApp(io: SocketIOServer): Express {
  const app = express();

  // Ensure upload directory exists
  ensureUploadDir();

  // Body parsing
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // CORS for local network access
  app.use((req: Request, res: Response, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    res.header('Accept-Ranges', 'bytes');

    if (req.method === 'OPTIONS') {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // Health check
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Status endpoint
  app.get('/api/status', (_req: Request, res: Response) => {
    res.json({
      status: 'running',
      port: config.server.port,
      version: '0.1.0',
    });
  });

  // Mount API routes
  app.use('/api', createUploadRouter(io));
  app.use('/api', createFilesRouter());
  app.use('/api', createInfoRouter());

  // Serve browser UI for all non-API routes (phones/browsers hitting the server)
  const browserUiPath = join(__dirname, 'browser-ui', 'index.html');
  app.get('/', (_req: Request, res: Response) => {
    res.sendFile(browserUiPath);
  });

  return app;
}

/**
 * Start the server and return HTTP server + Socket.IO instance
 */
export async function startServer(): Promise<{
  server: ReturnType<typeof createServer>;
  io: SocketIOServer;
  port: number;
}> {
  const server = createServer();

  const io = new SocketIOServer(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Mount the express app after io is created so routes can use it
  const app = createApp(io);
  server.on('request', app);

  // Setup Socket.IO connection handler
  io.on('connection', (socket) => {
    logger.info(`Client connected: ${socket.id}`);
    socket.on('disconnect', () => {
      logger.info(`Client disconnected: ${socket.id}`);
    });
  });

  return new Promise((resolve, reject) => {
    server.listen(config.server.port, '0.0.0.0', () => {
      const port = (server.address() as { port: number }).port;
      logger.info(`Server listening on port ${port}`);
      resolve({ server, io, port });
    });

    server.on('error', (error) => {
      logger.error('Server error:', error);
      reject(error);
    });
  });
}
