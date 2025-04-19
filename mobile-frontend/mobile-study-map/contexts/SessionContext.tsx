import React, { createContext, useContext, useState } from 'react';
import { Alert } from 'react-native';
import { createSession, endSession as endSessionBackend } from '@/backend/backendFunctions';
import { useAuth } from './AuthContext';

interface SessionContextType {
  sessionId: string | null;
  sessionType: string | null;
  description: string | null;
  startTime: Date | null;
  startSession: (type: string, description: string) => Promise<void>;
  endSession: () => Promise<boolean>;
  joinSession: (sessionId: string) => Promise<void>;
  leaveSession: () => Promise<void>;
  getElapsedTime: () => number;
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
    if (!user?.uid) return;

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
      console.error('Error starting session:', error);
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
              if (sessionId) {
                try {
                  await endSessionBackend(sessionId);
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
              }
            }
          }
        ]
      );
    });
  };

  const joinSession = async (newSessionId: string) => {
    setSessionId(newSessionId);
    setStartTime(new Date());
    // Add backend logic to join session
  };

  const leaveSession = async () => {
    if (sessionId) {
      try {
        await endSessionBackend(sessionId);
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
        getElapsedTime
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
