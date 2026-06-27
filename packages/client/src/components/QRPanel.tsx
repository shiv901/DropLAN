/**
 * QRPanel — displays the QR code, LAN URL, and connected device count
 * Fetches server info via Electron IPC with retry logic
 */

import { useEffect, useState } from 'react';
import type { ServerInfo } from '@droplan/types';

interface Props {
  connectedDevices?: number;
}

export function QRPanel({ connectedDevices = 0 }: Props): JSX.Element {
  const [info, setInfo] = useState<ServerInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let attempts = 0;
    const maxAttempts = 30; // 30 × 500ms = 15 seconds

    const tryFetch = async () => {
      if (cancelled) return;
      attempts++;
      try {
        const result = (await window.electron?.invoke('app:getServerInfo')) as
          | ServerInfo
          | undefined;
        if (result?.qrDataUrl && !cancelled) {
          setInfo(result);
          setError(false);
          return; // success — stop retrying
        }
      } catch {
        /* IPC not ready yet */
      }

      if (cancelled) return;
      if (attempts < maxAttempts) {
        setTimeout(tryFetch, 500);
      } else {
        setError(true);
      }
    };

    tryFetch();
    return () => {
      cancelled = true;
    };
  }, []);

  const copyUrl = async () => {
    if (!info?.lanUrl) return;
    try {
      await navigator.clipboard.writeText(info.lanUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="qr-panel">
      <div className="qr-header">
        <h2>Scan to Connect</h2>
        <p className="qr-subtitle">Any device on this network</p>
      </div>

      <div className="qr-code-wrap">
        {info?.qrDataUrl ? (
          <img src={info.qrDataUrl} alt="QR Code" className="qr-image" />
        ) : error ? (
          <div className="qr-placeholder qr-error">
            <span>⚠️</span>
            <p>Server not ready</p>
          </div>
        ) : (
          <div className="qr-placeholder">
            <div className="qr-spinner" />
          </div>
        )}
      </div>

      {/* Connected device count badge */}
      <div className={`device-badge ${connectedDevices > 0 ? 'device-badge--active' : ''}`}>
        <span className="device-badge-dot" />
        {connectedDevices > 0
          ? `${connectedDevices} device${connectedDevices !== 1 ? 's' : ''} connected`
          : 'No devices connected'}
      </div>

      {info && (
        <div className="qr-url-row">
          <span className="qr-url">{info.lanUrl}</span>
          <button className="copy-btn" onClick={copyUrl} title="Copy URL">
            {copied ? '✓' : '⎘'}
          </button>
        </div>
      )}

      {!info && !error && (
        <div className="qr-url-row">
          <span className="qr-url qr-url-loading">Starting server…</span>
        </div>
      )}
    </div>
  );
}
