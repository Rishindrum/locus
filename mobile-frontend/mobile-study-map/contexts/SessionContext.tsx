import React, { createContext, useContext, useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { createSession, endSession as endSessionBackend, getSession, getUserActiveSession } from '@/backend/backendFunctions';
import { useAuth } from './AuthContext';

interface SessionContextType {
  sessionId: string | null;
  sessionType: string | null;
  description: string | null;
  startTime: Date | null;
  startSession: (type: string, description: string) => Promise<void>;
  endSession: () => Promise<boolean>;
  joinSession: (sessionId: string, sessionType: string, description: string, sessionStart: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  getElapsedTime: () => number;
  user: { uid: string } | null;
}

interface AuthContextType {
  user: { uid: string } | null;
}

const SessionContext = createContext<SessionContextType | undefined>(undefined);

export function SessionProvider({ children }: { children: React.ReactNode }) {
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [sessionType, setSessionType] = useState<string | null>(null);
  const [description, setDescription] = useState<string | null>(null);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const { user } = useAuth() as AuthContextType;

  const startSession = async (type: string, description: string) => {
    if (!user?.uid || user.uid === "") {
      console.error("No valid user.uid in startSession", user);
      Alert.alert("Error", "No valid user ID found. Please log in again.");
      return;
    }

    try {
      const sessionData = {
        description,
        sessionType: type.toLowerCase(),
        spaceId: "", // You can add space selection later
        userId: user.uid,
        users: [user.uid],
        isActive: true,
        startTime: new Date(),
        endTime: null
      };

      const { success, sessionId: newSessionId } = await createSession(sessionData);
      
      if (success && newSessionId) {
        setSessionId(newSessionId);
        setSessionType(type);
        setDescription(description);
        setStartTime(new Date());
      }
    } catch (error) {
      console.error('Error starting session:', error, user);
      Alert.alert('Error', 'Failed to start session. Please try again.');
    }
  };

  const endSession = async (): Promise<boolean> => {
    return new Promise((resolve) => {
      Alert.alert(
        "End Session",
        "Are you sure you want to end your current study session?",
        [
          {
            text: "Cancel",
            style: "cancel",
            onPress: () => resolve(false)
          },
          {
            text: "End Session",
            style: "destructive",
            onPress: async () => {
              if (sessionId && user?.uid) {
                try {
                  // Remove user from users, add to pastUsers, and end if last user
                  await endSessionBackend(sessionId, user.uid);
                  setSessionId(null);
                  setSessionType(null);
                  setDescription(null);
                  setStartTime(null);
                  resolve(true);
                } catch (error) {
                  console.error('Error ending session:', error);
                  Alert.alert('Error', 'Failed to end session. Please try again.');
                  resolve(false);
                }
              } else {
                resolve(false);
              }
            }
          }
        ]
      );
    });
  };

  // Join a session and update all relevant fields from Firestore
  const joinSession = async (
    newSessionId: string,
    _sessionType: string,
    _description: string,
    _sessionStart: string
  ) => {
    // Actually fetch session data from Firestore after joining
    try {
      const session = await getSession(newSessionId);
      if (session) {
        setSessionId(newSessionId);
        setSessionType(session.sessionType ?? _sessionType);
        setDescription(session.description ?? _description);
        setStartTime(session.startTime ? new Date(session.startTime) : new Date(_sessionStart));
        console.log('Session context updated from Firestore:', session);
      } else {
        setSessionId(newSessionId);
        setSessionType(_sessionType);
        setDescription(_description);
        setStartTime(new Date(_sessionStart));
        console.warn('Session not found in Firestore, using fallback values');
      }
    } catch (e) {
      setSessionId(newSessionId);
      setSessionType(_sessionType);
      setDescription(_description);
      setStartTime(new Date(_sessionStart));
      console.error('Error fetching session after join:', e);
    }
  };

  const leaveSession = async () => {
    if (sessionId) {
      try {
        await endSessionBackend(sessionId, user.uid);
        setSessionId(null);
        setSessionType(null);
        setDescription(null);
        setStartTime(null);
      } catch (error) {
        console.error('Error leaving session:', error);
        Alert.alert('Error', 'Failed to leave session. Please try again.');
      }
    }
  };

  const getElapsedTime = (): number => {
    if (!startTime) return 0;
    return Math.floor((new Date().getTime() - startTime.getTime()) / 1000);
  };

  // On mount, check if user is in an active session in Firestore and sync local state
  useEffect(() => {
    const syncSession = async () => {
      if (user?.uid) {
        try {
          // Fetch the user's active session from Firestore
          const firestoreSessionId = await getUserActiveSession(user.uid);
          if (firestoreSessionId && !sessionId) {
            setSessionId(firestoreSessionId);
            // Optionally fetch more session data or setSessionType/Description/StartTime here
          } else if (!firestoreSessionId && sessionId) {
            setSessionId(null);
            setSessionType(null);
            setDescription(null);
            setStartTime(null);
          }
        } catch (e) {
          console.error('Error syncing session state on mount:', e);
        }
      }
    };
    syncSession();
    // Optionally, add a listener for auth/session changes
  }, [user?.uid]);

  return (
    <SessionContext.Provider
      value={{
        sessionId,
        sessionType,
        description,
        startTime,
        startSession,
        endSession,
        joinSession,
        leaveSession,
        getElapsedTime,
        user
      }}
    >
      {children}
    </SessionContext.Provider>
  );
}

export function useSession() {
  const context = useContext(SessionContext);
  if (context === undefined) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
}
