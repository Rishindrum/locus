import { View, Image, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { useSession } from '@/contexts/SessionContext';
import React from 'react';
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePicture, saveProfilePictureURL, getUserProfile } from '../../backend/backendFunctions';

export default function SettingsScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { sessionId, leaveSession } = useSession();

  // Profile picture state
  const [profilePic, setProfilePic] = React.useState<string | null>(null);
  const [uploading, setUploading] = React.useState(false);

  const name = user.name || user.email.split('@')[0]; // Fallback to email if displayName is not available

  // Fetch profile picture on mount
  React.useEffect(() => {
    async function fetchProfilePic() {
      try {
        if (user.uid) {
          const profile = await getUserProfile(user.uid);
          setProfilePic(profile?.pfp || null);
        }
      } catch (e) {
        setProfilePic(null);
      }
    }
    fetchProfilePic();
  }, [user.uid]);

  // Pick image and upload
  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Permission required', 'Permission to access media library is required!');
      return;
    }
    const pickerResult = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });
    if (!pickerResult.canceled && pickerResult.assets && pickerResult.assets[0].uri) {
      setUploading(true);
      try {
        const downloadURL = await uploadProfilePicture(user.uid, pickerResult.assets[0].uri);
        await saveProfilePictureURL(user.uid, downloadURL);
        setProfilePic(downloadURL);
        Alert.alert('Success', 'Profile picture updated!');
      } catch (e) {
        console.error('Profile pic upload error:', e);
        Alert.alert('Error', 'Failed to upload profile picture.');
      } finally {
        setUploading(false);
      }
    }
  };

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
      <TouchableOpacity onPress={pickImage} disabled={uploading}>
        {uploading ? (
          <ActivityIndicator size="large" color="#DC8B47" style={styles.pfp} />
        ) : (
          <Image 
            source={profilePic ? { uri: profilePic } : require('../../assets/images/pfp_melissa.png')}
            style={styles.pfp} 
          />
        )}
      </TouchableOpacity>
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
    borderRadius: 50, // Make circular
    borderWidth: 2,
    borderColor: '#DC8B47',
    overflow: 'hidden',
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
