import { startServer } from './server.js';
import { logger } from './logger.js';

/**
 * Main entry point for the Express server
 */
async function main(): Promise<void> {
  try {
    const { port } = await startServer();
    logger.info(`✓ Server started successfully on port ${port}`);

    // Graceful shutdown
    process.on('SIGINT', () => {
      logger.info('Shutting down gracefully...');
      process.exit(0);
    });

    process.on('SIGTERM', () => {
      logger.info('Shutting down gracefully...');
      process.exit(0);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

main();
