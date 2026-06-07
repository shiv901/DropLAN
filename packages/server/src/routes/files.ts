/**
 * Files route — browse and download received files
 * GET    /api/files
 * GET    /api/files/:id/download
 * DELETE /api/files/:id
 */

import { Router, type Request, type Response } from 'express';
import { createReadStream, unlinkSync, existsSync } from 'fs';
import { statSync } from 'fs';
import { basename } from 'path';
import { listFiles, getFile, removeFile } from '../store/fileStore.js';
import { logger } from '../logger.js';

export function createFilesRouter(): Router {
  const router = Router();

  /**
   * GET /api/files
   * Returns the list of all received files
   */
  router.get('/files', (_req: Request, res: Response) => {
    const files = listFiles().map((f) => ({
      id: f.id,
      name: f.name,
      size: f.size,
      receivedAt: f.receivedAt,
    }));
    res.json({ files });
  });

  /**
   * GET /api/files/:id/download
   * Streams the file to the client with proper headers for resume support
   */
  router.get('/files/:id/download', (req: Request, res: Response) => {
    const file = getFile(req.params['id'] ?? '');

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    if (!existsSync(file.diskPath)) {
      res.status(404).json({ error: 'File no longer exists on disk' });
      return;
    }

    const stat = statSync(file.diskPath);
    const fileSize = stat.size;
    const range = req.headers['range'];

    // Sanitise the filename for Content-Disposition
    const safeFilename = basename(file.name).replace(/[^\w\s. -]/g, '_');

    if (range) {
      // Handle HTTP range requests (resume / partial download)
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0] ?? '0', 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;

      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      });

      createReadStream(file.diskPath, { start, end }).pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'application/octet-stream',
        'Accept-Ranges': 'bytes',
        'Content-Disposition': `attachment; filename="${safeFilename}"`,
      });

      createReadStream(file.diskPath).pipe(res);
    }

    logger.info(`Download started: ${file.name}`);
  });

  /**
   * DELETE /api/files/:id
   * Remove file from registry and disk
   */
  router.delete('/files/:id', (req: Request, res: Response) => {
    const file = getFile(req.params['id'] ?? '');

    if (!file) {
      res.status(404).json({ error: 'File not found' });
      return;
    }

    // Delete from disk if it still exists
    if (existsSync(file.diskPath)) {
      try {
        unlinkSync(file.diskPath);
      } catch (err) {
        logger.warn(`Could not delete file from disk: ${file.diskPath}`, err);
      }
    }

    removeFile(file.id);
    logger.info(`File removed: ${file.name}`);
    res.json({ success: true });
  });

  return router;
}
