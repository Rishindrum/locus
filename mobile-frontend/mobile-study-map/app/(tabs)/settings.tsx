import { View, Text, Button, StyleSheet } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'expo-router';
import React from 'react';

export default function SettingsScreen() {
  const { logout } = useAuth();
  const router = useRouter();

  const handleSignOut = () => {
    logout();
    router.replace('/login');
  };
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Settings Screen</Text>
      <Button title="Sign Out" onPress={handleSignOut} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF5', // You can modify this for dark mode
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
