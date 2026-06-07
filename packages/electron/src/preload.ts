/**
 * Preload Script
 * Safe bridge between React renderer and Electron main process
 * Exposes only necessary IPC methods via contextBridge
 */

import { contextBridge, ipcRenderer } from 'electron';
import type { IpcInvokeChannels } from '@droplan/types';
import { isAllowedInvokeChannel, isAllowedSendChannel } from './security';

// Define the API object that will be exposed to the renderer
interface ElectronAPI {
  invoke: <K extends keyof IpcInvokeChannels>(
    channel: K,
    args?: IpcInvokeChannels[K]
  ) => Promise<unknown>;
  on: (channel: string, callback: (event: unknown, data: unknown) => void) => void;
  removeListener: (channel: string, callback: (event: unknown, data: unknown) => void) => void;
}

// Create safe wrapper functions
const safeInvoke = async <K extends keyof IpcInvokeChannels>(
  channel: K,
  args?: IpcInvokeChannels[K]
): Promise<unknown> => {
  if (!isAllowedInvokeChannel(channel)) {
    throw new Error(`IPC channel "${String(channel)}" is not allowed`);
  }
  return ipcRenderer.invoke(channel, args);
};

const safeOn = (channel: string, callback: (event: unknown, data: unknown) => void): void => {
  if (!isAllowedSendChannel(channel)) {
    throw new Error(`IPC channel "${channel}" is not allowed for listening`);
  }
  ipcRenderer.on(channel, callback);
};

const safeRemoveListener = (
  channel: string,
  callback: (event: unknown, data: unknown) => void
): void => {
  if (!isAllowedSendChannel(channel)) {
    throw new Error(`IPC channel "${channel}" is not allowed`);
  }
  ipcRenderer.removeListener(channel, callback);
};

// Create the API object
const api: ElectronAPI = {
  invoke: safeInvoke,
  on: safeOn,
  removeListener: safeRemoveListener,
};

// Expose the API to the renderer process
try {
  contextBridge.exposeInMainWorld('electron', api);
} catch (error) {
  // eslint-disable-next-line no-console
  console.error('Failed to expose electron API:', error);
}
