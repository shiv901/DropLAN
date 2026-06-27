/**
 * In-memory file registry, seeded from disk on startup.
 * Persistence model: files live on disk in ~/Downloads/DropLAN/.
 * On server start we scan that directory so the list survives restarts.
 * An fs.watch() watcher keeps the registry in sync with any external changes
 * (files added / deleted from Finder, airdrop, rsync, etc.)
 */

import { randomUUID } from 'crypto';
import { readdirSync, statSync, watch } from 'fs';
import { join } from 'path';
import type { ReceivedFile } from '@droplan/types';
import type { Server as SocketIOServer } from 'socket.io';

export interface StoredFile extends ReceivedFile {
  /** Absolute path on disk */
  diskPath: string;
}

const files = new Map<string, StoredFile>();

/* ------------------------------------------------------------------ */
/*  Read helpers                                                        */
/* ------------------------------------------------------------------ */

/** Find a file by its disk path — used by the watcher to avoid double-registration */
function findByDiskPath(diskPath: string): StoredFile | undefined {
  for (const file of files.values()) {
    if (file.diskPath === diskPath) return file;
  }
  return undefined;
}

/* ------------------------------------------------------------------ */
/*  Startup: seed from disk                                             */
/* ------------------------------------------------------------------ */

/**
 * Populate the registry from files already on disk.
 * Call once at server startup so the list survives process restarts.
 * Uses the file's birth-time as `receivedAt` for pre-existing files.
 */
export function seedFromDisk(dir: string): void {
  try {
    const entries = readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      // Skip hidden files (.DS_Store, .localized, etc.)
      if (!entry.isFile() || entry.name.startsWith('.')) continue;
      const diskPath = join(dir, entry.name);
      try {
        const stat = statSync(diskPath);
        const file: StoredFile = {
          id: randomUUID(),
          name: entry.name,
          size: stat.size,
          diskPath,
          receivedAt: stat.birthtime.toISOString(),
        };
        files.set(file.id, file);
      } catch {
        // Skip unreadable files
      }
    }
  } catch {
    // Upload dir doesn't exist yet — first upload will create it
  }
}

/* ------------------------------------------------------------------ */
/*  Live watcher: external file adds / deletes                         */
/* ------------------------------------------------------------------ */

/**
 * Watch the upload directory with Node's built-in fs.watch (uses macOS FSEvents).
 * - Externally added files (drag-drop, AirDrop, rsync …) are registered and
 *   broadcast as `file:received` to all connected clients.
 * - Externally deleted files are removed from the registry and broadcast
 *   as `file:removed`.
 * - Files uploaded through the server itself are already in the registry
 *   before the watcher fires, so they are silently skipped.
 */
export function watchUploadDir(dir: string, io: SocketIOServer): void {
  const debounce = new Map<string, ReturnType<typeof setTimeout>>();

  const watcher = watch(dir, { persistent: false }, (_eventType, filename) => {
    if (!filename) return;

    // Debounce: macOS FSEvents can fire several times per file write
    clearTimeout(debounce.get(filename));
    debounce.set(
      filename,
      setTimeout(() => {
        debounce.delete(filename);
        const diskPath = join(dir, filename);
        try {
          const stat = statSync(diskPath);
          if (!stat.isFile()) return;

          // Skip hidden files created by macOS (.DS_Store, .com.apple.timemachine.donotpresent …)
          if (filename.startsWith('.')) return;

          // Already registered (uploaded through the server) → skip
          if (findByDiskPath(diskPath)) return;

          // New file dropped externally — register and notify all clients
          const file = registerFile({ name: filename, size: stat.size, diskPath });
          io.emit('file:received', {
            id: file.id,
            name: file.name,
            size: file.size,
            receivedAt: file.receivedAt,
          });
        } catch {
          // stat failed → file was deleted (or moved out)
          const existing = findByDiskPath(diskPath);
          if (existing) {
            removeFile(existing.id);
            io.emit('file:removed', { id: existing.id });
          }
        }
      }, 250), // 250ms debounce — long enough for large writes to finish renaming
    );
  });

  // Clean up on process exit
  process.on('exit', () => watcher.close());
}

/* ------------------------------------------------------------------ */
/*  CRUD                                                                */
/* ------------------------------------------------------------------ */

/**
 * Register a newly uploaded file.
 * If the diskPath is already registered (e.g. the watcher picked it up mid-write),
 * update the entry with the final size/name instead of creating a duplicate.
 */
export function registerFile(params: { name: string; size: number; diskPath: string }): StoredFile {
  // Upsert: same path = same file; update rather than duplicate
  const existing = findByDiskPath(params.diskPath);
  if (existing) {
    const updated: StoredFile = { ...existing, name: params.name, size: params.size };
    files.set(existing.id, updated);
    return updated;
  }

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
 * List all received files, newest first
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
 * Remove a file from the registry (does NOT delete from disk)
 */
export function removeFile(id: string): boolean {
  return files.delete(id);
}
