import React, { useState } from 'react';
import { View, TextInput, Image, Text, StyleSheet, TouchableOpacity } from 'react-native';
// import { createUser, loginUser } from '../firebase/backendFunctions';
import { useRouter } from 'expo-router';
import {useAuth} from '../contexts/AuthContext';

const LoginScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [isSignUpMode, setIsSignUpMode] = useState(false);
  const router = useRouter();
  const {login, logout, register} = useAuth();

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
        <TextInput
          placeholder="Name"
          value={name}
          onChangeText={setName}
          style={styles.input}
        />
      )}
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

});

export default LoginScreen;
