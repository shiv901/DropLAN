/**
 * IPC Message Types
 * Type-safe communication between Electron main process and React renderer
 */

/**
 * Server status - sent from main process when server starts
 */
export interface ServerStatusMessage {
  port: number;
  bindAddress: string;
  ready: boolean;
  pid?: number;
}

/**
 * All IPC channel types that can be invoked from renderer
 */
export interface IpcInvokeChannels {
  'server:status': void;
  'app:quit': void;
  'app:getVersion': void;
  'app:openDevTools': void;
  'app:getServerInfo': void;
  /** Reveal a file in macOS Finder — arg is the absolute disk path */
  'app:revealFile': string;
  /** Open ~/Downloads/DropLAN in Finder */
  'app:openDownloadFolder': void;
  /** Show a native macOS notification */
  'app:notify': { title: string; body: string };
  /** Update the Dock icon badge with a count (empty string clears it) */
  'app:setDockBadge': string;
}

/**
 * All IPC channel types that are sent from main process
 */
export interface IpcSendChannels {
  'server:status': ServerStatusMessage;
  'transfer:progress': TransferProgressMessage;
  'transfer:complete': TransferCompleteMessage;
  'error:fatal': ErrorMessage;
  'file:received': ReceivedFile;
}

/**
 * Transfer progress update
 */
export interface TransferProgressMessage {
  transferId: string;
  bytesTransferred: number;
  totalBytes: number;
  speed: number;
  eta: number;
}

/**
 * Transfer completion notification
 */
export interface TransferCompleteMessage {
  transferId: string;
  success: boolean;
  message?: string;
}

/**
 * Error notification from main process
 */
export interface ErrorMessage {
  code: string;
  message: string;
  severity: 'warning' | 'error' | 'critical';
}

/**
 * Server info — returned by app:getServerInfo IPC call
 */
export interface ServerInfo {
  port: number;
  lanUrl: string;
  qrDataUrl: string;
  hostname: string;
  /** 4-digit PIN — displayed in UI and embedded in QR URL */
  sessionCode: string;
  /** mDNS hostname — e.g. http://Shivs-MacBook.local:3000 */
  mdnsUrl?: string;
}

/**
 * A file that has been received via upload
 */
export interface ReceivedFile {
  id: string;
  name: string;
  size: number;
  receivedAt: string; // ISO 8601
  /** Absolute disk path — only present in Electron context, used for Reveal in Finder */
  diskPath?: string;
}

/**
 * Type-safe IPC invoke wrapper
 */
export type IpcInvoke = <K extends keyof IpcInvokeChannels>(
  channel: K,
  args: IpcInvokeChannels[K]
) => Promise<unknown>;

/**
 * Type-safe IPC send wrapper
 */
export type IpcSend = <K extends keyof IpcSendChannels>(
  channel: K,
  args: IpcSendChannels[K]
) => void;

/**
 * Type-safe IPC on wrapper
 */
export type IpcOn = <K extends keyof IpcSendChannels>(
  channel: K,
  listener: (event: { sender: unknown }, args: IpcSendChannels[K]) => void
) => void;
