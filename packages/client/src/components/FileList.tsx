/**
 * FileList — shows received files with Electron-native actions:
 *   - "Reveal" opens the file highlighted in macOS Finder (replaces download)
 *   - "Open Folder" opens ~/Downloads/DropLAN in Finder
 *   - Delete shows an inline confirmation before making the API call
 * Real-time updates via Socket.IO (file:received / file:removed events)
 */

import { useEffect, useState, useCallback } from 'react';
import type { Socket } from 'socket.io-client';
import type { ReceivedFile } from '@droplan/types';

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

function timeAgo(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return new Date(iso).toLocaleDateString();
}

function fileIcon(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() ?? '';
  const icons: Record<string, string> = {
    pdf: '📄', doc: '📝', docx: '📝', xls: '📊', xlsx: '📊',
    jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', webp: '🖼️', heic: '🖼️',
    mp4: '🎬', mov: '🎬', avi: '🎬', mkv: '🎬',
    mp3: '🎵', m4a: '🎵', wav: '🎵',
    zip: '🗜️', rar: '🗜️', '7z': '🗜️',
    txt: '📄', md: '📄',
  };
  return icons[ext] ?? '📎';
}

/** True when running inside the Electron shell (contextBridge exposed) */
const isElectron = !!window.electron;

interface Props {
  serverPort: number;
  socket: Socket | null;
  disabled?: boolean;
  /** Called when user clicks Open Folder — fires app:openDownloadFolder IPC */
  onOpenFolder?: () => void;
}

export function FileList({ serverPort, socket, disabled = false, onOpenFolder }: Props): JSX.Element {
  const [files, setFiles] = useState<ReceivedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const baseUrl = `http://localhost:${serverPort}`;

  const fetchFiles = useCallback(async () => {
    try {
      const res = await fetch(`${baseUrl}/api/files`);
      const data = (await res.json()) as { files: ReceivedFile[] };
      setFiles(data.files ?? []);
    } catch {
      /* server may not be ready yet */
    } finally {
      setLoading(false);
    }
  }, [baseUrl]);

  // Polling fallback
  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, [fetchFiles]);

  // Real-time updates via Socket.IO
  useEffect(() => {
    if (!socket) return;

    const onReceived = (file: ReceivedFile) => {
      setFiles((prev) => [file, ...prev.filter((f) => f.id !== file.id)]);
    };

    const onRemoved = ({ id }: { id: string }) => {
      setFiles((prev) => prev.filter((f) => f.id !== id));
    };

    socket.on('file:received', onReceived);
    socket.on('file:removed', onRemoved);

    return () => {
      socket.off('file:received', onReceived);
      socket.off('file:removed', onRemoved);
    };
  }, [socket]);

  const revealInFinder = (diskPath: string) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    void (window.electron?.invoke as any)('app:revealFile', diskPath);
  };

  const confirmDelete = (id: string) => setConfirmDeleteId(id);
  const cancelDelete = () => setConfirmDeleteId(null);

  const executeDelete = async (id: string) => {
    setConfirmDeleteId(null);
    try {
      await fetch(`${baseUrl}/api/files/${id}`, { method: 'DELETE' });
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch { /* ignore */ }
  };

  if (loading) {
    return <div className="file-list-empty"><div className="spinner" /></div>;
  }

  return (
    <>
      {/* Header row with file count + open folder button */}
      <div className="file-list-toolbar">
        <span className="file-list-count">
          {files.length === 0 ? 'No files yet' : `${files.length} file${files.length !== 1 ? 's' : ''}`}
        </span>
        {isElectron && onOpenFolder && (
          <button
            id="open-folder-btn"
            className="open-folder-btn"
            onClick={onOpenFolder}
            title="Open ~/Downloads/DropLAN in Finder"
          >
            📁 Open Folder
          </button>
        )}
      </div>

      {files.length === 0 ? (
        <div className="file-list-empty" style={{ flex: 1 }}>
          <span className="empty-icon">📭</span>
          <p>No files received yet</p>
          <small>Scan the QR code to start uploading</small>
        </div>
      ) : (
        <div className="file-list">
          {files.map((file) => {
            const isPendingDelete = confirmDeleteId === file.id;
            return (
              <div key={file.id} className={`file-item${isPendingDelete ? ' file-item--confirm' : ''}`}>
                <span className="file-item-icon">{fileIcon(file.name)}</span>
                <div className="file-item-info">
                  <div className="file-item-name" title={file.name}>{file.name}</div>
                  <div className="file-item-meta">
                    {formatBytes(file.size)} · {timeAgo(file.receivedAt)}
                  </div>
                </div>

                {isPendingDelete ? (
                  <div className="file-item-confirm">
                    <span className="confirm-label">Delete this file?</span>
                    <button
                      id={`confirm-delete-${file.id}`}
                      className="confirm-btn confirm-btn--yes"
                      onClick={() => void executeDelete(file.id)}
                    >
                      Delete
                    </button>
                    <button
                      id={`cancel-delete-${file.id}`}
                      className="confirm-btn confirm-btn--no"
                      onClick={cancelDelete}
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="file-item-actions">
                    {!disabled && isElectron && file.diskPath && (
                      /* In Electron: open in default app (Preview/Photos/QuickTime) */
                      <button
                        id={`open-${file.id}`}
                        className="file-action-btn file-action-reveal"
                        onClick={() => revealInFinder(file.diskPath!)}
                        title="Open in default app"
                      >
                        👁
                      </button>
                    )}
                    {!disabled && !isElectron && (
                      /* In phone browser: show download link */
                      <a
                        href={`${baseUrl}/api/files/${file.id}/download`}
                        download={file.name}
                        className="file-action-btn file-action-download"
                        title="Download"
                      >
                        ⬇
                      </a>
                    )}
                    {!disabled && (
                      <button
                        id={`delete-${file.id}`}
                        className="file-action-btn file-action-delete"
                        onClick={() => confirmDelete(file.id)}
                        title="Delete file"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
