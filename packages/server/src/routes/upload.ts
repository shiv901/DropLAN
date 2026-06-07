/**
 * Upload route — receives files from browser clients and streams them to disk
 * POST /api/upload
 */

import { Router, type Request, type Response } from 'express';
import multer from 'multer';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync } from 'fs';
import { randomUUID } from 'crypto';
import { registerFile } from '../store/fileStore.js';
import { logger } from '../logger.js';
import type { Server as SocketIOServer } from 'socket.io';

/** Where received files land on disk */
export const UPLOAD_DIR = join(homedir(), 'Downloads', 'DropLAN');

/** Ensure upload directory exists */
export function ensureUploadDir(): void {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Create multer storage that streams directly to disk
 * Uses a UUID-based filename to avoid collisions / path traversal
 */
function createStorage(): multer.StorageEngine {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      // UUID prefix prevents path traversal & collisions; we keep original name in metadata
      const safeName = `${randomUUID()}-${file.originalname.replace(/[^a-zA-Z0-9._\- ]/g, '_')}`;
      cb(null, safeName);
    },
  });
}

/**
 * Create and return upload router
 * @param io - Socket.IO server instance for real-time notifications
 */
export function createUploadRouter(io: SocketIOServer): Router {
  const router = Router();
  const upload = multer({
    storage: createStorage(),
    limits: {
      fileSize: 500 * 1024 * 1024 * 1024, // 500 GB
    },
  });

  /**
   * POST /api/upload
   * Accepts single or multiple files as multipart/form-data field "files"
   */
  router.post('/upload', upload.array('files', 50), (req: Request, res: Response) => {
    const uploadedFiles = req.files as Express.Multer.File[];

    if (!uploadedFiles || uploadedFiles.length === 0) {
      res.status(400).json({ error: 'No files received' });
      return;
    }

    const received = uploadedFiles.map((f) => {
      const stored = registerFile({
        name: f.originalname,
        size: f.size,
        diskPath: f.path,
      });

      logger.info(`File received: ${stored.name} (${stored.size} bytes) → ${f.path}`);

      // Notify Electron UI via Socket.IO
      io.emit('file:received', {
        id: stored.id,
        name: stored.name,
        size: stored.size,
        receivedAt: stored.receivedAt,
      });

      return {
        id: stored.id,
        name: stored.name,
        size: stored.size,
        receivedAt: stored.receivedAt,
      };
    });

    res.json({ uploaded: received });
  });

  return router;
}
