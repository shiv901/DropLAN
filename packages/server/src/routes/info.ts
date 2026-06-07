/**
 * Info route — returns server info for browser clients
 * GET /api/info
 */

import { Router, type Request, type Response } from 'express';
import { hostname } from 'os';

interface InfoResponse {
  hostname: string;
  appVersion: string;
}

export function createInfoRouter(): Router {
  const router = Router();

  router.get('/info', (_req: Request, res: Response) => {
    const info: InfoResponse = {
      hostname: hostname(),
      appVersion: '0.1.0',
    };
    res.json(info);
  });

  return router;
}
