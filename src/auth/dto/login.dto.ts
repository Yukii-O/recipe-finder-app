import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),

  senha: z.string().min(1).max(128, 'senha com no maximo 128 caracteres'),
});

export type LoginDto = z.infer<typeof loginSchema>;
