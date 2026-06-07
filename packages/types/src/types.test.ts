import { describe, expect, it } from 'vitest';
import type { Config, File, Session, Transfer } from './index';

describe('Type definitions', () => {
  it('should compile Transfer type', () => {
    const transfer: Transfer = {
      transferId: 'test-123',
      fileName: 'test.txt',
      fileSize: 1024,
      bytesTransferred: 512,
      startedAt: new Date(),
      status: 'uploading',
    };

    expect(transfer.transferId).toBe('test-123');
    expect(transfer.status).toBe('uploading');
  });

  it('should compile Config type', () => {
    const config: Config = {
      maxFileSize: 549755813888,
      chunkSize: 8388608,
      maxConcurrentUploads: 10,
      maxConcurrentDownloads: 20,
      portRange: [3000, 3999],
      bindAddress: '0.0.0.0',
      sessionExpirationHours: 24,
      requestsPerMinute: 100,
    };

    expect(config.maxFileSize).toBe(549755813888);
  });

  it('should compile Session type', () => {
    const session: Session = {
      id: 'session-123',
      token: 'token-abc-def',
      ipAddress: '192.168.1.100',
      createdAt: new Date(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
      isValid: true,
    };

    expect(session.id).toBe('session-123');
    expect(session.isValid).toBe(true);
  });

  it('should compile File type', () => {
    const file: File = {
      id: 'file-123',
      name: 'document.pdf',
      path: '/uploads/document.pdf',
      size: 2048000,
      mimeType: 'application/pdf',
      checksum: 'sha256-abc123',
    };

    expect(file.name).toBe('document.pdf');
    expect(file.mimeType).toBe('application/pdf');
  });
});
