import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface SmallCardProps {
    name: string, 
    todayHrs: string,
    distance: number, 
    imageURL: string, 
    features: Record<string, Record<string, number>>; // Nested object
}

const SmallCard: React.FC<SmallCardProps> = ({ name, todayHrs, distance, imageURL, features }) => {
    return (
        <View>
            {/* Left Section*/}
            <View>
                <Text>{name}</Text> 
                <Text>{todayHrs}</Text>
                <Text>{distance}</Text>
                {imageURL && <Image source={{ uri: imageURL }}/>}
            </View> 

            {/* Right Section*/}
            <View>
                {/* Feature Tags Section*/}
                {/* TODO: need to figure out how to actually display labels */}
                <Text>A Label</Text>
            </View>

        </View>
    )
}

const styles = StyleSheet.create({
    card: {
      backgroundColor: "white",
      padding: 10,
      borderRadius: 10,
      shadowColor: "#000",
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 5,
      margin: 5,
    },
    image: {
      width: "100%",
      height: 100,
      borderRadius: 10,
      marginBottom: 5,
    },
    name: {
      fontSize: 16,
      fontWeight: "bold",
    },
    details: {
      fontSize: 14,
      color: "gray",
    },
    tagsContainer: {
      flexDirection: "row",
      flexWrap: "wrap",
      marginTop: 5,
    },
    tag: {
      backgroundColor: "#ddd",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 10,
      fontSize: 12,
      marginRight: 5,
      marginBottom: 5,
    },
    review: {
      fontStyle: "italic",
      fontSize: 12,
      color: "gray",
      marginTop: 5,
    },
  });

export default SmallCard;

