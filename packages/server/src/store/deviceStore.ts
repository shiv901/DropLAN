/**
 * Device Registry
 * Tracks connected phone clients by stable device ID.
 * Foundation for "send to phone" (P10) — each device has a socket ID
 * that can be used to push events to a specific phone.
 */

import { randomUUID } from 'crypto';

export interface ConnectedDevice {
  id: string;        // stable UUID (persisted in droplan_device cookie)
  socketId: string;  // current Socket.IO socket ID
  connectedAt: string;
  name: string;      // inferred from User-Agent
}

const devices = new Map<string, ConnectedDevice>();

function inferDeviceName(ua: string | undefined): string {
  if (!ua) return 'Device';
  if (/iPhone/i.test(ua)) return 'iPhone';
  if (/iPad/i.test(ua)) return 'iPad';
  if (/Android/i.test(ua)) return 'Android';
  if (/Macintosh|Mac OS X/i.test(ua)) return 'Mac';
  if (/Windows/i.test(ua)) return 'Windows PC';
  return 'Device';
}

/** Add or update a connected device. Returns the device ID used. */
export function registerDevice(
  socketId: string,
  userAgent?: string,
  existingId?: string,
): string {
  const id = existingId ?? randomUUID();
  devices.set(id, {
    id,
    socketId,
    connectedAt: new Date().toISOString(),
    name: inferDeviceName(userAgent),
  });
  return id;
}

/** Remove the device whose socket matches socketId */
export function removeDeviceBySocket(socketId: string): void {
  for (const [id, dev] of devices) {
    if (dev.socketId === socketId) {
      devices.delete(id);
      return;
    }
  }
}

export function listDevices(): ConnectedDevice[] {
  return Array.from(devices.values());
}

export function getDeviceCount(): number {
  return devices.size;
}
