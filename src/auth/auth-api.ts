import { API_BASE_URL } from '../config/api';

/**
 * Estructura de la sesión de usuario autenticado.
 * Contiene los datos del usuario incluyendo su rol y estado de autenticación.
 */
export type AuthSession = {
  user: {
    id: string;
    email: string;
    name: string;
    role?: 'admin' | 'cliente' | 'repartidor';
  };
};

/**
 * Datos de entrada para el registro de usuario con email.
 */
type SignUpEmailInput = {
  name: string;
  email: string;
  password: string;
};

/**
 * Registra un nuevo usuario con email y contraseña.
 * @param input - Datos del usuario a registrar
 * @returns Respuesta del servidor
 * @throws Error si el registro falla
 */
type SignUpResponse = { message?: string };

export async function signUpEmail(input: SignUpEmailInput) {
  const res = await safeFetch(`${API_BASE_URL}/auth/sign-up/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await safeJson<{ message?: string }>(res);
    throw new Error(body?.message ?? 'No se pudo registrar');
  }

  return safeJson<SignUpResponse>(res);
}

type SignInResponse = { message?: string };

// Inicia sesión con email y contraseña
export async function signInEmail(input: { email: string; password: string }) {
  const res = await safeFetch(`${API_BASE_URL}/auth/sign-in/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(input),
  });

  if (!res.ok) {
    const body = await safeJson<{ message?: string }>(res);
    throw new Error(body?.message ?? 'No se pudo iniciar sesión');
  }

  return safeJson<SignInResponse>(res);
}

/**
 * Cierra la sesión del usuario actual y elimina los datos de autenticación.
 * Realiza una llamada al backend y limpia los datos locales.
 * 
 * @throws Error si la solicitud falla
 */
export async function signOut() {
  await safeFetch(`${API_BASE_URL}/auth/sign-out`, {
    method: 'POST',
    credentials: 'include',
  });
}

/**
 * Obtiene la sesión actual del usuario con su rol desde el backend.
 * Verifica la autenticación del usuario y obtiene su información actualizada.
 * 
 * @returns Sesión del usuario con rol o null si no hay sesión activa
 * @throws Error si la solicitud falla
 */
type GetSessionResponse = { session?: unknown; user?: AuthSession['user'] };

export async function getSession(): Promise<AuthSession | null> {
  const res = await safeFetch(`${API_BASE_URL}/auth/get-session-with-role`, {
    method: 'GET',
    credentials: 'include',
  });

  if (!res.ok) return null;

  const body = await safeJson<GetSessionResponse>(res);

  if (!body?.session || !body?.user) return null;

  return {
    user: body.user,
  };
}

/**
 * Convierte la respuesta HTTP a JSON de forma segura.
 * Maneja errores de parseo JSON de forma consistente.
 *
 * @param res - Objeto Response de fetch
 * @returns Datos JSON parseados o null si hay error durante el parseo
 */
async function safeJson<TData>(res: Response): Promise<TData | null> {
  try {
    return await res.json() as TData;
  } catch {
    return null;
  }
}

async function safeFetch(
  url: string,
  init: RequestInit,
): Promise<Response> {
  try {
    return await fetch(url, init);
  } catch (e) {
    const message =
      e instanceof Error ? e.message : 'Error de red desconocido';
    throw new Error(
      `No se pudo conectar con el servidor (${url}). Detalle: ${message}`,
    );
  }
}

