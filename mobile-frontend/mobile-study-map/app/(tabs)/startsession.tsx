import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { createSession, endSession } from '@/backend/backendFunctions';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/backend/firebaseConfig';

const studyOptions = ["Individual", "Quiet Group", "Collaborative Group"];
const studyOptionDescriptions = [];

export default function StartSession() {
  const { user } = useAuth();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [text, setText] = useState('');
  const [activeSession, setActiveSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkActiveSession();
  }, [user]);

  const checkActiveSession = async () => {
    if (!user?.uid) return;

    try {
      const sessionsRef = doc(db, 'sessions', user.uid);
      const sessionDoc = await getDoc(sessionsRef);
      const sessionData = sessionDoc.data();

      if (sessionData && sessionData.isActive) {
        setActiveSession(sessionData);
      }
      setLoading(false);
    } catch (error) {
      console.error('Error checking active session:', error);
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!activeSession?.id) return;

    Alert.alert(
      'End Session',
      'Are you sure you want to end this session?',
      [
        {
          text: 'Cancel',
          style: 'cancel'
        },
        {
          text: 'End Session',
          style: 'destructive',
          onPress: async () => {
            try {
              await endSession(activeSession.id);
              setActiveSession(null);
              Alert.alert('Success', 'Session ended successfully');
            } catch (error) {
              Alert.alert('Error', 'Failed to end session. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleStartSession = async () => {
    if (!selectedOption || !user?.uid) {
      alert('Please select a study mode first');
      return;
    }

    try {
      const sessionData = {
        description: text,
        sessionType: selectedOption.toLowerCase(),
        spaceId: "", // You can add space selection later
        userId: user.uid,
        users: [user.uid],
        isActive: true,
        startTime: new Date(),
        endTime: null
      };

      const { success, sessionId } = await createSession(sessionData);
      
      if (success) {
        alert('Session started successfully!');
        setText('');
        setSelectedOption(null);
      }
    } catch (error) {
      console.error('Error starting session:', error);
      alert('Failed to start session. Please try again.');
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (activeSession) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Current Active Session</Text>
        <View style={styles.sessionCard}>
          <Text style={styles.sessionType}>{activeSession.sessionType}</Text>
          <Text style={styles.description}>{activeSession.description}</Text>
          <Text style={styles.timestamp}>
            Started: {new Date(activeSession.startTime.seconds * 1000).toLocaleString()}
          </Text>
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
        multiline
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
    borderRadius: 10,
    marginVertical: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sessionType: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 16,
    color: '#666',
    marginBottom: 12,
  },
  timestamp: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  endButton: {
    backgroundColor: '#dc3545',
    paddingVertical: 12,
    borderRadius: 5,
    alignItems: 'center',
  },
  endButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: "#062F48",
    marginBottom: 20,
  },
});
