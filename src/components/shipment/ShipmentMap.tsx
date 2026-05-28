import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Map, Marker, Camera, Layer, GeoJSONSource } from '@maplibre/maplibre-react-native';
import { MapPin, Bike } from 'lucide-react-native';
import { PlaceOption, RouteInfo, Coordinates } from '@/types/shipment-types';
import { appColors } from '@/theme/theme';

interface ShipmentMapProps {
  origin: PlaceOption | null;
  destination: PlaceOption | null;
  routeInfo: RouteInfo | null;
  initialLocation?: Coordinates | null;
  onMapPress?: (coords: Coordinates) => void;
  onOriginDragEnd?: (coords: Coordinates) => void;
  onDestinationDragEnd?: (coords: Coordinates) => void;
  driverLocation?: { lat: number; lng: number } | null;
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

export function ShipmentMap({
  origin,
  destination,
  routeInfo,
  initialLocation,
  onMapPress,
  driverLocation = null,
}: ShipmentMapProps) {
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const cameraRef = useRef<any>(null);

  const MarkerDrop = ({ color, label }: { color: string; label: string }) => (
    <View className="items-center">
      <Text className="text-xs font-bold text-white mb-0.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: color }}>{label}</Text>
      <View className="items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: color }}>
        <MapPin size={20} color="white" strokeWidth={2.5} />
      </View>
    </View>
  );

  useEffect(() => {
    if (routeInfo?.geometry) {
      const coords = flattenRouteCoordinates(routeInfo.geometry);
      setRouteCoords(coords);
    } else {
      setRouteCoords(null);
    }
  }, [routeInfo?.geometry]);

  useEffect(() => {
    if (!cameraRef.current) return;
    if (driverLocation) {
      cameraRef.current.flyTo({
        center: [driverLocation.lng, driverLocation.lat],
        zoom: 13,
        duration: 800,
      });
    } else if (initialLocation) {
      cameraRef.current.flyTo({
        center: [initialLocation.lon, initialLocation.lat],
        zoom: 13,
        duration: 800,
      });
    }
  }, [driverLocation, initialLocation]);

  const handleMapPress = useCallback((event: any) => {
    const nativeEvent = event?.nativeEvent;
    const lngLat = nativeEvent?.lngLat as [number, number] | undefined;
    if (lngLat && Array.isArray(lngLat) && lngLat.length >= 2) {
      onMapPress?.({ lat: lngLat[1], lon: lngLat[0] });
    }
  }, [onMapPress]);

  const getInitialCenter = (): [number, number] | undefined => {
    if (driverLocation) return [driverLocation.lng, driverLocation.lat];
    if (initialLocation) return [initialLocation.lon, initialLocation.lat];
    if (origin) return [origin.lon, origin.lat];
    return undefined;
  };

  const hasLocation = initialLocation || origin || driverLocation;

  if (!hasLocation) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={appColors.primary} />
      </View>
    );
  }

  const initialCenter = getInitialCenter();

  return (
    <View style={styles.container}>
      <Map
        style={{ flex: 1 }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
        onPress={handleMapPress}
      >
        <Camera
          ref={cameraRef}
          initialViewState={initialCenter ? { center: initialCenter, zoom: 13 } : undefined}
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

        {driverLocation && (
          <Marker id="driver" lngLat={[driverLocation.lng, driverLocation.lat]}>
            <View className="items-center">
              <View className="items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: '#3B82F6' }}>
                <Bike size={22} color="white" strokeWidth={2.5} />
              </View>
            </View>
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
                "line-width": 4,
                "line-opacity": 0.8,
              }}
              layout={{
                "line-join": "round",
                "line-cap": "round",
              }}
            />
          </GeoJSONSource>
        )}
      </Map>

      {routeInfo && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>
            {(routeInfo.distance / 1000).toFixed(1)} km • {Math.round(routeInfo.duration / 60)} min
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 350,
    borderRadius: 16,
    overflow: 'hidden',
  },
  routeInfo: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  routeText: {
    fontSize: 14,
    fontWeight: '600',
    color: appColors.text,
  },
});