import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';


// Custom Slider Component
const RatingSlider = ({ label, value, lowestLabel, highestLabel, onValueChange }) => (
  <View style={styles.sliderContainer}>
    <Text style={styles.categoryLabel}>{label}</Text>

    <Slider
      style={styles.slider}
      minimumValue={0}
      maximumValue={4} // 5 notches (0, 1, 2, 3, 4)
      step={1}
      value={value}
      onValueChange={onValueChange}
      minimumTrackTintColor="#DC8B47"
      maximumTrackTintColor="#ccc"
      thumbImage={require('../../assets/images/orangesliderdot.png')} // Custom small image
    />

    {/* Labels for the ends */}
    <View style={styles.labelContainer}>
        <Text style={styles.label}>{lowestLabel}</Text>
        <Text style={styles.label}>{highestLabel}</Text>
    </View>
    
  </View>
);


// Set up categories for easy changes
const categories = [
  { id: "1", name: "Lighting", options: ["Artificial", "Natural", "Dim", "Bright"] },
  { id: "2", name: "Seating Types", options: ["Couches", "Desks", "Comfy", "Hard"] },
  { id: "3", name: "Aesthetics", options: ["Dark Academia", "Minimalist", "Cozy", "Corporate", "Modern", "Vintage"] },
];


// Custom Category Selection Component
const CategorySelection = ({ id, label, options, selected, onValueChange }) => (
  <View>
    <Text style={styles.categoryLabel}>{label}</Text>

    <View style={styles.optionsContainer}>
            {options.map((option) => {
              const isSelected = selected[id]?.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.option, isSelected && styles.selectedOption]}
                  onPress={() => onValueChange(id, option)}
                >
                  <Text style={[styles.optionText, isSelected && styles.selectedOptionText]}>
                    {option}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
  </View>
);


const RatingForm = () => {

  // Set up sliders' states
  const [sliders, setSliders] = useState({
    noiseLevel: 2,
    temperature: 2,
    wifi: 2,
    outlet: 2,
    cleanliness: 2,
  });

  // Set up categories' states
  const [selectedOptions, setSelectedOptions] = useState<{ [key: string]: string[] }>({});

  // Set up text input's state
  const [text, setText] = useState('');

  // Function to change slider state
  const handleSliderChange = (category: string) => (value: number) => {
    setSliders((prev) => ({ ...prev, [category]: value }));
  };

  // Function to change category selection state
  const toggleOption = (categoryId: string, option: string) => {
    setSelectedOptions((prev) => {
      const selected = prev[categoryId] || [];
      return {
        ...prev,
        [categoryId]: selected.includes(option)
          ? selected.filter((item) => item !== option) // Remove if already selected
          : [...selected, option], // Add if not selected
      };
    });
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
    <View style={styles.formContainer}>

      <Text style={styles.heading}>Rate the Study Space</Text>

      {/* Sliders */}
      <RatingSlider
        label="Noise Level"
        value={sliders.noiseLevel}
        lowestLabel="Quiet"
        highestLabel="Loud"
        onValueChange={handleSliderChange('noiseLevel')}
      />
      <RatingSlider
        label="Temperature"
        value={sliders.temperature}
        lowestLabel="Cold"
        highestLabel="Hot"
        onValueChange={handleSliderChange('temperature')}
      />
      <RatingSlider
        label="WiFi Quality"
        value={sliders.wifi}
        lowestLabel="Poor"
        highestLabel="Excellent"
        onValueChange={handleSliderChange('wifi')}
      />
      <RatingSlider
        label="Outlet Availability"
        value={sliders.outlet}
        lowestLabel="Few"
        highestLabel="Plenty"
        onValueChange={handleSliderChange('outlet')}
      />
      <RatingSlider
        label="Cleanliness"
        value={sliders.cleanliness}
        lowestLabel="Dirty"
        highestLabel="Clean"
        onValueChange={handleSliderChange('cleanliness')}
      />

      {/* Categorical Selections */}
      <CategorySelection
        id={categories[0].id}
        label={categories[0].name}
        options={categories[0].options}
        selected={selectedOptions}
        onValueChange={toggleOption}
      />

      <CategorySelection
        id={categories[1].id}
        label={categories[1].name}
        options={categories[1].options}
        selected={selectedOptions}
        onValueChange={toggleOption}
      />

      <CategorySelection
        id={categories[2].id}
        label={categories[2].name}
        options={categories[2].options}
        selected={selectedOptions}
        onValueChange={toggleOption}
      />

      {/* Text Input */}
      <Text style={[styles.categoryLabel, styles.inputLabel]}>Additional Comments?</Text>
      <TextInput
        style={styles.input}
        placeholder="Type here..."
        value={text}
        onChangeText={setText}
      />

      {/* Submit Button */}
      <TouchableOpacity style={styles.submitButton} onPress={() => alert('Rating Submitted!')}>
        <Text style={styles.submitButtonText}>Submit Rating</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    backgroundColor: '#FFFBF5',
    flexGrow: 1, // Allows content to grow and be scrollable
    padding: 20,
    alignItems: 'center',
  },
  formContainer: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#062F48",
    marginTop: 40,
    marginBottom: 20,
    textAlign: 'center',
  },
  sliderContainer: {
    marginBottom: 20,
  },
  slider: {
    width: '100%',
  },
  categoryLabel: {
    fontSize: 16,
  },
  label: {
    fontSize: 14,
    marginBottom: 10,
  },
  labelContainer: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
  },
  selectedCategoryText: {
    color: '#fff',
  },
  optionsContainer: { 
    flexDirection: "row", 
    flexWrap: "wrap",
    paddingTop: 10,
    paddingBottom: 10,
  },
  option: {
    padding: 10,
    marginRight: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#DC8B47",
    borderRadius: 10,
  },
  selectedOption: {
    backgroundColor: "#DC8B47",
    color: "#fff",
  },
  optionText: { 
    color: "#DC8B47" 
  },
  selectedOptionText: {
    color: '#fff',
  },
  submitButton: {
    backgroundColor: '#DC8B47',
    padding: 15,
    marginBottom: 70,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  inputLabel: {
    paddingTop: 20,
  },
  input: {
    height: 80,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 10,
    marginBottom: 30,
  },
});

export default RatingForm;
