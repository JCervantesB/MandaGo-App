import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import type { RootStackParamList } from '@/navigation/types';
import { signUpEmail } from '@/auth/auth-api';
import { onboardingSetup } from '@/auth/onboarding-api';
import { useSession } from '@/auth/session-provider';
import { registrationSchema } from '@/validation/schemas';
import {
  FormLayout,
  FormField,
  FormSubmitButton,
  FormError,
  FormPhoneInput,
} from '@/components/ui/form';
import { appColors } from '@/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Register'>;
type UserRole = 'cliente' | 'repartidor';

type RegistrationFormValues = {
  name: string;
  email: string;
  password: string;
  phone: string;
};

const initialValues: RegistrationFormValues = {
  name: '',
  email: '',
  password: '',
  phone: '',
};

export function RegisterScreen({ route }: Props) {
  const initialRole = (route.params?.role ?? 'cliente') as UserRole;
  const { refresh, setPostAuthRole } = useSession();

  const [role, setRole] = useState<UserRole>(initialRole);
  const [formData, setFormData] = useState<RegistrationFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof RegistrationFormValues, string>>>({});

  const validateField = (fieldName: keyof RegistrationFormValues, value: string) => {
    const schemaWithTransform = registrationSchema.shape[fieldName];
    const result = schemaWithTransform.safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
    return undefined;
  };

  const handleChange = (fieldName: keyof RegistrationFormValues, value: string) => {
    setFormData((previous) => ({ ...previous, [fieldName]: value }));
    if (hasSubmitted) {
      const error = validateField(fieldName, value);
      setFieldErrors((previous) => ({ ...previous, [fieldName]: error }));
    }
  };

  const handleBlur = (fieldName: keyof RegistrationFormValues) => {
    const value = formData[fieldName];
    const error = validateField(fieldName, value);
    setFieldErrors((previous) => ({ ...previous, [fieldName]: error }));
  };

  const validateForm = () => {
    const result = registrationSchema.safeParse({ ...formData, role });
    if (!result.success) {
      const errors: Partial<Record<keyof RegistrationFormValues, string>> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof RegistrationFormValues;
        if (!errors[fieldName]) {
          errors[fieldName] = issue.message;
        }
      });
      setFieldErrors(errors);
      return false;
    }
    setFieldErrors({});
    return true;
  };

  const onSubmit = async () => {
    setSubmitError(null);
    setHasSubmitted(true);

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      await signUpEmail({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
      });

      await onboardingSetup({
        role,
        phone: formData.phone.replace(/\D/g, ''),
        name: formData.name.trim(),
      });

      setPostAuthRole(role);
      await refresh();
    } catch (errorObject) {
      const message = errorObject instanceof Error ? errorObject.message : 'No se pudo registrar';
      setSubmitError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormLayout title="" subtitle="">
      <View className="gap-6">
        <View className="gap-2 pt-2">
          <Text className="text-primary text-sm font-bold uppercase tracking-[1.5px]">
            MandaGo
          </Text>
          <Text className="text-3xl font-extrabold text-text">
            Crea tu cuenta
          </Text>
          <Text className="text-base text-text-muted leading-6">
            Regístrate para comenzar. Después completarás tu perfil según el tipo de cuenta.
          </Text>
        </View>

        <View className="bg-surface border border-border rounded-2xl p-4 gap-4">
          <View className="gap-2">
            <Text className="text-sm font-semibold text-text">
              Tipo de cuenta
            </Text>

            <View className="bg-background border border-border rounded-2xl p-1 flex-row">
              <Pressable
                onPress={() => setRole('cliente')}
                className={`flex-1 py-3 rounded-xl items-center justify-center ${
                  role === 'cliente' ? 'bg-primary' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    role === 'cliente' ? 'text-white' : 'text-text-muted'
                  }`}
                >
                  Cliente
                </Text>
              </Pressable>

              <Pressable
                onPress={() => setRole('repartidor')}
                className={`flex-1 py-3 rounded-xl items-center justify-center ${
                  role === 'repartidor' ? 'bg-primary' : 'bg-transparent'
                }`}
              >
                <Text
                  className={`text-sm font-bold ${
                    role === 'repartidor' ? 'text-white' : 'text-text-muted'
                  }`}
                >
                  Repartidor
                </Text>
              </Pressable>
            </View>
          </View>

          <FormField label="Nombre completo" error={fieldErrors.name} required>
            <TextInput
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              onBlur={() => handleBlur('name')}
              placeholder="Ej. Juan Pérez"
              className="border border-border rounded-xl py-3 px-4 bg-white text-text text-base"
              placeholderTextColor={appColors.inputPlaceholder}
            />
          </FormField>

          <FormField label="Email" error={fieldErrors.email} required>
            <TextInput
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              onBlur={() => handleBlur('email')}
              placeholder="tu@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-border rounded-xl py-3 px-4 bg-white text-text text-base"
              placeholderTextColor={appColors.inputPlaceholder}
            />
          </FormField>

          <FormField label="Contraseña" error={fieldErrors.password} required>
            <TextInput
              value={formData.password}
              onChangeText={(value) => handleChange('password', value)}
              onBlur={() => handleBlur('password')}
              placeholder="********"
              secureTextEntry
              className="border border-border rounded-xl py-3 px-4 bg-white text-text text-base"
              placeholderTextColor={appColors.inputPlaceholder}
            />
          </FormField>

          <FormField label="Teléfono" error={fieldErrors.phone} required>
            <FormPhoneInput
              value={formData.phone}
              onChange={(value) => handleChange('phone', value)}
            />
          </FormField>

          {submitError && <FormError message={submitError} />}

          <View className="pt-1">
            <FormSubmitButton
              onPress={onSubmit}
              disabled={!formData.name || !formData.email || !formData.password || !formData.phone}
              loading={isSubmitting}
              title="Crear cuenta"
            />
          </View>
        </View>
      </View>
    </FormLayout>
  );
}