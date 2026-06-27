/**
 * Electron IPC Security Layer
 * Validates and sanitizes all IPC communication
 */

import type { IpcInvokeChannels, IpcSendChannels } from '@droplan/types';

/**
 * Allowed IPC invoke channels
 */
const ALLOWED_INVOKE_CHANNELS: Set<keyof IpcInvokeChannels> = new Set([
  'server:status',
  'app:quit',
  'app:getVersion',
  'app:openDevTools',
  'app:getServerInfo',
  'app:revealFile',
  'app:openDownloadFolder',
  'app:notify',
  'app:setDockBadge',
]);

/**
 * Allowed IPC send channels
 */
const ALLOWED_SEND_CHANNELS: Set<keyof IpcSendChannels> = new Set([
  'server:status',
  'transfer:progress',
  'transfer:complete',
  'error:fatal',
  'file:received',
]);

/**
 * Validate if a channel is allowed for invocation
 */
export function isAllowedInvokeChannel(channel: unknown): channel is keyof IpcInvokeChannels {
  return (
    typeof channel === 'string' && ALLOWED_INVOKE_CHANNELS.has(channel as keyof IpcInvokeChannels)
  );
}

/**
 * Validate if a channel is allowed for listening
 */
export function isAllowedSendChannel(channel: unknown): channel is keyof IpcSendChannels {
  return typeof channel === 'string' && ALLOWED_SEND_CHANNELS.has(channel as keyof IpcSendChannels);
}

/**
 * Get all allowed channels for debugging
 */
export function getAllowedChannels(): {
  invoke: string[];
  send: string[];
} {
  return {
    invoke: Array.from(ALLOWED_INVOKE_CHANNELS),
    send: Array.from(ALLOWED_SEND_CHANNELS),
  };
}
