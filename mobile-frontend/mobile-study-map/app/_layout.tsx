import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/useColorScheme';

// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const colorScheme = useColorScheme();
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
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>

        {/* All pages under (tabs) handled here */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
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
        
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
