import { View, Text, StyleSheet, Button } from 'react-native';

import { useRouter } from 'expo-router';

export default function SavedScreen() {

  const router = useRouter(); // Use expo-router for navigation

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Saved Screen of Study Spaces</Text>

      {/* Button just to test Ratings page */}
      <Button
        title="Rate a Study Space"
        onPress={() => router.push('/rating')} // Navigate to Ratings page
      />

      {/* Button just to test Start Study Session page */}
      <Button
        title="Start a Session"
        onPress={() => router.push('/startsession')} // Navigate to Ratings page
      />

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
