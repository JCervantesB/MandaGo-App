import React, { useState } from 'react';
import {
  View,
  TextInput,
  ScrollView,
  Pressable,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useAddressSearch } from '@/hooks/use-address-search';
import { PlaceOption } from '@/types/shipment-types';
import { appColors } from '@/theme/theme';

interface AddressAutocompleteProps {
  placeholder?: string;
  value?: PlaceOption | null;
  onPlaceSelected: (place: PlaceOption) => void;
  onClear?: () => void;
  label?: string;
  showUseCurrentLocation?: boolean;
  onUseCurrentLocation?: () => void;
  isUsingCurrentLocation?: boolean;
}

// Campo de búsqueda de dirección con autocompletado
export function AddressAutocomplete({
  placeholder = 'Buscar dirección...',
  value,
  onPlaceSelected,
  onClear,
  label,
  showUseCurrentLocation,
  onUseCurrentLocation,
  isUsingCurrentLocation,
}: AddressAutocompleteProps) {
  const [isFocused, setIsFocused] = useState(false);
  const {
    query,
    setQuery,
    results,
    isLoading,
    selectPlace,
  } = useAddressSearch(300);

  // Manejar selección de lugar
  const handleSelect = (place: PlaceOption) => {
    selectPlace(place);
    onPlaceSelected(place);
    setIsFocused(false);
  };

  // Manejar limpieza de búsqueda
  const handleClear = () => {
    setQuery('');
    onClear?.();
  };

  // Renderizar elemento de autocompletado
  const renderItem = ({ item }: { item: PlaceOption }) => (
    <Pressable
      className="px-4 py-3 border-b border-border/50 active:bg-background"
      onPress={() => handleSelect(item)}
    >
      <Text className="text-sm text-text" numberOfLines={2}>
        {item.formatted}
      </Text>
    </Pressable>
  );

  return (
    <View className="mb-4 z-50">
      {label && (
        <Text className="text-sm font-semibold text-text mb-2">{label}</Text>
      )}
      <View className="flex-row items-center bg-white rounded-xl border border-border px-3 h-12">
        <TextInput
          className="flex-1 text-base text-text h-full"
          placeholder={placeholder}
          placeholderTextColor={appColors.inputPlaceholder}
          value={value ? value.formatted : query}
          onChangeText={setQuery}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
        />
        {isLoading && (
          <ActivityIndicator size="small" color={appColors.primary} />
        )}
        {showUseCurrentLocation && !isLoading && (
          <Pressable
            onPress={onUseCurrentLocation}
            className={`px-3 py-1.5 rounded-lg bg-background mr-2 min-w-11 items-center justify-center active:bg-surface ${
              isUsingCurrentLocation ? 'opacity-70' : ''
            }`}
            disabled={Boolean(isUsingCurrentLocation)}
          >
            {isUsingCurrentLocation ? (
              <ActivityIndicator size="small" color={appColors.primary} />
            ) : (
              <Text className="text-xs font-bold text-text">GPS</Text>
            )}
          </Pressable>
        )}
        {query && !isLoading && (
          <Pressable onPress={handleClear} className="p-1">
            <Text className="text-base" style={{ color: appColors.inputPlaceholder }}>
              ✕
            </Text>
          </Pressable>
        )}
      </View>

      {isFocused && (results.length > 0 || isLoading) && (
        <View className="mt-2 bg-white rounded-xl border border-border max-h-52 z-50 shadow-sm elevation-4">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            className="max-h-52"
          >
            {results.map((item) => (
              <React.Fragment key={item.id}>
                {renderItem({ item })}
              </React.Fragment>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}
