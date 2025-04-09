import { View, Image, Text, StyleSheet, TouchableOpacity, Button } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import React from 'react';

export default function SettingsScreen() {

  const router = useRouter();

  const { logout } = useAuth();

  const handleSignOut = () => {
    logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>

      <Image 
        source={require('../../assets/images/marker_S.png')}
        style={styles.pfp} 
      />

      <Text style={styles.titleText}> My Settings </Text>

      {/* Three buttons: preferences, saved spaces, and log out */}

      {/* Button going to preferred features */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => router.push('/preferredfeatures')}
      >
        <View style={styles.buttonContent}> 
          <Text style={styles.buttonText}>Preferred Features</Text>
          <Image
            source={require('../../assets/images/arrow_forward.png')}
            style={styles.arrowIcon} 
          />
        </View>
      </TouchableOpacity>

      {/* Button going to saved spaces */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push('/savedspaces')}
      >
        <View style={styles.buttonContent}> 
          <Text style={styles.buttonText}>Saved Spaces</Text>
          <Image
            source={require('../../assets/images/arrow_forward.png')}
            style={styles.arrowIcon} 
          />
        </View>
      </TouchableOpacity>

      {/* Button going to study log */}
      <TouchableOpacity
        style={styles.settingsButton}
        onPress={() => router.push('/studylog')}
      >
        <View style={styles.buttonContent}> 
          <Text style={styles.buttonText}>Study Log</Text>
          <Image
            source={require('../../assets/images/arrow_forward.png')}
            style={styles.arrowIcon} 
          />
        </View>
      </TouchableOpacity>

      {/* Button to logout */}
      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={handleSignOut}
      >
      <View style={styles.buttonContent}> 
          <Text style={styles.buttonText}>Logout</Text>
          <Image
            source={require('../../assets/images/arrow_forward.png')}
            style={styles.arrowIcon} 
          />
        </View>
      </TouchableOpacity>

    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF5', 
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#062F48",
    marginBottom: 30,
  },
  pfp: {
    width: 100,
    height: 100,
    marginTop: -40,
    marginBottom: 30,
  },
  settingsButton: {
    width: "100%",
    backgroundColor: '#FFFBF5',
    padding: 30,
    borderTopColor: "#DC8B47",
    borderTopWidth: 1,
    borderBottomColor: "#DC8B47",
    borderBottomWidth: 1,
    alignItems: 'center',
    margin: -1,
  }, 
  buttonContent: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: "#062F48",
  },
  arrowIcon: {
    width: 20,
    height: 20,
  }
});
