/**
 * @droplan/types - Shared TypeScript type definitions
 * Exports all IPC messages, configurations, and domain types
 */

export * from './ipc';
export * from './config';

// Domain types
export interface Transfer {
  transferId: string;
  fileName: string;
  fileSize: number;
  bytesTransferred: number;
  startedAt: Date;
  completedAt?: Date;
  status: 'pending' | 'uploading' | 'paused' | 'completed' | 'failed' | 'cancelled';
}

export interface File {
  id: string;
  name: string;
  path: string;
  size: number;
  mimeType: string;
  checksum?: string;
}

export interface Session {
  id: string;
  token: string;
  ipAddress: string;
  userAgent?: string;
  createdAt: Date;
  expiresAt: Date;
  isValid: boolean;
}

/**
 * Generic IPC message wrapper
 */
export interface IPCMessage<T = unknown> {
  type: string;
  data: T;
}
