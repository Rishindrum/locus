import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';

const studyOptions = ["Individual", "Quiet Group", "Collaborative Group"];

export default function StartSession() {

  // Set up selected study option state
  const [selectedOption, setSelectedOption] = useState<string | null>(null);

  // Set up text input's state
  const [text, setText] = useState('');

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Select Your Study Mode</Text>

      {/* the three study option buttons */}
      <View style={styles.optionsContainer}>
        {
            studyOptions.map((option) => {
                const isSelected = selectedOption === option; 

                return (
                    <TouchableOpacity
                        key={option}
                        style={[styles.optionButton, isSelected && styles.selectedButton]}
                        onPress={() => setSelectedOption(option)}
                    >
                        <Text style={[styles.optionText, isSelected && styles.selectedText]}>
                            {option}
                        </Text>
                    </TouchableOpacity>
                );
            })
        }
      </View>

      {/* Text Input */}
      <Text style={[styles.text, styles.inputText]}>Describe Your Session</Text>
      <TextInput
        style={styles.input}
        placeholder="Type here..."
        value={text}
        onChangeText={setText}
      />

      {/* Button to start session */}
      <TouchableOpacity style={styles.startButton} onPress={() => alert('Session started!')}>
        <Text style={styles.startButtonText}>Start Session</Text>
      </TouchableOpacity>


    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF5', // You can modify this for dark mode
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
  },

  optionsContainer: {
    marginTop: 20,
    width: "80%",
  },
  optionButton: {
    padding: 15,
    marginVertical: 5,
    borderWidth: 1,
    borderColor: "#DC8B47",
    borderRadius: 10,
    alignItems: "center",
  },
  selectedButton: {
    backgroundColor: "#DC8B47",
    borderColor: "#DC8B47",
  },
  optionText: {
    fontSize: 16,
    color: "#DC8B47",
  },
  selectedText: {
    color: "#fff",
    fontWeight: "bold",
  },
  inputText: {
    marginTop: 25,
  },
  input: {
    width: "80%",
    height: 80,
    borderColor: 'gray',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 10,
    marginTop: 15,
    marginBottom: 30,
  },
  startButton: {
    width: "60%",
    backgroundColor: '#DC8B47',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
