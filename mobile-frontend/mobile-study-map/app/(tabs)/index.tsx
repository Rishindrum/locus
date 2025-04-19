import { Text, ScrollView, Image, StyleSheet, FlatList, Platform, Dimensions, View, TouchableOpacity } from 'react-native';
import React, { useRef, useMemo, useEffect, useState, useCallback } from 'react';

// For scrolling view of small cards
import BottomSheet, { BottomSheetView } from '@gorhom/bottom-sheet';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import SmallCard from '../../components/SmallCard';
import LargeCard from '../../components/LargeCard';
import SearchWithFilter from '@/components/SearchWithFilter';
import UserSessionPopup from '../../components/UserSessionPopup';

// For geolocation
import * as Location from 'expo-location';
import { useLocation } from '@/contexts/LocationContext';
import { useAuth } from '@/contexts/AuthContext';

// For map
import MapView, { Callout, Marker, PROVIDER_GOOGLE, Region } from 'react-native-maps';
import { SearchBar } from 'react-native-elements';

// For backend
import { useRouter } from 'expo-router';
import { getUserActiveSession } from '@/backend/backendFunctions';
import { useSession } from '@/contexts/SessionContext';
import { getAllStudySpaces, getStudySpace } from '@/backend/backendFunctions';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '@/backend/firebaseConfig';


// Type Definition for Study Space Schema
interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface AuthContextType {
  user: { uid: string; name: string } | null;
}

interface UserLocation {
  userId: string;
  name: string;
  location: {
    latitude: number;
    longitude: number;
    timestamp: number;
  };
}

type FeatureRatings = {
  aesthetics: {
    corporate: number;
    cozy: number;
    dark_academia: number;
    minimalist: number;
  };
  lighting: {
    artificial: number;
    bright: number;
    dim: number;
    natural: number;
  };
  reservable: {
    no: number;
    yes: number;
  };
  seating: {
    couches: number;
    desks: number;
    comfy: number;
    hard: number;
  };
  noise: number;
  outlets: number;
  temp: number;
  wifi: number;
  cleanliness: number;
};

