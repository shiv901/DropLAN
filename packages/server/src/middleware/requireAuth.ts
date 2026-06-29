/**
 * requireAuth middleware
 * Validates session cookie on all phone-facing API routes.
 * Localhost (Electron renderer) is always trusted without a cookie.
 */

import type { Request, Response, NextFunction } from 'express';
import { getSessionFromCookie, isValidSession } from '../session.js';

function isLocalhost(ip: string | undefined): boolean {
  return ip === '127.0.0.1' || ip === '::1' || ip === '::ffff:127.0.0.1';
}

export function requireAuth(req: Request, res: Response, next: NextFunction): void {
  // Electron renderer always connects from localhost — unconditionally trusted
  if (isLocalhost(req.ip)) {
    next();
    return;
  }

  const token = getSessionFromCookie(req.headers.cookie);
  if (token && isValidSession(token)) {
    next();
    return;
  }

  res.status(401).json({ error: 'Unauthorized', code: 'SESSION_REQUIRED' });
}
