import { useState } from 'react';
import {
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LogOut } from 'lucide-react-native';
import { useSession } from '@/auth/session-provider';
import { useUserProfile } from '@/hooks/use-user-profile';
import { ProfileView } from '@/components/settings/ProfileView';
import { ProfileEditForm } from '@/components/settings/ProfileEditForm';
import { API_BASE_URL } from '@/config/api';
import { appColors } from '@/theme/theme';

interface FormState {
  name: string;
  phone: string;
  street: string;
  streetNumber: string;
  postalCode: string;
  colony: string;
  city: string;
  state: string;
  businessName: string;
  rfc: string;
  vehicleType: string;
}

export function SettingsScreen() {
  const { logout } = useSession();
  const { profile, isLoading, isSaving, refetch } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: '',
    phone: '',
    street: '',
    streetNumber: '',
    postalCode: '',
    colony: '',
    city: '',
    state: '',
    businessName: '',
    rfc: '',
    vehicleType: '',
  });

  const openEdit = () => {
    if (!profile) return;
    setForm({
      name: profile.name ?? '',
      phone: profile.phone ?? '',
      street: profile.customerProfile?.street ?? profile.driverProfile?.street ?? '',
      streetNumber: profile.customerProfile?.streetNumber ?? profile.driverProfile?.streetNumber ?? '',
      postalCode: profile.customerProfile?.postalCode ?? profile.driverProfile?.postalCode ?? '',
      colony: profile.customerProfile?.colony ?? profile.driverProfile?.colony ?? '',
      city: profile.customerProfile?.city ?? profile.driverProfile?.city ?? '',
      state: profile.customerProfile?.state ?? profile.driverProfile?.state ?? '',
      businessName: profile.customerProfile?.businessName ?? '',
      rfc: profile.customerProfile?.rfc ?? '',
      vehicleType: profile.driverProfile?.vehicleType ?? '',
    });
    setIsEditing(true);
  };

  const handleSave = async () => {
    if (!profile) return;

    const payload: Record<string, string> = {};
    if (form.name !== profile.name) payload.name = form.name;
    if (form.phone !== (profile.phone ?? '')) payload.phone = form.phone;
    if (profile.role === 'cliente') {
      if (form.street !== (profile.customerProfile?.street ?? '')) payload.street = form.street;
      if (form.streetNumber !== (profile.customerProfile?.streetNumber ?? '')) payload.streetNumber = form.streetNumber;
      if (form.postalCode !== (profile.customerProfile?.postalCode ?? '')) payload.postalCode = form.postalCode;
      if (form.colony !== (profile.customerProfile?.colony ?? '')) payload.colony = form.colony;
      if (form.city !== (profile.customerProfile?.city ?? '')) payload.city = form.city;
      if (form.state !== (profile.customerProfile?.state ?? '')) payload.state = form.state;
      if (form.businessName !== (profile.customerProfile?.businessName ?? '')) payload.businessName = form.businessName;
      if (form.rfc !== (profile.customerProfile?.rfc ?? '')) payload.rfc = form.rfc;
    } else if (profile.role === 'repartidor') {
      if (form.street !== (profile.driverProfile?.street ?? '')) payload.street = form.street;
      if (form.streetNumber !== (profile.driverProfile?.streetNumber ?? '')) payload.streetNumber = form.streetNumber;
      if (form.postalCode !== (profile.driverProfile?.postalCode ?? '')) payload.postalCode = form.postalCode;
      if (form.colony !== (profile.driverProfile?.colony ?? '')) payload.colony = form.colony;
      if (form.city !== (profile.driverProfile?.city ?? '')) payload.city = form.city;
      if (form.state !== (profile.driverProfile?.state ?? '')) payload.state = form.state;
      if (form.vehicleType !== (profile.driverProfile?.vehicleType ?? '')) payload.vehicleType = form.vehicleType;
    }

    if (Object.keys(payload).length === 0) {
      setIsEditing(false);
      return;
    }

    const response = await fetch(`${API_BASE_URL}/users/profile/me`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      await refetch();
      setIsEditing(false);
    } else {
      Alert.alert('Error', 'No se pudo guardar los cambios');
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color={appColors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top', 'left', 'right']}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView
          className="flex-1"
          contentContainerStyle={{ paddingBottom: 32 }}
          showsVerticalScrollIndicator={false}
        >
          <View className="px-5 pt-4 pb-6">
            <View className="mb-5">
              <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
                MandaGo
              </Text>
              <Text className="text-3xl font-extrabold text-text mt-1">
                Configuración
              </Text>
              <Text className="text-sm text-text-muted mt-2 leading-5">
                Administra tu cuenta, preferencias y opciones de soporte.
              </Text>
            </View>

            {profile && (
              isEditing ? (
                <ProfileEditForm
                  profile={profile}
                  form={form}
                  isSaving={isSaving}
                  onFormChange={setForm}
                  onCancel={() => setIsEditing(false)}
                  onSave={handleSave}
                />
              ) : (
                <ProfileView profile={profile} onEdit={openEdit} />
              )
            )}

            <View className="mt-5 bg-surface border border-border rounded-2xl p-4">
              <Text className="text-base font-extrabold text-text mb-1">Cuenta</Text>
              <Text className="text-sm text-text-muted mb-4 leading-5">
                Cierra tu sesión en este dispositivo cuando lo necesites.
              </Text>

              <Pressable
                onPress={logout}
                className="py-4 rounded-xl items-center justify-center bg-red-500 active:bg-red-600 flex-row"
              >
                <LogOut size={18} color="white" />
                <Text className="text-white text-base font-semibold ml-2">
                  Cerrar sesión
                </Text>
              </Pressable>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}