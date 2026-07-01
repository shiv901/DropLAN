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
import { SettingsDrawer } from './components/SettingsDrawer';
import { DropLANLogo } from './components/DropLANLogo';
import type { ServerInfo } from '@droplan/types';

export interface UploadProgress {
  uploadId: string;
  filename: string;
  pct: number;
  received: number;
  total: number;
}

export default function App(): JSX.Element {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected' | 'stopped'>('connecting');
  const [activeUploads, setActiveUploads] = useState<UploadProgress[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connectedDevices, setConnectedDevices] = useState(0);
  // Unread count: increments per file received, resets when window regains focus
  const [unreadCount, setUnreadCount] = useState(0);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [downloadFolder, setDownloadFolder] = useState<string | null>(null);
  const [errorToast, setErrorToast] = useState<string | null>(null);

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
          setDownloadFolder(info.downloadFolder ?? null);
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

    // Tag this connection as the Electron renderer so the server excludes it from phone count
    const sock = connectSocket(`http://localhost:${serverInfo.port}`, {
      reconnectionAttempts: 10,
      transports: ['websocket', 'polling'],
      query: { type: 'renderer' },
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

    // New file arrived — native notification when window is not the frontmost app (B1 fix)
    sock.on('file:received', (file: { name: string }) => {
      setUnreadCount((n) => n + 1); // B4: increment unread badge
      if (!document.hasFocus() && window.electron) {
        void (window.electron.invoke as (ch: string, arg: unknown) => Promise<unknown>)(
          'app:notify',
          { title: 'DropLAN — File Received', body: file.name },
        );
      }
    });

    // Live phone count (server only counts type=phone sockets now)
    sock.on('server:connections', ({ count }: { count: number }) => {
      setConnectedDevices(count);
    });

    // Download folder changed mid-session — server reseeded its file list
    sock.on('files:reset', () => {
      // FileList will refetch from /api/files automatically via its own effect
      // triggering a re-mount is enough — we signal it by bumping a key via socket
    });

    // Server stopping (triggered by stop-sharing button or process exit)
    sock.on('server:stopping', () => {
      setStatus('stopped');
    });

    // Upload error (disk full, permission denied etc.) — show dismissible banner
    sock.on('upload:error', ({ message }: { message: string }) => {
      setErrorToast(message);
      // Auto-dismiss after 8 seconds
      setTimeout(() => setErrorToast(null), 8000);
    });

    setSocket(sock);
    return () => {
      sock.disconnect();
      setSocket(null);
    };
  }, [serverInfo?.port]);

  // ── Stop sharing ──────────────────────────────────────────────────────────
  const stopSharing = useCallback(async () => {
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

  // B4: Reset unread count when window regains focus; sync Dock badge
  useEffect(() => {
    const handleFocus = () => {
      setUnreadCount(0);
    };
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  // B4: Update Dock badge whenever unreadCount changes
  useEffect(() => {
    if (window.electron) {
      void (window.electron.invoke as (ch: string, arg: unknown) => Promise<unknown>)(
        'app:setDockBadge',
        unreadCount > 0 ? String(unreadCount) : '',
      );
    }
  }, [unreadCount]);

  return (
    <div className="app">
      {/* Titlebar */}
      <div className="titlebar">
        <div className="titlebar-drag" />
        <div className="titlebar-logo">
          <DropLANLogo size={20} />
          <span className="titlebar-name">DropLAN</span>
        </div>
        <div className="titlebar-actions">
          <StatusBar status={status} port={serverInfo?.port ?? null} />
          <button
            id="settings-btn"
            className="settings-btn"
            onClick={() => setSettingsOpen(true)}
            title="Settings"
            aria-label="Open settings"
          >
            ⚙
          </button>
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
          <QRPanel connectedDevices={connectedDevices} />

          <div className="sidebar-info">
            <div className="info-row">
              <span className="info-label">Save location</span>
              <button
                className="info-value info-value--link"
                onClick={() => void window.electron?.invoke('app:openDownloadFolder')}
                title={downloadFolder ?? serverInfo?.downloadFolder ?? '~/Downloads/DropLAN'}
              >
                {shortenPath(downloadFolder ?? serverInfo?.downloadFolder ?? '~/Downloads/DropLAN')}
              </button>
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
          {/* Upload error banner */}
          {errorToast && (
            <div className="upload-error-banner" role="alert">
              <span className="upload-error-icon">⚠️</span>
              <span className="upload-error-msg">{errorToast}</span>
              <button
                className="upload-error-dismiss"
                onClick={() => setErrorToast(null)}
                aria-label="Dismiss error"
              >
                ✕
              </button>
            </div>
          )}
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
                    <span className="active-upload-label">
                      ⬆ {u.filename.length > 30 ? u.filename.slice(0, 28) + '…' : u.filename}
                    </span>
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

      {/* Settings drawer */}
      <SettingsDrawer
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSettingsChange={(s) => {
          setDownloadFolder(s.downloadFolder);
        }}
      />
    </div>
  );
}

function shortenPath(p: string): string {
  return p.startsWith('/Users/') ? p.replace(/^\/Users\/[^/]+/, '~') : p;
}


function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}
