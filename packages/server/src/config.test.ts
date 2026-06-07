import { describe, it, expect, beforeEach } from 'vitest';
import { config } from './config';

describe('Server Configuration', () => {
  beforeEach(() => {
    delete process.env['PORT'];
    delete process.env['MAX_FILE_SIZE'];
    delete process.env['CHUNK_SIZE'];
  });

  it('should load default configuration', () => {
    expect(config.server.port).toBe(3000);
    expect(config.server.maxFileSize).toBe(500 * 1024 * 1024 * 1024); // 500GB
    expect(config.server.chunkSize).toBe(8 * 1024 * 1024); // 8MB
  });

  it('should have proper defaults', () => {
    expect(config.server.host).toBe('0.0.0.0');
    // vitest sets NODE_ENV=test; in production it defaults to 'development'
    expect(['development', 'test']).toContain(config.env);
  });
});
