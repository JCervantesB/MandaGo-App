import type { PropsWithChildren } from 'react';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { getSession, type AuthSession, signOut } from './auth-api';
import { getOnboardingStatus, type OnboardingStatus } from './onboarding-api';

/**
 * Rol elegido durante el registro (antes de que el backend lo persista o antes de reconsultar estado).
 *
 * Nota:
 * - Se usa solo para mejorar UX inmediatamente después de crear cuenta.
 */
export type PostAuthRole = 'cliente' | 'repartidor';

export type SessionState = {
  isLoading: boolean;
  session: AuthSession | null;
  postAuthRole: PostAuthRole | null;
  onboardingStatus: OnboardingStatus | null;
  
  refresh: () => Promise<void>;

  logout: () => Promise<void>;

  setPostAuthRole: (role: PostAuthRole) => void;

  clearPostAuthRole: () => void;
};

/**
 * Archivo: session-provider
 *
 * Propósito:
 * - Centralizar la sesión de Better Auth en la app móvil (Fase 11.2).
 *
 * Nota:
 * - Por simplicidad inicial, se usa cookie-session del backend y `fetch(..., credentials: 'include')`.
 */
const SessionContext = createContext<SessionState | null>(null);

const SESSION_STORAGE_KEY = 'mandago.session';
const ONBOARDING_STORAGE_KEY = 'mandago.onboardingStatus';

// Carga datos JSON desde secure storage
async function loadJson<TData>(key: string): Promise<TData | null> {
  const raw = await SecureStore.getItemAsync(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TData;
  } catch {
    return null;
  }
}

async function saveJson(key: string, value: unknown) {
  await SecureStore.setItemAsync(key, JSON.stringify(value));
}

async function removeKeys(keys: string[]) {
  await Promise.all(keys.map((k) => SecureStore.deleteItemAsync(k)));
}

// Contexto de sesión
export function SessionProvider({ children }: PropsWithChildren) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState<AuthSession | null>(null);
  const [postAuthRole, setPostAuthRoleState] = useState<PostAuthRole | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatus | null>(null);

  const refresh = async () => {
    setIsLoading(true);
    try {
      const s = await getSession();
      setSession(s);
      if (s) {
        const status = await getOnboardingStatus();
        setOnboardingStatus(status);
        await Promise.all([
          saveJson(SESSION_STORAGE_KEY, s),
          saveJson(ONBOARDING_STORAGE_KEY, status),
        ]);
      } else {
        setOnboardingStatus(null);
        setPostAuthRoleState(null);
        await removeKeys([SESSION_STORAGE_KEY, ONBOARDING_STORAGE_KEY]);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    await signOut();
    setSession(null);
    setPostAuthRoleState(null);
    setOnboardingStatus(null);
    await removeKeys([SESSION_STORAGE_KEY, ONBOARDING_STORAGE_KEY]);
  };

  const setPostAuthRole = useCallback((role: PostAuthRole) => {
    setPostAuthRoleState(role);
  }, []);

  const clearPostAuthRole = useCallback(() => {
    setPostAuthRoleState(null);
  }, []);

  // Inicializa sesión y estado de onboarding desde el backend
  useEffect(() => {
    const bootstrap = async () => {
      const [cachedSession, cachedStatus] = await Promise.all([
        loadJson<AuthSession>(SESSION_STORAGE_KEY),
        loadJson<OnboardingStatus>(ONBOARDING_STORAGE_KEY),
      ]);

      if (cachedSession) setSession(cachedSession);
      if (cachedStatus) setOnboardingStatus(cachedStatus);

      await refresh();
    };

    void bootstrap();
  }, []);

  const value = useMemo<SessionState>(
    () => ({
      isLoading,
      session,
      postAuthRole,
      onboardingStatus,
      refresh,
      logout,
      setPostAuthRole,
      clearPostAuthRole,
    }),
    [
      isLoading,
      session,
      postAuthRole,
      onboardingStatus,
      setPostAuthRole,
      clearPostAuthRole,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession() {
  const ctx = useContext(SessionContext);
  if (!ctx) {
    throw new Error('useSession debe usarse dentro de SessionProvider');
  }
  return ctx;
}
