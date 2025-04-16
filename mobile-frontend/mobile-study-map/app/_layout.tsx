import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';
import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import { useColorScheme } from '@/hooks/useColorScheme';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
  // const { user } = useAuth();
  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  if (!loaded) {
    return null;
  }

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack>

          {/* All pages under (tabs) handled here */}
          <Stack.Screen 
            name="(tabs)" 
            options={{ headerShown: false }} 
            screenOptions={{
              animation: 'slide_from_left',
            }}
          />
          <Stack.Screen name="+not-found" />
          
          {/* Added a screen per other external page */}
          <Stack.Screen
            name="preferredfeatures"
            options={{ headerShown: false }} // Removes the header
          />
          <Stack.Screen
            name="savedspaces"
            options={{ headerShown: false }} // Removes the header
          />
          <Stack.Screen
            name="studylog"
            options={{ headerShown: false }} // Removes the header
          />
          <Stack.Screen
            name="largecard"
            options={{ headerShown: false }} // Removes the header
          />
          <Stack.Screen
            name="login"
            options={{ headerShown: false }} // Removes the header
          />
          <Stack.Screen
            name="filters"
            options={{ headerShown: false }} // Removes the header
          />

          
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </AuthProvider>
  );
}

function AppNavigator() {
  const { user, loading } = useAuth();

  if (loading) {
    // Show a loading spinner while Firebase initializes
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
      <Stack>
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
  );
}
