import { Pressable, View, Text } from 'react-native';
import type { UserProfile } from '@/hooks/use-user-profile';
import { VEHICLE_TYPES, getVehicleLabel } from '@/constants/vehicle-types';

interface ProfileViewProps {
  profile: UserProfile;
  onEdit: () => void;
}

// Vista de solo lectura de los datos del perfil
export function ProfileView({ profile, onEdit }: ProfileViewProps) {
  return (
    <View className="bg-surface border border-border rounded-2xl p-4 mb-5">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-base font-extrabold text-text">Datos personales</Text>
        <Pressable onPress={onEdit}>
          <Text className="text-sm font-semibold text-primary">Editar</Text>
        </Pressable>
      </View>

      <View className="flex-row justify-between py-2.5 border-b border-border">
        <Text className="text-sm text-text/60">Nombre</Text>
        <Text className="text-sm font-medium text-text">{profile.name}</Text>
      </View>
      <View className="flex-row justify-between py-2.5 border-b border-border">
        <Text className="text-sm text-text/60">Email</Text>
        <Text className="text-sm font-medium text-text">{profile.email}</Text>
      </View>
      <View className="flex-row justify-between py-2.5 border-b border-border">
        <Text className="text-sm text-text/60">Teléfono</Text>
        <Text className="text-sm font-medium text-text">{profile.phone ?? 'No establecido'}</Text>
      </View>

      {profile.role === 'cliente' && profile.customerProfile && (
        <>
          {profile.customerProfile.businessName && (
            <View className="flex-row justify-between py-2.5 border-b border-border">
              <Text className="text-sm text-text/60">Nombre comercial</Text>
              <Text className="text-sm font-medium text-text">{profile.customerProfile.businessName}</Text>
            </View>
          )}
          {profile.customerProfile.rfc && (
            <View className="flex-row justify-between py-2.5 border-b border-border">
              <Text className="text-sm text-text/60">RFC</Text>
              <Text className="text-sm font-medium text-text">{profile.customerProfile.rfc}</Text>
            </View>
          )}
          <View className="flex-row justify-between py-2.5 border-b border-border">
            <Text className="text-sm text-text/60">Dirección</Text>
            <Text className="text-sm font-medium text-text text-right flex-1 ml-4">
              {profile.customerProfile.street}
              {profile.customerProfile.streetNumber ? ` ${profile.customerProfile.streetNumber}` : ''}
            </Text>
          </View>
          <View className="flex-row justify-between py-2.5">
            <Text className="text-sm text-text/60">Ciudad</Text>
            <Text className="text-sm font-medium text-text">
              {profile.customerProfile.city}, {profile.customerProfile.state}
            </Text>
          </View>
        </>
      )}

      {profile.role === 'repartidor' && profile.driverProfile && (
        <>
          {profile.driverProfile.vehicleType && (
            <View className="flex-row justify-between py-2.5 border-b border-border">
              <Text className="text-sm text-text/60">Vehículo</Text>
              <Text className="text-sm font-medium text-text">
                {getVehicleLabel(profile.driverProfile?.vehicleType ?? '')}
              </Text>
            </View>
          )}
          <View className="flex-row justify-between py-2.5 border-b border-border">
            <Text className="text-sm text-text/60">Dirección</Text>
            <Text className="text-sm font-medium text-text text-right flex-1 ml-4">
              {profile.driverProfile.street}
              {profile.driverProfile.streetNumber ? ` ${profile.driverProfile.streetNumber}` : ''}
            </Text>
          </View>
          <View className="flex-row justify-between py-2.5">
            <Text className="text-sm text-text/60">Ciudad</Text>
            <Text className="text-sm font-medium text-text">
              {profile.driverProfile.city}, {profile.driverProfile.state}
            </Text>
          </View>
        </>
      )}
    </View>
  );
}