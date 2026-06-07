import type { BrowserWindowConstructorOptions } from 'electron';
import { describe, expect, it } from 'vitest';
import {
  REQUIRED_SECURITY_SETTINGS,
  SECURITY_CHECKLIST,
  generateSecurityReport,
  validateSecuritySettings,
} from './audit';

describe('Electron Security Audit', () => {
  describe('validateSecuritySettings', () => {
    it('should validate secure settings', () => {
      const options: BrowserWindowConstructorOptions = {
        webPreferences: {
          contextIsolation: true,
          sandbox: true,
          nodeIntegration: false,
          webSecurity: true,
        },
      };

      const result = validateSecuritySettings(options);
      expect(result.valid).toBe(true);
      expect(result.violations).toHaveLength(0);
    });

    it('should detect context isolation violation', () => {
      const options: BrowserWindowConstructorOptions = {
        webPreferences: {
          contextIsolation: false,
          sandbox: true,
          nodeIntegration: false,
          webSecurity: true,
        },
      };

      const result = validateSecuritySettings(options);
      expect(result.valid).toBe(false);
      expect(result.violations).toContain('contextIsolation must be true');
    });

    it('should detect sandbox violation', () => {
      const options: BrowserWindowConstructorOptions = {
        webPreferences: {
          contextIsolation: true,
          sandbox: false,
          nodeIntegration: false,
          webSecurity: true,
        },
      };

      const result = validateSecuritySettings(options);
      expect(result.valid).toBe(false);
      expect(result.violations).toContain('sandbox must be true');
    });

    it('should detect node integration violation', () => {
      const options: BrowserWindowConstructorOptions = {
        webPreferences: {
          contextIsolation: true,
          sandbox: true,
          nodeIntegration: true,
          webSecurity: true,
        },
      };

      const result = validateSecuritySettings(options);
      expect(result.valid).toBe(false);
      expect(result.violations).toContain('nodeIntegration must be false');
    });

    it('should detect multiple violations', () => {
      const options: BrowserWindowConstructorOptions = {
        webPreferences: {
          contextIsolation: false,
          sandbox: false,
          nodeIntegration: true,
          webSecurity: false,
        },
      };

      const result = validateSecuritySettings(options);
      expect(result.valid).toBe(false);
      expect(result.violations.length).toBe(4);
    });
  });

  describe('Security settings', () => {
    it('should require context isolation', () => {
      expect(REQUIRED_SECURITY_SETTINGS['contextIsolation']).toBe(true);
    });

    it('should require sandbox', () => {
      expect(REQUIRED_SECURITY_SETTINGS['sandbox']).toBe(true);
    });

    it('should disable node integration', () => {
      expect(REQUIRED_SECURITY_SETTINGS['nodeIntegration']).toBe(false);
    });

    it('should enable web security', () => {
      expect(REQUIRED_SECURITY_SETTINGS['webSecurity']).toBe(true);
    });
  });

  describe('Security checklist', () => {
    it('should have all security measures', () => {
      expect(SECURITY_CHECKLIST.length).toBe(8);
    });

    it('should mark all checks as passed', () => {
      const passedChecks = SECURITY_CHECKLIST.filter((c) => c.status).length;
      expect(passedChecks).toBe(8);
    });

    it('should include context isolation check', () => {
      const check = SECURITY_CHECKLIST.find((c) => c.id === 'context-isolation');
      expect(check).toBeDefined();
      expect(check?.status).toBe(true);
    });

    it('should include IPC validation check', () => {
      const check = SECURITY_CHECKLIST.find((c) => c.id === 'ipc-validation');
      expect(check).toBeDefined();
      expect(check?.status).toBe(true);
    });
  });

  describe('generateSecurityReport', () => {
    it('should generate security report', () => {
      const report = generateSecurityReport();
      expect(report).toContain('Electron Security Report');
      expect(report).toContain('SECURE');
      expect(report).toContain('8/8');
    });
  });
});
