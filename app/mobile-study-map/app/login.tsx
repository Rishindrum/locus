import React, { useState } from 'react';
import { View, TextInput, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { createUser, loginUser } from '../firebase/backendFunctions';
import { useRouter } from 'expo-router';
import {useAuth} from '../contexts/AuthContext';

// For uploading pfp for new users
import * as ImagePicker from 'expo-image-picker';
import { uploadProfilePicture, saveProfilePictureURL } from '@/backend/backendFunctions';


const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const router = useRouter();
  const { login, logout, register, user } = useAuth();


  const handleAuthAction = async () => {
    try {
      let success = false;
      if (isSignUpMode) {
        success = await register(name.trim(), email.trim(), password.trim());
        alert('Account created successfully!');
      } else {
        success = await login(email.trim(), password.trim());
      }

      // Navigate to map screen after successful login/signup
      if (success){
        alert('Logged in successfully!');
        await new Promise(resolve => setTimeout(resolve, 100));
        router.replace('/');
      }
    } catch (error) {
      if (!isSignUpMode) {
      alert('Login failed! Please check your credentials.');
      }
      else {
        alert('Registration failed! Please try again. See if you put a valid email or already have an account.');
      }
    }
  };

  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const pickImage = async () => {
    // Request permission if not already granted
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      const uri = result.assets[0].uri;
      setSelectedImage(uri);

      console.log(`USER: ${user.uid}`);
      console.log(`URI: ${uri}`);


      const downloadURL = await uploadProfilePicture(user.uid, uri);
      await saveProfilePictureURL(user.uid, downloadURL);
      console.log(`USER: ${user.uid}`);
    }
  };


  return (
    <View style={styles.container}>

      {/* Logo */}

      <Image 
        style={styles.logo}
        source={require('../assets/images/locus-logo.png')} 
      />


      <Text style={styles.title}>
        {isSignUpMode ? 'Sign up with Locus' : 'Welcome back to Locus!'}
      </Text>

      {isSignUpMode && (
          <TouchableOpacity onPress={pickImage} style={styles.imageButton}>
            {selectedImage ? (
              <Image source={{ uri: selectedImage }} style={styles.imagePreview} />
            ) : (
              <Text style={styles.submitImageText}>Choose Profile Picture</Text>
            )}
          </TouchableOpacity>
      )}

      { isSignUpMode &&
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      }

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        style={styles.input}
        secureTextEntry
      />

      <TouchableOpacity style={styles.submitButton} onPress={handleAuthAction}>
        <Text style={styles.submitButtonText}>{isSignUpMode ? 'Sign Up' : 'Log In'} </Text>
      </TouchableOpacity>
      
      <Text
        style={styles.toggleText}
        onPress={() => setIsSignUpMode((prev) => !prev)}
      >
        {isSignUpMode ? 'Already have an account? Log In' : "Don't have an account? Sign Up"}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center',
    paddingHorizontal: 20, 
    backgroundColor: '#FFFBF5' 
  },

  title: {
    color: "#062F48",
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },


  input: { 
    width: '90%',
    borderWidth: 1, 
    borderColor: '#DC8B47', 
    borderRadius: 10,
    padding: 15, 
    marginBottom: 15,
    color: '#DC8B47'
  },
  toggleText: { 
    color: '#2098e3', 
    marginTop: 10 
  },
  submitButton: {
    width: '90%',
    backgroundColor: '#DC8B47',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 14,
  },

  logo: {
    width: 130,
    height: 130,
  },

  imagePreview: {
    width: 120,
    height: 120,
    marginBottom: 20,
    borderRadius: 100,
  },
  submitImageText: {
    width: "90%",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#DC8B47',
    padding: 15,
    marginBottom: 15,
    color: "#DC8B47",
  }

});

export default LoginScreen;
