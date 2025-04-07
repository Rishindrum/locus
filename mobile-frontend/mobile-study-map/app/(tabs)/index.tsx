import { Image, StyleSheet, Platform, View } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

//For own location
import * as Location from 'expo-location';
import { useEffect, useState } from 'react';

// Import from Meli
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import React, {Text} from 'react-native';
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

  console.log('Cur User:', user);
  
  return (
    <View style={styles.generalMap}>
        
        {/* Meli's Map */}
        <View style={styles.container}>
          <MapView
            style={styles.map}
            // provider={PROVIDER_GOOGLE}
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
                {/* <View>
                  <Text>Current Location</Text>
                </View> */}
              </Marker>
      }

            {/* Markers */}

            
            {/* Sarah Marker */}
            <Marker
              coordinate={{
                latitude: 30.28463,
                longitude: -97.74184,
              }}>
              <Image 
                  source={require('../../assets/images/marker_S.png')}
                  style={{ width: 50, height: 50 }} 
              />
            </Marker>

            {/* Faith Marker */}
            <Marker
              coordinate={{
                latitude: 30.28657,
                longitude: -97.74364,
              }}
              >
              <Image 
                source={require('../../assets/images/marker_F.png')}
                style={{width: 50, height: 50}}
              />
            </Marker>


            {/* Holly Marker */}
            <Marker
              coordinate={{
                latitude: 30.28619,
                longitude: -97.74327,
              }}>
              
              <Image 
                source={require('../../assets/images/marker_H.png')}
                style={{width: 50, height: 50}}
              />
            </Marker>

            {/* Grayson Marker */}
            <Marker
              coordinate={{
                latitude: 30.29087,
                longitude: -97.74368,
              }}
              >
              <Image 
                source={require('../../assets/images/marker_G.png')}
                style={{width: 50, height: 50}}
              />
            </Marker>

            {/* Krithi Marker */}
            <Marker
              coordinate={{
                latitude: 30.2886,
                longitude: -97.74167,
              }}>
              
              <Image 
                source={require('../../assets/images/marker_K.png')}
                style={{width: 50, height: 50}}
              />
            </Marker>

            {/* Locations */}

            {/* GDC*/}
            {/* <Marker
              coordinate={{
                latitude: 30.28639,
                longitude: -97.73667,
              }}> */}
              
              {/* <Image 
                source={require('../../assets/images/image.png')}
                style={{width: 100, height: 100}}
              /> */}
            {/* </Marker> */}

            {/* Welch*/}
            {/* <Marker
              coordinate={{
                latitude: 30.29167,
                longitude: -97.73872,
              }}> */}
              
              {/* <Image 
                source={require('../../assets/images/marker_K.png')}
                style={{width: 100, height: 100}}
              /> */}
            {/* </Marker> */}

            {/* Robert B. Rowling Hall*/}
            {/* <Marker
              coordinate={{
                latitude: 30.28222,
                longitude: -97.74139,
              }}> */}
              
              {/* <Image 
                source={require('../../assets/images/marker_K.png')}
                style={{width: 100, height: 100}}
              /> */}
            {/* </Marker> */}

            {/* EER*/}
            {/* <Marker
              coordinate={{
                latitude: 30.28417,
                longitude: -97.73611,
              }}> */}
              
              {/* <Image 
                source={require('../../assets/images/marker_K.png')}
                style={{width: 100, height: 100}}
              /> */}
            {/* </Marker> */}

            {/* FAC*/}
            {/* <Marker
              coordinate={{
                latitude: 30.28528,
                longitude: -97.73972,
              }}> */}
              
              {/* <Image 
                source={require('../../assets/images/marker_K.png')}
                style={{width: 100, height: 100}}
              /> */}
            {/* </Marker> */}

            {/* Union*/}
            {/* <Marker
              coordinate={{
                latitude: 30.28333,
                longitude: -97.73944,
              }}> */}
              
              {/* <Image 
                source={require('../../assets/images/marker_K.png')}
                style={{width: 100, height: 100}}
              /> */}
            {/* </Marker> */}

            {/* PCL*/}
            {/* <Marker
              coordinate={{
                latitude: 30.28694,
                longitude: -97.73944,
              }}> */}
              
              {/* <Image 
                source={require('../../assets/images/marker_K.png')}
                style={{width: 100, height: 100}}
              /> */}
            {/* </Marker> */}

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

    // <ParallaxScrollView
    //   headerBackgroundColor={{ light: '#A1CEDC', dark: '#1D3D47' }}
    //   headerImage={
    //     <Image
    //       source={require('@/assets/images/partial-react-logo.png')}
    //       style={styles.reactLogo}
    //     />
    //   }>
    //   <ThemedView style={styles.titleContainer}>
    //     <ThemedText type="title">Welcome!</ThemedText>
    //     <HelloWave />
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 1: Try it</ThemedText>
    //     <ThemedText>
    //       Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
    //       Press{' '}
    //       <ThemedText type="defaultSemiBold">
    //         {Platform.select({
    //           ios: 'cmd + d',
    //           android: 'cmd + m',
    //           web: 'F12'
    //         })}
    //       </ThemedText>{' '}
    //       to open developer tools.
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 2: Explore</ThemedText>
    //     <ThemedText>
    //       Tap the Explore tab to learn more about what's included in this starter app.
    //     </ThemedText>
    //   </ThemedView>
    //   <ThemedView style={styles.stepContainer}>
    //     <ThemedText type="subtitle">Step 3: Get a fresh start</ThemedText>
    //     <ThemedText>
    //       When you're ready, run{' '}
    //       <ThemedText type="defaultSemiBold">npm run reset-project</ThemedText> to get a fresh{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> directory. This will move the current{' '}
    //       <ThemedText type="defaultSemiBold">app</ThemedText> to{' '}
    //       <ThemedText type="defaultSemiBold">app-example</ThemedText>.
    //     </ThemedText>
    //   </ThemedView>
    // </ParallaxScrollView>
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
