import { z } from 'zod';

export const resultSpoonacularSchema = z.object({
  results: z.array(
    z.object({
      id: z.number().min(1),
      title: z.string().min(1),
      image: z.url(),
      //.refine((file) => file <= 10 * 1000 * 1024)
      //.refine((file) => file.type === 'image/jpg'), //possivel opcional
      imageType: z.enum(['jpg', 'png', 'webp']),
    }),
  ),
  offset: z.number().min(0),
  number: z.number().min(1),
  totalResults: z.number(),
});

export const recipeSchema = z.object({
  id: z.number().min(1),
  image: z.url(),
  title: z.string(),
  readyInMinutes: z.number(),
  servings: z.number(),
  sourceUrl: z.url(),
  preparationMinutes: z.number().nullable().optional(),
  cookingMinutes: z.number().nullable().optional(),

  extendedIngredients: z.array(
    z.object({
      id: z.number(),
      image: z.string(),
      name: z.string(),
      amount: z.number(),
      unit: z.string(),
    }),
  ),

  summary: z.string(),
  cuisines: z.array(z.string()),
  dishTypes: z.array(z.string()),
  diets: z.array(z.string()),
  instructions: z.string().nullable().optional(),
});

export const idSchema = z.coerce.number().positive().int();

export type ResultSpoonacularDto = z.infer<typeof resultSpoonacularSchema>;
export type RecipeDto = z.infer<typeof recipeSchema>;
