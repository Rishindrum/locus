import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';

type Props = {
  name: string;
  todayHrs: string;
  distance: number;
  features: string;
  imageURL: string;
};

export default function LargeCard({ name, todayHrs, distance, features, imageURL }: Props) {

  const router = useRouter();

  return (
    <ScrollView contentContainerStyle={styles.container}>

      {/* Container for the title, back arrow, save button */}
      <View style={styles.titleContainer}>
          <TouchableOpacity onPress={() => router.back()}>
              <Image
                  source={require('../assets/images/arrow_back.png')}
                  style={styles.arrowIcon} 
              />
          </TouchableOpacity>
          <Text style={styles.titleText}>NAME HERE</Text>
      </View>

      <TouchableOpacity
        style={styles.orangeTag}
      >
        <Text>Get Directions</Text>
      </TouchableOpacity>

      {/* Container for hours, and wifi and outlet icons */}
      <View style={styles.iconcontainer}>
        <MaterialCommunityIcons name="wifi" size={24} color="black" padding={5} />
        <MaterialCommunityIcons name="power-socket-us" size={24} color="black" padding={5} />
        <Text style={styles.hours}>Today's Hours: HOURS HERE</Text>
      </View>

      <View style={styles.imgcontainer}> 
        <Image source={require('../assets/images/pcl.jpg')} style={styles.image} />
        <Image source={require('../assets/images/pcl2.jpg')} style={styles.image} />
      </View>

      {/* Categorical (labels) */}
      <Text style={styles.featureLabel}> Lighting </Text>
      <View style={styles.labelContainer}> 
        <Text style={styles.orangeTag}>Natural</Text>
        <Text style={styles.orangeTag}>Artificial</Text>
        <Text style={styles.orangeTag}>Bright</Text>
      </View>


      <Text style={styles.featureLabel}> Seating Types </Text>
      <View style={styles.labelContainer}> 
        <Text style={styles.orangeTag}>Comfy Couches</Text>
        <Text style={styles.orangeTag}>Desks</Text>
      </View>

      <Text style={styles.featureLabel}> Aesthetics </Text>
      <View style={styles.labelContainer}> 
        <Text style={styles.orangeTag}>Minimalist</Text>
        <Text style={styles.orangeTag}>Cozy</Text>
      </View>


      {/* Numerical (sliders) */}
      <Text style={styles.featureLabel}> Noise Level </Text>

      <Text style={styles.featureLabel}> Temperature </Text>

      <Text style={styles.featureLabel}> Outlets </Text>

      <Text style={styles.featureLabel}> Cleanliness </Text>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 80,
    padding: 30,
    flex: 1,
    alignItems: 'flex-start',
    backgroundColor: '#FFFBF5', // You can modify this for dark mode
  },

  titleContainer: {
    width: '90%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
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
    width: '48%',
    height: 180,
    borderRadius: 12,
    marginVertical: 16,
  },
  iconcontainer: {
    flexDirection: "row",
  },
  imgcontainer: {
    width: "100%",
    flexDirection: "row", 
    justifyContent: 'space-between',
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
    fontSize: 18, 
    fontWeight: 'bold',
  },
  labelContainer: {
    flexDirection: "row", 
    flexWrap: "wrap",
    marginBottom: 20,
  },

  orangeTag: {
    padding: 8,
    marginVertical: 10,
    marginHorizontal: 5,
    backgroundColor: "#DC8B47",
    borderRadius: 10,
    alignItems: "center",
    color: "white",
  }, 

});
