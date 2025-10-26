import React, { useRef, useEffect, useState } from 'react';
import {
  FlatList,
  Image,
  StyleSheet,
  Dimensions,
  View,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width: screenWidth } = Dimensions.get('window');
const ITEM_WIDTH = (screenWidth * 0.9) * 0.6;
const SPACER_WIDTH = (((screenWidth * 0.9) - ITEM_WIDTH) / 2) - 10;

const AutoScrollCarousel = ({ images }) => {
  const flatListRef = useRef(null);
  const [index, setIndex] = useState(0);

  // Repeat images 3 times: [copy, original, copy]
  const tripledImages = [
    ...images,
    ...images,
    ...images,
  ];

  const midIndex = images.length; // where the "real" list starts

  useEffect(() => {
    // Scroll to the real middle on mount
    setTimeout(() => {
      flatListRef.current?.scrollToIndex({
        index: midIndex,
        animated: false,
      });
    }, 100);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => {
        const next = prev + 1;
        const scrollIndex = midIndex + next;

        flatListRef.current?.scrollToIndex({
          index: scrollIndex,
          animated: true,
        });

        if (next >= images.length) {
          // Reset index after one full loop
          setTimeout(() => {
            flatListRef.current?.scrollToIndex({
              index: midIndex,
              animated: false,
            });
          }, 350); // Wait for animation to finish

          return 0;
        }

        return next;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const renderItem = ({ item }) => (
    <Image source={{ uri: item }} style={styles.image} />
  );

  return (

    <View>
        {/* Left fade */}
        <LinearGradient
            colors={['#FFFBF5', 'rgba(255,255,255,0)']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }} // left ➝ right
            style={{
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: 70, // adjust fade width
                zIndex: 1,
            }}
            pointerEvents="none"
        />

        {/* Right fade */}
        <LinearGradient
            colors={['rgba(255,255,255,0)', '#FFFBF5']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }} // right -> left
            style={{
                position: 'absolute',
                right: 0,
                top: 0,
                bottom: 0,
                width: 70, // match fade width
                zIndex: 1,
            }}
            pointerEvents="none"
        />

        <FlatList
        ref={flatListRef}
        data={tripledImages}
        renderItem={renderItem}
        keyExtractor={(_, i) => i.toString()}
        horizontal
        snapToInterval={ITEM_WIDTH}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        getItemLayout={(_, index) => ({
            length: ITEM_WIDTH,
            offset: (ITEM_WIDTH * index),
            index,
        })}
        contentContainerStyle={{
            paddingHorizontal: SPACER_WIDTH,
        }}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  image: {
    width: ITEM_WIDTH,
    height: 200,
    borderRadius: 12,
    marginVertical: 20,
    paddingHorizontal: 5,
  },
});

export default AutoScrollCarousel;