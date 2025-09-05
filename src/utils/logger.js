import winston from 'winston';
import * as Sentry from '@sentry/node';

// Define custom log format
const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] <${level}>: ${stack || message}`;
});

// Create a Winston logger instance
export const logger = winston.createLogger({
  level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    logFormat,
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

// Initialize Sentry for error monitoring
export const setupSentry = () => {
  if (process.env.SENTRY_DSN) {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 1.0,
      profilesSampleRate: 1.0,
    });
    logger.info('Sentry monitoring is enabled.');
  } else {
    logger.info('Sentry DSN is missing. Skipping.');
  }
};

// Report error to Sentry if DSN is configured
export const reportError = (error, context = {}) => {
  logger.error(error);

  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};
