import React, { useRef, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import MapView, { Marker, Polyline, MapPressEvent } from 'react-native-maps';
import { MapPin, Flag, Bike } from 'lucide-react-native';
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

// Mapa para mostrar origen, destino y ruta del envío
export function ShipmentMap({
  origin,
  destination,
  routeInfo,
  initialLocation,
  onMapPress,
  onOriginDragEnd,
  onDestinationDragEnd,
  driverLocation = null,
}: ShipmentMapProps) {
  const mapRef = useRef<MapView>(null);

  // Manejar presión en el mapa
  const handlePress = useCallback((event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    onMapPress?.({ lat: coordinate.latitude, lon: coordinate.longitude });
  }, [onMapPress]);

  // Manejar arrastre del origen
  const handleOriginDragEnd = useCallback((event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    onOriginDragEnd?.({ lat: coordinate.latitude, lon: coordinate.longitude });
  }, [onOriginDragEnd]);

  // Manejar arrastre del destino
  const handleDestinationDragEnd = useCallback((event: MapPressEvent) => {
    const { coordinate } = event.nativeEvent;
    onDestinationDragEnd?.({ lat: coordinate.latitude, lon: coordinate.longitude });
  }, [onDestinationDragEnd]);

  // Manejar animación a la región del origen 
  useEffect(() => {
    if (origin && mapRef.current) {
      mapRef.current.animateToRegion({
        latitude: origin.lat,
        longitude: origin.lon,
        latitudeDelta: 0.03,
        longitudeDelta: 0.03,
      }, 500);
    }
  }, [origin]);

  // Manejar animación a la región del destino 
  useEffect(() => {
    if (origin && destination && mapRef.current) {
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
    }
  }, [origin, destination]);

  // Manejar animación a la región del conductor
  useEffect(() => {
    if (!mapRef.current || !driverLocation) return;

    const markers: { lat: number; lng: number }[] = [{ lat: driverLocation.lat, lng: driverLocation.lng }];
    if (destination) markers.push({ lat: destination.lat, lng: destination.lon });

    const lats = markers.map(m => m.lat);
    const lons = markers.map(m => m.lng);
    const minLat = Math.min(...lats);
    const maxLat = Math.max(...lats);
    const minLon = Math.min(...lons);
    const maxLon = Math.max(...lons);

    mapRef.current.animateToRegion({
      latitude: (minLat + maxLat) / 2,
      longitude: (minLon + maxLon) / 2,
      latitudeDelta: Math.abs(maxLat - minLat) * 1.5 + 0.02,
      longitudeDelta: Math.abs(maxLon - minLon) * 1.5 + 0.02,
    }, 500);
  }, [driverLocation, destination]);

  const routeCoordinates = routeInfo?.geometry?.map(c => ({
    latitude: c.lat,
    longitude: c.lon,
  })) ?? [];

  if (!initialLocation) return null;

  return (
    <View style={styles.container}>
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
        showsUserLocation
        showsMyLocationButton={false}
        showsCompass={false}
      >
        {origin && (
          <Marker
            coordinate={{ latitude: origin.lat, longitude: origin.lon }}
            title="Origen"
            pinColor={appColors.success}
            draggable
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
            pinColor={appColors.mapDestination}
            draggable
            onDragEnd={handleDestinationDragEnd}
          >
            <View style={[styles.marker, styles.destinationMarker]}>
              <Flag size={18} color="white" />
            </View>
          </Marker>
        )}

        {driverLocation && (
          <Marker
            coordinate={{ latitude: driverLocation.lat, longitude: driverLocation.lng }}
            title="Repartidor"
          >
            <View style={[styles.marker, styles.driverMarker]}>
              <Bike size={18} color="white" />
            </View>
          </Marker>
        )}

        {routeCoordinates.length > 0 && (
          <Polyline
            coordinates={routeCoordinates}
            strokeColor={appColors.primary}
            strokeWidth={4}
          />
        )}
      </MapView>

      {routeInfo && (
        <View style={styles.routeInfo}>
          <Text style={styles.routeText}>
            {(routeInfo.distance / 1000).toFixed(1)} km • {Math.round(routeInfo.duration / 60)} min
          </Text>
        </View>
      )}

      <View style={styles.hintArea}>
        <Text style={styles.hintText}>Toca o arrastra los marcadores para seleccionar</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 350,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  originMarker: {
    backgroundColor: appColors.success,
  },
  destinationMarker: {
    backgroundColor: '#EF4444',
  },
  driverMarker: {
    backgroundColor: '#3B82F6',
  },
  routeInfo: {
    position: 'absolute',
    bottom: 60,
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
  hintArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingVertical: 10,
    alignItems: 'center',
  },
  hintText: {
    fontSize: 12,
    color: '#64748B',
  },
});