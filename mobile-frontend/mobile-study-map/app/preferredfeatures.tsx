import { View, Text, StyleSheet, Image, TouchableOpacity, FlatList } from 'react-native';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Ionicons } from '@expo/vector-icons';


// Feature preferences
const FEATURES = [
    'Noise Level',
    'Temperature',
    'Lighting',
    'Seating Types',
    'Outlet Availability',
    'Aesthetics',
    'Cleanliness',
    'Wifi Quality',
  ];

export default function SettingsScreen() {

    const router = useRouter();

    // State for the selected features
    const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

    // Function to toggle feature selection
    const toggleFeature = (feature: string) => {
        setSelectedFeatures((prev) =>
          prev.includes(feature)
            ? prev.filter((f) => f !== feature)
            : [...prev, feature]
        );
      };

    return (
        <View style={styles.container}>

            {/* Container for the title and back arrow */}
            <View style={styles.titleContainer}>
                <TouchableOpacity onPress={() => router.push('/settings')}>
                    <Image
                        source={require('../assets/images/arrow_back.png')}
                        style={styles.arrowIcon} 
                    />
                </TouchableOpacity>
                <Text style={styles.titleText}>Preferred Features</Text>
            </View>

            {/* Container for the multi-select for features */}
            <FlatList
                style={styles.flatlist}
                data={FEATURES}
                keyExtractor={(item) => item }
                renderItem={({ item }) => {
                    const isSelected = selectedFeatures.includes(item);
                    return (
                        <TouchableOpacity
                            style={styles.featureContainer}
                            onPress={() => toggleFeature(item)}
                        >
                            <View style={styles.featureBox}>
                                {isSelected ? (
                                <Ionicons name="checkbox" size={30} color="#DC8B47" />
                                ) : (
                                <Ionicons name="square-outline" size={30} color="#062F48" />
                                )}
                            </View>
                            <Text style={styles.featureText}>{item}</Text>
                        </TouchableOpacity>
                    );
                }}
            />

        </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    alignItems: 'center',
    backgroundColor: '#FFFBF5', // You can modify this for dark mode
  },
  titleContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  titleText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#DC8B47",
  },
  arrowIcon: {
    width: 30,
    height: 30,
    marginRight: 20,
  },
  flatlist: {
    padding: 20,
    width: '90%'
  },
  featureContainer: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    padding: 8,
  }, 
  featureBox: {
    marginRight: 10,
  }, 
  featureText: {
    color: "#062F48",
    fontSize: 20,
  }
});