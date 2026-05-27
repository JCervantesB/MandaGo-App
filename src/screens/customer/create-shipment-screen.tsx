import React, { useState, useCallback, useEffect } from 'react';
import { View, Text, Pressable, Alert, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, MapPin } from 'lucide-react-native';
import { CustomerShipmentMap } from '@/components/customer-components/CustomerShipmentMap';
import { CustomerShipmentBottomSheet } from '@/components/customer-components/CustomerShipmentBottomSheet';
import { AddressesStep } from '@/components/customer-components/AddressesStep';
import { PackageStep } from '@/components/customer-components/PackageStep';
import { RecipientStep } from '@/components/customer-components/RecipientStep';
import { ReviewStep } from '@/components/customer-components/ReviewStep';
import { useReverseGeocode, useRouting } from '@/hooks/use-address-search';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { PlaceOption, ShipmentFormData, Coordinates } from '@/types/shipment-types';
import { appColors } from '@/theme/theme';
import { API_BASE_URL } from '@/config/api';
import type { ShipmentStep } from '@/components/customer-components/ShipmentStepIndicator';

const STEPS: ShipmentStep[] = ['addresses', 'package', 'recipient', 'review'];

export function CreateShipmentScreen({ navigation }: { navigation: any }) {
  const [currentStep, setCurrentStep] = useState<ShipmentStep>('addresses');
  const [completedSteps, setCompletedSteps] = useState<ShipmentStep[]>([]);
  const [origin, setOrigin] = useState<PlaceOption | null>(null);
  const [destination, setDestination] = useState<PlaceOption | null>(null);
  const [initialLocation, setInitialLocation] = useState<Coordinates | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [routeInfo, setRouteInfo] = useState<{ distance: number; duration: number } | null>(null);

  const [formData, setFormData] = useState<ShipmentFormData>({
    origin: null,
    destination: null,
    packageDescription: '',
    packageWeight: 0,
    destName: '',
    destPhone: '',
    notes: '',
  });

  const { reverseSearch, isLoading: isReversing } = useReverseGeocode();
  const { calculateRoute, routeInfo: routeFromHook, isLoading: isRouting } = useRouting();
  const { getCurrentLocation, isLoading: isGettingLocation } = useCurrentLocation();

  useEffect(() => {
    let isMounted = true;
    const loadInitialLocation = async () => {
      const location = await getCurrentLocation();
      if (isMounted && location) {
        setInitialLocation({ lat: location.latitude, lon: location.longitude });
      }
    };
    loadInitialLocation();
    return () => { isMounted = false; };
  }, []);

  const handleOriginSelect = useCallback((place: PlaceOption) => {
    setOrigin(place);
    setFormData(prev => ({ ...prev, origin: place }));
    if (destination) {
      void calculateRoute(place, destination);
    }
  }, [destination, calculateRoute]);

  const handleDestinationSelect = useCallback((place: PlaceOption) => {
    setDestination(place);
    setFormData(prev => ({ ...prev, destination: place }));
    if (origin) {
      void calculateRoute(origin, place);
    }
  }, [origin, calculateRoute]);

  // Sync routeInfo from hook to local state
  useEffect(() => {
    if (routeFromHook) {
      setRouteInfo({ distance: routeFromHook.distance, duration: routeFromHook.duration });
    }
  }, [routeFromHook]);

  const handleMapPress = useCallback(async (coords: Coordinates) => {
    const place = await reverseSearch(coords.lat, coords.lon);
    if (place) {
      if (!origin) {
        handleOriginSelect(place);
      } else if (!destination) {
        handleDestinationSelect(place);
      }
    }
  }, [origin, destination, reverseSearch, handleOriginSelect, handleDestinationSelect]);

  const handleUseCurrentLocation = useCallback(async () => {
    const location = await getCurrentLocation();
    if (location) {
      const place = await reverseSearch(location.latitude, location.longitude);
      if (place) {
        handleOriginSelect(place);
      }
    }
  }, [getCurrentLocation, reverseSearch, handleOriginSelect]);

  const handleFormChange = useCallback((data: Partial<ShipmentFormData>) => {
    setFormData(prev => ({ ...prev, ...data }));
  }, []);

  const canProceedFromAddresses = Boolean(origin && destination);
  const canProceedFromPackage = Boolean(
    formData.packageDescription &&
    formData.packageSize &&
    formData.priority
  );
  const canProceedFromRecipient = Boolean(formData.destName && formData.destPhone);

  const getCanContinue = (): boolean => {
    switch (currentStep) {
      case 'addresses': return canProceedFromAddresses;
      case 'package': return canProceedFromPackage;
      case 'recipient': return canProceedFromRecipient;
      case 'review': return true;
      default: return false;
    }
  };

  const handleContinue = () => {
    if (!completedSteps.includes(currentStep)) {
      setCompletedSteps(prev => [...prev, currentStep]);
    }

    const currentIndex = STEPS.indexOf(currentStep);
    if (currentIndex < STEPS.length - 1) {
      setCurrentStep(STEPS[currentIndex + 1]);
    }
  };

  const handleStepPress = (step: ShipmentStep) => {
    const stepIndex = STEPS.indexOf(step);
    const currentIndex = STEPS.indexOf(currentStep);
    if (stepIndex <= currentIndex || completedSteps.includes(step)) {
      setCurrentStep(step);
    }
  };

  const handleEditStep = (step: 'addresses' | 'package' | 'recipient') => {
    setCurrentStep(step);
  };

  const handleSubmit = useCallback(async () => {
    if (!origin || !destination) {
      Alert.alert('Error', 'Por favor selecciona origen y destino');
      return;
    }

    setIsSubmitting(true);

    const orderPayload = {
      originAddress: origin.formatted,
      originLat: origin.lat,
      originLng: origin.lon,
      destAddress: destination.formatted,
      destLat: destination.lat,
      destLng: destination.lon,
      destName: formData.destName,
      destPhone: formData.destPhone,
      packageDescription: formData.packageDescription,
      packageSize: formData.packageSize,
      packageWeight: formData.packageWeight?.toString() ?? '',
      packageDimensions: formData.packageDimensions ?? undefined,
      priority: formData.priority,
      productType: formData.productType ?? 'sin_costo',
      productAmount: formData.productAmount,
    };

    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(orderPayload),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || 'Error al crear el envío');
      }

      const responseData = await response.json();

      Alert.alert('Éxito', 'Envío creado correctamente', [
        {
          text: 'OK',
          onPress: () => {
            navigation.navigate('ClientShipmentDetail', { shipmentId: responseData.id });
          },
        },
      ]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear el envío';
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [origin, destination, formData, navigation]);

  const renderStepContent = () => {
    switch (currentStep) {
      case 'addresses':
        return (
          <AddressesStep
            origin={origin}
            destination={destination}
            onOriginSelect={handleOriginSelect}
            onDestinationSelect={handleDestinationSelect}
            onOriginClear={() => setOrigin(null)}
            onDestinationClear={() => setDestination(null)}
            onUseCurrentLocation={handleUseCurrentLocation}
            isUsingCurrentLocation={isGettingLocation}
          />
        );
      case 'package':
        return (
          <PackageStep
            formData={formData}
            onChange={handleFormChange}
          />
        );
      case 'recipient':
        return (
          <RecipientStep
            formData={formData}
            onChange={handleFormChange}
          />
        );
      case 'review':
        return (
          <ReviewStep
            origin={origin}
            destination={destination}
            formData={formData}
            routeInfo={routeInfo}
            onEditStep={handleEditStep}
          />
        );
    }
  };

  return (
    <View style={styles.container}>
      <CustomerShipmentMap
        origin={origin}
        destination={destination}
        routeInfo={routeInfo}
        initialLocation={initialLocation}
        onMapPress={handleMapPress}
        showLegend={currentStep !== 'addresses'}
        height="100%"
      />

      {isReversing || isRouting ? (
        <View className="absolute bottom-72 left-0 right-0 items-center">
          <View className="bg-white/95 px-4 py-2 rounded-full shadow">
            <ActivityIndicator size="small" color={appColors.primary} />
          </View>
        </View>
      ) : null}

      <CustomerShipmentBottomSheet
        step={currentStep}
        onStepChange={handleStepPress}
        completedSteps={completedSteps}
        canContinue={getCanContinue()}
        onContinue={currentStep === 'review' ? handleSubmit : handleContinue}
        isLoading={isSubmitting}
        routeInfo={routeInfo}
      >
        {renderStepContent()}
      </CustomerShipmentBottomSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: appColors.background,
  },
});