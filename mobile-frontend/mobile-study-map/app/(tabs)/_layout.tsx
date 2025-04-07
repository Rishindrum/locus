import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import TabBarBackground from '@/components/ui/TabBarBackground';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Dimensions } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginScreen from '../login';

const { width } = Dimensions.get('window'); // Get screen width

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const {user} = useAuth(); // Get user from AuthContext

  if (!user) {
    return <LoginScreen />; // Show login screen if user is not authenticated
  }

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "#DC8B47",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarBackground: TabBarBackground,
        tabBarStyle: {
          position: 'absolute',
          width: (width * 0.8),
          marginLeft: width * 0.1,
          bottom: 30, // Move it up from the bottom
          alignSelf: 'center', // Ensures it stays centered
          height: 60, // Increase height for floating effect
          borderRadius: 20, // Rounded corners
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.8)', // Semi-transparent white
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 5 },
          shadowOpacity: 0.2,
          shadowRadius: 10,
          elevation: 5, // Shadow for Android
        },
      }}
    >

      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved Spaces',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="house.fill" color={color} />,
        }}
      />
      {/* <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="paperplane.fill" color={color} />,
        }}
      /> */}
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />

    </Tabs>
  );
}
