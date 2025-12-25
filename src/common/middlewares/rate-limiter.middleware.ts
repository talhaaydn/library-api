import { Request } from 'express';
import rateLimit from 'express-rate-limit';
import { config } from '../../config/app.config';

export const rateLimiter = rateLimit({
  windowMs: 15 * 60 * config.rateLimit.windowMs,
  max: config.rateLimit.maxRequests,
  message: 'Too many requests, please try again later.',
  standardHeaders: true,
  legacyHeaders: true,
  keyGenerator: (req: Request) => req.ip as string,
});
