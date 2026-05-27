/**
 * Hook para verificar acceso basado en el rol del usuario.
 * Utilizado para proteger rutas específicas de cada tipo de usuario.
 */
import { useSession } from './session-provider';
import type { UserRole } from '@/navigation/types';

/**
 * Resultado de la verificación de acceso.
 */
export type AccessResult = {
  hasAccess: boolean;
  requiredRole?: UserRole;
  message?: string;
};

/**
 * Verifica si el usuario tiene el rol requerido.
 * @param requiredRole - Rol requerido para acceder a la pantalla
 * @returns Objeto con resultado de acceso
 */
export function useRoleGuard(requiredRole?: UserRole): AccessResult {
  const { session, onboardingStatus } = useSession();

  // Sin sesión
  if (!session) {
    return {
      hasAccess: false,
      message: 'Debes iniciar sesión para acceder',
    };
  }

  // Cuenta no activa
  if (onboardingStatus?.status !== 'activo') {
    return {
      hasAccess: false,
      message: 'Debes completar tu perfil para acceder',
    };
  }

  // Verificar rol si se requiere
  if (requiredRole) {
    const userRole = session.user.role as UserRole | undefined;
    
    if (userRole !== requiredRole) {
      return {
        hasAccess: false,
        requiredRole,
        message: `Esta sección es solo para ${getRoleLabel(requiredRole)}s`,
      };
    }
  }

  return { hasAccess: true };
}

/**
 * Obtiene la etiqueta legible de un rol.
 */
function getRoleLabel(role: UserRole): string {
  const labels: Record<UserRole, string> = {
    cliente: 'cliente',
    repartidor: 'repartidor',
    admin: 'administrador',
  };
  return labels[role] || role;
}

/**
 * Verifica si el usuario es cliente.
 */
export function useIsClient(): boolean {
  const { session } = useSession();
  return session?.user?.role === 'cliente';
}

/**
 * Verifica si el usuario es repartidor.
 */
export function useIsDelivery(): boolean {
  const { session } = useSession();
  return session?.user?.role === 'repartidor';
}

/**
 * Verifica si el usuario es admin.
 */
export function useIsAdmin(): boolean {
  const { session } = useSession();
  return session?.user?.role === 'admin';
}