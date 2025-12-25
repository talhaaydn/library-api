import { Request, Response, NextFunction } from 'express';
import { validate, ValidationError } from 'class-validator';
import { plainToClass } from 'class-transformer';
import { AppError } from '../errors/app.error';

export const validationMiddleware = (
  type: any,
  skipMissingProperties = false,
) => {
  return async (req: Request, _res: Response, next: NextFunction) => {
    const dto = plainToClass(type, req.body);
    const errors: ValidationError[] = await validate(dto, {
      skipMissingProperties,
      whitelist: true,
      forbidNonWhitelisted: true,
    });

    if (errors.length > 0) {
      const message = errors
        .map((error: ValidationError) => {
          return Object.values(error.constraints || {}).join(', ');
        })
        .join(', ');

      return next(new AppError(message, 400));
    }

    req.body = dto;
    next();
  };
};
