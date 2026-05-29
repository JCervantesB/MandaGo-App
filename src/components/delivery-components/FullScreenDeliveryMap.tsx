import React, { useRef, useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native';
import { Map, Marker, Camera, Layer, GeoJSONSource } from '@maplibre/maplibre-react-native';
import { MapPin, ChevronDown, ChevronUp, Bike } from 'lucide-react-native';
import { useCurrentLocation, useLocationWatcher } from '@/hooks/use-current-location';
import { getRoute } from '@/services/geoapify-service';
import { appColors } from '@/theme/theme';

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

const ROUTE_COLORS = {
  toPickup: '#3B82F6',
  toDelivery: '#22C55E',
};

// Aplanar las coordenadas de la ruta en una sola matriz
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

// Componente de mapa del repartidor
export default function FullScreenDeliveryMap({
  originLat,
  originLng,
  destLat,
  destLng,
  routeType = 'both',
  driverLocation: externalDriverLocation,
  onDriverLocationUpdate,
}: FullScreenDeliveryMapProps) {
  const { getCurrentLocation } = useCurrentLocation();
  const cameraRef = useRef<any>(null);
  const [internalDriverLocation, setInternalDriverLocation] = useState<{ lat: number; lon: number } | null>(null);
  const [routeToPickup, setRouteToPickup] = useState<[number, number][] | null>(null);
  const [routeToDelivery, setRouteToDelivery] = useState<[number, number][] | null>(null);
  const [pickupDistance, setPickupDistance] = useState<number>(0);
  const [deliveryDistance, setDeliveryDistance] = useState<number>(0);
  const [isLoadingRoutes, setIsLoadingRoutes] = useState(false);
  const [legendCollapsed, setLegendCollapsed] = useState(false);

  // Combinar la ubicación externa con la ubicación interna
  const driverLocation = externalDriverLocation ?? internalDriverLocation;

  const originLatNum = parseFloat(originLat);
  const originLngNum = parseFloat(originLng);
  const destLatNum = parseFloat(destLat);
  const destLngNum = parseFloat(destLng);

  const hasValidCoords =
    !isNaN(originLatNum) && !isNaN(originLngNum) && !isNaN(destLatNum) && !isNaN(destLngNum);

  const isDelivered = routeType === 'none';

  // Manejar la actualización de la ubicación del conductor
  const handleLocationUpdate = useCallback(
    (location: { latitude: number; longitude: number }) => {
      const loc = { lat: location.latitude, lon: location.longitude };
      setInternalDriverLocation(loc);
      onDriverLocationUpdate?.(loc);
    },
    [onDriverLocationUpdate]
  );

  // Utilizar el watcher de ubicación para actualizar la ubicación del conductor
  useLocationWatcher(handleLocationUpdate, 10000);

  // Obtener la ubicación inicial del mapa basada en la ubicación del conductor, la ubicación inicial o el destino
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

  // Calcular las rutas de recogida y entrega
  const calculateRoutes = useCallback(async () => {
    if (!hasValidCoords) return;
    if (isDelivered) return;

    setIsLoadingRoutes(true);

    const promises: Promise<void>[] = [];

    if (routeType === 'driver-to-pickup' || routeType === 'both') {
      if (driverLocation) {
        promises.push(
          getRoute([
            { lat: driverLocation.lat, lon: driverLocation.lon },
            { lat: originLatNum, lon: originLngNum },
          ]).then((res) => {
            if (res.features.length > 0) {
              const coords = flattenRouteCoordinates(res.features[0].geometry);
              setRouteToPickup(coords);
              setPickupDistance(res.features[0].properties.distance);
            }
          }).catch(() => {})
        );
      }
    }

    // Calcular la ruta de entrega
    if (routeType !== 'driver-to-pickup') {
      const startLat = routeType === 'pickup-to-delivery' && driverLocation ? driverLocation.lat : originLatNum;
      const startLon = routeType === 'pickup-to-delivery' && driverLocation ? driverLocation.lon : originLngNum;

      promises.push(
        getRoute([
          { lat: startLat, lon: startLon },
          { lat: destLatNum, lon: destLngNum },
        ]).then((res) => {
          if (res.features.length > 0) {
            const coords = flattenRouteCoordinates(res.features[0].geometry);
            setRouteToDelivery(coords);
            setDeliveryDistance(res.features[0].properties.distance);
          }
        }).catch(() => {})
      );
    }

    await Promise.all(promises);
    setIsLoadingRoutes(false);
  }, [hasValidCoords, routeType, driverLocation, originLatNum, originLngNum, destLatNum, destLngNum, isDelivered]);

  useEffect(() => {
    if (hasValidCoords) {
      calculateRoutes();
    }
  }, [hasValidCoords, calculateRoutes]);

  // Mover la cámara al conductor si está disponible
   useEffect(() => {
    if (cameraRef.current && driverLocation) {
      cameraRef.current.flyTo({
        center: [driverLocation.lon, driverLocation.lat],
        zoom: 13,
        duration: 800,
      });
    }
  }, [driverLocation]);

  if (!hasValidCoords) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Coordenadas no disponibles</Text>
      </View>
    );
  }

  const MarkerDrop = ({ color, label }: { color: string; label: string }) => (
    <View className="items-center">
      <Text className="text-xs font-bold text-white mb-0.5 px-1.5 py-0.5 rounded" style={{ backgroundColor: color }}>{label}</Text>
      <View className="items-center justify-center w-9 h-9 rounded-full" style={{ backgroundColor: color }}>
        <MapPin size={20} color="white" strokeWidth={2.5} />
      </View>
    </View>
  );

  const centerLat = driverLocation?.lat ?? (hasValidCoords ? originLatNum : 0);
  const centerLon = driverLocation?.lon ?? (hasValidCoords ? originLngNum : 0);

  if (!hasValidCoords) {
    return (
      <View style={styles.errorContainer}>
        <ActivityIndicator size="large" color={appColors.primary} />
        <Text style={styles.errorText}>Cargando coordenadas...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Map
        style={{ flex: 1 }}
        mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
      >
        <Camera
          ref={cameraRef}
          initialViewState={{ center: [centerLon, centerLat], zoom: 13 }}
        />

        {routeType !== 'pickup-to-delivery' && hasValidCoords && (
          <Marker id="pickup" lngLat={[originLngNum, originLatNum]}>
            <MarkerDrop color={ROUTE_COLORS.toPickup} label="Recoger" />
          </Marker>
        )}

        {routeType !== 'driver-to-pickup' && hasValidCoords && (
          <Marker id="delivery" lngLat={[destLngNum, destLatNum]}>
            <MarkerDrop color={ROUTE_COLORS.toDelivery} label="Entregar" />
          </Marker>
        )}

        {driverLocation && (
          <Marker id="driver" lngLat={[driverLocation.lon, driverLocation.lat]}>
            <View className="items-center">
              <View className="items-center justify-center w-10 h-10 rounded-full" style={{ backgroundColor: '#3B82F6' }}>
                <Bike size={22} color="white" strokeWidth={2.5} />
              </View>
            </View>
          </Marker>
        )}

        {routeToPickup && routeToPickup.length > 0 && (
          <GeoJSONSource
            id="routeToPickup"
            data={{
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: routeToPickup },
            }}
          >
            <Layer
              id="routeToPickupLine"
              type="line"
              source="routeToPickup"
              paint={{
                "line-color": ROUTE_COLORS.toPickup,
                "line-width": 4,
                "line-opacity": 0.8,
                "line-dasharray": [2, 1.5],
              }}
              layout={{ "line-join": "round", "line-cap": "round" }}
            />
          </GeoJSONSource>
        )}

        {routeToDelivery && routeToDelivery.length > 0 && (
          <GeoJSONSource
            id="routeToDelivery"
            data={{
              type: 'Feature',
              properties: {},
              geometry: { type: 'LineString', coordinates: routeToDelivery },
            }}
          >
            <Layer
              id="routeToDeliveryLine"
              type="line"
              source="routeToDelivery"
              paint={{
                "line-color": ROUTE_COLORS.toDelivery,
                "line-width": 4,
                "line-opacity": 0.8,
              }}
              layout={{ "line-join": "round", "line-cap": "round" }}
            />
          </GeoJSONSource>
        )}
      </Map>

      <View style={styles.legendContainer}>
        <Pressable onPress={() => setLegendCollapsed(!legendCollapsed)} style={styles.legendHeader}>
          <Text style={styles.legendTitle}>{isDelivered ? 'Entrega completada' : 'Rutas'}</Text>
          {legendCollapsed
            ? <ChevronUp size={16} color={appColors.textMuted} />
            : <ChevronDown size={16} color={appColors.textMuted} />
          }
        </Pressable>

        {!legendCollapsed && (
          <View style={styles.legendContent}>
            {isLoadingRoutes && (
              <View style={styles.loadingRow}>
                <ActivityIndicator size="small" color={appColors.primary} />
                <Text style={styles.loadingText}>Calculando...</Text>
              </View>
            )}

            {routeToPickup && routeToPickup.length > 0 && (
              <View style={styles.routeRow}>
                <View style={styles.routeRowLeft}>
                  <View style={[styles.routeDot, { backgroundColor: ROUTE_COLORS.toPickup }]} />
                  <Text style={styles.routeLabel}>Ubicación → Recoger</Text>
                </View>
                <Text style={styles.routeDistance}>{(pickupDistance / 1000).toFixed(1)} km</Text>
              </View>
            )}

            {routeToDelivery && routeToDelivery.length > 0 && (
              <View style={styles.routeRow}>
                <View style={styles.routeRowLeft}>
                  <View style={[styles.routeDot, { backgroundColor: ROUTE_COLORS.toDelivery }]} />
                  <Text style={styles.routeLabel}>Recoger → Entregar</Text>
                </View>
                <Text style={styles.routeDistance}>{(deliveryDistance / 1000).toFixed(1)} km</Text>
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
  errorContainer: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: { fontSize: 14, color: appColors.textMuted },
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