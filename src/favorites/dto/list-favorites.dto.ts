import { z } from 'zod';

export const idRecipeSchema = z.int().positive().min(1).max(2147483647);

export const idUserSchema = z.uuid();

export type idRecipeDto = z.infer<typeof idRecipeSchema>;

export type idUserDto = z.infer<typeof idUserSchema>;
