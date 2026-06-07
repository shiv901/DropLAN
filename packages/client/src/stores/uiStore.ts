import { create } from 'zustand';

/**
 * UI state management (modals, panels, notifications)
 */
interface UIState {
  sidebarOpen: boolean;
  activeView: 'send' | 'receive' | 'transfers' | 'settings';
  showSettingsModal: boolean;
  setSidebarOpen: (open: boolean) => void;
  setActiveView: (view: 'send' | 'receive' | 'transfers' | 'settings') => void;
  setShowSettingsModal: (show: boolean) => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  activeView: 'send',
  showSettingsModal: false,
  setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
  setActiveView: (view: 'send' | 'receive' | 'transfers' | 'settings') => set({ activeView: view }),
  setShowSettingsModal: (show: boolean) => set({ showSettingsModal: show }),
}));
