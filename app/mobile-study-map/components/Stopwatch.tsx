import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSession } from '@/contexts/SessionContext';

export default function Stopwatch() {
  const { getElapsedTime } = useSession();
  const [time, setTime] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(getElapsedTime());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number): string => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;

    const pad = (num: number): string => num.toString().padStart(2, '0');

    return `${pad(hours)}:${pad(minutes)}:${pad(remainingSeconds)}`;
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Study Time</Text>
      <Text style={styles.time}>{formatTime(time)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    marginVertical: 10,
  },
  label: {
    fontSize: 16,
    color: '#062F48',
    marginBottom: 5,
    fontWeight: '500',
  },
  time: {
    fontSize: 48,
    fontWeight: 'bold',
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: '#DC8B47',
  },
});
