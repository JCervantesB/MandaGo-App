import { API_BASE_URL } from '../config/api';

/**
 * Estado mínimo del usuario para el flujo de onboarding/verificación.
 * Contiene la información necesaria para decidir la navegación en la aplicación.
 * 
 * @property id - Identificador único del usuario
 * @property role - Rol del usuario en el sistema
 * @property status - Estado actual del usuario (verificación, activo, deshabilitado)
 * @property profileCompleted - Indica si el perfil del usuario está completo (opcional)
 * 
 * Nota:
 * - El backend expone estos valores desde la tabla `user`.
 * - Se usa para decidir si la app debe mostrar Onboarding o Home.
 */
export type OnboardingStatus = {
  id: string;
  role: 'admin' | 'cliente' | 'repartidor';
  status: 'pendiente_verificacion' | 'activo' | 'deshabilitado';
  profileCompleted?: boolean;
};

/**
 * Completa datos mínimos post-registro (rol + teléfono + nombre).
 * Permite al usuario finalizar el registro inicial con información básica.
 * @returns Respuesta del backend con estado actualizado del usuario
 * @throws Error si la solicitud falla o el backend devuelve error
 */
type SetupResponse = { message?: string };

export async function onboardingSetup(input: {
  role: 'cliente' | 'repartidor';
  phone: string;
  name: string;
}) {
  const res = await fetch(`${API_BASE_URL}/onboarding/setup`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await safeJson<{ message?: string }>(res);
    throw new Error(body?.message ?? 'No se pudo completar el registro');
  }

  return safeJson<SetupResponse>(res);
}

/**
 * Obtiene el estado actual del usuario autenticado para decidir navegación.
 * Determina si el usuario debe ser dirigido al Home o al Onboarding.
 * 
 * @returns Estado del usuario o `null` si no hay sesión válida
 * @throws Error si la solicitud falla
 */
export async function getOnboardingStatus(): Promise<OnboardingStatus | null> {
  const res = await fetch(`${API_BASE_URL}/onboarding/status`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) return null;

  const body = (await safeJson(res)) as OnboardingStatus | null;
  return body ?? null;
}

/**
 * Completa el onboarding del cliente con datos fiscales y de dirección.
 * Permite a clientes finalizar su perfil con información comercial y fiscal.
 */
type ClientOnboardingResponse = { message?: string };

export async function completeClientOnboarding(input: {
  street: string;
  streetNumber?: string;
  postalCode: string;
  colony: string;
  city: string;
  state: string;
  rfc: string;
  businessName: string;
}) {
  const res = await fetch(`${API_BASE_URL}/onboarding/complete/client`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await safeJson<{ message?: string }>(res);
    throw new Error(body?.message ?? 'No se pudo completar el registro');
  }

  return safeJson<ClientOnboardingResponse>(res);
}

type PostalLookupResponse = {
  postalCode: string;
  city: string | null;
  neighborhoods: string[];
};

// Busca información de código postal para autocompletar dirección
export async function lookupPostalCode(postalCode: string): Promise<PostalLookupResponse | null> {
  const res = await fetch(
    `${API_BASE_URL}/onboarding/postal-lookup?postalCode=${postalCode}`,
    {
      method: 'GET',
      credentials: 'include',
    },
  );

  if (!res.ok) return null;
  return safeJson<PostalLookupResponse>(res);
}

/**
 * Tipo para documentos en formato base64 durante el proceso de onboarding.
 * Permite subir documentos de identificación y otros requerimientos.
 */
export type Base64DocumentInput = {
  /** Contenido del documento codificado en base64 */
  base64: string;
  mimeType: string;
  fileName?: string;
};

/**
 * Completa el onboarding del repartidor con dirección y documentación requerida.
 * Permite a repartidores finalizar su perfil con información personal y documentos legales.
 */
type DriverOnboardingResponse = { message?: string };

export async function completeDriverOnboarding(input: {
  street: string;
  streetNumber?: string;
  postalCode: string;
  colony: string;
  city: string;
  state: string;
  vehicleType: string;
  ine: Base64DocumentInput;
  driverLicense: Base64DocumentInput;
  vehiclePhoto: Base64DocumentInput;
}) {
  const res = await fetch(`${API_BASE_URL}/onboarding/complete/driver`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await safeJson<{ message?: string }>(res);
    throw new Error(body?.message ?? 'No se pudo completar el registro');
  }

  return safeJson<DriverOnboardingResponse>(res);
}

/**
 * Convierte la respuesta HTTP a JSON de forma segura.
 * @param res - Objeto Response de fetch
 * @returns Datos JSON o null si hay error
 */
async function safeJson<TData>(res: Response): Promise<TData | null> {
  try {
    return await res.json() as TData;
  } catch {
    return null;
  }
}
