import { describe, expect, it } from 'vitest';
import { logger } from './logger';

describe('Logger', () => {
  it('should have all required methods', () => {
    expect(logger).toHaveProperty('info');
    expect(logger).toHaveProperty('warn');
    expect(logger).toHaveProperty('error');
  });

  it('should be callable without errors', () => {
    expect(() => {
      logger.info('Test message');
      logger.warn('Test warning');
      logger.error('Test error');
    }).not.toThrow();
  });
});
