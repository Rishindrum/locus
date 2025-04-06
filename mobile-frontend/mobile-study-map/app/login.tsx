import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet } from 'react-native';
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
      <Button title={isSignUpMode ? 'Sign Up' : 'Log In'} onPress={handleAuthAction} />
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
  container: { flex: 1, justifyContent: 'center', paddingHorizontal: 20, backgroundColor: '#fff' },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10 },
  toggleText: { color: 'blue', marginTop: 10 },
});

export default LoginScreen;
