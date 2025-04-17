import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { storage } from '@/backend/firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';

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

type SmallCardProps = {
  space: StudySpace,
};

const SmallCard: React.FC<SmallCardProps> = ({ space }) => {

    const router = useRouter();

    // FUNCTION TO CALL AND CREATE LARGE CARD
    const displayLargeCard = () => {
      router.push({
        pathname: `./largecard/${space.spaceId}`,
      });
    };

    return (
      <TouchableOpacity
        onPress={displayLargeCard}
        style={styles.card}
      >
        <View>
            <Text style={styles.name}>{space.name}</Text> 

            <View style={styles.card2}> 
            {/* Left Section*/}
            <View style={styles.leftcontainer}>
                <Text style={styles.text}>{space.hours}</Text>
                <Text style={styles.text}>1 mi</Text>
                <Image style={styles.image} source={{ uri: space.images[0] }} />
            </View> 

            {/* Right Section*/}
            <View style={styles.rightcontainer}>
                {/* Feature Tags Section*/}
                <View style={styles.tagsContainer}> 

                  {/* Aesthetics */}
                  { space.features.aesthetics.corporate > 0 && 
                    <Text style={styles.tag}>Corporate</Text> }
                  { space.features.aesthetics.cozy > 0 && 
                    <Text style={styles.tag}>Cozy</Text> }
                  { space.features.aesthetics.dark_academia > 0 && 
                    <Text style={styles.tag}>Dark Academia</Text> }
                  { space.features.aesthetics.minimalist > 0 && 
                    <Text style={styles.tag}>Minimalist</Text> }

                  {/* Lighting */}
                  { space.features.lighting.artificial > 0 && 
                    <Text style={styles.tag}>Artificial</Text> }
                  { space.features.lighting.natural > 0 && 
                    <Text style={styles.tag}>Natural</Text> }
                  { space.features.lighting.dim > 0 && 
                    <Text style={styles.tag}>Dim</Text> }
                  { space.features.lighting.bright > 0 && 
                    <Text style={styles.tag}>Bright</Text> }

                  {/* Seating */}
                  { space.features.seating.comfy > 0 && 
                    <Text style={styles.tag}>Comfy</Text> }
                  { space.features.seating.couches > 0 && 
                    <Text style={styles.tag}>Couches</Text> }
                  { space.features.seating.desks > 0 && 
                    <Text style={styles.tag}>Desks</Text> }
                  { space.features.seating.hard > 0 && 
                    <Text style={styles.tag}>Hard</Text> }

                </View>

                {/* TODO: pull most common words/themes from reviews in small quotes */}

                <View style={styles.iconcontainer}>
                  {
                    space.features.outlets > 0 &&
                    <MaterialCommunityIcons name="power-socket-us" size={24} color="black" padding={5} />
                  }

                  {
                    space.features.wifi > 0 &&
                    <MaterialCommunityIcons name="wifi" size={24} color="black" padding={5} />
                  }
                </View>

            </View>

            </View>

        </View>
      </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
    card: {
      flexDirection: "column",
      backgroundColor: "#FFFBF5",
      padding: 10,
      borderRadius: 15,
      shadowColor: "#062F48",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      margin: 10,
    },
    card2: {
      flexDirection: "row",
      alignItems: "flex-start", 
      backgroundColor: "#FFFBF5",
    },

    leftcontainer: {
      width: "35%",
      flexDirection: "column",
      margin: 5,
    },
    name: {
      fontSize: 24,
      fontWeight: 'bold',
      color: "#DC8B47",
    },
    text: {
      fontSize: 16,
      color: "#062F48",
    },

    rightcontainer: {
      paddingLeft: 10,
      flexDirection: "column",
      margin: 5
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      width: "80%",
      maxHeight: 100, // or whatever height constraint you want
      overflow: 'hidden', // 🔥 this hides anything beyond the height
      marginTop: 5,
    },

    image: {
      width: "100%",
      height: 100,
      borderRadius: 10,
      marginTop: 5,
    },
    tag: {
      backgroundColor: "#DC8B47",
      paddingHorizontal: 8,
      paddingVertical: 5,
      borderRadius: 10,
      fontSize: 14,
      color: "white",
      marginRight: 5,
      marginBottom: 5,
    },
    iconcontainer: {
      flexDirection: "row",
    }

  });

export default SmallCard;
