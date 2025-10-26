import React from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

const SearchWithFilter = ({ searchQuery, setSearchQuery }) => {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.searchBar}>
        <TextInput
          style={styles.input}
          placeholder="Search"
          placeholderTextColor="#DC8B47"
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        <Ionicons name="search" size={20} color="#DC8B47" />
      </View>

      <TouchableOpacity style={styles.filterButton} onPress={() => router.push('/filters')}>
        <Ionicons name="options-outline" size={24} color="#DC8B47" />
      </TouchableOpacity>
    </View>
  );
};

const screenWidth = Dimensions.get('window').width;

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 10,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFBF5',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: screenWidth * 0.80,
    marginRight: 8,
    borderColor: '#DC8B47',
    borderWidth: 1,
  },
  input: {
    flex: 1,
    color: '#DC8B47',
    fontSize: 16,
    marginRight: 8,
  },
  filterButton: {
    backgroundColor: '#FFFBF5',
    padding: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#DC8B47',
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default SearchWithFilter;
