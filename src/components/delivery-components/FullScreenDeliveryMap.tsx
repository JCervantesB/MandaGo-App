import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Pressable } from 'react-native';
import MapView, { Marker, Polyline } from 'react-native-maps';
import { Package, Flag, Navigation, ChevronDown, ChevronUp } from 'lucide-react-native';
import { useCurrentLocation, useLocationWatcher } from '@/hooks/use-current-location';
import { getRoute } from '@/services/geoapify-service';
import { appColors } from '@/theme/theme';
import type { Coordinates } from '@/types/shipment-types';

export type RouteType = 'driver-to-pickup' | 'pickup-to-delivery' | 'both' | 'none';

interface FullScreenDeliveryMapProps {
  originLat: string;
  originLng: string;
  originAddress: string;
  destLat: string;
  destLng: string;
  destAddress: string;
  routeType?: RouteType;
  driverLocation?: { lat: number; lon: number } | null;
  onDriverLocationUpdate?: (location: { lat: number; lon: number }) => void;
}

interface RouteData {
  geometry: Coordinates[];
  distance: number;
}

const ROUTE_COLORS = {
  toPickup: '#3B82F6',
  toDelivery: appColors.success,
};

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

// Mapa a pantalla completa con rutas para el repartidor
export function FullScreenDeliveryMap({
  originLat,
  originLng,
  destLat,
  destLng,
  routeType = 'both',
  driverLocation: externalDriverLocation,
  onDriverLocationUpdate,
}: FullScreenDeliveryMapProps) {
  const mapRef = useRef<MapView>(null);
  const { getCurrentLocation } = useCurrentLocation();
  const [internalDriverLocation, setInternalDriverLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [routeToPickup, setRouteToPickup] = useState<RouteData | null>(null);
  const [routeToDelivery, setRouteToDelivery] = useState<RouteData | null>(null);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  // Combinar ubicación externa con interna
  const driverLocation = externalDriverLocation ?? internalDriverLocation;

  // Convertir coordenadas a números
  const originLatNum = parseFloat(originLat);
  const originLngNum = parseFloat(originLng);
  const destLatNum = parseFloat(destLat);
  const destLngNum = parseFloat(destLng);

  // Verificar si hay coordenadas válidas
  const hasValidCoords =
    !isNaN(originLatNum) && !isNaN(originLngNum) && !isNaN(destLatNum) && !isNaN(destLngNum);

  // Determinar si se debe mostrar el mapa en función del tipo de ruta
  const isDelivered = routeType === 'none';
  const isDriverActive = routeType === 'driver-to-pickup' || routeType === 'pickup-to-delivery' || routeType === 'both';
  const showDriverLocation = isDriverActive && !!driverLocation;
  const showOriginMarker = routeType !== 'pickup-to-delivery';
  const showDestMarker = routeType !== 'driver-to-pickup';
  const showRouteToPickup = (routeType === 'driver-to-pickup' || routeType === 'both') && !!routeToPickup;
  const showRouteToDelivery = routeType !== 'driver-to-pickup' && !!routeToDelivery;

  // Manejar actualización de ubicación del conductor
  const handleLocationUpdate = useCallback(
    (location: { latitude: number; longitude: number }) => {
      const loc = { lat: location.latitude, lon: location.longitude };
      setInternalDriverLocation(loc);
      onDriverLocationUpdate?.(loc);
    },
    [onDriverLocationUpdate]
  );

  // Escuchar cambios de ubicación del conductor
  useLocationWatcher(handleLocationUpdate, 10000);

  // Obtener ubicación actual del conductor si hay coordenadas válidas
   useEffect(() => {
    if (!hasValidCoords) return;
    getCurrentLocation().then((location) => {
      if (location) {
        const loc = { lat: location.latitude, lon: location.longitude };
        setInternalDriverLocation(loc);
        onDriverLocationUpdate?.(loc);
      }
    });
  }, [hasValidCoords, getCurrentLocation, onDriverLocationUpdate]);

  // Calcular rutas
  // 1. Ruta del conductor: conductor → recogida (cuando el conductor va a recoger un pedido)
  // 2. Ruta del conductor: conductor → entrega (cuando el conductor va a entregar el pedido)
  const calculateRoutes = useCallback(async () => {
    if (!mapReady || !hasValidCoords) return;
    if (isDelivered) return;

    setIsLoadingRoutes(true);

    const promises: Promise<void>[] = [];

    // Ruta del conductor: conductor → recogida (cuando el conductor va a recoger un pedido)
    if (routeType === 'driver-to-pickup' || routeType === 'both') {
      if (driverLocation) {
        promises.push(
          getRoute([
            { lat: driverLocation.lat, lon: driverLocation.lon },
            { lat: originLatNum, lon: originLngNum },
          ]).then((res) => {
            if (res.features.length > 0) {
              const coords = extractCoordinatesFromGeometry(res.features[0].geometry.coordinates);
              setRouteToPickup({ geometry: coords, distance: res.features[0].properties.distance });
            }
          }).catch(() => {})
        );
      }
    }

    // Ruta del conductor: conductor → entrega (cuando el conductor va a entregar el pedido)
    if (routeType !== 'driver-to-pickup') {
      const startLat = routeType === 'pickup-to-delivery' && driverLocation ? driverLocation.lat : originLatNum;
      const startLon = routeType === 'pickup-to-delivery' && driverLocation ? driverLocation.lon : originLngNum;

      promises.push(
        getRoute([
          { lat: startLat, lon: startLon },
          { lat: destLatNum, lon: destLngNum },
        ]).then((res) => {
          if (res.features.length > 0) {
            const coords = extractCoordinatesFromGeometry(res.features[0].geometry.coordinates);
            setRouteToDelivery({ geometry: coords, distance: res.features[0].properties.distance });
          }
        }).catch(() => {})
      );
    }

    await Promise.all(promises);
    setIsLoadingRoutes(false);
  }, [mapReady, hasValidCoords, routeType, driverLocation, originLatNum, originLngNum, destLatNum, destLngNum, isDelivered]);

  // Calcular rutas cuando el mapa está listo
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (mapReady) {
      timeout = setTimeout(() => calculateRoutes(), 100);
    }
    return () => clearTimeout(timeout);
  }, [mapReady, calculateRoutes]);

  // Centrar el mapa en los marcadores
  const centerMapOnMarkers = useCallback(() => {
    if (!mapRef.current || !hasValidCoords) return;

    let markers: { lat: number; lon: number }[] = [];

    if (isDelivered) {
      markers = [
        { lat: originLatNum, lon: originLngNum },
        { lat: destLatNum, lon: destLngNum },
      ];
    } else if (routeType === 'driver-to-pickup') {
      if (driverLocation) markers.push(driverLocation);
      markers.push({ lat: originLatNum, lon: originLngNum });
    } else if (routeType === 'pickup-to-delivery') {
      markers.push({ lat: originLatNum, lon: originLngNum });
      markers.push({ lat: destLatNum, lon: destLngNum });
    } else {
      // 'both'
      if (driverLocation) markers.push(driverLocation);
      markers.push({ lat: originLatNum, lon: originLngNum });
      markers.push({ lat: destLatNum, lon: destLngNum });
    }

    const lats = markers.map((m) => m.lat);
    const lons = markers.map((m) => m.lon);

    mapRef.current.animateToRegion(
      {
        latitude: (Math.min(...lats) + Math.max(...lats)) / 2,
        longitude: (Math.min(...lons) + Math.max(...lons)) / 2,
        latitudeDelta: Math.abs(Math.max(...lats) - Math.min(...lats)) * 1.5 + 0.05,
        longitudeDelta: Math.abs(Math.max(...lons) - Math.min(...lons)) * 1.5 + 0.05,
      },
      500
    );
  }, [hasValidCoords, isDelivered, routeType, driverLocation, originLatNum, originLngNum, destLatNum, destLngNum]);

  if (!hasValidCoords) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Coordenadas no disponibles</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <MapView
        key={`map-${originLatNum}-${originLngNum}-${destLatNum}-${destLngNum}`}
        ref={mapRef}
        style={styles.map}
        showsUserLocation
        showsMyLocationButton
        showsCompass={false}
        onMapReady={() => {
          setMapReady(true);
          centerMapOnMarkers();
        }}
      >
        {/* Ruta del conductor: conductor → recogida */}
        {showRouteToPickup && (
          <Polyline
            coordinates={routeToPickup.geometry.map((c) => ({ latitude: c.lat, longitude: c.lon }))}
            strokeColor={ROUTE_COLORS.toPickup}
            strokeWidth={5}
            lineDashPattern={[12, 6]}
          />
        )}

        {/* Ruta del conductor: conductor → entrega */}
        {showRouteToDelivery && (
          <Polyline
            coordinates={routeToDelivery.geometry.map((c) => ({ latitude: c.lat, longitude: c.lon }))}
            strokeColor={ROUTE_COLORS.toDelivery}
            strokeWidth={5}
          />
        )}

        {/* Ubicación del conductor en el mapa */}
        {showDriverLocation && (
          <Marker coordinate={{ latitude: driverLocation!.lat, longitude: driverLocation!.lon }} title="Tu ubicación">
            <View style={styles.markerContainer}>
              <Navigation size={20} color="white" />
            </View>
          </Marker>
        )}

        {/* Punto de recogida en el mapa */}
        {showOriginMarker && (
          <Marker coordinate={{ latitude: originLatNum, longitude: originLngNum }} title="Punto de recogida">
            <View style={[styles.markerContainer, styles.pickupMarker]}>
              <Package size={20} color="white" />
            </View>
          </Marker>
        )}

        {/* Punto de entrega en el mapa */}
        {showDestMarker && (
          <Marker coordinate={{ latitude: destLatNum, longitude: destLngNum }} title="Punto de entrega">
            <View style={[styles.markerContainer, styles.deliveryMarker]}>
              <Flag size={20} color="white" />
            </View>
          </Marker>
        )}
      </MapView>

      {/* Panel de rutas y ubicaciones */}
      <View style={styles.legendContainer}>
        <Pressable onPress={() => setLegendCollapsed(!legendCollapsed)} style={styles.legendHeader}>
          <Text style={styles.legendTitle}>{isDelivered ? 'Entrega completada' : 'Rutas'}</Text>
          {legendCollapsed ? <ChevronUp size={16} color={appColors.textMuted} /> : <ChevronDown size={16} color={appColors.textMuted} />}
        </Pressable>

        {!legendCollapsed && (
          <View style={styles.legendContent}>
            {isLoadingRoutes && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={appColors.primary} />
                <Text style={styles.loadingText}>Calculando...</Text>
              </View>
            )}

            {showRouteToPickup && (
              <View style={styles.routeRow}>
                <View style={styles.routeRowLeft}>
                  <View style={[styles.routeDot, { backgroundColor: ROUTE_COLORS.toPickup }]} />
                  <Text style={styles.routeLabel}>Ubicación → Recoger</Text>
                </View>
                <Text style={styles.routeDistance}>{(routeToPickup!.distance / 1000).toFixed(1)} km</Text>
              </View>
            )}

            {showRouteToDelivery && (
              <View style={styles.routeRow}>
                <View style={styles.routeRowLeft}>
                  <View style={[styles.routeDot, { backgroundColor: ROUTE_COLORS.toDelivery }]} />
                  <Text style={styles.routeLabel}>Recoger → Entregar</Text>
                </View>
                <Text style={styles.routeDistance}>{(routeToDelivery!.distance / 1000).toFixed(1)} km</Text>
              </View>
            )}
          </View>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  errorContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { fontSize: 14, color: appColors.textMuted },
  markerContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3B82F6',
    borderWidth: 3,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 6,
  },
  pickupMarker: { backgroundColor: appColors.success },
  deliveryMarker: { backgroundColor: appColors.mapDestination },
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
    minWidth: 220,
    maxWidth: 250,
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
  legendContent: { paddingHorizontal: 14, paddingVertical: 10, gap: 8 },
  loadingRow: { flexDirection: 'row', alignItems: 'center' },
  loadingText: { fontSize: 12, color: appColors.textMuted, marginLeft: 8 },
  routeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 10 },
  routeRowLeft: { flexDirection: 'row', alignItems: 'center', flex: 1, minWidth: 0 },
  routeDot: { width: 10, height: 10, borderRadius: 5, marginRight: 8 },
  routeLabel: { flex: 1, flexShrink: 1, fontSize: 12, lineHeight: 16, color: appColors.text },
  routeDistance: { fontSize: 12, fontWeight: '700', color: appColors.textMuted },
});