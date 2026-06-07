import { describe, expect, it } from 'vitest';
import type {
  ErrorMessage,
  IpcInvokeChannels,
  IpcSendChannels,
  ServerStatusMessage,
  TransferCompleteMessage,
  TransferProgressMessage,
} from './ipc';

describe('IPC Types', () => {
  it('should create valid ServerStatusMessage', () => {
    const message: ServerStatusMessage = {
      port: 3000,
      bindAddress: '0.0.0.0',
      ready: true,
      pid: 1234,
    };
    expect(message.port).toBe(3000);
    expect(message.ready).toBe(true);
  });

  it('should create valid TransferProgressMessage', () => {
    const message: TransferProgressMessage = {
      transferId: 'test-123',
      bytesTransferred: 1024000,
      totalBytes: 10240000,
      speed: 1024,
      eta: 9,
    };
    expect(message.transferId).toBe('test-123');
    expect(message.totalBytes).toBe(10240000);
  });

  it('should create valid TransferCompleteMessage', () => {
    const message: TransferCompleteMessage = {
      transferId: 'test-123',
      success: true,
      message: 'Transfer completed successfully',
    };
    expect(message.success).toBe(true);
  });

  it('should create valid ErrorMessage', () => {
    const message: ErrorMessage = {
      code: 'TRANSFER_FAILED',
      message: 'Transfer failed due to network error',
      severity: 'error',
    };
    expect(message.code).toBe('TRANSFER_FAILED');
    expect(message.severity).toBe('error');
  });

  it('should have correct IPC invoke channels', () => {
    const channels: (keyof IpcInvokeChannels)[] = [
      'server:status',
      'app:quit',
      'app:getVersion',
      'app:openDevTools',
    ];
    expect(channels).toHaveLength(4);
  });

  it('should have correct IPC send channels', () => {
    const channels: (keyof IpcSendChannels)[] = [
      'server:status',
      'transfer:progress',
      'transfer:complete',
      'error:fatal',
    ];
    expect(channels).toHaveLength(4);
  });
});
