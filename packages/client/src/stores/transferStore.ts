import type { Transfer } from '@droplan/types';
import { create } from 'zustand';

/**
 * File transfer state management
 */
interface TransferState {
  transfers: Map<string, Transfer>;
  addTransfer: (transfer: Transfer) => void;
  updateTransfer: (id: string, partial: Partial<Transfer>) => void;
  removeTransfer: (id: string) => void;
  getTransfer: (id: string) => Transfer | undefined;
}

export const useTransferStore = create<TransferState>((set, get) => ({
  transfers: new Map(),
  addTransfer: (transfer: Transfer) => {
    set((state) => {
      const newMap = new Map(state.transfers);
      newMap.set(transfer.transferId, transfer);
      return { transfers: newMap };
    });
  },
  updateTransfer: (id: string, partial: Partial<Transfer>) => {
    set((state) => {
      const newMap = new Map(state.transfers);
      const existing = newMap.get(id);
      if (existing) {
        newMap.set(id, { ...existing, ...partial });
      }
      return { transfers: newMap };
    });
  },
  removeTransfer: (id: string) => {
    set((state) => {
      const newMap = new Map(state.transfers);
      newMap.delete(id);
      return { transfers: newMap };
    });
  },
  getTransfer: (id: string) => {
    return get().transfers.get(id);
  },
}));
