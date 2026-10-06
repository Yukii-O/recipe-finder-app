import { z } from 'zod';

export const resultSpoonacularSchema = z.object({
  results: z.array(
    z.object({
      id: z.coerce.number().min(1),
      title: z.string().min(1).max(100),
      image: z.url(),
      //.refine((file) => file <= 10 * 1000 * 1024)
      //.refine((file) => file.type === 'image/jpg'), //possivel opcional
      imageType: z.string().refine((file) => file === 'jpg'),
    }),
  ),
  offset: z.coerce.number().min(0),
  number: z.coerce.number().min(1),
  totalResults: z.coerce.number(),
});

export const recipeSchema = z.object({
  id: z.coerce.number().min(1),
  image: z.url(),
  imageType: z.enum(['jpg', 'png', 'webp']),
  title: z.string(),
  readyInMinutes: z.coerce.number(),
  servings: z.coerce.number(),
  sourceUrl: z.url(),
  vegetarian: z.boolean(),
  vegan: z.boolean(),
  glutenFree: z.boolean(),
  dairyFree: z.boolean(),
  veryHealthy: z.boolean(),
  cheap: z.boolean(),
  veryPopular: z.boolean(),
  sustainable: z.boolean(),
  lowFodmap: z.boolean(),
  weightWatcherSmartPoints: z.coerce.number(),
  gaps: z.enum(['no', 'yes']),
  preparationMinutes: z.number().nullable(),
  cookingMinutes: z.number().nullable(),
  aggregateLikes: z.coerce.number(),
  healthScore: z.coerce.number(),
  creditsText: z.string(),
  license: z.string().nullable().optional(),
  sourceName: z.string(),
  pricePerServing: z.coerce.number(),

  extendedIngredients: z.array(
    z.object({
      id: z.coerce.number(),
      image: z.string(),
      name: z.string(),
      amount: z.coerce.number(),
      unit: z.string(),
    }),
  ),

  summary: z.string(),
  cuisines: z.array(z.string()),
  dishTypes: z.array(z.string()),
  diets: z.array(z.string()),
  instructions: z.string(),
});

export type ResultSpoonacularDto = z.infer<typeof resultSpoonacularSchema>;
export type RecipeDto = z.infer<typeof recipeSchema>;
