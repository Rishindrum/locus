import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { getStudySpace } from '@/backend/backendFunctions';
import AutoScrollCarousel from './AutoScrollCarousel';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { saveStudySpace, unsaveStudySpace } from '@/backend/backendFunctions';
import { useAuth } from '@/contexts/AuthContext';

type FeatureRatings = {
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
  reservable: {
    no: number;
    yes: number;
  };
  seating: {
    couches: number;
    desks: number;
    comfy: number;
    hard: number;
  };
  noise: number;
  outlets: number;
  temp: number;
  wifi: number;
  cleanliness: number;
};

type StudySpace = {
  id: string,
  address: string;
  createdBy: string;
  features: FeatureRatings;
  hours: string;
  images: string[]; // assuming each image is a URL string
  location: [number, number]; // [latitude, longitude]
  name: string;
  numRatings: number;
  spaceId: string;
};

type Props = {
  space: StudySpace,
};

// Text that converts numerical rating into a string
const NumericalRatingText = ({ label, value, lowestLabel, highestLabel, icon }) => (
  <View style={styles.ratingContainer}>
    {icon}

    <Text style={styles.ratingLabel}>{label}: 
    { value >= 0 && value < 0.6 && <Text style={styles.label}> Very {lowestLabel} </Text> }
    { value >= 0.6 && value < 1.2 && <Text style={styles.label}> Somewhat {lowestLabel} </Text> }
    { value >= 1.2 && value < 2 && <Text style={styles.label}> Slightly {lowestLabel} </Text> }
    { value >= 2 && value < 2.6 && <Text style={styles.label}> Slightly {highestLabel} </Text>  }
    { value >= 2.6 && value < 3.2 && <Text style={styles.label}> Somewhat {highestLabel} </Text>  }
    { value >= 3.2 && value <= 4 && <Text style={styles.label}> Very {highestLabel} </Text> }
    </Text>
  </View>
);

