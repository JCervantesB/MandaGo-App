import {
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
import { ServiceFeesEditor } from '@/components/admin-components/ServiceFeesEditor';
import { appColors } from '@/theme/theme';

export function AdminSettingsScreen() {
  const { logout } = useSession();
  const { profile, isLoading } = useUserProfile();

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
                Administra la plataforma y preferencias del sistema.
              </Text>
            </View>

            {profile && (
              <View className="bg-surface border border-border rounded-2xl p-4 mb-5">
                <Text className="text-base font-extrabold text-text mb-4">Cuenta de administrador</Text>
                <View className="flex-row justify-between py-2.5 border-b border-border">
                  <Text className="text-sm text-text/60">Nombre</Text>
                  <Text className="text-sm font-medium text-text">{profile.name}</Text>
                </View>
                <View className="flex-row justify-between py-2.5 border-b border-border">
                  <Text className="text-sm text-text/60">Email</Text>
                  <Text className="text-sm font-medium text-text">{profile.email}</Text>
                </View>
                <View className="flex-row justify-between py-2.5">
                  <Text className="text-sm text-text/60">Rol</Text>
                  <Text className="text-sm font-medium text-primary">Administrador</Text>
                </View>
              </View>
            )}

            <ServiceFeesEditor />

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