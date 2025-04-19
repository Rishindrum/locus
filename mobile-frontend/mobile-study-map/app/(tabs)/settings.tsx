import { View, Image, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';
import React from 'react';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { sessionId, leaveSession } = useSession();

  const name = user.name || user.email.split('@')[0]; // Fallback to email if displayName is not available

  const handleSignOut = async () => {
    if (sessionId) {
      Alert.alert(
        "Active Session",
        "Logging out will end your current session. Do you want to continue?",
        [
          {
            text: "Cancel",
            style: "cancel"
          },
          {
            text: "End Session & Logout",
            style: "destructive",
            onPress: async () => {
              try {
                await leaveSession();
                await logout();
                router.replace('/login');
              } catch (error) {
                console.error('Error during logout:', error);
                Alert.alert('Error', 'Failed to logout. Please try again.');
              }
            }
          }
        ]
      );
      return;
    }

    try {
      await logout();
      router.replace('/login');
    } catch (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error', 'Failed to sign out. Please try again.');
    }
  };

  return (
    <View style={styles.container}>
      <Image 
        source={require('../../assets/images/pfp_melissa.png')}
        style={styles.pfp} 
      />

      <Text style={styles.titleText}>{name}'s Settings </Text>

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
      {/* 
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
      </TouchableOpacity> */}

      <TouchableOpacity 
        style={styles.settingsButton}
        onPress={() => router.push('/follow')}
      >
        <View style={styles.buttonContent}> 
          <Text style={styles.buttonText}>Following</Text>
          <Image
            source={require('../../assets/images/arrow_forward.png')}
            style={styles.arrowIcon} 
          />
        </View>
      </TouchableOpacity>

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
  );
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
