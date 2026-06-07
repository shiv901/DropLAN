/**
 * Global type augmentations for the browser window
 * Declares the electron API exposed via contextBridge / preload
 */

import type { IpcInvokeChannels } from '@droplan/types';

interface ElectronAPI {
  invoke: <K extends keyof IpcInvokeChannels>(
    channel: K,
    args?: IpcInvokeChannels[K]
  ) => Promise<unknown>;
  on: (channel: string, callback: (event: unknown, data: unknown) => void) => void;
  removeListener: (channel: string, callback: (event: unknown, data: unknown) => void) => void;
}

declare global {
  interface Window {
    electron?: ElectronAPI;
  }
}

export {};
