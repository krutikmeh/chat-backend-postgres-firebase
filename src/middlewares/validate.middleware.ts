import { Request, Response, NextFunction } from 'express';
import { z, ZodError } from 'zod';

export const validate =
  (schema: z.ZodObject) =>
  (req: Request, res: Response, next: NextFunction) => {
    try {
      schema.parse({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: err.issues.map((e) => ({
            path: e.path.join('.'),
            message: e.message,
          })),
        });
      }
      next(err);
    }
  };