import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { doc, updateDoc, onSnapshot, collection, getDoc } from 'firebase/firestore';
import { db } from '../backend/firebaseConfig';
import { useAuth } from './AuthContext';

interface LocationData {
  latitude: number;
  longitude: number;
  timestamp: number;
}

interface UserLocation {
  userId: string;
  displayName: string;
  location: LocationData | null;
}

interface LocationContextType {
  userLocations: UserLocation[];
  startLocationSharing: () => Promise<void>;
  stopLocationSharing: () => void;
}

interface AuthContextType {
  user: { uid: string; displayName: string } | null;
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

  // Listen to followed users' locations
  useEffect(() => {
    if (!user?.uid) return;

    // Get the list of users we're following
    const followingRef = collection(db, 'users', user.uid, 'following');
    const unsubscribe = onSnapshot(followingRef, async (snapshot) => {
      const locations: UserLocation[] = [];
      
      // Get all followed users' documents
      const followedUserPromises = snapshot.docs.map(async (followDoc) => {
        const followedUserId = followDoc.id;
        const userRef = doc(db, 'users', followedUserId);
        const userSnap = await getDoc(userRef);
        const userData = userSnap.data();
        
        if (userData) {
          // Include user even if they don't have a current location
          locations.push({
            userId: followedUserId,
            displayName: userData.displayName || 'Unknown',
            location: userData.location || null,
          });
        }
      });

      // Wait for all user data to be fetched
      await Promise.all(followedUserPromises);
      setUserLocations(locations);
    });

    return () => unsubscribe();
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
