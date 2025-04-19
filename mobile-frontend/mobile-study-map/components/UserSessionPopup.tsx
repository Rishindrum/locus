import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { getUserActiveSession, joinSession } from '@/backend/backendFunctions';
import { useSession } from '@/contexts/SessionContext';
import Stopwatch from './Stopwatch';
import { useRouter } from 'expo-router';

interface UserSessionPopupProps {
  userId: string;
  userName: string;
  onClose: () => void;
  onJoin: (sessionId: string, sessionStart: string, sessionType: string, sessionDescription: string) => void;
  currentSessionId: string | null;
}

export default function UserSessionPopup({ userId, userName, onClose, onJoin, currentSessionId }: UserSessionPopupProps) {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState<any>(null);
  const [joining, setJoining] = useState(false);
  const { sessionId, endSession, getElapsedTime, user } = useSession();
  const [ending, setEnding] = useState(false);
  const [stopwatch, setStopwatch] = useState(0);
  const router = useRouter();
  const [showEndSessionPrompt, setShowEndSessionPrompt] = useState(false);

  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    if (currentSessionId && session && currentSessionId === session.id) {
      timer = setInterval(() => {
        setStopwatch(getElapsedTime());
      }, 1000);
    } else {
      setStopwatch(0);
    }
    return () => { if (timer) clearInterval(timer); };
  }, [currentSessionId, session, getElapsedTime]);

  useEffect(() => {
    async function fetchSession() {
      setLoading(true);
      try {
        const s = await getUserActiveSession(userId);
        setSession(s);
      } catch (e) {
        setSession(null);
      } finally {
        setLoading(false);
      }
    }
    fetchSession();
  }, [userId]);

  const handleJoin = async () => {
    if (!session) return;
    const myUserId = user?.uid;
    if (!myUserId || myUserId === "") {
      Alert.alert("Error", "No valid user ID found. Please log in again.");
      return;
    }
    // If user is already in a session and trying to join a different one, show the popup with End Session button
    if (currentSessionId && currentSessionId !== session.id) {
      setShowEndSessionPrompt(true);
      return;
    }
    setJoining(true);
    try {
      await joinSession(session.id, myUserId);
      await new Promise(res => setTimeout(res, 500));
      onJoin(session.id, session.startTime, session.sessionType, session.description);
      onClose();
    } catch (e: any) {
      Alert.alert('Could not join session', e.message || 'Unknown error');
    } finally {
      setJoining(false);
    }
  };

  const handleEndAndRedirect = async () => {
    setShowEndSessionPrompt(false);
    router.push('/startsession');
  };

  const handleEndSession = async () => {
    setEnding(true);
    try {
      await endSession();
      setStopwatch(0);
      onClose();
    } catch (e) {
      Alert.alert('Could not end session', e.message || 'Unknown error');
    } finally {
      setEnding(false);
    }
  };

  const renderSmallStopwatch = () => (
    <View style={{ alignItems: 'center', marginVertical: 6 }}>
      <Text style={{ fontSize: 12, color: '#888', fontWeight: 'bold' }}>Stopwatch</Text>
      <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#DC8B47' }}>{formatTime(stopwatch)}</Text>
    </View>
  );

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  return (
    <View style={styles.overlay}>
      <View style={styles.popup}>
        <Text style={styles.title}>{userName}</Text>
        {loading ? (
          <ActivityIndicator size="small" color="#DC8B47" />
        ) : session ? (
          <>
            <Text style={styles.sessionText}>Active Session: {session.description || session.sessionType}</Text>
            <Text style={styles.sessionText}>Started: {new Date(session.startTime).toLocaleTimeString()}</Text>
            {currentSessionId === session.id ? (
              <>
                {renderSmallStopwatch()}
                <TouchableOpacity style={styles.endButton} onPress={handleEndSession} disabled={ending}>
                  <Text style={styles.endButtonText}>{ending ? 'Ending...' : 'End Session'}</Text>
                </TouchableOpacity>
                <Text style={styles.joinedText}>You are in this session</Text>
              </>
            ) : (
              <TouchableOpacity style={styles.joinButton} onPress={handleJoin} disabled={joining}>
                <Text style={styles.joinButtonText}>{joining ? 'Joining...' : 'Join Session'}</Text>
              </TouchableOpacity>
            )}
          </>
        ) : (
          <Text style={styles.noSessionText}>No active session</Text>
        )}
        {showEndSessionPrompt && (
          <View style={styles.endSessionPrompt}>
            <Text style={styles.promptText}>
              You are already in a session. Please end your current session before joining another.
            </Text>
            <TouchableOpacity style={styles.endButton} onPress={handleEndAndRedirect}>
              <Text style={styles.endButtonText}>End Session</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.cancelButton} onPress={() => setShowEndSessionPrompt(false)}>
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}
        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  popup: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 24,
    minWidth: 260,
    alignItems: 'center',
    elevation: 6,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  sessionText: {
    fontSize: 16,
    marginBottom: 6,
  },
  noSessionText: {
    fontSize: 16,
    color: '#888',
    marginVertical: 10,
  },
  joinButton: {
    backgroundColor: '#DC8B47',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginVertical: 10,
  },
  joinButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  endButton: {
    backgroundColor: '#c0392b',
    paddingVertical: 8,
    paddingHorizontal: 18,
    borderRadius: 8,
    marginVertical: 10,
  },
  endButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  joinedText: {
    color: '#2ecc40',
    fontWeight: 'bold',
    marginVertical: 10,
  },
  closeButton: {
    marginTop: 12,
    padding: 6,
  },
  closeButtonText: {
    color: '#DC8B47',
    fontWeight: '600',
    fontSize: 16,
  },
  endSessionPrompt: {
    backgroundColor: '#fffbe6',
    borderRadius: 10,
    padding: 16,
    marginVertical: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  promptText: {
    fontSize: 16,
    color: '#062F48',
    marginBottom: 12,
    textAlign: 'center',
  },
  endButton: {
    backgroundColor: '#DC8B47',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginBottom: 8,
  },
  endButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelButton: {
    backgroundColor: '#eee',
    paddingVertical: 8,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#062F48',
    fontSize: 16,
  },
});
