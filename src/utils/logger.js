import winston from 'winston';
import * as Sentry from '@sentry/node';

const logFormat = winston.format.printf(({ level, message, timestamp, stack }) => {
  return `[${timestamp}] <${level}>: ${stack || message}`;
});

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

export const reportError = (error, context = {}) => {
  logger.error(error);

  if (process.env.SENTRY_DSN) {
    Sentry.captureException(error, {
      extra: context,
    });
  }
};
