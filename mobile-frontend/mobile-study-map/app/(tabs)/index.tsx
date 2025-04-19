import { Text, ScrollView, Image, StyleSheet, FlatList, Platform, Dimensions, View, TouchableOpacity } from 'react-native';
import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';

// For scrolling view of small cards
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SmallCard from '../../components/SmallCard';
import LargeCard from '../../components/LargeCard';
import SearchWithFilter from '@/components/SearchWithFilter';

// For geolocation
import * as Location from 'expo-location';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';

// For map
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SearchBar } from 'react-native-elements';

// For backend
import { useRouter } from 'expo-router';
import { getAllStudySpaces } from '@/backend/backendFunctions';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface StudySpace {
  id: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
  };
  address: string;
  hours: string;
  features: any;
}

interface AuthContextType {
  user: { uid: string; displayName: string } | null;
}

interface UserLocation {
  userId: string;
  displayName: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

export default function HomeScreen() {

  const router = useRouter();
  const { user } = useAuth() as AuthContextType;
  const { userLocations, startLocationSharing } = useLocation();
  const [region, setRegion] = useState<Region | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const mapRef = useRef<MapView>(null);

  useEffect(() => {
    // Start sharing location when component mounts
    startLocationSharing();
  }, []);

  useEffect(() => {
    const getCurrentLocation = async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          console.log('Permission denied', 'Location permission is required.');
          return;
        }

        const location = await Location.getCurrentPositionAsync({});
        const newRegion = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        };
        setRegion(newRegion);
        setCurrentLocation({
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          timestamp: location.timestamp,
        });

        // Animate to the location
        mapRef.current?.animateToRegion(newRegion, 1000);
      } catch (error) {
        console.error('Error getting location:', error);
      }
    };

    getCurrentLocation();
  }, []);

  // FUNCTIONS FOR SCROLLABLE VIEW

  const bottomSheetRef = useRef<BottomSheet>(null);
  const snapPoints = useMemo(() => ['20%', '40%', '90%'], []);

  const handleSheetChanges = useCallback((index: number) => {
    console.log('handleSheetChanges', index);
  }, []);

  // FUNCTIONS FOR CURRENT LOCATION

  const [studySpaceMarkers, setStudySpaceMarkers] = useState<StudySpace[]>([]);

  useEffect(() => {
    const fetchStudySpaces = async () => {
      try {
        const spaces = await getAllStudySpaces();
        const formattedMarkers = spaces.map((space) => ({
          id: space.id,
          location: {
            latitude: space.location[0],
            longitude: space.location[1]
          },
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
  // const parseLocationString = (locationStr) => {
  //   const [lat, lng] = locationStr
  //     .replace(/[\[\]]/g, '')
  //     .split(',')
  //     .map(Number);
  //   return { latitude: lat, longitude: lng };
  // };

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        console.log('Permission to access location was denied');
        return;
      }
      // If permissions are granted, fetch the location
      const location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude, timestamp: location.timestamp });
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // console.log('Cur User:', user);

  // FUNCTION TO CREATE LARGE CARDS

  const callLargeCard = () => {
    return(
      <LargeCard></LargeCard>
    );
  };

  // SEARCH BAR

  const [search, setSearch] = useState('');
  
  return (
      <View style={{ flex: 1 }}>

        {/* SEARCH BAR */}
        <SearchWithFilter></SearchWithFilter>

        {/* Map */}
        {region && (
          <MapView
            ref={mapRef}
            style={styles.map}
            initialRegion={region}
            showsUserLocation={false}
            showsMyLocationButton={false}
          >
            {/* Current Location Marker */}
            {currentLocation && (
              <Marker
                coordinate={{
                  latitude: currentLocation.latitude,
                  longitude: currentLocation.longitude,
                }}
              >
                <View style={styles.currentLocationMarker}>
                  <Text style={styles.currentLocationText}>Me</Text>
                </View>
              </Marker>
            )}

            {/* Location - Vaishnuv */}
            <Marker
              coordinate={{latitude: 30.288075, longitude: -97.735714}}>
              <Image 
                source={require('../../assets/images/pfp_vaishnuv.png')}
                style={{ width: 48, height: 48 }} 
              />
            </Marker>

            {/* Location - Shruti */}
            <Marker
              coordinate={{latitude: 30.28668, longitude: -97.73782}}>
              <Image 
                source={require('../../assets/images/pfp_shruti.png')}
                style={{ width: 50, height: 50 }} 
              />
            </Marker>

            {/* Location - Rishindra */}
            <Marker
              coordinate={{latitude: 30.285876, longitude: -97.739407}}>
              <Image 
                source={require('../../assets/images/pfp_rishindra.png')}
                style={{ width: 50, height: 50 }} 
              />
            </Marker>

            {/* Location - Vincent */}
            <Marker
              coordinate={{latitude: 30.288491, longitude: -97.743310}}>
              <Image 
                source={require('../../assets/images/pfp_vincent.png')}
                style={{ width: 50, height: 50 }} 
              />
            </Marker>

            {/* Location - Drishti */}
            <Marker
              coordinate={{latitude: 30.289997, longitude: -97.740532}}>
              <Image 
                source={require('../../assets/images/pfp_drishti.png')}
                style={{ width: 50, height: 50 }} 
              />
            </Marker>

            {/* Location - Venkat */}
            <Marker
              coordinate={{latitude: 30.28417, longitude: -97.73783}}>
              <Image 
                source={require('../../assets/images/pfp_venkat.png')}
                style={{ width: 50, height: 50 }} 
              />
            </Marker>

            {/* Location - Ishita */}
            <Marker
              coordinate={{latitude: 30.28876, longitude: -97.73758}}>
              <Image 
                source={require('../../assets/images/pfp_ishita.png')}
                style={{ width: 50, height: 50 }} 
              />
            </Marker>

            {/* Followed Users */}
            {userLocations.map((userLocation) => {
              if (!userLocation.location) return null;

              const isInactive = Date.now() - userLocation.location.timestamp > 30 * 60 * 1000; // 30 minutes
              const markerStyle = {
                ...styles.markerContainer,
                backgroundColor: isInactive ? '#808080' : '#DC8B47',
              };

              return (
                <Marker
                  key={userLocation.userId}
                  coordinate={{
                    latitude: userLocation.location.latitude,
                    longitude: userLocation.location.longitude,
                  }}
                >
                  <View style={markerStyle}>
                    <Text style={styles.markerText}>
                      {userLocation.displayName.split(' ').map(part => part[0]).join('').toUpperCase()}
                    </Text>
                  </View>
                  <Callout>
                    <View style={styles.callout}>
                      <Text style={styles.calloutText}>{userLocation.displayName}</Text>
                      <Text style={styles.calloutSubtext}>
                        {isInactive ? 'Inactive - ' : ''}
                        Last seen: {new Date(userLocation.location.timestamp).toLocaleTimeString()}
                      </Text>
                    </View>
                  </Callout>
                </Marker>
              );
            })}

            {/* Study Space Markers from Firestore */}
            {studySpaceMarkers.map((space) => (
              space.location && space.location.latitude && space.location.longitude ? (
                <Marker
                  key={space.id}
                  coordinate={{
                    latitude: space.location.latitude,
                    longitude: space.location.longitude,
                  }}
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
              ) : null
            ))}
          </MapView>
        )}

        {/* List of Study Space Small Cards */}
        <BottomSheet
          ref={bottomSheetRef}
          index={1}
          snapPoints={snapPoints}
          backgroundStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.9)', // slightly transparent white
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
          }}
        >
          <BottomSheetView style={styles.scrollContent}>
            <ScrollView
            >
              <SmallCard
                name="PCL"
                todayHrs="24/7"
                distance={0.6}
                imagePath="gs://studymap-5c5ae.firebasestorage.app/pcl.jpg"
                features="something"
              />
              <SmallCard
                name="Welch"
                todayHrs="8 AM-4:30 PM"
                distance={0.2}
                imagePath="gs://studymap-5c5ae.firebasestorage.app/welch.png"
                features="something"
              />
              <SmallCard
                name="Gates Dell Complex"
                todayHrs="24/7"
                distance={0.1}
                imagePath="gs://studymap-5c5ae.firebasestorage.app/gdc.png"
                features="something"
              />
              <SmallCard
                name="NRG Productivity Center"
                todayHrs="9 AM-5 PM"
                distance={0.4}
                imagePath="gs://studymap-5c5ae.firebasestorage.app/nrg.jpg"
                features="something"
              />
              <SmallCard
                name="Moody (DMC)"
                todayHrs="7 AM-11 PM"
                distance={0.8}
                imagePath="gs://studymap-5c5ae.firebasestorage.app/moody.png"
                features="something"
              />
            </ScrollView>
          </BottomSheetView>
        </BottomSheet>

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

  cardContainer: {
    width: "100%",
    height: "100%",
    padding: 16,
    gap: 12,
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
    flex: 1,
  },

  scrollContent: {
    flex: 1,
    padding: 8,
    marginBottom: 130,
  },

  markerContainer: {
    backgroundColor: '#DC8B47',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  markerText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  calloutText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  calloutSubtext: {
    fontSize: 12,
    color: '#666',
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
    flex: 1,
  },

  scrollContent: {
    flex: 1,
    padding: 8,
    marginBottom: 130,
  },

  currentLocationMarker: {
    backgroundColor: '#DC8B47',
    borderRadius: 20,
    padding: 8,
    borderWidth: 2,
    borderColor: '#fff',
  },
  currentLocationText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
