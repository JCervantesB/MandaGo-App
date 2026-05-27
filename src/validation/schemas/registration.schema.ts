import { z } from 'zod';

export const registrationSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .regex(/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ\s]+$/u, 'El nombre solo debe contener letras'),
  email: z
    .string()
    .trim()
    .min(1, 'El email es requerido')
    .email('Ingresa un email válido'),
  password: z
    .string()
    .min(8, 'La contraseña debe tener al menos 8 caracteres')
    .regex(/[A-Z]/, 'Incluye al menos una mayúscula')
    .regex(/[a-z]/, 'Incluye al menos una minúscula')
    .regex(/[0-9]/, 'Incluye al menos un número')
    .regex(/[^\w\s]/, 'Incluye al menos un caracter especial'),
  phone: z
    .string()
    .transform((value) => value.replace(/\D/g, ''))
    .refine((value) => value.length === 10, 'El teléfono debe tener 10 dígitos'),
  role: z.enum(['cliente', 'repartidor']),
});

export type RegistrationFormData = z.infer<typeof registrationSchema>;

export function validateRegistrationForm(data: RegistrationFormData) {
  const result = registrationSchema.safeParse(data);
  if (result.success) {
    return { ok: true };
  }
  const firstError = result.error.issues[0];
  return { ok: false, message: firstError?.message ?? 'Error de validación' };
}