import { z } from 'zod';

export const envSchema = z.object({
  DATABASE_URL: z.url(),
  JWT_SECRET: z.string().min(32, 'JWT precisa de minimo 32 caracteres'),
  JWT_EXPIRES_IN: z
    .string()
    .regex(/^[1-9]\d*[smhd]$/, {
      message:
        "Formato inválido. Use um número maior que zero seguido de s, m, h ou d (ex: '7d', '2h', '30m').",
    })
    .pipe(
      z.string().refine(
        (val) => {
          const num = parseInt(val.slice(0, -1), 10);
          const unit = val.slice(-1);

          if (unit === 'd') return num <= 30;
          if (unit === 'h') return num <= 720;
          if (unit === 'm') return num <= 43200;
          return num <= 2592000;
        },
        { message: 'A validade do JWT não pode ultrapassar 30 dias.' },
      ),
    )
    .default('7d'),
  SPOONACULAR_API_KEY: z.string().min(1),
  OPENAI_API_KEY: z.string().optional(),
  PORT: z.coerce.number().int().min(1).max(65535).default(3000),
  THROTTLE_TTL_MS: z.coerce.number().positive().int(),
  THROTTLE_LIMIT: z.coerce.number().positive().int(),
  CACHE_SEARCH_TTL_MS: z.coerce
    .number()
    .positive()
    .int()
    .max(3600000)
    .default(600000),
  CACHE_DETAIL_TTL_MS: z.coerce
    .number()
    .positive()
    .int()
    .max(3600000)
    .default(1800000),
  CACHE_DETAIL_NOT_FOUND_TTL_MS: z.coerce
    .number()
    .positive()
    .int()
    .max(300000)
    .default(150000),
  CACHE_MAX: z.coerce.number().positive().int().max(1000).default(100),

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
