import { describe, expect, it } from 'vitest';
import { getAllowedChannels, isAllowedInvokeChannel, isAllowedSendChannel } from './security';

describe('Electron IPC Security', () => {
  describe('isAllowedInvokeChannel', () => {
    it('should allow valid invoke channels', () => {
      expect(isAllowedInvokeChannel('server:status')).toBe(true);
      expect(isAllowedInvokeChannel('app:quit')).toBe(true);
      expect(isAllowedInvokeChannel('app:getVersion')).toBe(true);
      expect(isAllowedInvokeChannel('app:openDevTools')).toBe(true);
      expect(isAllowedInvokeChannel('app:getServerInfo')).toBe(true);
    });

    it('should reject invalid invoke channels', () => {
      expect(isAllowedInvokeChannel('malicious:channel')).toBe(false);
      expect(isAllowedInvokeChannel('process:exit')).toBe(false);
      expect(isAllowedInvokeChannel('eval')).toBe(false);
      expect(isAllowedInvokeChannel(null)).toBe(false);
      expect(isAllowedInvokeChannel(undefined)).toBe(false);
    });
  });

  describe('isAllowedSendChannel', () => {
    it('should allow valid send channels', () => {
      expect(isAllowedSendChannel('server:status')).toBe(true);
      expect(isAllowedSendChannel('transfer:progress')).toBe(true);
      expect(isAllowedSendChannel('transfer:complete')).toBe(true);
      expect(isAllowedSendChannel('error:fatal')).toBe(true);
      expect(isAllowedSendChannel('file:received')).toBe(true);
    });

    it('should reject invalid send channels', () => {
      expect(isAllowedSendChannel('malicious:send')).toBe(false);
      expect(isAllowedSendChannel('__proto__')).toBe(false);
      expect(isAllowedSendChannel('constructor')).toBe(false);
    });
  });

  describe('getAllowedChannels', () => {
    it('should return all allowed channels', () => {
      const channels = getAllowedChannels();

      expect(channels.invoke).toHaveLength(5);
      expect(channels.send).toHaveLength(5);
      expect(channels.invoke).toContain('server:status');
      expect(channels.invoke).toContain('app:getServerInfo');
      expect(channels.send).toContain('transfer:progress');
      expect(channels.send).toContain('file:received');
    });
  });
});
