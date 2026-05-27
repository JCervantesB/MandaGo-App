import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import MapView, { Marker, Polyline, MapPressEvent } from 'react-native-maps';
import { MapPin, Flag, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useCurrentLocation } from '@/hooks/use-current-location';
import { getRoute } from '@/services/geoapify-service';
import { appColors } from '@/theme/theme';
import type { PlaceOption, Coordinates } from '@/types/shipment-types';

interface RouteData {
  geometry: Coordinates[];
  distance: number;
  duration: number;
}

interface CustomerShipmentMapProps {
  origin: PlaceOption | null;
  destination: PlaceOption | null;
  routeInfo?: { distance: number; duration: number; geometry?: Coordinates[] } | null;
  initialLocation?: Coordinates | null;
  onMapPress?: (coords: Coordinates) => void;
  onOriginDragEnd?: (coords: Coordinates) => void;
  onDestinationDragEnd?: (coords: Coordinates) => void;
  draggable?: boolean;
  showLegend?: boolean;
  height?: number | string;
}

// Extrae coordenadas de la geometría de la respuesta de Geoapify
function extractCoordinatesFromGeometry(geometry: unknown): Coordinates[] {
  if (!Array.isArray(geometry) || geometry.length === 0) return [];
  const rawCoords = geometry as unknown[];
  const firstItem = rawCoords[0];

  if (typeof firstItem === 'number') {
    return Array.from({ length: Math.floor(rawCoords.length / 2) }, (_, i) => ({
      lat: rawCoords[i * 2 + 1] as number,
      lon: rawCoords[i * 2] as number,
    }));
  }

  if (Array.isArray(firstItem) && firstItem.length > 0) {
    if (typeof firstItem[0] === 'number') {
      return (geometry as number[][]).map(coord => ({ lat: coord[1], lon: coord[0] }));
    }
    if (Array.isArray(firstItem[0]) && typeof firstItem[0][0] === 'number') {
      return (geometry as number[][][])[0].map(coord => ({ lat: coord[1], lon: coord[0] }));
    }
  }

  return [];
}

