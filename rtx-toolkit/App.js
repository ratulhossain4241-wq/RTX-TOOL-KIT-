import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/theme/theme';

/**
 * RTX TOOL KIT - App Entry Point
 * ---------------------------------
 * Wraps the whole app with:
 *  - SafeAreaProvider (notch-safe layout)
 *  - GestureHandlerRootView (required by react-native-gesture-handler)
 *  - AuthProvider (Firebase auth + premium/free plan state, added in a later batch)
 *  - AppNavigator (all screens)
 */
export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: COLORS.background }}>
      <SafeAreaProvider>
        <AuthProvider>
          <StatusBar style="light" backgroundColor={COLORS.background} />
          <AppNavigator />
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
    }