// Function to open directions in google maps
const openInGoogleMaps = (latitude: number, longitude: number) => {
  console.log(`Latitude: ${latitude}, Longitude: ${longitude}`); 
  const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&travelmode=walking`;
  Linking.openURL(url).catch(err => console.error('An error occurred', err));
};

export default function LargeCard({ spaceId }) {

  const { user } = useAuth();
  const router = useRouter();
  const [space, setSpace] = useState<StudySpace>();

  const [isSaved, setSaved] = useState(false);
  
  const toggleSave = () => {
    if (!isSaved) {
      saveStudySpace(user.uid, spaceId); 
    } else {
      unsaveStudySpace(user.uid, spaceId); 
    }
    setSaved(prev => !prev);
  }

  useEffect(() => {
    const fetchStudySpaces = async () => {
      try {
        const targetSpace = await getStudySpace(spaceId); 
        setSpace(targetSpace);
      } catch (error) {
        console.error('Error fetching study spaces:', error);
      }
    };
    fetchStudySpaces();
  }, [spaceId]);

  if (!space) return <Text>Loading...</Text>;

  return (
    <ScrollView style={styles.container}>

      {/* Container for the title, back arrow, save button */}
      <View style={styles.titleContainer}>

          <TouchableOpacity onPress={() => router.back()}>
              <Image
                  source={require('../assets/images/arrow_back.png')}
                  style={styles.arrowIcon} 
              />
          </TouchableOpacity>
          <Text style={styles.titleText}>{space.name}</Text>
      </View>


      {/* Container for hours, and wifi and outlet icons */}
      <View style={styles.iconcontainer}>
        <MaterialCommunityIcons name="wifi" size={24} color="black" padding={5} />
        <MaterialCommunityIcons name="power-socket-us" size={24} color="black" padding={5} />
        <Text style={styles.hours}>Today's Hours: {space.hours}</Text>
      </View>


      {/* Button to get directions button, rating button, & saved button */}
      <View style={styles.directionContainer}> 
        <TouchableOpacity
          style={styles.directionButton}
          onPress={() => openInGoogleMaps(space.location[0], space.location[1])}
        >
          <Text
            style={{ color: "white" }}
          >Get Directions</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.directionButton}
          onPress={() => router.push({ pathname: '/(tabs)/rating', params: { spaceId: space.id } })}
        >
          <Text
            style={{ color: "white" }}
          >Rate This Space</Text>
        </TouchableOpacity>

        <Ionicons name={isSaved ? "bookmark" : "bookmark-outline"} size={30} color={isSaved ? "#DC8B47" : "#DC8B47"} onPress={toggleSave} />
      </View>


      {/* Container for images (scroll horizontal) */}
      <AutoScrollCarousel images={space.images} />


      {/* Categorical (labels) */}
      <Text style={styles.featureLabel}> Lighting </Text>
      <View style={styles.labelContainer}> 
        { space.features.lighting.artificial && space.features.lighting.artificial > 0 && 
          <Text style={styles.orangeTag}>Artificial</Text> }
        { space.features.lighting.natural && space.features.lighting.natural > 0 && 
          <Text style={styles.orangeTag}>Natural</Text> }
        { space.features.lighting.dim && space.features.lighting.dim > 0 && 
          <Text style={styles.orangeTag}>Dim</Text> }
        { space.features.lighting.bright && space.features.lighting.bright > 0 && 
          <Text style={styles.orangeTag}>Bright</Text> }
      </View>


      <Text style={styles.featureLabel}> Seating Types </Text>
      <View style={styles.labelContainer}> 
        { space.features.seating.comfy && space.features.seating.comfy > 0 && 
          <Text style={styles.orangeTag}>Comfy</Text> }
        { space.features.seating.couches && space.features.seating.couches > 0 && 
          <Text style={styles.orangeTag}>Couches</Text> }
        { space.features.seating.desks && space.features.seating.desks > 0 && 
          <Text style={styles.orangeTag}>Desks</Text> }
        { space.features.seating.hard && space.features.seating.hard > 0 && 
          <Text style={styles.orangeTag}>Hard</Text> }
      </View>

      <Text style={styles.featureLabel}> Aesthetics </Text>
      <View style={styles.labelContainer}> 
        { space.features.aesthetics.corporate && space.features.aesthetics.corporate > 0 && 
          <Text style={styles.orangeTag}>Corporate</Text> }
        { space.features.aesthetics.cozy && space.features.aesthetics.cozy > 0 && 
          <Text style={styles.orangeTag}>Cozy</Text> }
        { space.features.aesthetics.dark_academia && space.features.aesthetics.dark_academia > 0 && 
          <Text style={styles.orangeTag}>Dark Academia</Text> }
        { space.features.aesthetics.minimalist && space.features.aesthetics.minimalist > 0 && 
          <Text style={styles.orangeTag}>Minimalist</Text> }
      </View>


      {/* Numerical Ratings (turned strings) */}
      <NumericalRatingText
        label="Noise Level"
        value={space.features.noise}
        lowestLabel="Quiet"
        highestLabel="Loud"
        icon={<Ionicons name="volume-high" size={18} />}
      />

      <NumericalRatingText
        label="Temperature"
        value={space.features.temp}
        lowestLabel="Cold"
        highestLabel="Hot"
        icon={<Ionicons name="thermometer" size={18} />}
      />

      <NumericalRatingText
        label="WiFi Quality"
        value={space.features.wifi}
        lowestLabel="Poor"
        highestLabel="Good"
        icon={<MaterialCommunityIcons name="wifi" size={18} color="black"/>}
      />

      <NumericalRatingText
        label="Outlets"
        value={space.features.outlets}
        lowestLabel="Few"
        highestLabel="Plenty"
        icon={<MaterialCommunityIcons name="power-plug-outline" size={18} />}
      />

      <NumericalRatingText
        label="Cleanliness"
        value={space.features.cleanliness}
        lowestLabel="Dirty"
        highestLabel="Clean"
        icon={<MaterialCommunityIcons name="broom" size={18} />}
      />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    padding: 30,
    flex: 1,
    backgroundColor: '#FFFBF5', // You can modify this for dark mode
  },

  titleContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  titleText: {
    fontSize: 26,
    fontWeight: 'bold',
    color: "#DC8B47",
  },
  arrowIcon: {
    width: 30,
    height: 30,
    marginRight: 20,
  },

  image: {
    width: '50%',
    height: 180,
    borderRadius: 12,
    marginVertical: 16,
    paddingRight: 12,
  },
  imageScrollContainer: {
    flex: 1,
    width: "100%",
  },
  iconcontainer: {
    flexDirection: "row",
  },

  directionContainer: {
    flexDirection: "row", 
    alignItems: "center",
  },
  directionButton: {
    width: "44%",
    padding: 8,
    marginVertical: 4,
    marginHorizontal: 5,
    backgroundColor: "#DC8B47",
    borderRadius: 10,
    alignItems: "center",
    color: "white",
  },


  name: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  hours: {
    paddingLeft: 20,
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  featureLabel: {
    marginLeft: -6,
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 4,
  },
  labelContainer: {
    marginLeft: -6,
    flexDirection: "row", 
    flexWrap: "wrap",
    marginBottom: 20,
  },

  orangeTag: {
    padding: 8,
    marginVertical: 4,
    marginHorizontal: 5,
    backgroundColor: "#DC8B47",
    borderRadius: 10,
    alignItems: "center",
    color: "white",
  }, 

  ratingContainer: {
    flexDirection: "row",
    marginTop: 10,
  },
  ratingLabel: {
    fontSize: 18, 
    fontWeight: 'bold',
    marginBottom: 4,
    marginLeft: 10,
  },
  label: {
    fontSize: 18,
    marginBottom: 16,
    color: "#DC8B47"
  },

});
