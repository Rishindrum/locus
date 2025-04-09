import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';

import { HapticTab } from '@/components/HapticTab';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { Colors } from '@/constants/Colors';
import { useColorScheme } from '@/hooks/useColorScheme';
import { Dimensions } from 'react-native';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import LoginScreen from '../login';

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
        tabBarInactiveTintColor: "white",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          position: 'absolute',
          width: '100%',
          alignSelf: 'center', // Ensures it stays centered
          paddingTop: 5,
          paddingBottom: 20,
          backgroundColor: '#062F48',
        },
      }}
    >
      <Tabs.Screen
        name="rating"
        options={{
          title: 'Add Rating',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="plus.circle.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="startsession"
        options={{
          title: 'Start Session',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="book.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="index"
        options={{
          title: 'Map',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="map.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: 'Settings',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape.fill" color={color} />,
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Testing',
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="gearshape" color={color} />,
        }}
      />

    </Tabs>
  );
}
