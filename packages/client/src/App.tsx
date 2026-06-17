/**
 * DropLAN — Main dashboard
 *
 * Status logic:
 *  - 'connecting'   → waiting for Electron IPC to become ready
 *  - 'connected'    → IPC responded; server info received; Socket.IO connected
 *  - 'disconnected' → IPC failed after 30 retries
 *  - 'stopped'      → user stopped the server via the Stop Sharing button
 */

import { useEffect, useState, useCallback } from 'react';
import { io as connectSocket, type Socket } from 'socket.io-client';
import { QRPanel } from './components/QRPanel';
import { FileList } from './components/FileList';
import { StatusBar } from './components/StatusBar';
import type { ServerInfo } from '@droplan/types';

export interface UploadProgress {
  uploadId: string;
  pct: number;
  received: number;
  total: number;
}

export default function App(): JSX.Element {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'stopped'>('connecting');
  const [activeUploads, setActiveUploads] = useState<UploadProgress[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  // ── IPC: get server info ──────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 × 500ms = 15 seconds

    const tryConnect = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const info = (await window.electron?.invoke('app:getServerInfo')) as ServerInfo | undefined;
        if (info?.port && !cancelled) {
          setServerInfo(info);
          setStatus('connected');
          return;
        }
      } catch {
        /* IPC not ready yet — will retry */
      }

      if (cancelled) return;
      if (attempts < maxAttempts) {
        setTimeout(tryConnect, 500);
      } else {
        setStatus('disconnected');
      }
    };

    tryConnect();
    return () => {
      cancelled = true;
    };
  }, []);

  // ── Socket.IO: connect once we know the port ──────────────────────────────
  useEffect(() => {
    if (!serverInfo?.port) return;

    const sock = connectSocket(`http://localhost:${serverInfo.port}`, {
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
    });

    // Real-time upload progress
    sock.on('upload:progress', (data: UploadProgress) => {
      setActiveUploads((prev) => {
        const existing = prev.find((u) => u.uploadId === data.uploadId);
        if (!existing) return [...prev, data];
        return prev.map((u) => (u.uploadId === data.uploadId ? data : u));
      });
      // Clear completed uploads after a short delay
      if (data.pct >= 100) {
        setTimeout(() => {
          setActiveUploads((prev) => prev.filter((u) => u.uploadId !== data.uploadId));
        }, 2000);
      }
    });

    // Server stopping (triggered by stop-sharing button or process exit)
    sock.on('server:stopping', () => {
      setStatus('stopped');
    });

    setSocket(sock);
    return () => {
      sock.disconnect();
      setSocket(null);
    };
  }, [serverInfo?.port]);

  // ── Stop sharing ──────────────────────────────────────────────────────────
  const stopSharing = useCallback(async () => {
    console.log('triggering stop!!')
    if (!serverInfo?.port) return;
    try {
      await fetch(`http://localhost:${serverInfo.port}/api/shutdown`, { method: 'POST' });
      // server:stopping Socket.IO event will set status to 'stopped'
    } catch {
      // Server may already be gone — update UI anyway
      setStatus('stopped');
    }
  }, [serverInfo?.port]);

  const isStopped = status === 'stopped';

  return (
    <div className="app">
      {/* Titlebar */}
      <div className="titlebar">
        <div className="titlebar-drag" />
        <div className="titlebar-logo">
          <span className="titlebar-icon">📡</span>
          <span className="titlebar-name">DropLAN</span>
        </div>
        <div className="titlebar-actions">
          <StatusBar status={status} port={serverInfo?.port ?? null} />
        </div>
      </div>

      {/* Stopped banner */}
      {isStopped && (
        <div className="stopped-banner">
          <span>🔴</span>
          <span>Server stopped — no further uploads or downloads accepted.</span>
          <button
            onClick={() => window.electron?.invoke('app:quit')}
            className="stop-btn stop-btn-quit"
          >
            Quit DropLAN
          </button>
        </div>
      )}

      {/* Main content */}
      <div className="layout">
        {/* Left: QR + connection info */}
        <aside className="sidebar">
          <QRPanel />

          <div className="sidebar-info">
            <div className="info-row">
              <span className="info-label">Save location</span>
              <span className="info-value">~/Downloads/DropLAN</span>
            </div>
            {serverInfo && (
              <div className="info-row">
                <span className="info-label">Host</span>
                <span className="info-value">{serverInfo.hostname}</span>
              </div>
            )}
          </div>
        </aside>

        {/* Right: active uploads + received files */}
        <main className="content">
          {status === 'connected' && (
            <button
              id="stop-sharing-btn"
              className="stop-btn"
              onClick={() => stopSharing()}
              title="Stop accepting uploads and shut down the server"
            >
              ⏹ Stop Sharing
            </button>
          )}
          <div className="content-header">
            <h2 className="content-title">Received Files</h2>
            <span className="content-subtitle">
              Files dropped here from any device on your network
            </span>
          </div>

          {/* Active uploads progress */}
          {activeUploads.length > 0 && (
            <div className="active-uploads">
              {activeUploads.map((u) => (
                <div key={u.uploadId} className="active-upload-item">
                  <div className="active-upload-header">
                    <span className="active-upload-label">⬆ Incoming file</span>
                    <span className="active-upload-pct">{u.pct}%</span>
                    <span className="active-upload-bytes">
                      {formatBytes(u.received)} / {formatBytes(u.total)}
                    </span>
                  </div>
                  <div className="active-upload-bar">
                    <div
                      className="active-upload-fill"
                      style={{ width: `${u.pct}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}

          <FileList
            serverPort={serverInfo?.port ?? 3000}
            socket={socket}
            disabled={isStopped}
            onOpenFolder={() => void window.electron?.invoke('app:openDownloadFolder')}
          />
        </main>
      </div>
    </div>
  );
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
