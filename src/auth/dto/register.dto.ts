import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().trim().toLowerCase().pipe(z.email()),

  senha: z
    .string()
    .min(8, 'senha com no minimo 8 caracteres')
    .max(128, 'senha com no maximo 128 caracteres'),
  /*.regex(/[A-Z]/, "A senha deve conter pelo menos uma letra maiúscula")
         .regex(/[a-z]/, "A senha deve conter pelo menos uma letra minúscula")
         .regex(/[0-9]/, "A senha deve conter pelo menos um número")
         .regex(/^[^-\s]*$/, 'nao pode haver espaço ou hífens na senha')
         .refine(
                  ((senha) => senha !== 'Ap3nasTeste'),
                  ('nao pode por senha "Ap3nasTeste"')
                ),*/
});

export type RegisterDto = z.infer<typeof registerSchema>;
