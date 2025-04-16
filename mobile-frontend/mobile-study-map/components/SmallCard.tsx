import React from "react";
import { View, Text, Image, StyleSheet, TouchableOpacity } from "react-native";
import { MaterialCommunityIcons, FontAwesome5 } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';

import { storage } from '@/backend/firebaseConfig';
import { ref, getDownloadURL } from 'firebase/storage';


type SmallCardProps = {
    name: string, 
    todayHrs: string,
    distance: number, 
    imagePath: string, 
    features: string, // Nested object???
};

const SmallCard: React.FC<SmallCardProps> = ({ name, todayHrs, distance, imagePath, features }) => {

    const router = useRouter();

    // FUNCTION TO RENDER IMAGES

    const [imageURL, setImageURL] = useState<string | null>(null);

    useEffect(() => {
      const fetchImageURL = async () => {
        try {
          const path = imagePath.replace('gs://studymap-5c5ae.appspot.com/', '');
          const storageRef = ref(storage, path);
          const url = await getDownloadURL(storageRef);
          setImageURL(url);
        } catch (error) {
          console.error('Failed to fetch image URL:', error);
        }
      };

      fetchImageURL();
    }, [imagePath]);

    const displayLargeCard = () => {
      router.push({
        pathname: `./largecard/${name}`,
        params: {
          name,
          todayHrs,
          distance: distance.toString(),
          features,
          imageURL,
        },
      });
    };

    return (
      <TouchableOpacity
        onPress={displayLargeCard}
        style={styles.card}
      >
        <View>
            <Text style={styles.name}>{name}</Text> 

            <View style={styles.card2}> 
            {/* Left Section*/}
            <View style={styles.leftcontainer}>
                <Text style={styles.text}>{todayHrs}</Text>
                <Text style={styles.text}>{distance} mi</Text>
                {imageURL && (
                  <Image style={styles.image} source={{ uri: imageURL }} />
                )}
            </View> 

            {/* Right Section*/}
            <View style={styles.rightcontainer}>
                {/* Feature Tags Section*/}
                <View style={styles.tagsContainer}> 
                  {/* TODO: need to figure out how to actually display labels */}
                  <Text style={styles.tag}>Natural</Text>
                  <Text style={styles.tag}>Desks</Text>
                  <Text style={styles.tag}>Comfy Couches</Text>
                  <Text style={styles.tag}>Minimalist</Text>
                  <Text style={styles.tag}>Cozy</Text>
                </View>

                {/* TODO: pull most common words/themes from reviews in small quotes */}

                <View style={styles.iconcontainer}>
                  <MaterialCommunityIcons name="wifi" size={24} color="black" padding={5} />
                  <MaterialCommunityIcons name="power-socket-us" size={24} color="black" padding={5} />
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
      width: "95%",
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
