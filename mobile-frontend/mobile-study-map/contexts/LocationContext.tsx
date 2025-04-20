import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { doc, updateDoc, onSnapshot, collection, getDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import { useAuth } from './AuthContext';
import { getUserProfile, getUserActiveSession } from '../backend/backendFunctions'; // Assuming this function is defined elsewhere

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface UserLocation {
  userId: string;
  name: string;
  location: LocationData | null;
  pfp?: string | null;
  sessionType?: string | null; // collaborative, quiet, individual, or null
  sessionActive?: boolean; // true if in session, false if not
}

interface LocationContextType {
  userLocations: UserLocation[];
  startLocationSharing: () => Promise<void>;
  stopLocationSharing: () => void;
}

interface AuthContextType {
  user: { uid: string; name: string } | null;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [userLocations, setUserLocations] = useState<UserLocation[]>([]);
  const [locationSubscription, setLocationSubscription] = useState<any>(null);
  const { user } = useAuth() as AuthContextType;

  // Function to update user's location in Firestore
  const updateUserLocation = async (location: LocationData) => {
    if (!user?.uid) return;

    try {
      const userRef = doc(db, 'users', user.uid);
      await updateDoc(userRef, {
        location: {
          latitude: location.latitude,
          longitude: location.longitude,
          timestamp: location.timestamp,
        },
      });
    } catch (error) {
      console.error('Error updating location:', error);
    }
  };

  // Start sharing location
  const startLocationSharing = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied', 'Location permission is required to share your location.');
        return;
      }

      // Start watching position
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 10, // Update every 10 meters
        },
        (location) => {
          const locationData: LocationData = {
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
            timestamp: location.timestamp,
          };
          updateUserLocation(locationData);
        }
      );

      setLocationSubscription(subscription);
    } catch (error) {
      console.error('Error starting location sharing:', error);
      Alert.alert('Error', 'Failed to start location sharing');
    }
  };

  // Stop sharing location
  const stopLocationSharing = () => {
    if (locationSubscription) {
      locationSubscription.remove();
      setLocationSubscription(null);
    }
  };

  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribes: (() => void)[] = [];
    let isMounted = true;

    async function setupLocationListeners() {
      try {
        // Get current user's profile and following list
        const userProfile = await getUserProfile(user.uid);
        const following: string[] = userProfile?.following || [];

        if (following.length === 0) {
          if (isMounted) setUserLocations([]);
          return;
        }

        // Listen to each followed user's location and session in real time
        const newUnsubscribes = following.map((followedUserId) => {
          const userRef = doc(db, 'users', followedUserId);
          return onSnapshot(userRef, async (userSnap) => {
            const userData = userSnap.data();
            if (!userData) return;
            // Fetch session info
            let sessionType = null;
            let sessionActive = false;
            try {
              const session = await getUserActiveSession(followedUserId);
              if (session && session.isActive) {
                sessionType = session.sessionType;
                sessionActive = true;
              }
            } catch (e) {
              // ignore
            }
            setUserLocations((prev) => {
              // Remove any previous entry for this user
              const filtered = prev.filter(u => u.userId !== followedUserId);
              return [
                ...filtered,
                {
                  userId: followedUserId,
                  name: userData.name || 'Unknown',
                  location: userData.location || null,
                  pfp: userData.pfp || null,
                  sessionType,
                  sessionActive,
                }
              ];
            });
          });
        });
        unsubscribes = newUnsubscribes;
        console.log('Locations: ', userLocations);
      } catch (error) {
        console.error('Error setting up location listeners:', error);
        if (isMounted) setUserLocations([]);
      }
    }

    setupLocationListeners();
    return () => {
      isMounted = false;
      unsubscribes.forEach(unsub => unsub && unsub());
    };
  }, [user?.uid]);

  return (
    <LocationContext.Provider
      value={{
        userLocations,
        startLocationSharing,
        stopLocationSharing,
      }}
    >
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const context = useContext(LocationContext);
  if (context === undefined) {
    throw new Error('useLocation must be used within a LocationProvider');
  }
  return context;
}
