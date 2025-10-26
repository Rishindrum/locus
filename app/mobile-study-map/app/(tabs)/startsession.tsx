import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { useSession } from '@/contexts/SessionContext';
import Stopwatch from '@/components/Stopwatch';

const studyOptions = ["Individual", "Quiet Group", "Collaborative Group"];

export default function StartSession() {
  const { sessionId, sessionType, description, startSession, endSession } = useSession();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [text, setText] = useState('');

  const handleStartSession = async () => {
    if (!selectedOption) {
      Alert.alert('Error', 'Please select a study mode first');
      return;
    }

    try {
      await startSession(selectedOption, text);
      setText('');
      setSelectedOption(null);
      Keyboard.dismiss();
    } catch (error) {
      console.error('Error starting session:', error);
      Alert.alert('Error', 'Failed to start session. Please try again.');
    }
  };

  const handleEndSession = async () => {
    const ended = await endSession();
    if (ended) {
      setText('');
      setSelectedOption(null);
    }
  };

  if (sessionId) {
    return (
      <View style={styles.container}>
        <Text style={[styles.text, styles.title]}>Current Active Session</Text>
        <View style={styles.sessionCard}>
          <Stopwatch />
          <View style={styles.divider} />
          <Text style={styles.sessionType}>{sessionType}</Text>
          {description && <Text style={styles.description}>{description}</Text>}
          <TouchableOpacity
            style={styles.endButton}
            onPress={handleEndSession}
          >
            <Text style={styles.endButtonText}>End Session</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
        <Text style={styles.text}>Select Your Study Mode</Text>

      {/* the three study option buttons */}
        <View style={styles.optionsContainer}>
          {studyOptions.map((option) => {
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
          })}
        </View>

      {/* Text Input */}
        <Text style={[styles.text, styles.inputText]}>Describe Your Session</Text>
        <TextInput
          style={styles.input}
          placeholder="Type here..."
          value={text}
          onChangeText={setText}
          multiline
          onSubmitEditing={Keyboard.dismiss}
          blurOnSubmit={true}
        />

      {/* Button to start session */}        
        <TouchableOpacity
          style={[styles.startButton, !selectedOption && styles.disabledButton]} 
          onPress={handleStartSession}
          disabled={!selectedOption}
        >
          <Text style={styles.startButtonText}>Start Session</Text>
        </TouchableOpacity>
      </View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFBF5',
  },
  text: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#062F48",
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
    borderWidth: 1,
    borderColor: "#DC8B47",
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    marginBottom: 20,
    textAlignVertical: 'top',
  },
  startButton: {
    backgroundColor: "#DC8B47",
    padding: 15,
    borderRadius: 10,
    width: "80%",
    alignItems: "center",
  },
  startButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  disabledButton: {
    backgroundColor: "#ccc",
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 15,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '80%',
    alignItems: 'center',
  },
  sessionType: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'capitalize',
    color: '#062F48',
    textAlign: 'center',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
    textAlign: 'center',
  },
  endButton: {
    backgroundColor: '#DC8B47',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
    width: '100%',
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#eee',
    width: '100%',
    marginVertical: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#062F48",
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    marginBottom: 10,
  },
});
