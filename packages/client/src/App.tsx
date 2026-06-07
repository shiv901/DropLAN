/**
 * DropLAN — Main dashboard
 *
 * Status logic:
 *  - 'connecting'   → waiting for Electron IPC to become ready
 *  - 'connected'    → IPC responded; server info received
 *  - 'disconnected' → IPC failed after 30 retries (not running inside Electron)
 */

import { useEffect, useState } from 'react';
import { QRPanel } from './components/QRPanel';
import { FileList } from './components/FileList';
import { StatusBar } from './components/StatusBar';
import type { ServerInfo } from '@droplan/types';

export default function App(): JSX.Element {
  const [serverInfo, setServerInfo] = useState<ServerInfo | null>(null);
  const [status, setStatus] = useState<'disconnected' | 'connecting' | 'connected'>('connecting');

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

  return (
    <div className="app">
      {/* Titlebar */}
      <div className="titlebar">
        <div className="titlebar-drag" />
        <div className="titlebar-logo">
          <span className="titlebar-icon">📡</span>
          <span className="titlebar-name">DropLAN</span>
        </div>
        <StatusBar status={status} port={serverInfo?.port ?? null} />
      </div>

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

        {/* Right: received files */}
        <main className="content">
          <div className="content-header">
            <h2 className="content-title">Received Files</h2>
            <span className="content-subtitle">
              Files dropped here from any device on your network
            </span>
          </div>
          <FileList serverPort={serverInfo?.port ?? 3000} />
        </main>
      </div>
    </div>
  );
}
