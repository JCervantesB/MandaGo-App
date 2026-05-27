import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import type { UserProfile } from '@/hooks/use-user-profile';
import { appColors } from '@/theme/theme';
import { VEHICLE_TYPES } from '@/constants/vehicle-types';

interface ProfileFormState {
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

interface ProfileEditFormProps {
  profile: UserProfile;
  form: ProfileFormState;
  isSaving: boolean;
  onFormChange: (form: ProfileFormState) => void;
  onCancel: () => void;
  onSave: () => void;
}

// Formulario para editar datos del perfil de usuario
export function ProfileEditForm({
  profile,
  form,
  isSaving,
  onFormChange,
  onCancel,
  onSave,
}: ProfileEditFormProps) {
  const update = (field: keyof ProfileFormState, value: string) => {
    onFormChange({ ...form, [field]: value });
  };

  return (
    <View className="bg-surface border border-border rounded-2xl p-4 mb-5">
      <View className="flex-row justify-between items-center mb-4">
        <Text className="text-base font-extrabold text-text">Editar perfil</Text>
        <Pressable onPress={onCancel}>
          <Text className="text-sm font-semibold text-text/60">Cancelar</Text>
        </Pressable>
      </View>

      <View className="gap-4">
        <View className="gap-1.5">
          <Text className="text-sm font-semibold text-text">Nombre</Text>
          <TextInput
            className="border border-border rounded-xl p-3 text-base text-text bg-white"
            value={form.name}
            onChangeText={(v) => update('name', v)}
            placeholder="Tu nombre"
            placeholderTextColor={appColors.textSoft}
          />
        </View>

        <View className="gap-1.5">
          <Text className="text-sm font-semibold text-text">Teléfono</Text>
          <TextInput
            className="border border-border rounded-xl p-3 text-base text-text bg-white"
            value={form.phone}
            onChangeText={(v) => update('phone', v)}
            placeholder="+52 55 1234 5678"
            placeholderTextColor={appColors.textSoft}
            keyboardType="phone-pad"
          />
        </View>

        {profile.role === 'cliente' && (
          <>
            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-text">Nombre comercial</Text>
              <TextInput
                className="border border-border rounded-xl p-3 text-base text-text bg-white"
                value={form.businessName}
                onChangeText={(v) => update('businessName', v)}
                placeholder="Nombre de tu negocio"
                placeholderTextColor={appColors.textSoft}
              />
            </View>

            <View className="gap-1.5">
              <Text className="text-sm font-semibold text-text">RFC</Text>
              <TextInput
                className="border border-border rounded-xl p-3 text-base text-text bg-white"
                value={form.rfc}
                onChangeText={(v) => update('rfc', v.toUpperCase())}
                placeholder="XAXX010101000"
                placeholderTextColor={appColors.textSoft}
                autoCapitalize="characters"
                maxLength={13}
              />
            </View>
          </>
        )}

        {profile.role === 'repartidor' && (
          <View className="gap-1.5">
            <Text className="text-sm font-semibold text-text">Tipo de vehículo</Text>
            <View className="flex-row flex-wrap gap-2">
              {VEHICLE_TYPES.map((vt) => (
                <Pressable
                  key={vt.value}
                  onPress={() => update('vehicleType', vt.value)}
                  className={`py-2 px-4 rounded-lg border ${
                    form.vehicleType === vt.value ? 'border-primary bg-primary' : 'border-border bg-white'
                  }`}
                >
                  <Text className={`text-sm font-medium ${form.vehicleType === vt.value ? 'text-white' : 'text-text'}`}>
                    {vt.label}
                  </Text>
                </Pressable>
              ))}
            </View>
          </View>
        )}

        <View className="h-px bg-border" />

        <Text className="text-sm font-semibold text-text">Dirección</Text>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">Calle</Text>
            <TextInput
              className="border border-border rounded-xl p-3 text-base text-text bg-white"
              value={form.street}
              onChangeText={(v) => update('street', v)}
              placeholder="Av. Principal"
              placeholderTextColor={appColors.textSoft}
            />
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">No. Ext.</Text>
            <TextInput
              className="border border-border rounded-xl p-3 text-base text-text bg-white"
              value={form.streetNumber}
              onChangeText={(v) => update('streetNumber', v)}
              placeholder="123"
              placeholderTextColor={appColors.textSoft}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">Código postal</Text>
            <TextInput
              className="border border-border rounded-xl p-3 text-base text-text bg-white"
              value={form.postalCode}
              onChangeText={(v) => update('postalCode', v.replace(/[^0-9]/g, '').slice(0, 5))}
              placeholder="55000"
              placeholderTextColor={appColors.textSoft}
              keyboardType="number-pad"
              maxLength={5}
            />
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">Colonia</Text>
            <TextInput
              className="border border-border rounded-xl p-3 text-base text-text bg-white"
              value={form.colony}
              onChangeText={(v) => update('colony', v)}
              placeholder="Centro"
              placeholderTextColor={appColors.textSoft}
            />
          </View>
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">Ciudad</Text>
            <TextInput
              className="border border-border rounded-xl p-3 text-base text-text bg-white"
              value={form.city}
              onChangeText={(v) => update('city', v)}
              placeholder="Ciudad de México"
              placeholderTextColor={appColors.textSoft}
            />
          </View>
          <View className="flex-1 gap-1.5">
            <Text className="text-sm font-semibold text-text">Estado</Text>
            <TextInput
              className="border border-border rounded-xl p-3 text-base text-text bg-white"
              value={form.state}
              onChangeText={(v) => update('state', v)}
              placeholder="CDMX"
              placeholderTextColor={appColors.textSoft}
            />
          </View>
        </View>

        <View className="flex-row gap-3 pt-2">
          <Pressable
            onPress={onCancel}
            className="flex-1 py-3 rounded-xl items-center justify-center border border-border"
          >
            <Text className="text-base font-semibold text-text">Cancelar</Text>
          </Pressable>
          <Pressable
            onPress={onSave}
            disabled={isSaving}
            className={`flex-1 py-3 rounded-xl items-center justify-center ${
              isSaving ? 'opacity-60 bg-primary' : 'bg-primary active:bg-primary-pressed'
            }`}
          >
            {isSaving ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text className="text-white text-base font-semibold">Guardar</Text>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}