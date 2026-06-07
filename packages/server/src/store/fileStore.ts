/**
 * In-memory file registry for MVP
 * Tracks all files received via upload during this session
 */

import { randomUUID } from 'crypto';
import type { ReceivedFile } from '@droplan/types';

export interface StoredFile extends ReceivedFile {
  /** Absolute path on disk */
  diskPath: string;
}

const files = new Map<string, StoredFile>();

/**
 * Register a newly uploaded file
 */
export function registerFile(params: { name: string; size: number; diskPath: string }): StoredFile {
  const file: StoredFile = {
    id: randomUUID(),
    name: params.name,
    size: params.size,
    diskPath: params.diskPath,
    receivedAt: new Date().toISOString(),
  };
  files.set(file.id, file);
  return file;
}

/**
 * List all received files
 */
export function listFiles(): StoredFile[] {
  return Array.from(files.values()).sort(
    (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
  );
}

/**
 * Get a single file by ID
 */
export function getFile(id: string): StoredFile | undefined {
  return files.get(id);
}

/**
 * Remove a file from the registry
 */
export function removeFile(id: string): boolean {
  return files.delete(id);
}
