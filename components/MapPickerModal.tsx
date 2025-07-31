import { Colors } from '@/constants/Colors';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import React, { useEffect, useRef, useState } from 'react';
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MapView, { Marker } from 'react-native-maps';

interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onLocationSelect: (latitude: number, longitude: number) => void;
  value?: { latitude: number; longitude: number };
}

const MapPickerModal: React.FC<MapPickerModalProps> = ({ 
  visible, 
  onClose, 
  onLocationSelect,
  value 
}) => {
  const [selectedLocation, setSelectedLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [mapRegion, setMapRegion] = useState<{ latitude: number; longitude: number; latitudeDelta: number; longitudeDelta: number }>({
    latitude: 54.6872,
    longitude: 25.2797,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const [isMapReady, setIsMapReady] = useState(false);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    if (visible && !value) {
      getCurrentLocation(); // just sets userLocation, not pin
    }
  }, [visible]);

  // Another useEffect to set marker + camera when map is ready
  useEffect(() => {
    if (visible && isMapReady) {
        console.log('value', value);
        console.log('userLocation', userLocation);
      if (value) {
        // User provided value
        setSelectedLocation(value);
        setMapRegion({
          ...value,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      } else if (userLocation) {
        // Fallback to user location
        setSelectedLocation(userLocation);
        setMapRegion({
          ...userLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        });
      }
    }
  }, [visible, isMapReady, userLocation, value]);

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to use this feature.');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };
      setUserLocation(coords);
      // Only set userLocation, not selectedLocation - that will be handled by the other useEffect
    } catch (error) {
      console.error('Error getting location:', error);
      // Default to a fallback location (e.g., city center)
      const fallbackLocation = { latitude: 54.6872, longitude: 25.2797 }; // Vilnius
      setSelectedLocation(fallbackLocation);
      setMapRegion({
        latitude: fallbackLocation.latitude,
        longitude: fallbackLocation.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      });
    }
  };

  const handleMapPress = (event: any) => {
    const { latitude, longitude } = event.nativeEvent.coordinate;
    setSelectedLocation({ latitude, longitude });
  };

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation.latitude, selectedLocation.longitude);
    }
    onClose();
  };

  const handleUseCurrentLocation = () => {
    if (userLocation) {
      setSelectedLocation(userLocation);
      
      mapRef.current?.animateToRegion({
        ...userLocation,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }, 500); // 500ms animation
    } else {
      // If we don't have user location yet, get it and it will update both marker and map
      getCurrentLocation();
      setSelectedLocation(userLocation);
    }
  };



  return (
    <Modal
      visible={visible}
      animationType="slide"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose} style={styles.closeButton}>
            <MaterialCommunityIcons name="close" size={24} color={Colors.app.primary} />
          </TouchableOpacity>
          <Text style={styles.title}>Select Location</Text>
          <TouchableOpacity onPress={handleConfirm} style={styles.confirmButton}>
            <Text style={styles.confirmButtonText}>Confirm</Text>
          </TouchableOpacity>
        </View>

        {/* Map */}
        <View style={styles.mapContainer}>
          <MapView
            ref={mapRef}
            style={styles.map}
            region={mapRegion}
            onPress={handleMapPress}
            onMapReady={() => setIsMapReady(true)}
          >
            {selectedLocation && (
              <Marker
                coordinate={selectedLocation}
                pinColor={Colors.app.primary}
                draggable
                onDragEnd={(e) => setSelectedLocation(e.nativeEvent.coordinate)}
              />
            )}
          </MapView>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.currentLocationButton}
            onPress={handleUseCurrentLocation}
          >
            <MaterialCommunityIcons name="crosshairs-gps" size={20} color={Colors.app.primary} />
            <Text style={styles.currentLocationText}>Use Current Location</Text>
          </TouchableOpacity>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsText}>
            Tap on the map to select a location, or use your current location
          </Text>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0A',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0A0A0A',
  },
  closeButton: {
    padding: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  confirmButton: {
    backgroundColor: Colors.app.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmButtonText: {
    color: '#0A0A0A',
    fontWeight: '600',
  },
  mapContainer: {
    flex: 1,
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 12,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
  },
  controls: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  currentLocationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#1A1A1A',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.app.primary,
  },
  currentLocationText: {
    color: Colors.app.primary,
    marginLeft: 8,
    fontWeight: '500',
  },
  instructions: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  instructionsText: {
    color: '#888888',
    textAlign: 'center',
    fontSize: 14,
  },
});

export default MapPickerModal; 