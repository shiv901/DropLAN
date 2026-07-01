/**
 * SettingsDrawer — slide-in panel from the right
 *
 * Settings:
 *  1. Download folder — native picker, live change (no restart needed)
 *  2. Launch at login — macOS login item toggle
 *  3. PIN mode — None (request-to-connect) / 4-digit / 6-digit (takes effect on restart)
 */

import { useEffect, useState, useCallback } from 'react';
import type { AppSettings } from '@droplan/types';

interface Props {
  open: boolean;
  onClose: () => void;
  /** Called after settings are saved so parent can refresh displayed values */
  onSettingsChange?: (s: AppSettings) => void;
}

export function SettingsDrawer({ open, onClose, onSettingsChange }: Props): JSX.Element {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedFlash, setSavedFlash] = useState(false);

  // Load settings when the drawer opens
  useEffect(() => {
    if (!open) return;
    void (async () => {
      const s = (await window.electron?.invoke('app:getSettings')) as AppSettings | undefined;
      if (s) setSettings(s);
    })();
  }, [open]);

  const save = useCallback(async (patch: Partial<AppSettings>) => {
    setSaving(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const next = (await (window.electron?.invoke as any)(
        'app:saveSettings',
        patch,
      )) as AppSettings | undefined;
      if (next) {
        setSettings(next);
        onSettingsChange?.(next);
        setSavedFlash(true);
        setTimeout(() => setSavedFlash(false), 1800);
      }
    } finally {
      setSaving(false);
    }
  }, [onSettingsChange]);

  const pickFolder = useCallback(async () => {
    const folder = (await window.electron?.invoke('app:selectFolder')) as string | null | undefined;
    if (folder) {
      await save({ downloadFolder: folder });
    }
  }, [save]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`settings-backdrop ${open ? 'settings-backdrop--visible' : ''}`}
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <aside
        className={`settings-drawer ${open ? 'settings-drawer--open' : ''}`}
        role="dialog"
        aria-label="Settings"
        aria-modal="true"
      >
        {/* Header */}
        <div className="settings-header">
          <h2 className="settings-title">Settings</h2>
          <button className="settings-close-btn" onClick={onClose} aria-label="Close settings">
            ✕
          </button>
        </div>

        {settings ? (
          <div className="settings-body">

            {/* ── Download folder ─────────────────────────────── */}
            <section className="settings-section">
              <h3 className="settings-section-title">Files</h3>

              <div className="settings-row settings-row--column">
                <div className="settings-row-label">
                  <span className="settings-label-text">Download Folder</span>
                  <span className="settings-label-hint">
                    Files from phones are saved here
                  </span>
                </div>
                <div className="settings-folder-row">
                  <span className="settings-folder-path" title={settings.downloadFolder}>
                    {shortenPath(settings.downloadFolder)}
                  </span>
                  <button
                    className="settings-folder-btn"
                    onClick={pickFolder}
                    disabled={saving}
                    id="settings-change-folder-btn"
                  >
                    Change…
                  </button>
                </div>
              </div>
            </section>

            {/* ── Launch at login ──────────────────────────────── */}
            <section className="settings-section">
              <h3 className="settings-section-title">Startup</h3>

              <div className="settings-row">
                <div className="settings-row-label">
                  <span className="settings-label-text">Launch at Login</span>
                  <span className="settings-label-hint">
                    Open DropLAN when you log in to macOS
                  </span>
                </div>
                <label className="settings-toggle" aria-label="Launch at login">
                  <input
                    id="settings-launch-at-login"
                    type="checkbox"
                    checked={settings.launchAtLogin}
                    onChange={(e) => void save({ launchAtLogin: e.target.checked })}
                    disabled={saving}
                  />
                  <span className="settings-toggle-track">
                    <span className="settings-toggle-thumb" />
                  </span>
                </label>
              </div>
            </section>

            {/* ── PIN mode ─────────────────────────────────────── */}
            <section className="settings-section">
              <h3 className="settings-section-title">Security</h3>

              <div className="settings-row settings-row--column">
                <div className="settings-row-label">
                  <span className="settings-label-text">Connection PIN</span>
                  <span className="settings-label-hint">
                    Changes take effect on next restart
                  </span>
                </div>
                <div className="settings-pin-options" role="radiogroup" aria-label="PIN length">
                  {([4, 6, 0] as const).map((len) => (
                    <label
                      key={len}
                      className={`settings-pin-option ${settings.pinLength === len ? 'settings-pin-option--active' : ''}`}
                    >
                      <input
                        type="radio"
                        name="pinLength"
                        value={len}
                        checked={settings.pinLength === len}
                        onChange={() => void save({ pinLength: len })}
                        disabled={saving}
                      />
                      {len === 0 ? (
                        <span>
                          <strong>No PIN</strong>
                          <small>Request-to-connect</small>
                        </span>
                      ) : (
                        <span>
                          <strong>{len}-digit</strong>
                          <small>{len === 4 ? 'Default' : 'More secure'}</small>
                        </span>
                      )}
                    </label>
                  ))}
                </div>

                {settings.pinLength === 0 && (
                  <div className="settings-pin-notice">
                    <span className="settings-pin-notice-icon">🔔</span>
                    <span>
                      In request-to-connect mode, phones must send a join request
                      that you approve from the DropLAN window.
                      <br />
                      <em>This mode is planned for a future release.</em>
                    </span>
                  </div>
                )}
              </div>
            </section>

          </div>
        ) : (
          <div className="settings-loading">
            <div className="settings-spinner" />
          </div>
        )}

        {/* Saved indicator */}
        {savedFlash && (
          <div className="settings-saved-toast">
            ✓ Saved
          </div>
        )}
      </aside>
    </>
  );
}

/** Shorten a long absolute path for display: ~/Downloads/DropLAN → keeps last 2 parts */
function shortenPath(p: string): string {
  const home = p.startsWith('/Users/') ? p.replace(/^\/Users\/[^/]+/, '~') : p;
  return home;
}
