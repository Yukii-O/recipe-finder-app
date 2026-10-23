import { z } from 'zod';

export const idSchema = z
  .string()
  .regex(/^[^0-9]/)
  .transform((e) => Number(e))
  .pipe(z.number().positive().int().min(1).max(2147483647));
