/**
 * QRPanel — displays the QR code, LAN URL, and copy button
 * Fetches server info via Electron IPC
 */

import { useEffect, useState, useCallback } from 'react';
import type { ServerInfo } from '@droplan/types';

export function QRPanel(): JSX.Element {
  const [info, setInfo] = useState<ServerInfo | null>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState(false);

  const fetchInfo = useCallback(async () => {
    try {
      const result = (await window.electron?.invoke('app:getServerInfo')) as ServerInfo;
      setInfo(result);
      setError(false);
    } catch {
      setError(true);
    }
  }, []);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

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
