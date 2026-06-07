/**
 * Application Configuration Types
 */

export interface PortRange {
  min: number;
  max: number;
}

export interface AppConfigOptions {
  maxFileSize: number;
  chunkSize: number;
  maxConcurrentUploads: number;
  maxConcurrentDownloads: number;
  portRange: [number, number];
  bindAddress: string;
  sessionExpirationHours: number;
  requestsPerMinute: number;
}

export interface ConfigOverrides {
  maxFileSize?: number;
  chunkSize?: number;
  portRange?: [number, number];
  sessionExpirationHours?: number;
  requestsPerMinute?: number;
}

export type Config = AppConfigOptions;