type StudySpace = {
  id: string;
  name: string;
  address: string;
  createdBy: string;
  features: FeatureRatings;
  hours: string;
  location: [number, number]; // [latitude, longitude]
  numRatings: number;
  spaceId: string;
  images?: string[];
};

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth(); // Get the current user from AuthContext
  const { userLocations, startLocationSharing } = useLocation();
  const { sessionId, joinSession, startTime } = useSession();
  const [region, setRegion] = useState<Region | null>(null);
  const [currentLocation, setCurrentLocation] = useState<LocationData | null>(null);
  const mapRef = useRef<MapView>(null);
  const [popupUser, setPopupUser] = useState<{ userId: string; name: string } | null>(null);
  const [joinedSessionStart, setJoinedSessionStart] = useState<string | null>(null);

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

  // FUNCTIONS FOR CURRENT LOCATION, SPACES LOCATIONS
  // const [currentLocation, setCurrentLocation] = useState({ latitude: 30.28626, longitude: -97.73937 });
  const [studySpaces, setStudySpaces] = useState<StudySpace[]>([]);

  // Fetch and display the study space markers
  useEffect(() => {
    const fetchStudySpaces = async () => {
      try {
        const spaces = await getAllStudySpaces();
        setStudySpaces(spaces);
      } catch (error) {
        console.error('Error fetching study spaces:', error);
      }
    };

    fetchStudySpaces();
  }, []);


  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "studySpaces"), (snapshot) => {
      const spaces = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setStudySpaces(spaces);
    });
  
    return () => unsubscribe();
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
      setCurrentLocation({ latitude: location.coords.latitude, longitude: location.coords.longitude });
    } catch (error) {
      console.error('Error requesting location permission:', error);
    }
  };

  useEffect(() => {
    requestLocationPermission();
  }, []);

  // FUNCTION TO CALL AND CREATE LARGE CARD
  const displayLargeCard = (space) => {
    router.push({
      pathname: `./largecard/${space.spaceId}`,
    });
  };

  // SEARCH BAR

  const [search, setSearch] = useState('');

  // Handler for marker tap
  const handleUserMarkerPress = (userLocation: UserLocation) => {
    setPopupUser({ userId: userLocation.userId, name: userLocation.name });
  };

  // Handler for joining session from popup
  const handleJoinSession = async (
    newSessionId: string,
    sessionStart: string,
    sessionType: string,
    sessionDescription: string
  ) => {
    await joinSession(newSessionId, sessionType, sessionDescription, sessionStart);
    setJoinedSessionStart(sessionStart);
  };


  const [zoomLevel, setZoomLevel] = useState(15); // default

  const handleRegionChangeComplete = (region) => {
    const zoom = Math.round(Math.log(360 / region.longitudeDelta) / Math.LN2);
    setZoomLevel(zoom);
  };

  const bringSpaceToTop = (spaceId: string) => {
    setStudySpaces((prevSpaces) => {
      const index = prevSpaces.findIndex(space => space.id === spaceId);
      if (index === -1) return prevSpaces;
  
      const selected = prevSpaces[index];
      const rest = prevSpaces.filter((_, i) => i !== index);
      return [selected, ...rest];
    });
  };
  
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
              style={styles.pfpIcon} 
            />
          </Marker>

          {/* Location - Shruti */}
          <Marker
            coordinate={{latitude: 30.28668, longitude: -97.73782}}>
            <Image 
              source={require('../../assets/images/pfp_shruti.png')}
              style={styles.pfpIcon} 
            />
          </Marker>

          {/* Location - Rishindra */}
          <Marker
            coordinate={{latitude: 30.285876, longitude: -97.739407}}>
            <Image 
              source={require('../../assets/images/pfp_rishindra.png')}
              style={styles.pfpIcon} 
            />
          </Marker>

          {/* Location - Vincent */}
          <Marker
            coordinate={{latitude: 30.288491, longitude: -97.743310}}>
            <Image 
              source={require('../../assets/images/pfp_vincent.png')}
              style={styles.pfpIcon} 
            />
          </Marker>

          {/* Location - Drishti */}
          <Marker
            coordinate={{latitude: 30.289997, longitude: -97.740532}}>
            <Image 
              source={require('../../assets/images/pfp_drishti.png')}
              style={styles.pfpIcon} 
            />
          </Marker>

          {/* Location - Venkat */}
          <Marker
            coordinate={{latitude: 30.28417, longitude: -97.73783}}>
            <Image 
              source={require('../../assets/images/pfp_venkat.png')}
              style={styles.pfpIcon} 
            />
          </Marker>

          {/* Location - Ishita */}
          <Marker
            coordinate={{latitude: 30.28876, longitude: -97.73758}}>
            <Image 
              source={require('../../assets/images/pfp_ishita.png')}
              style={styles.pfpIcon} 
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

            // Show stopwatch if joined this session
            const showStopwatch = popupUser && popupUser.userId === userLocation.userId && sessionId && joinedSessionStart;

            return (
              <Marker
                key={userLocation.userId}
                coordinate={{
                  latitude: userLocation.location.latitude,
                  longitude: userLocation.location.longitude,
                }}
                onPress={() => handleUserMarkerPress(userLocation)}
              >
                <View style={markerStyle}>
                  <Text style={styles.markerText}>
                    {userLocation.name.split(' ').map((part) => part[0]).join('').toUpperCase()}
                  </Text>
                </View>
                <Callout>
                  <View style={styles.callout}>
                    <Text style={styles.calloutText}>{userLocation.name}</Text>
                    <Text style={styles.calloutSubtext}>
                      {isInactive ? 'Inactive - ' : ''}
                      Last seen: {new Date(userLocation.location.timestamp).toLocaleTimeString()}
                    </Text>
                    {showStopwatch && (
                      <Text style={{ color: '#DC8B47', fontWeight: 'bold', marginTop: 8 }}>
                        Stopwatch: {Math.floor((Date.now() - new Date(joinedSessionStart!).getTime()) / 1000)}s
                      </Text>
                    )}
                  </View>
                </Callout>
              </Marker>
            );
          })}

          {/* Study Space Markers from Firestore */}
          {studySpaces.map((space) => (
            <Marker
              key={space.spaceId}
              coordinate={ { latitude: space.location[0], longitude: space.location[1]} }
              title={space.name}
              description={space.address}
              // image={require('../../assets/images/pin.png')}
              onPress={() => bringSpaceToTop(space.spaceId)}
            >
              <Image
                source={require('../../assets/images/pin.png')}
                style={{
                  width: zoomLevel * 2, // scale as desired
                  height: zoomLevel * 2,
                  resizeMode: 'contain',
                }}
              />
              <Callout>
                <View style={styles.callout}>
                  <Text style={styles.calloutTitle}>{space.name}</Text>
                  <Text>{space.address}</Text>
                </View>
              </Callout>
            </Marker>
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
          <ScrollView>
            {studySpaces.map((space) => (
              <SmallCard
                key={space.id}
                space={{
                  ...space,
                  images: space.images || [],
                }}
              />
            ))}
          </ScrollView>
        </BottomSheetView>
      </BottomSheet>

      {/* Popup for joining a followed user's session */}
      {popupUser && (
        <UserSessionPopup
          userId={popupUser.userId}
          userName={popupUser.name}
          onClose={() => setPopupUser(null)}
          onJoin={handleJoinSession}
          currentSessionId={sessionId}
        />
      )}
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
    width: '100%',
    height: '100%',
    padding: 16,
    gap: 12,
  },

  // added by Meli
  generalMap: {
    flex: 1,
  },
  calloutTitle: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  // map: {
  //   width: '100%',
  //   height: '100%',
  // },
  // scrollContent: {
  //   flex: 1,
  //   padding: 8,
  //   marginBottom: 90,
  // },
  pfpIcon: {
    width: 40,
    height: 40,
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
