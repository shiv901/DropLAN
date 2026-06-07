import { create } from 'zustand';

/**
 * Application state for server connection and UI
 */
interface AppState {
  serverPort: number | null;
  serverStatus: 'disconnected' | 'connecting' | 'connected';
  setServerPort: (port: number) => void;
  setServerStatus: (status: 'disconnected' | 'connecting' | 'connected') => void;
}

export const useAppStore = create<AppState>((set) => ({
  serverPort: null,
  serverStatus: 'disconnected',
  setServerPort: (port: number) => set({ serverPort: port }),
  setServerStatus: (status: 'disconnected' | 'connecting' | 'connected') =>
    set({ serverStatus: status }),
}));
