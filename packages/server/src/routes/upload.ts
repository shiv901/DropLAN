/**
 * Upload route — receives files from browser clients and streams them to disk
 * POST /api/upload
 */

import { Router, type Request, type Response, type NextFunction } from 'express';
import multer from 'multer';
import { join } from 'path';
import { homedir } from 'os';
import { mkdirSync, existsSync, unlink } from 'fs';
import { randomUUID } from 'crypto';
import { registerFile, markUploading, unmarkUploading } from '../store/fileStore.js';
import { logger } from '../logger.js';
import type { Server as SocketIOServer } from 'socket.io';

/** Where received files land on disk — configurable via env, defaults to ~/Downloads/DropLAN */
export let UPLOAD_DIR = process.env['DOWNLOAD_FOLDER'] ?? join(homedir(), 'Downloads', 'DropLAN');

/** Update the active upload directory at runtime (called when user changes folder in settings) */
export function setUploadDir(newDir: string): void {
  UPLOAD_DIR = newDir;
  ensureUploadDir();
}

/** Ensure upload directory exists */
export function ensureUploadDir(): void {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

/**
 * Build a safe, human-readable filename for a given destination directory.
 *
 * Strategy (mirrors macOS Finder behaviour):
 *   1. Sanitise the original name (strip path separators & control chars)
 *   2. Use it as-is if the file does not already exist
 *   3. If it does exist, append ` (2)`, ` (3)` … before the extension
 *   4. Fall back to a UUID prefix only if the sanitised name is empty
 */
function uniqueFilename(dir: string, originalname: string): string {
  // Strip directory traversal characters and control characters; keep spaces
  const safe = originalname.replace(/[\/\\\x00-\x1f]/g, '_').trim();
  const base = safe || randomUUID(); // UUID fallback for unnamed files

  // Split into stem + extension (e.g. "photo.jpg" → ["photo", ".jpg"])
  const lastDot = base.lastIndexOf('.');
  const stem = lastDot > 0 ? base.slice(0, lastDot) : base;
  const ext = lastDot > 0 ? base.slice(lastDot) : '';

  // Try the original name first, then add a counter suffix if needed
  let candidate = base;
  let counter = 2;
  while (existsSync(`${dir}/${candidate}`)) {
    candidate = `${stem} (${counter})${ext}`;
    counter++;
  }

  return candidate;
}

/**
 * Create multer storage that streams directly to disk.
 * Filenames preserve the original name; duplicates get a " (2)" suffix.
 * Also calls markUploading() so the fs.watch watcher skips the partial write.
 */
function createStorage(): multer.StorageEngine {
  return multer.diskStorage({
    destination: (_req, _file, cb) => {
      cb(null, UPLOAD_DIR);
    },
    filename: (_req, file, cb) => {
      const name = uniqueFilename(UPLOAD_DIR, file.originalname);
      // Mark as in-progress BEFORE multer opens the write stream
      markUploading(join(UPLOAD_DIR, name));
      cb(null, name);
    },
  });
}

/**
 * Middleware: track raw bytes received and emit upload:progress via Socket.IO.
 * Uses Node.js EventEmitter semantics — adding a 'data' listener does not
 * interfere with multer's pipe-based stream processing.
 */
function trackProgress(
  io: SocketIOServer
): (req: Request, _res: Response, next: NextFunction) => void {
  return (req, _res, next) => {
    const totalStr = req.headers['content-length'];
    if (!totalStr) return next();
    const total = parseInt(totalStr, 10);
    if (!total || isNaN(total)) return next();

    const uploadId = randomUUID();
    let received = 0;
    let filename = 'file'; // will be replaced once we see the first multipart header
    let headerParsed = false;

    io.emit('upload:progress', { uploadId, filename, pct: 0, received: 0, total });

    req.on('data', (chunk: Buffer) => {
      received += chunk.length;

      // Extract filename from the first multipart chunk (always starts with headers)
      if (!headerParsed) {
        headerParsed = true;
        const header = chunk.toString('utf8', 0, Math.min(chunk.length, 512));
        const match = /filename="([^"]+)"/.exec(header);
        if (match?.[1]) filename = decodeURIComponent(match[1]);
      }

      io.emit('upload:progress', {
        uploadId,
        filename,
        pct: Math.min(99, Math.round((received / total) * 100)),
        received,
        total,
      });
    });

    req.on('end', () => {
      io.emit('upload:progress', { uploadId, filename, pct: 100, received: total, total });
    });

    next();
  };
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
   * Accepts single or multiple files as multipart/form-data field "files".
   *
   * Abort detection: wraps upload.array() manually so we can detect when the
   * client closes the connection mid-upload. On abort:
   *   - Partial files are deleted from disk
   *   - They are NOT registered or emitted as file:received
   *   - An upload:error socket event is emitted (Electron + phone show error banner)
   */
  router.post('/upload', trackProgress(io), (req: Request, res: Response, next: NextFunction) => {
    let aborted = false;

    // Detect connection close BEFORE the response has been sent
    const onClose = () => {
      if (!res.writableEnded) aborted = true;
    };
    req.on('close', onClose);

    upload.array('files', 50)(req, res, (err) => {
      req.off('close', onClose); // clean up listener

      const uploadedFiles = (req.files as Express.Multer.File[]) ?? [];

      if (aborted) {
        // Connection dropped mid-upload — delete partial files, emit error
        uploadedFiles.forEach((f) => {
          unmarkUploading(f.path);
          unlink(f.path, () => {}); // best-effort delete
          logger.warn(`Deleted partial file after abort: ${f.path}`);
        });
        io.emit('upload:error', {
          message: 'Upload interrupted — connection was lost',
          code: 'ECONNABORTED',
        });
        return; // don't send response; connection is already gone
      }

      if (err) { next(err); return; }

      if (!uploadedFiles || uploadedFiles.length === 0) {
        res.status(400).json({ error: 'No files received' });
        return;
      }

      const received = uploadedFiles.map((f) => {
        unmarkUploading(f.path); // done writing — let the watcher know it’s safe
        const stored = registerFile({
          name: f.originalname,
          size: f.size,
          diskPath: f.path,
        });

        logger.info(`File received: ${stored.name} (${stored.size} bytes) → ${f.path}`);

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
  });

  /**
   * Upload error handler — catches multer errors and disk/OS errors.
   * Must be a 4-argument Express error handler (err, req, res, next).
   *
   * Error codes handled:
   *   LIMIT_FILE_SIZE  — file exceeds multer's fileSize limit
   *   ENOSPC           — no space left on device
   *   EACCES / EPERM   — permission denied writing to download folder
   *   EROFS            — read-only filesystem
   */
  router.use('/upload', (
    err: Error & { code?: string; field?: string },
    _req: Request,
    res: Response,
    _next: NextFunction,
  ) => {
    // Map low-level error codes to user-friendly messages
    let userMessage = 'Upload failed — please try again';
    const code = (err as NodeJS.ErrnoException).code ?? err.code ?? '';

    if (code === 'LIMIT_FILE_SIZE') {
      userMessage = 'File is too large to upload';
    } else if (code === 'ENOSPC') {
      userMessage = 'Upload failed — disk is full on the host machine';
    } else if (code === 'EACCES' || code === 'EPERM') {
      userMessage = 'Upload failed — permission denied writing to download folder';
    } else if (code === 'EROFS') {
      userMessage = 'Upload failed — download folder is on a read-only volume';
    } else if (err.name === 'MulterError') {
      userMessage = `Upload failed — ${err.message}`;
    }

    logger.error(`Upload error (${code || err.name}): ${err.message}`);

    // Emit upload:error so all clients (phone + Electron) can show a toast
    io.emit('upload:error', {
      message: userMessage,
      code,
    });

    // Respond to the XHR with an error status
    if (!res.headersSent) {
      res.status(500).json({ error: userMessage });
    }
  });

  return router;
}
