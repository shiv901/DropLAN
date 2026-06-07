/**
 * Simple logging utility for the server
 * Levels: info, warn, error
 */

type LogLevel = 'info' | 'warn' | 'error';

interface Logger {
  info(message: string, data?: unknown): void;
  warn(message: string, data?: unknown): void;
  error(message: string, data?: unknown): void;
}

function formatLog(level: LogLevel, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const levelStr = level.toUpperCase().padEnd(5);

  if (data) {
    return `[${timestamp}] ${levelStr} ${message} ${JSON.stringify(data)}`;
  }

  return `[${timestamp}] ${levelStr} ${message}`;
}

export const logger: Logger = {
  info: (message: string, data?: unknown) => {
    // eslint-disable-next-line no-console
    console.log(formatLog('info', message, data));
  },
  warn: (message: string, data?: unknown) => {
    // eslint-disable-next-line no-console
    console.warn(formatLog('warn', message, data));
  },
  error: (message: string, data?: unknown) => {
    // eslint-disable-next-line no-console
    console.error(formatLog('error', message, data));
  },
};
