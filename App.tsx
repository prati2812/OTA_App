import React, { useEffect, useState } from 'react';
import { StatusBar, StyleSheet, useColorScheme, View, Text, Alert, Pressable } from 'react-native';
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from 'react-native-safe-area-context';
import { checkForOTAUpdate } from './ota';
import AsyncStorage from '@react-native-async-storage/async-storage';

function App() {
  const isDarkMode = useColorScheme() === 'dark';

  useEffect(() => {
    // Check for OTA update on startup
    checkForOTAUpdate();
  }, []);

  return (
    <SafeAreaProvider>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <AppContent />
    </SafeAreaProvider>
  );
}

function AppContent() {
  const safeAreaInsets = useSafeAreaInsets();
  const [otaVersion, setOtaVersion] = useState<string | null>('Initial');

  useEffect(() => {
    const getVersion = async () => {
      const version = await AsyncStorage.getItem('OTA_VERSION');
      if (version) setOtaVersion(version);
    };
    getVersion();
  }, []);

  return (
    <View style={[styles.container, { paddingTop: safeAreaInsets.top }]}>
      <View style={styles.header}>
        <Text style={styles.title}>OTA Update System</Text>
        <Text style={styles.subtitle}>Current OTA Version: {otaVersion}</Text>
      </View>
      <View style={styles.content}>
        <Text style={styles.text}>
          Let's workig on new functionality
        </Text>
        <Text style={styles.text}>
          If a new version is found, it will download and apply on next restart.
        </Text>

        <Pressable onPress={() => {
          Alert.alert("update");
        }}>
              <Text>
                     Click new version install
              </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#555151ff',
  },
  header: {
    padding: 20,
    backgroundColor: '#6200ee',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#ffffff',
  },
  subtitle: {
    fontSize: 16,
    color: '#e0e0e0',
    marginTop: 5,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  text: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 10,
    color: '#e4a7a7ff',
  },
});

export default App;
