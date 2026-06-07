/**
 * Configuration management for the application
 * Priority order: Environment variables > config.json > defaults
 */

interface ServerConfig {
  port: number;
  host: string;
  maxFileSize: number; // in bytes
  chunkSize: number; // in bytes
}

interface Config {
  server: ServerConfig;
  env: 'development' | 'production' | 'test';
}

// Default configuration values
const defaultConfig: Config = {
  server: {
    port: 3000,
    host: '0.0.0.0',
    maxFileSize: 500 * 1024 * 1024 * 1024, // 500GB
    chunkSize: 8 * 1024 * 1024, // 8MB
  },
  env: (process.env['NODE_ENV'] as 'development' | 'production' | 'test') || 'development',
};

/**
 * Load configuration from environment variables
 */
function loadConfig(): Config {
  const config = { ...defaultConfig };

  if (process.env['PORT']) {
    config.server.port = parseInt(process.env['PORT'], 10);
  }

  if (process.env['MAX_FILE_SIZE']) {
    config.server.maxFileSize = parseInt(process.env['MAX_FILE_SIZE'], 10);
  }

  if (process.env['CHUNK_SIZE']) {
    config.server.chunkSize = parseInt(process.env['CHUNK_SIZE'], 10);
  }

  return config;
}

export const config = loadConfig();
