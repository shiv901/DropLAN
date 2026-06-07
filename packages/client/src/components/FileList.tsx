/**
 * FileList — shows received files, allows download and delete
 * Polls GET /api/files and listens for file:received Socket.IO events
 */

import { useEffect, useState, useCallback } from 'react';
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

interface Props {
  serverPort: number;
}

export function FileList({ serverPort }: Props): JSX.Element {
  const [files, setFiles] = useState<ReceivedFile[]>([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    fetchFiles();
    const interval = setInterval(fetchFiles, 5000);
    return () => clearInterval(interval);
  }, [fetchFiles]);

  // Listen for real-time file:received events from Electron IPC
  useEffect(() => {
    const handler = (_event: unknown, data: unknown) => {
      const file = data as ReceivedFile;
      setFiles((prev) => [file, ...prev.filter((f) => f.id !== file.id)]);
    };
    window.electron?.on('file:received', handler);
    return () => {
      window.electron?.removeListener('file:received', handler);
    };
  }, []);

  const deleteFile = async (id: string) => {
    try {
      await fetch(`${baseUrl}/api/files/${id}`, { method: 'DELETE' });
      setFiles((prev) => prev.filter((f) => f.id !== id));
    } catch {
      /* ignore */
    }
  };

  if (loading) {
    return (
      <div className="file-list-empty">
        <div className="spinner" />
      </div>
    );
  }

  if (files.length === 0) {
    return (
      <div className="file-list-empty">
        <span className="empty-icon">📭</span>
        <p>No files received yet</p>
        <small>Scan the QR code to start uploading</small>
      </div>
    );
  }

  return (
    <div className="file-list">
      {files.map((file) => (
        <div key={file.id} className="file-item">
          <span className="file-item-icon">{fileIcon(file.name)}</span>
          <div className="file-item-info">
            <div className="file-item-name" title={file.name}>{file.name}</div>
            <div className="file-item-meta">
              {formatBytes(file.size)} · {timeAgo(file.receivedAt)}
            </div>
          </div>
          <div className="file-item-actions">
            <a
              href={`${baseUrl}/api/files/${file.id}/download`}
              download={file.name}
              className="file-action-btn file-action-download"
              title="Download"
            >
              ⬇
            </a>
            <button
              className="file-action-btn file-action-delete"
              onClick={() => deleteFile(file.id)}
              title="Delete"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
