import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import { Map, Marker, Camera, Layer, GeoJSONSource } from '@maplibre/maplibre-react-native';
import { MapPin } from 'lucide-react-native';
import { appColors } from '@/theme/theme';
import type { PlaceOption, Coordinates } from '@/types/shipment-types';

interface RouteData {
  geometry: any;
  distance: number;
  duration: number;
}

interface CustomerShipmentMapProps {
  origin: PlaceOption | null;
  destination: PlaceOption | null;
  routeInfo?: { distance: number; duration: number; geometry?: any } | null;
  initialLocation?: Coordinates | null;
  onMapPress?: (coords: Coordinates) => void;
  showLegend?: boolean;
  height?: number | string;
}

function flattenRouteCoordinates(geometry: any): [number, number][] {
  if (!geometry?.type || !geometry?.coordinates) return [];

  if (geometry.type === 'LineString') {
    return geometry.coordinates;
  }

  if (geometry.type === 'MultiLineString') {
    return geometry.coordinates.flat();
  }

  return [];
}

export function CustomerShipmentMap({
  origin,
  destination,
  routeInfo: externalRouteInfo,
  initialLocation,
  onMapPress,
  showLegend = false,
  height = '100%',
}: CustomerShipmentMapProps) {
  const [internalRoute, setInternalRoute] = useState<RouteData | null>(null);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const cameraRef = useRef<any>(null);
  const hasCentered = useRef(false);

  const MarkerDrop = ({ color, label }: { color: string; label: string }) => (
    <View className="items-center">
      <Text className="text-xs font-bold text-white mb-0.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: color }}>{label}</Text>
      <View className="items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: color }}>
        <MapPin size={20} color="white" strokeWidth={2.5} />
      </View>
    </View>
  );

  const calculateRoute = useCallback(async () => {
    if (!origin || !destination) return;

    try {
      const API_KEY = process.env.EXPO_PUBLIC_GEOAPIFY_API_KEY;
      if (!API_KEY) {
        console.warn('GEOAPIFY_API_KEY not configured');
        return;
      }

      const url = `https://api.geoapify.com/v1/routing?waypoints=lonlat:${origin.lon},${origin.lat}|lonlat:${destination.lon},${destination.lat}&mode=drive&details=instruction_details&apiKey=${API_KEY}`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.features && data.features.length > 0) {
        const feature = data.features[0];
        const coords = flattenRouteCoordinates(feature.geometry);

        setInternalRoute({
          geometry: feature.geometry,
          distance: feature.properties.distance,
          duration: feature.properties.time,
        });

        setRouteCoords(coords);
      }
    } catch (error) {
      console.error('Route calculation error:', error);
    }
  }, [origin, destination]);

  useEffect(() => {
    if (origin && destination) {
      calculateRoute();
    } else {
      setInternalRoute(null);
      setRouteCoords(null);
    }
  }, [origin, destination, calculateRoute]);

  useEffect(() => {
    if (cameraRef.current && initialLocation && !hasCentered.current) {
      cameraRef.current.flyTo({
        center: [initialLocation.lon, initialLocation.lat],
        zoom: 14,
        duration: 1000,
      });
      hasCentered.current = true;
    }
  }, [initialLocation]);

  const routeInfo = externalRouteInfo ?? internalRoute;
  const routeDistance = routeInfo?.distance ?? 0;
  const routeDuration = routeInfo?.duration ?? 0;

  const handleMapPress = useCallback((event: any) => {
    console.log('[Map] onPress fired');
    const nativeEvent = event?.nativeEvent;
    const lngLat = nativeEvent?.lngLat as [number, number] | undefined;
    if (lngLat && Array.isArray(lngLat) && lngLat.length >= 2) {
      console.log('[Map] coords:', lngLat[0], lngLat[1]);
      onMapPress?.({ lat: lngLat[1], lon: lngLat[0] });
    } else {
      console.log('[Map] nativeEvent:', nativeEvent);
    }
  }, [onMapPress]);

  if (!initialLocation && !origin) {
    return (
      <View className="flex-1 bg-gray-100 justify-center items-center">
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text className="mt-3 text-sm text-gray-500">Cargando mapa...</Text>
      </View>
    );
  }

  return (
    <View className="flex-1 overflow-hidden">
      <Map
        style={{ flex: 1 }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onPress={handleMapPress}
      >
        <Camera
          ref={cameraRef}
          initialViewState={initialLocation ? {
            center: [initialLocation.lon, initialLocation.lat],
            zoom: 14,
          } : undefined}
        />
        {origin && (
          <Marker id="origin" lngLat={[origin.lon, origin.lat]}>
            <MarkerDrop color={appColors.success} label="Origen" />
          </Marker>
        )}

        {destination && (
          <Marker id="destination" lngLat={[destination.lon, destination.lat]}>
            <MarkerDrop color={appColors.mapDestination} label="Destino" />
          </Marker>
        )}

        {routeCoords && routeCoords.length > 0 && (
          <GeoJSONSource
            id="routeSource"
            data={{
              type: 'Feature',
              properties: {},
              geometry: {
                type: 'LineString',
                coordinates: routeCoords,
              },
            }}
          >
            <Layer
              id="routeLine"
              type="line"
              source="routeSource"
              paint={{
                "line-color": appColors.primary,
                "line-width": 5,
                "line-opacity": 0.9,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
          </GeoJSONSource>
        )}
      </Map>

      {showLegend && routeCoords && routeCoords.length > 0 && (
        <Pressable
          className="absolute top-12 right-3 bg-white rounded-xl shadow-lg min-w-[200px] overflow-hidden"
          onPress={() => setLegendCollapsed(!legendCollapsed)}
        >
          <View className="px-3.5 py-2.5">
            {!legendCollapsed && (
              <Text className="text-xs font-bold text-gray-800">
                {(routeDistance / 1000).toFixed(1)} km • {Math.round(routeDuration / 60)} min
              </Text>
            )}
          </View>
        </Pressable>
      )}

      {!origin || !destination ? (
        <View className="absolute bottom-0 left-0 right-0 bg-white/95 py-2.5 items-center">
          <Text className="text-sm text-gray-500">Toca el mapa para seleccionar punto</Text>
        </View>
      ) : null}
    </View>
  );
}