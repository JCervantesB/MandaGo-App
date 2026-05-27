import { z } from 'zod';

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(1, 'La contraseña es requerida'),
});

export type LoginFormData = z.infer<typeof loginSchema>;

export function validateLoginForm(data: LoginFormData) {
  const result = loginSchema.safeParse(data);
  if (result.success) {
    return { ok: true };
  }
  const firstError = result.error.issues[0];
  return { ok: false, message: firstError?.message ?? 'Error de validación' };
}