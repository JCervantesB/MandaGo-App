import { z } from 'zod';

const base64DocumentSchema = z.object({
  base64: z.string().min(1, 'El documento es requerido'),
  mimeType: z.string().min(1, 'El tipo de archivo es requerido'),
  fileName: z.string().optional(),
});

export const clientOnboardingSchema = z.object({
  street: z
    .string()
    .trim()
    .min(3, 'Ingresa una calle válida'),
  streetNumber: z.string().optional(),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Código postal inválido (5 dígitos)'),
  colony: z
    .string()
    .trim()
    .min(2, 'Ingresa una colonia válida'),
  city: z
    .string()
    .trim()
    .min(2, 'Ingresa una ciudad válida'),
  state: z
    .string()
    .trim()
    .min(2, 'Ingresa un estado válido'),
  rfc: z
    .string()
    .trim()
    .regex(/^[A-Z&Ñ]{3,4}\d{6}[A-Z0-9]{3}$/i, 'RFC inválido (formato: XXXX000000XXX)'),
  businessName: z
    .string()
    .trim()
    .min(3, 'Ingresa un nombre comercial válido'),
});

export type ClientOnboardingData = z.infer<typeof clientOnboardingSchema>;

export const driverOnboardingSchema = z.object({
  street: z
    .string()
    .trim()
    .min(3, 'Ingresa una calle válida'),
  streetNumber: z.string().optional(),
  postalCode: z
    .string()
    .trim()
    .regex(/^\d{5}$/, 'Código postal inválido (5 dígitos)'),
  colony: z
    .string()
    .trim()
    .min(2, 'Ingresa una colonia válida'),
  city: z
    .string()
    .trim()
    .min(2, 'Ingresa una ciudad válida'),
  state: z
    .string()
    .trim()
    .min(2, 'Ingresa un estado válido'),
  vehicleType: z
    .string()
    .min(1, 'Selecciona el tipo de vehículo'),
  ine: base64DocumentSchema,
  driverLicense: base64DocumentSchema,
  vehiclePhoto: base64DocumentSchema,
});

export type DriverOnboardingData = z.infer<typeof driverOnboardingSchema>;

export type FieldErrors = Partial<Record<keyof ClientOnboardingData | keyof DriverOnboardingData, string>>;

export function validateClientOnboarding(data: ClientOnboardingData) {
  const result = clientOnboardingSchema.safeParse(data);
  if (result.success) {
    return { ok: true, errors: {} };
  }
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0] as keyof ClientOnboardingData;
    if (!errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
  });
  return { ok: false, errors };
}

export function validateDriverOnboarding(data: DriverOnboardingData) {
  const result = driverOnboardingSchema.safeParse(data);
  if (result.success) {
    return { ok: true, errors: {} };
  }
  const errors: Record<string, string> = {};
  result.error.issues.forEach((issue) => {
    const fieldName = issue.path[0] as keyof DriverOnboardingData;
    if (!errors[fieldName]) {
      errors[fieldName] = issue.message;
    }
  });
  return { ok: false, errors };
}