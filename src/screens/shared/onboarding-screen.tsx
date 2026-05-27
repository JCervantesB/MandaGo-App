import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { useSession } from '@/auth/session-provider';
import { completeClientOnboarding, completeDriverOnboarding } from '@/auth/onboarding-api';
import type { Base64DocumentInput } from '@/components/common/DocumentPicker';
import { ClientOnboardingForm } from '@/components/onboarding/ClientOnboardingForm';
import { DriverOnboardingForm } from '@/components/onboarding/DriverOnboardingForm';
import type { RootStackParamList } from '@/navigation/root-navigator';
import {
  validateClientOnboarding,
  validateDriverOnboarding,
  type FieldErrors,
} from '@/validation/schemas';

type Props = NativeStackScreenProps<RootStackParamList, 'Onboarding'>;

export function OnboardingScreen(_props: Props) {
  const { postAuthRole, onboardingStatus, clearPostAuthRole, refresh } = useSession();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [street, setStreet] = useState('');
  const [streetNumber, setStreetNumber] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [colony, setColony] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [rfc, setRfc] = useState('');
  const [businessName, setBusinessName] = useState('');

  const [vehicleType, setVehicleType] = useState('');
  const [ineDocument, setIneDocument] = useState<Base64DocumentInput | null>(null);
  const [driverLicenseDocument, setDriverLicenseDocument] = useState<Base64DocumentInput | null>(null);
  const [vehiclePhotoDocument, setVehiclePhotoDocument] = useState<Base64DocumentInput | null>(null);

  const [errors, setErrors] = useState<FieldErrors>({});

  const role = useMemo(() => onboardingStatus?.role ?? postAuthRole, [onboardingStatus?.role, postAuthRole]);
  const isClient = role === 'cliente';
  const isDriver = role === 'repartidor';

  useEffect(() => {
    clearPostAuthRole();
  }, [clearPostAuthRole]);

  useEffect(() => {
    if (onboardingStatus?.profileCompleted) {
      if (isClient) _props.navigation.replace('ClientHome');
      else if (isDriver) _props.navigation.replace('DeliveryHome');
    }
  }, [isClient, isDriver, onboardingStatus?.profileCompleted, _props.navigation]);

  const handleSubmit = async () => {
    const addressData = {
      street,
      streetNumber: streetNumber || undefined,
      postalCode,
      colony,
      city,
      state,
    };

    let validationResult;

    if (isClient) {
      validationResult = validateClientOnboarding({ ...addressData, rfc, businessName });
    } else {
      validationResult = validateDriverOnboarding({
        ...addressData,
        vehicleType,
        ine: ineDocument ?? { base64: '', mimeType: '' },
        driverLicense: driverLicenseDocument ?? { base64: '', mimeType: '' },
        vehiclePhoto: vehiclePhotoDocument ?? { base64: '', mimeType: '' },
      });
    }

    if (!validationResult.ok) {
      setErrors(validationResult.errors);
      return;
    }

    setErrors({});
    setIsSubmitting(true);

    try {
      if (isClient) {
        await completeClientOnboarding({
          street: street.trim(),
          streetNumber: streetNumber.trim() || undefined,
          postalCode: postalCode.trim(),
          colony: colony.trim(),
          city: city.trim(),
          state: state.trim(),
          rfc: rfc.trim().toUpperCase(),
          businessName: businessName.trim(),
        });
      } else if (isDriver) {
        await completeDriverOnboarding({
          street: street.trim(),
          streetNumber: streetNumber.trim() || undefined,
          postalCode: postalCode.trim(),
          colony: colony.trim(),
          city: city.trim(),
          state: state.trim(),
          vehicleType,
          ine: ineDocument!,
          driverLicense: driverLicenseDocument!,
          vehiclePhoto: vehiclePhotoDocument!,
        });
      }

      await refresh();

      if (isClient) _props.navigation.replace('ClientHome');
      else if (isDriver) _props.navigation.replace('DeliveryHome');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error al completar el registro';
      Alert.alert('Error', message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-background"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ paddingBottom: 32 }}
        showsVerticalScrollIndicator={false}
      >
        <View className="px-5 pt-8 pb-6 gap-6">
          <View className="gap-2">
            <Text className="text-3xl mt-4 font-extrabold text-text">
              Completa tu registro
            </Text>
            <Text className="text-base text-text-muted leading-6">
              {isClient
                ? 'Agrega la información de tu negocio para activar tu cuenta.'
                : 'Completa tus datos y sube tus documentos para continuar.'}
            </Text>
          </View>

          <View className="bg-surface border border-border rounded-2xl p-4 gap-5">
            {isClient ? (
              <ClientOnboardingForm
                street={street} streetNumber={streetNumber} postalCode={postalCode}
                colony={colony} city={city} state={state}
                rfc={rfc} businessName={businessName}
                errors={errors} isSubmitting={isSubmitting}
                onStreetChange={setStreet}
                onStreetNumberChange={setStreetNumber}
                onPostalCodeChange={setPostalCode}
                onColonyChange={setColony}
                onCityChange={setCity}
                onStateChange={setState}
                onRfcChange={setRfc}
                onBusinessNameChange={setBusinessName}
                onErrorsChange={setErrors}
                onSubmit={handleSubmit}
              />
            ) : (
              <DriverOnboardingForm
                street={street} streetNumber={streetNumber} postalCode={postalCode}
                colony={colony} city={city} state={state}
                vehicleType={vehicleType}
                ine={ineDocument} driverLicense={driverLicenseDocument} vehiclePhoto={vehiclePhotoDocument}
                errors={errors} isSubmitting={isSubmitting}
                onStreetChange={setStreet}
                onStreetNumberChange={setStreetNumber}
                onPostalCodeChange={setPostalCode}
                onColonyChange={setColony}
                onCityChange={setCity}
                onStateChange={setState}
                onVehicleTypeChange={setVehicleType}
                onIneChange={setIneDocument}
                onDriverLicenseChange={setDriverLicenseDocument}
                onVehiclePhotoChange={setVehiclePhotoDocument}
                onErrorsChange={setErrors}
                onSubmit={handleSubmit}
              />
            )}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}