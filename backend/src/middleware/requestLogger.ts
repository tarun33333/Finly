import { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';

export const requestLogger = (req: Request, res: Response, next: NextFunction): void => {
  const start = Date.now();
  const { method, originalUrl, ip } = req;

  res.on('finish', () => {
    const duration = Date.now() - start;
    const { statusCode } = res;
    logger.info(
      {
        method,
        url: originalUrl,
        status: statusCode,
        durationMs: duration,
        ip,
      },
      `${method} ${originalUrl} ${statusCode} - ${duration}ms`
    );
  });

  next();
};

