import { z } from 'zod';

export const searchRecipesSchema = z.object({
  query: z.string().min(1).max(100),
  number: z.coerce.number().min(1).max(20).default(10),
  offset: z.coerce.number().min(0).default(0),
});

export type SearchRecipesDto = z.infer<typeof searchRecipesSchema>;
