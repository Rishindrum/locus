import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput } from 'react-native';
import Slider from '@react-native-community/slider';
import DropDownPicker from 'react-native-dropdown-picker';
import { getAllStudySpaces, updateStudySpace } from '@/backend/backendFunctions';
import { useLocalSearchParams } from 'expo-router';

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
  { name: "Lighting", options: ["Artificial", "Natural", "Dim", "Bright"] },
  { name: "Seating", options: ["Couches", "Desks", "Comfy", "Hard"] },
  { name: "Aesthetics", options: ["Dark Academia", "Minimalist", "Cozy", "Corporate"] },
];


// Custom Category Selection Component
const CategorySelection = ({ categoryName, label, options, selected, onValueChange }) => (
  <View>
    <Text style={styles.categoryLabel}>{label}</Text>

    <View style={styles.optionsContainer}>
            {options.map((option) => {
              const isSelected = selected[categoryName]?.includes(option);
              return (
                <TouchableOpacity
                  key={option}
                  style={[styles.option, isSelected && styles.selectedOption]}
                  onPress={() => onValueChange(categoryName, option)}
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

  // Passed in from large card button to rate space
  const { spaceId } = useLocalSearchParams<{ spaceId: string }>();

  // Set up selected study space
  const [open, setOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState<string | null>(spaceId);
  const [items, setItems] = useState([]);
  const [studySpaces, setStudySpaces] = useState([]);

  useEffect(() => {
    const fetchStudySpaces = async () => {
      try {
        const spaces = await getAllStudySpaces(); 
        setStudySpaces(spaces);
        const mappedItems = spaces.map(space => ({
          label: space.name,
          value: space.spaceId,
        }));
        setItems(mappedItems);
      } catch (error) {
        console.error('Error fetching study spaces:', error);
      }
    };
  
    fetchStudySpaces();
  }, []);

  // Set up sliders' states
  type SliderField =
  | "features.noise"
  | "features.temp"
  | "features.wifi"
  | "features.outlet"
  | "features.cleanliness";

  const [sliders, setSliders] = useState<Record<SliderField, number>>({
    "features.noise": 2,
    "features.temp": 2,
    "features.wifi": 2,
    "features.outlet": 2,
    "features.cleanliness": 2,
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
  const toggleOption = (categoryName: string, option: string) => {
    setSelectedOptions((prev) => {
      const selected = prev[categoryName] || [];
      return {
        ...prev,
        [categoryName]: selected.includes(option)
          ? selected.filter((item) => item !== option) // Remove if already selected
          : [...selected, option], // Add if not selected
      };
    });
  };


  // Function to convert selected categorical options to the features to update (json object form)
  const mapSelectedOptionsToFeatures = (selectedOptions: { [key: string]: string[] }) => {
    const featuresUpdate: { [key: string]: number } = {};
  
    Object.entries(selectedOptions).forEach(([category, options]) => {
      const formattedCategory = category.toLowerCase().replace(/\s+/g, '');
      options.forEach(option => {
        const formattedOption = option.toLowerCase().replace(/\s+/g, '_');
        const key = `features.${formattedCategory}.${formattedOption}`;
        featuresUpdate[key] = 1;
      });
    });
  
    return featuresUpdate;
  };



  // Function to submit rating
  const handleSubmit = async () => {
    if (!selectedValue) {
      console.warn("No study space selected.");
      return;
    }

    const space = studySpaces.find(space => space.spaceId === selectedValue);
    const numRatings = space.numRatings;

    // Fields to average
    const fieldsToAverage = ["features.noise", "features.outlets", "features.temp", "features.wifi", "features.cleanliness"];

    // Numerical updates
    const averagedData = {};
    fieldsToAverage.forEach(field => {
      const oldValue = space[field] || 0;
      const newValue = sliders[field as SliderField] || 0;
      averagedData[field] = ((oldValue * numRatings) + newValue) / (numRatings + 1);
    });

    // Categorical updates
    const categoryFeatures = mapSelectedOptionsToFeatures(selectedOptions);

    // Merge in categories and comments
    const updatedData = {
      ...averagedData,
      ...categoryFeatures, // include labeled categories
      numRatings: numRatings + 1,
      comment: text || "", // optional: store comments too
    };

    try {
      await updateStudySpace(selectedValue, updatedData);
      console.log("Study space updated successfully.");
      
    } catch (error) {
      console.error("Error updating study space:", error);
    }
  };

  return (

    <View style={styles.scrollContainer}>
      <Text style={styles.heading}>Rate the Study Space</Text>

      <DropDownPicker
        open={open}
        value={selectedValue}
        items={items}
        setOpen={setOpen}
        setValue={setSelectedValue}
        setItems={setItems}
        placeholder="Choose a study space"
        containerStyle={{ marginBottom: 20, width: "90%", }} 
        style={styles.dropdown}
        dropDownContainerStyle={styles.dropdownContainer}
      />

    <ScrollView>

    <View style={styles.formContainer}>

      {/* Sliders */}
      <RatingSlider
        label="Noise Level"
        value={sliders['features.noise']}
        lowestLabel="Quiet"
        highestLabel="Loud"
        onValueChange={handleSliderChange('noiseLevel')}
      />
      <RatingSlider
        label="Temperature"
        value={sliders['features.temp']}
        lowestLabel="Cold"
        highestLabel="Hot"
        onValueChange={handleSliderChange('temperature')}
      />
      <RatingSlider
        label="WiFi Quality"
        value={sliders['features.wifi']}
        lowestLabel="Poor"
        highestLabel="Excellent"
        onValueChange={handleSliderChange('wifi')}
      />
      <RatingSlider
        label="Outlet Availability"
        value={sliders['features.outlet']}
        lowestLabel="Few"
        highestLabel="Plenty"
        onValueChange={handleSliderChange('outlet')}
      />
      <RatingSlider
        label="Cleanliness"
        value={sliders['features.cleanliness']}
        lowestLabel="Dirty"
        highestLabel="Clean"
        onValueChange={handleSliderChange('cleanliness')}
      />

      {/* Categorical Selections */}
      <CategorySelection
        categoryName={categories[0].name}
        label={categories[0].name}
        options={categories[0].options}
        selected={selectedOptions}
        onValueChange={toggleOption}
      />

      <CategorySelection
        categoryName={categories[1].name}
        label={categories[1].name}
        options={categories[1].options}
        selected={selectedOptions}
        onValueChange={toggleOption}
      />

      <CategorySelection
        categoryName={categories[2].name}
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
      <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
        <Text style={styles.submitButtonText}>Submit Rating</Text>
      </TouchableOpacity>
    </View>
    </ScrollView>

    </View>
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
    marginBottom: 200,
  },
  heading: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#062F48",
    marginTop: 60,
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

  dropdown: {
    borderColor: '#DC8B47',
    borderRadius: 10,
  },
  dropdownContainer: {
    borderColor: '#DC8B47',
  },
});

export default RatingForm;
