import React, { Text, Image, StyleSheet, Platform, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

// For geolocation
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

// For map
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';

// For backend
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext'; // Importing the AuthContext for authentication
import { getAllStudySpaces } from '@/backend/backendFunctions';


export default function HomeScreen() {

  const [currentLocation, setCurrentLocation] = useState({ latitude: 30.28448, longitude: -97.74222 });
  const [studySpaceMarkers, setStudySpaceMarkers] = useState([]);

  const {user} = useAuth(); // Get the current user from AuthContext

  useEffect(() => {
    const fetchStudySpaces = async () => {
      try {
        const spaces = await getAllStudySpaces();
        const formattedMarkers = spaces.map((space) => ({
          id: space.id,
          coordinate: parseLocationString(space.location),
          name: space.name,
          address: space.address,
        }));
        setStudySpaceMarkers(formattedMarkers);
      } catch (error) {
        console.error('Error fetching study spaces:', error);
      }
    };

    fetchStudySpaces();
  }, []);

  // Helper function to parse location string from Firestore
  const parseLocationString = (locationStr) => {
    const [lat, lng] = locationStr
      .replace(/[\[\]]/g, '')
      .split(',')
      .map(Number);
    return { latitude: lat, longitude: lng };
  };

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

  // console.log('Cur User:', user);
  
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

             {/* Study Space Markers from Firestore */}
          {studySpaceMarkers.map((space) => (
            <Marker
              key={space.id}
              coordinate={space.coordinate}
              title={space.name}
              description={space.address}
            >
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{space.name}</Text>
                  <Text>{space.address}</Text>
                </View>
              </Callout>
            </Marker>
          ))}
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
  callout: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    maxWidth: 200,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  map: {
    width: '100%',
    height: '100%',
  },
});
