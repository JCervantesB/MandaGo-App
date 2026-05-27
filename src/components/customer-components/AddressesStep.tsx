import React from 'react';
import { View, Text, ScrollView, Pressable, Alert } from 'react-native';
import { AddressAutocomplete } from '@/components/shipment/AddressAutocomplete';
import { PlaceOption } from '@/types/shipment-types';

const ADDRESS_HELP_TEXT =
  'Escribe tu dirección en este orden:\n\n1. Nombre de la calle y número\n2. Código postal\n3. Ciudad\n4. Estado\n\nEjemplo: Av. Insurgentes Sur #123, 06600, Ciudad de México, CDMX';

// Botón de ayuda con icono circular
function HelpButton({ onPress }: { onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      className="ml-2 w-5 h-5 rounded-full bg-primary/20 items-center justify-center"
    >
      <Text className="text-xs font-bold text-primary">?</Text>
    </Pressable>
  );
}

function AddressSection({
  title,
  label,
  placeholder,
  value,
  onPlaceSelected,
  onClear,
  showUseCurrentLocation,
  onUseCurrentLocation,
  isUsingCurrentLocation,
}: {
  title: string;
  label: string;
  placeholder: string;
  value: PlaceOption | null;
  onPlaceSelected: (place: PlaceOption) => void;
  onClear: () => void;
  showUseCurrentLocation?: boolean;
  onUseCurrentLocation?: () => void;
  isUsingCurrentLocation?: boolean;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center mb-3">
        <Text className="text-base font-semibold text-text">{title}</Text>
        <HelpButton onPress={() => Alert.alert('Formato de dirección', ADDRESS_HELP_TEXT)} />
      </View>
      <AddressAutocomplete
        label={label}
        placeholder={placeholder}
        value={value}
        onPlaceSelected={onPlaceSelected}
        onClear={onClear}
        showUseCurrentLocation={showUseCurrentLocation}
        onUseCurrentLocation={onUseCurrentLocation}
        isUsingCurrentLocation={isUsingCurrentLocation}
      />
    </View>
  );
}

interface AddressesStepProps {
  origin: PlaceOption | null;
  destination: PlaceOption | null;
  onOriginSelect: (place: PlaceOption) => void;
  onDestinationSelect: (place: PlaceOption) => void;
  onOriginClear: () => void;
  onDestinationClear: () => void;
  onUseCurrentLocation: () => void;
  isUsingCurrentLocation: boolean;
}

// Step de creación de envío para ingresar direcciones de origen y destino
export function AddressesStep({
  origin,
  destination,
  onOriginSelect,
  onDestinationSelect,
  onOriginClear,
  onDestinationClear,
  onUseCurrentLocation,
  isUsingCurrentLocation,
}: AddressesStepProps) {
  return (
    <ScrollView
      className="px-4 py-3"
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
    >
      <AddressSection
        title="¿De dónde envías?"
        label="Origen"
        placeholder="Ubicación de recogida"
        value={origin}
        onPlaceSelected={onOriginSelect}
        onClear={onOriginClear}
        showUseCurrentLocation
        onUseCurrentLocation={onUseCurrentLocation}
        isUsingCurrentLocation={isUsingCurrentLocation}
      />

      <View className="h-6" />

      <AddressSection
        title="¿A dónde lo envías?"
        label="Destino"
        placeholder="Ubicación de entrega"
        value={destination}
        onPlaceSelected={onDestinationSelect}
        onClear={onDestinationClear}
      />

      <View className="h-4" />
    </ScrollView>
  );
}