// Mapa interactivo para mostrar origen, destino y ruta del envío
export function CustomerShipmentMap({
  origin,
  destination,
  routeInfo: externalRouteInfo,
  initialLocation,
  onMapPress,
  onOriginDragEnd,
  onDestinationDragEnd,
  draggable = true,
  showLegend = false,
  height = '100%',
}: CustomerShipmentMapProps) {
  const mapRef = useRef<MapView>(null);
  const { getCurrentLocation } = useCurrentLocation();
  const [internalRoute, setInternalRoute] = useState<RouteData | null>(null);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const routeInfo = externalRouteInfo ?? internalRoute;

  const handlePress = useCallback((event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    onMapPress?.({ lat: coordinate.latitude, lon: coordinate.longitude });
  }, [onMapPress]);

  const handleOriginDragEnd = useCallback((event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    onOriginDragEnd?.({ lat: coordinate.latitude, lon: coordinate.longitude });
  }, [onOriginDragEnd]);

  const handleDestinationDragEnd = useCallback((event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    onDestinationDragEnd?.({ lat: coordinate.latitude, lon: coordinate.longitude });
  }, [onDestinationDragEnd]);

  const calculateRoute = useCallback(async () => {
    if (!mapReady || !origin || !destination) return;

    setIsLoadingRoute(true);

    try {
      const res = await getRoute([
        { lat: origin.lat, lon: origin.lon },
        { lat: destination.lat, lon: destination.lon },
      ]);

      if (res.features.length > 0) {
        const coords = extractCoordinatesFromGeometry(res.features[0].geometry.coordinates);
        setInternalRoute({
          geometry: coords,
          distance: res.features[0].properties.distance,
          duration: res.features[0].properties.duration,
        });
      }
    } catch {
      // silent fail
    } finally {
      setIsLoadingRoute(false);
    }
  }, [mapReady, origin, destination]);

  useEffect(() => {
    if (mapReady && origin && destination) {
      calculateRoute();
    }
  }, [mapReady, origin, destination, calculateRoute]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    if (origin && destination) {
      const midLat = (origin.lat + destination.lat) / 2;
      const midLon = (origin.lon + destination.lon) / 2;
      const latDiff = Math.abs(origin.lat - destination.lat) * 1.5;
      const lonDiff = Math.abs(origin.lon - destination.lon) * 1.5;

      mapRef.current.animateToRegion({
        latitude: midLat,
        longitude: midLon,
        latitudeDelta: Math.max(latDiff, 0.03),
        longitudeDelta: Math.max(lonDiff, 0.03),
      }, 500);
    } else if (origin && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: origin.lat,
        longitude: origin.lon,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }, 500);
    } else if (initialLocation && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: initialLocation.lat,
        longitude: initialLocation.lon,
        latitudeDelta: 0.05,
        longitudeDelta: 0.05,
      }, 500);
    }
  }, [origin, destination, initialLocation, mapReady]);

  const routeCoordinates = routeInfo?.geometry?.map(c => ({
    latitude: c.lat,
    longitude: c.lon,
  })) ?? [];

  if (!initialLocation) {
    return (
      <View style={[styles.loadingContainer, { height: height as number }]}>
        <ActivityIndicator color={appColors.success} />
        <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { height: height as number }]}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          latitude: initialLocation.lat,
          longitude: initialLocation.lon,
          latitudeDelta: 0.05,
          longitudeDelta: 0.05,
        }}
        onPress={handlePress}
        onMapReady={() => setMapReady(true)}
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {origin && (
          <Marker
            coordinate={{ latitude: origin.lat, longitude: origin.lon }}
            title="Origen"
            draggable={draggable}
            onDragEnd={handleOriginDragEnd}
          >
            <View style={[styles.marker, styles.originMarker]}>
              <MapPin size={18} color="white" />
            </View>
          </Marker>
        )}

        {destination && (
          <Marker
            coordinate={{ latitude: destination.lat, longitude: destination.lon }}
            title="Destino"
            draggable={draggable}
            onDragEnd={handleDestinationDragEnd}
          >
            <View style={[styles.marker, styles.destinationMarker]}>
              <Flag size={18} color="white" />
            </View>
          </Marker>
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={appColors.primary}
            strokeWidth={5}
          />
        )}
      </MapView>

      {showLegend && routeInfo && (
        <View style={styles.legendContainer}>
          <Pressable onPress={() => setLegendCollapsed(!legendCollapsed)} style={styles.legendHeader}>
            <Text style={styles.legendTitle}>Ruta</Text>
            {legendCollapsed
              ? <ChevronUp size={16} color={appColors.textMuted} />
              : <ChevronDown size={16} color={appColors.textMuted} />
            }
          </Pressable>

          {!legendCollapsed && (
            <View style={styles.legendContent}>
              {isLoadingRoute && (
                <View style={styles.loadingRow}>
                  <ActivityIndicator size="small" color={appColors.primary} />
                  <Text style={styles.loadingText}>Calculando...</Text>
                </View>
              )}
              {!isLoadingRoute && (
                <View style={styles.routeRow}>
                  <View style={styles.routeRowLeft}>
                    <View style={[styles.routeDot, { backgroundColor: appColors.primary }]} />
                    <Text style={styles.routeLabel}>Distancia total</Text>
                  </View>
                  <Text style={styles.routeDistance}>
                    {(routeInfo.distance / 1000).toFixed(1)} km • {Math.round(routeInfo.duration / 60)} min
                  </Text>
                </View>
              )}
            </View>
          )}
        </View>
      )}

      {(!origin || !destination) && (
        <View style={styles.hintContainer}>
          <Text style={styles.hintText}>Toca el mapa para seleccionar punto</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, overflow: 'hidden' },
  map: { flex: 1 },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: { marginTop: 12, fontSize: 14, color: appColors.textMuted },
  marker: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  originMarker: { backgroundColor: appColors.success },
  destinationMarker: { backgroundColor: '#EF4444' },
  legendContainer: {
    position: 'absolute',
    top: 50,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.16,
    shadowRadius: 8,
    elevation: 8,
    minWidth: 200,
    overflow: 'hidden',
  },
  legendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#F8FAFC',
  },
  legendTitle: { fontSize: 14, fontWeight: '700', color: appColors.text },
  legendContent: { paddingHorizontal: 14, paddingVertical: 10 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  routeRowLeft: { flexDirection: 'row', alignItems: 'center' },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  routeLabel: { fontSize: 12, color: appColors.text },
  routeDistance: { fontSize: 12, fontWeight: '700', color: appColors.textMuted },
  hintContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  hintText: { fontSize: 12, color: '#64748B' },
});