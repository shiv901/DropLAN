import { describe, it, expect } from 'vitest';
import { useAppStore } from './appStore';
import { useTransferStore } from './transferStore';
import { useUIStore } from './uiStore';

describe('Zustand Stores', () => {
  describe('useAppStore', () => {
    it('should initialize with correct defaults', () => {
      const store = useAppStore.getState();
      expect(store.serverPort).toBeNull();
      expect(store.serverStatus).toBe('disconnected');
    });

    it('should update server port', () => {
      useAppStore.setState({ serverPort: 3000 });
      expect(useAppStore.getState().serverPort).toBe(3000);
    });

    it('should update server status', () => {
      useAppStore.setState({ serverStatus: 'connected' });
      expect(useAppStore.getState().serverStatus).toBe('connected');
    });
  });

  describe('useTransferStore', () => {
    it('should initialize with empty transfers', () => {
      const store = useTransferStore.getState();
      expect(store.transfers.size).toBe(0);
    });

    it('should add and retrieve transfer', () => {
      const transfer = {
        transferId: 'test-1',
        fileName: 'test.txt',
        fileSize: 1024,
        bytesTransferred: 0,
        startedAt: new Date(),
        completedAt: undefined,
        status: 'pending' as const,
      };

      useTransferStore.getState().addTransfer(transfer);
      expect(useTransferStore.getState().getTransfer('test-1')).toEqual(transfer);
    });
  });

  describe('useUIStore', () => {
    it('should initialize with correct defaults', () => {
      const store = useUIStore.getState();
      expect(store.sidebarOpen).toBe(true);
      expect(store.activeView).toBe('send');
      expect(store.showSettingsModal).toBe(false);
    });

    it('should toggle sidebar', () => {
      useUIStore.getState().setSidebarOpen(false);
      expect(useUIStore.getState().sidebarOpen).toBe(false);
    });

    it('should change active view', () => {
      useUIStore.getState().setActiveView('receive');
      expect(useUIStore.getState().activeView).toBe('receive');
    });
  });
});
