/**
 * Session management
 * - SESSION_CODE: 4-digit PIN generated once at server startup
 * - Session tokens: opaque hex strings, in-memory, invalidated on restart
 */

import { randomBytes } from 'crypto';

/** 4-digit PIN displayed in Electron UI and embedded in QR code URL */
export const SESSION_CODE = String(Math.floor(1000 + Math.random() * 9000));

/** Active session tokens — cleared when the server restarts */
const activeSessions = new Set<string>();

/** Returns true if the given code matches the session PIN */
export function isValidCode(code: string): boolean {
  return code.trim() === SESSION_CODE;
}

/** Generate a new session token and add it to the active set */
export function createSession(): string {
  const token = randomBytes(32).toString('hex');
  activeSessions.add(token);
  return token;
}

/** Returns true if the token is a currently active session */
export function isValidSession(token: string): boolean {
  return activeSessions.has(token);
}

/** Parse droplan_sess from a raw Cookie header string */
export function getSessionFromCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  const m = /droplan_sess=([^;]+)/.exec(cookieHeader);
  return m?.[1];
}

/** Parse droplan_device from a raw Cookie header string */
export function getDeviceIdFromCookie(cookieHeader: string | undefined): string | undefined {
  if (!cookieHeader) return undefined;
  const m = /droplan_device=([^;]+)/.exec(cookieHeader);
  return m?.[1];
}
