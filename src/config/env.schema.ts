import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32, 'JWT precisa de minimo 32 caracteres'),
  JWT_EXPIRES_IN: z.string().default('7d'),
  SPOONACULAR_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  PORT: z.coerce.number(),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
});

export type EnvConfig = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): EnvConfig {
  const result = envSchema.safeParse(config);
  if (!result.success) {
    console.error('Erro de Validação', z.treeifyError(result.error));
    throw new Error('Config invalida');
  }
  return result.data;
}
