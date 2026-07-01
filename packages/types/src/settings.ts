/**
 * AppSettings — persisted to ~/Library/Application Support/DropLAN/settings.json
 */
export interface AppSettings {
  /** Absolute path where received files are saved */
  downloadFolder: string;
  /** Launch DropLAN automatically when the user logs in */
  launchAtLogin: boolean;
  /**
   * Number of digits in the session PIN.
   * 0 = No PIN (request-to-connect mode — future feature).
   * Changes take effect on next server restart.
   */
  pinLength: 0 | 4 | 6;
}
