import { View, Text } from 'react-native';
import { useSession } from '@/auth/session-provider';
import { appColors } from '@/theme/theme';

interface UserProfileCardProps {
  showFullDetails?: boolean;
}

// Tarjeta de perfil de usuario con nombre, rol y estado
export function UserProfileCard({ showFullDetails = true }: UserProfileCardProps) {
  const { session, onboardingStatus } = useSession();

  const userName = session?.user?.name || 'Usuario';
  const userEmail = session?.user?.email || '';
  const userRole = session?.user?.role || 'cliente';
  const userStatus = userRole === 'admin' ? 'activo' : (onboardingStatus?.status || 'pendiente_verificacion');

  // Etiqueta de rol de usuario
  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Administrador';
      case 'cliente':
        return 'Cliente';
      case 'repartidor':
        return 'Repartidor';
      default:
        return 'Usuario';
    }
  };

  // Etiqueta de estado de usuario
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'activo':
        return 'Activo';
      case 'pendiente_verificacion':
        return 'Pendiente de verificación';
      case 'deshabilitado':
        return 'Deshabilitado';
      default:
        return 'Desconocido';
    }
  };

  // Color de estado de usuario
  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'activo':
        return appColors.success;
      case 'pendiente_verificacion':
        return appColors.warning;
      case 'deshabilitado':
        return appColors.error;
      default:
        return appColors.textMuted;
    }
  };

  return (
    <View className="bg-white rounded-2xl overflow-hidden">
      <View className="items-center py-6 border-b border-border">
        <View className="w-20 h-20 rounded-full bg-primary items-center justify-center mb-3">
          <Text className="text-2xl font-bold text-white">
            {userName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text className="text-xl font-bold text-text">{userName}</Text>
        <Text className="text-sm text-text/70 mt-1">{userEmail}</Text>
      </View>

      {showFullDetails && (
        <View className="p-4">
          <Text className="text-sm font-semibold text-text mb-3">Información de la cuenta</Text>

          <View className="flex-row justify-between py-2.5 border-b border-border">
            <Text className="text-sm text-text/60">Rol</Text>
            <Text className="text-sm font-medium text-text">{getRoleLabel(userRole)}</Text>
          </View>

          <View className="flex-row justify-between py-2.5 border-b border-border">
            <Text className="text-sm text-text/60">Estado</Text>
            <Text className="text-sm font-medium" style={{ color: getStatusColor(userStatus) }}>
              {getStatusLabel(userStatus)}
            </Text>
          </View>

          {onboardingStatus?.profileCompleted && (
            <View className="flex-row justify-between py-2.5">
              <Text className="text-sm text-text/60">Perfil</Text>
              <Text className="text-sm font-medium text-text">Completado</Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
}