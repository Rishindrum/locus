import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Switch } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { createStudySpace } from '@/backend/backendFunctions';

export default function AddSpaceScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  
  // Basic information
  const [name, setName] = useState('');
  const [address, setAddress] = useState('');
  const [hours, setHours] = useState('24 Hrs');
  
  // Location coordinates
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  
  // Features - these match the structure in your Firestore
  const [features, setFeatures] = useState({
    aesthetics: {
      corporate: 0,
      cozy: 0,
      dark_academia: 0,
      minimalist: 0
    },
    lighting: {
      artificial: 0,
      bright: 0,
      dim: 0,
      natural: 0
    },
    noise: 0,
    outlets: 0,
    reservable: {
      no: 0,
      yes: 0
    },
    seating: {
      couches: 0,
      desks: 0,
      temp: 0
    },
    wifi: 0
  });
  
  // Image URLs - In a real app, you would use image picker and upload
  const [imageUrls, setImageUrls] = useState(['']);

  // Function to update feature values
  const updateFeature = (category, feature, value) => {
    if (category) {
      setFeatures({
        ...features,
        [category]: {
          ...features[category],
          [feature]: value ? 1 : 0
        }
      });
    } else {
      setFeatures({
        ...features,
        [feature]: value ? 1 : 0
      });
    }
  };

  // Handle form submission
  const handleSubmit = async () => {
    // Validate required fields
    if (!name || !address) {
      Alert.alert('Error', 'Name and address are required fields');
      return;
    }
    
    if (!user) {
      Alert.alert('Error', 'You must be logged in to create a study space');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Prepare location format as shown in your Firestore
      const location = latitude && longitude 
        ? `[${latitude}, ${longitude}]` 
        : '';
      
      // Filter out empty image URLs
      const images = imageUrls.filter(url => url.trim() !== '');
      
      // Create space data object
      const spaceData = {
        name,
        address,
        location,
        hours,
        features,
        images
      };
      
      const result = await createStudySpace(user.uid, spaceData);
      
      if (result && result.success) {
        Alert.alert(
          'Success',
          'Study space created successfully!',
          [{ text: 'OK', onPress: () => router.back() }]
        );
      } else {
        Alert.alert('Error', 'Failed to create study space');
      }
    } catch (error) {
      console.error('Error creating study space:', error);
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Create New Study Space</Text>
      
      <Text style={styles.label}>Name *</Text>
      <TextInput
        style={styles.input}
        value={name}
        onChangeText={setName}
        placeholder="Enter study space name"
      />
      
      <Text style={styles.label}>Address *</Text>
      <TextInput
        style={styles.input}
        value={address}
        onChangeText={setAddress}
        placeholder="Enter address"
      />
      
      <Text style={styles.label}>Hours</Text>
      <TextInput
        style={styles.input}
        value={hours}
        onChangeText={setHours}
        placeholder="e.g., 24 Hrs, 9AM-5PM"
      />
      
      <Text style={styles.label}>Location (Latitude, Longitude)</Text>
      <View style={styles.row}>
        <TextInput
          style={[styles.input, styles.halfInput]}
          value={latitude}
          onChangeText={setLatitude}
          placeholder="Latitude"
        />
        <TextInput
          style={[styles.input, styles.halfInput]}
          value={longitude}
          onChangeText={setLongitude}
          placeholder="Longitude"
        />
      </View>
      
      <Text style={styles.sectionTitle}>Features</Text>
      
      {/* Aesthetics section */}
      <Text style={styles.categoryTitle}>Aesthetics</Text>
      <View style={styles.featuresContainer}>
        <FeatureToggle
          label="Corporate"
          value={features.aesthetics.corporate === 1}
          onToggle={(value) => updateFeature('aesthetics', 'corporate', value)}
        />
        <FeatureToggle
          label="Cozy"
          value={features.aesthetics.cozy === 1}
          onToggle={(value) => updateFeature('aesthetics', 'cozy', value)}
        />
        <FeatureToggle
          label="Dark Academia"
          value={features.aesthetics.dark_academia === 1}
          onToggle={(value) => updateFeature('aesthetics', 'dark_academia', value)}
        />
        <FeatureToggle
          label="Minimalist"
          value={features.aesthetics.minimalist === 1}
          onToggle={(value) => updateFeature('aesthetics', 'minimalist', value)}
        />
      </View>
      
      {/* Lighting section */}
      <Text style={styles.categoryTitle}>Lighting</Text>
      <View style={styles.featuresContainer}>
        <FeatureToggle
          label="Artificial"
          value={features.lighting.artificial === 1}
          onToggle={(value) => updateFeature('lighting', 'artificial', value)}
        />
        <FeatureToggle
          label="Bright"
          value={features.lighting.bright === 1}
          onToggle={(value) => updateFeature('lighting', 'bright', value)}
        />
        <FeatureToggle
          label="Dim"
          value={features.lighting.dim === 1}
          onToggle={(value) => updateFeature('lighting', 'dim', value)}
        />
        <FeatureToggle
          label="Natural"
          value={features.lighting.natural === 1}
          onToggle={(value) => updateFeature('lighting', 'natural', value)}
        />
      </View>
      
      {/* Other features */}
      <Text style={styles.categoryTitle}>Other Features</Text>
      <View style={styles.featuresContainer}>
        <FeatureToggle
          label="Noise"
          value={features.noise === 1}
          onToggle={(value) => updateFeature(null, 'noise', value)}
        />
        <FeatureToggle
          label="Outlets"
          value={features.outlets === 1}
          onToggle={(value) => updateFeature(null, 'outlets', value)}
        />
        <FeatureToggle
          label="WiFi"
          value={features.wifi === 1}
          onToggle={(value) => updateFeature(null, 'wifi', value)}
        />
      </View>
      
      {/* Reservable options */}
      <Text style={styles.categoryTitle}>Reservable</Text>
      <View style={styles.featuresContainer}>
        <FeatureToggle
          label="Yes"
          value={features.reservable.yes === 1}
          onToggle={(value) => updateFeature('reservable', 'yes', value)}
        />
        <FeatureToggle
          label="No"
          value={features.reservable.no === 1}
          onToggle={(value) => updateFeature('reservable', 'no', value)}
        />
      </View>
      
      {/* Seating options */}
      <Text style={styles.categoryTitle}>Seating</Text>
      <View style={styles.featuresContainer}>
        <FeatureToggle
          label="Couches"
          value={features.seating.couches === 1}
          onToggle={(value) => updateFeature('seating', 'couches', value)}
        />
        <FeatureToggle
          label="Desks"
          value={features.seating.desks === 1}
          onToggle={(value) => updateFeature('seating', 'desks', value)}
        />
      </View>
      
      {/* Image URLs */}
      <Text style={styles.sectionTitle}>Images (URLs)</Text>
      {imageUrls.map((url, index) => (
        <TextInput
          key={index}
          style={styles.input}
          value={url}
          onChangeText={(text) => {
            const newUrls = [...imageUrls];
            newUrls[index] = text;
            
            // Add a new empty field if this is the last one and it's not empty
            if (index === imageUrls.length - 1 && text.trim() !== '') {
              newUrls.push('');
            }
            
            setImageUrls(newUrls);
          }}
          placeholder="Enter image URL"
        />
      ))}
      
      <View style={styles.buttonContainer}>
        <Button
          title="Cancel"
          onPress={() => router.back()}
          color="#f44336"
        />
        <Button
          title={isLoading ? "Creating..." : "Create Study Space"}
          onPress={handleSubmit}
          disabled={isLoading || !name || !address}
          color="#4CAF50"
        />
      </View>
    </ScrollView>
  );
}

// Helper component for feature toggles
function FeatureToggle({ label, value, onToggle }) {
  return (
    <View style={styles.featureToggle}>
      <Text>{label}</Text>
      <Switch
        value={value}
        onValueChange={onToggle}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFBF5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    marginBottom: 5,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 10,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  halfInput: {
    width: '48%',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 10,
  },
  categoryTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 10,
    marginBottom: 5,
  },
  featuresContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 10,
  },
  featureToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '50%',
    marginBottom: 10,
    paddingRight: 10,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 20,
    marginBottom: 40,
  },
});
