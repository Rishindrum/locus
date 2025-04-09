import { Text, Image, StyleSheet, Platform, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// For geolocation
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

// For map
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';


export default function HomeScreen() {

  const [currentLocation, setCurrentLocation] = useState({ latitude: 30.28448, longitude: -97.74222 });

  const markers = [
    { id: 1, coordinate: { latitude: 30.28639, longitude: 97.73667 } },
    { id: 2, coordinate: { latitude: 30.29167, longitude: 97.73972 } },
    // replace with function to get the markers
  ];

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      // If permissions are granted, fetch the location
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);
  
  return (

    <View style={styles.generalMap}>
        
        {/* Meli's Map */}
        <View style={styles.container}>
          <MapView
            style={styles.map}
            initialRegion={{
              latitude: 30.28448,
              longitude: -97.74222,
              latitudeDelta: 0.020,
              longitudeDelta: 0.010,
            }}>

            {/* Current Location */}
            {currentLocation &&
              <Marker
                coordinate={currentLocation}>
                <Image 
                  source={require('../../assets/images/marker_S.png')}
                  style={{ width: 50, height: 50 }} 
                />
                <View>
                  <Text>Current Location</Text>
                </View>
              </Marker>
      }

          </MapView>
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    height: 178,
    width: 290,
    bottom: 0,
    left: 0,
    position: 'absolute',
  },

  // added by Meli
  generalMap: {
    flex: 1,
  },
  container: {
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
