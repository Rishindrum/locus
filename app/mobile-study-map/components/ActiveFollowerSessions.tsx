import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { useAuth } from '@/contexts/AuthContext';
import { db } from '@/backend/firebaseConfig';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { getUserProfile, joinSession, getUserActiveSession } from '@/backend/backendFunctions';

export default function ActiveFollowerSessions() {
  const { user } = useAuth();
  const [activeSessions, setActiveSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.uid) return;

    let unsubscribe;

    const setupSessionListener = async () => {
      try {
        // Get current user's following list
        const userProfile = await getUserProfile(user.uid);
        const following = userProfile?.following || [];

        if (following.length === 0) {
          setLoading(false);
          return;
        }

        // Create query for active sessions from followed users
        const sessionsRef = collection(db, 'sessions');
        const q = query(
          sessionsRef,
          where('userId', 'in', following),
          where('isActive', '==', true)
        );

        // Set up real-time listener
        unsubscribe = onSnapshot(q, (snapshot) => {
          const sessions = [];
          snapshot.forEach((doc) => {
            sessions.push({ id: doc.id, ...doc.data() });
          });
          setActiveSessions(sessions);
          setLoading(false);
        }, (error) => {
          console.error('Error listening to sessions:', error);
          setLoading(false);
        });
      } catch (error) {
        console.error('Error setting up session listener:', error);
        setLoading(false);
      }
    };

    setupSessionListener();

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [user]);

  const handleJoinSession = async (sessionId: string) => {
    if (!user?.uid) return;

    try {
      // Check if user has an active session
      const currentSession = await getUserActiveSession(user.uid);
      
      if (currentSession) {
        // If they're trying to join the same session they're already in
        if (currentSession.id === sessionId) {
          Alert.alert('Already Joined', 'You are already in this session.');
          return;
        }

        // Ask for confirmation to leave current session
        Alert.alert(
          'Leave Current Session?',
          'Joining this session will end your participation in your current session. If you are the only participant, the current session will end. Do you want to continue?',
          [
            {
              text: 'Cancel',
              style: 'cancel'
            },
            {
              text: 'Continue',
              style: 'destructive',
              onPress: async () => {
                try {
                  await joinSession(sessionId, user.uid);
                  Alert.alert('Success', 'You have joined the new session!');
                } catch (error: any) {
                  Alert.alert('Error', error?.message || 'Failed to join session');
                }
              }
            }
          ]
        );
      } else {
        // No active session, join directly
        await joinSession(sessionId, user.uid);
        Alert.alert('Success', 'You have joined the session!');
      }
    } catch (error: any) {
      Alert.alert('Error', error?.message || 'Failed to join session');
    }
  };

  const renderSession = ({ item }) => (
    <View style={styles.sessionCard}>
      <View style={styles.sessionInfo}>
        <Text style={styles.sessionType}>{item.sessionType}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.timestamp}>Started: {new Date(item.startTime.seconds * 1000).toLocaleString()}</Text>
      </View>
      <TouchableOpacity
        style={styles.joinButton}
        onPress={() => handleJoinSession(item.id)}
      >
        <Text style={styles.joinButtonText}>Join</Text>
      </TouchableOpacity>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.container}>
        <Text>Loading sessions...</Text>
      </View>
    );
  }

  if (activeSessions.length === 0) {
    return (
      <View style={styles.container}>
        <Text>No active sessions from people you follow</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Active Sessions</Text>
      <FlatList
        data={activeSessions}
        keyExtractor={(item) => item.id}
        renderItem={renderSession}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#FFFBF5',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#062F48',
  },
  sessionCard: {
    backgroundColor: '#fff',
    padding: 15,
    marginVertical: 8,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionInfo: {
    flex: 1,
  },
  sessionType: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    textTransform: 'capitalize',
  },
  description: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  timestamp: {
    fontSize: 12,
    color: '#999',
  },
  joinButton: {
    backgroundColor: '#4CAF50',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
    marginLeft: 10,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});
