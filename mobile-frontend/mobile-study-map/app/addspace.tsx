import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, ScrollView, Alert, Switch, Platform } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/contexts/AuthContext';
import { createStudySpace } from '@/backend/backendFunctions';

type Features = {
  aesthetics: {
    corporate: number;
    cozy: number;
    dark_academia: number;
    minimalist: number;
  };
  lighting: {
    artificial: number;
    bright: number;
    dim: number;
    natural: number;
  };
  noise: number;
  outlets: number;
  reservable: {
    no: number;
    yes: number;
  };
  seating: {
    couches: number;
    comfy: number;
    desks: number;
    hard: number;
  };
  temp: number;
  wifi: number;
  cleanliness: number;
};

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
  
  // Features state
  const [features, setFeatures] = useState<Features>({
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
    noise: 1,
    outlets: 1,
    reservable: {
      no: 0,
      yes: 0
    },
    seating: {
      couches: 0,
      comfy: 0,
      desks: 0,
      hard: 0
    },
    temp: 1,
    wifi: 1,
    cleanliness: 1
  });
  
  // Image URLs - In a real app, you would use image picker and upload
  const [imageUrls, setImageUrls] = useState(['']);

  // Function to update feature values
  const updateFeature = (category: keyof Features | null, feature: string, value: number | boolean) => {
    const numericValue = typeof value === 'boolean' ? (value ? 1 : 0) : value;
    
    if (category) {
      setFeatures((prev: Features) => {
        const updatedCategory = {
          ...prev[category],
          [feature]: numericValue
        };
        return {
          ...prev,
          [category]: updatedCategory
        };
      });
    } else if (feature in features) {
      setFeatures((prev: Features) => ({
        ...prev,
        [feature]: numericValue
      }));
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
    <ScrollView 
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={true}
      bounces={false}
    >
      <View style={styles.formContainer}>
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
          <View style={styles.numberInputContainer}>
            <Text style={styles.inputLabel}>Noise Level (1-5)</Text>
            <TextInput
              style={styles.numberInput}
              value={String(features.noise)}
              onChangeText={(text) => {
                const num = parseInt(text);
                if (!isNaN(num) && num >= 1 && num <= 5) {
                  updateFeature(null, 'noise', num);
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              editable={true}
              selectTextOnFocus={true}
            />
          </View>

          <View style={styles.numberInputContainer}>
            <Text style={styles.inputLabel}>Outlets (1-5)</Text>
            <TextInput
              style={styles.numberInput}
              value={String(features.outlets)}
              onChangeText={(text) => {
                const num = parseInt(text);
                if (!isNaN(num) && num >= 1 && num <= 5) {
                  updateFeature(null, 'outlets', num);
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              editable={true}
              selectTextOnFocus={true}
            />
          </View>

          <View style={styles.numberInputContainer}>
            <Text style={styles.inputLabel}>Temperature (1-5)</Text>
            <TextInput
              style={styles.numberInput}
              value={String(features.temp)}
              onChangeText={(text) => {
                const num = parseInt(text);
                if (!isNaN(num) && num >= 1 && num <= 5) {
                  updateFeature(null, 'temp', num);
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              editable={true}
              selectTextOnFocus={true}
            />
          </View>

          <View style={styles.numberInputContainer}>
            <Text style={styles.inputLabel}>WiFi (1-5)</Text>
            <TextInput
              style={styles.numberInput}
              value={String(features.wifi)}
              onChangeText={(text) => {
                const num = parseInt(text);
                if (!isNaN(num) && num >= 1 && num <= 5) {
                  updateFeature(null, 'wifi', num);
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              editable={true}
              selectTextOnFocus={true}
            />
          </View>

          <View style={styles.numberInputContainer}>
            <Text style={styles.inputLabel}>Cleanliness (1-5)</Text>
            <TextInput
              style={styles.numberInput}
              value={String(features.cleanliness)}
              onChangeText={(text) => {
                const num = parseInt(text);
                if (!isNaN(num) && num >= 1 && num <= 5) {
                  updateFeature(null, 'cleanliness', num);
                }
              }}
              keyboardType="number-pad"
              maxLength={1}
              editable={true}
              selectTextOnFocus={true}
            />
          </View>
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
    backgroundColor: '#FFFBF5',
  },
  contentContainer: {
    flexGrow: 1,
    paddingBottom: 40,
  },
  formContainer: {
    padding: 16,
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
  numberInputContainer: {
    width: '100%',
    marginBottom: 15,
    padding: 10,
  },
  inputLabel: {
    fontSize: 16,
    marginBottom: 8,
  },
  numberInput: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    padding: 8,
    fontSize: 16,
    textAlign: 'center',
    width: 60,
    backgroundColor: '#fff',
    color: '#000',
    height: 40,
  },
});
