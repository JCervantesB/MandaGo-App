import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useState } from 'react';
import { TextInput, View, Text } from 'react-native';
import { signInEmail } from '@/auth/auth-api';
import { useSession } from '@/auth/session-provider';
import type { RootStackParamList } from '@/navigation/types';
import { loginSchema } from '@/validation/schemas';
import { FormLayout, FormField, FormSubmitButton, FormError } from '@/components/ui/form';
import { appColors } from '@/theme/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Login'>;

type LoginFormValues = {
  email: string;
  password: string;
};

const initialValues: LoginFormValues = {
  email: '',
  password: '',
};

export function LoginScreen({ navigation }: Props) {
  const { refresh } = useSession();

  const [formData, setFormData] = useState<LoginFormValues>(initialValues);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof LoginFormValues, string>>>({});

  const validateField = (fieldName: keyof LoginFormValues, value: string) => {
    const fieldSchema = loginSchema.shape[fieldName];
    const result = fieldSchema.safeParse(value);
    if (!result.success) {
      return result.error.issues[0]?.message;
    }
    return undefined;
  };

  const handleChange = (fieldName: keyof LoginFormValues, value: string) => {
    setFormData((previous) => ({ ...previous, [fieldName]: value }));
    if (hasSubmitted) {
      const error = validateField(fieldName, value);
      setFieldErrors((previous) => ({ ...previous, [fieldName]: error }));
    }
  };

  const handleBlur = (fieldName: keyof LoginFormValues) => {
    const value = formData[fieldName];
    const error = validateField(fieldName, value);
    setFieldErrors((previous) => ({ ...previous, [fieldName]: error }));
  };

  const validateForm = () => {
    const result = loginSchema.safeParse(formData);
    if (!result.success) {
      const errors: Partial<Record<keyof LoginFormValues, string>> = {};
      result.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof LoginFormValues;
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
      await signInEmail({ email: formData.email.trim(), password: formData.password });
      await refresh();
    } catch (errorObject) {
      const message = errorObject instanceof Error ? errorObject.message : 'No se pudo iniciar sesión';
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
            Bienvenido de nuevo
          </Text>
          <Text className="text-base text-text-muted leading-6">
            Inicia sesión para gestionar tu actividad dentro de MandaGo.
          </Text>
        </View>

        <View className="bg-surface border border-border rounded-2xl p-4 gap-4 mt-4">
          <FormField label="Email" error={fieldErrors.email} required>
            <TextInput
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              onBlur={() => handleBlur('email')}
              placeholder="tu@correo.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="border border-border rounded-xl py-3 px-4 bg-white text-text"
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
              autoCapitalize="none"
              className="border border-border rounded-xl py-3 px-4 bg-white text-text"
              placeholderTextColor={appColors.inputPlaceholder}
            />
          </FormField>

          {submitError && <FormError message={submitError} />}

          <View className="pt-1 gap-3">
            <FormSubmitButton
              onPress={onSubmit}
              disabled={!formData.email || !formData.password}
              loading={isSubmitting}
              title="Entrar"
            />

            <View className="items-center pt-1">
              <Text className="text-sm text-text-muted">¿No tienes cuenta?</Text>
            </View>

            <FormSubmitButton
              onPress={() => navigation.navigate('Register')}
              variant="secondary"
              title="Crear cuenta"
            />
          </View>
        </View>
      </View>
    </FormLayout>
  );
}