import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import { useAuth } from '../context/AuthContext';
import { COLORS } from '../theme/theme';

import SplashScreen from '../screens/auth/SplashScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import PremiumScreen from '../screens/premium/PremiumScreen';
import PaymentRequestScreen from '../screens/premium/PaymentRequestScreen';
import PlaceholderScreen from '../screens/PlaceholderScreen';
import SpeedTestScreen from '../screens/tools/SpeedTestScreen';
import StorageAnalyzerScreen from '../screens/tools/StorageAnalyzerScreen';
import QrToolScreen from '../screens/tools/QrToolScreen';
import ClipboardCleanerScreen from '../screens/tools/ClipboardCleanerScreen';

const Stack = createNativeStackNavigator();

// Dark nav theme so screen transitions don't flash white
const NavDarkTheme = {
  ...DefaultTheme,
  dark: true,
  colors: {
    ...DefaultTheme.colors,
    background: COLORS.background,
    card: COLORS.surface,
    text: COLORS.textPrimary,
    border: COLORS.border,
    primary: COLORS.primary,
  },
};

// Every feature screen name used by DashboardScreen's FEATURES list.
// Each currently renders PlaceholderScreen until its real screen is built
// in a later batch - this list is the ONLY place to update when a real
// screen replaces a placeholder (see comment at the bottom of this file).
const PLACEHOLDER_SCREENS = [
  { name: 'JunkCleaner', title: 'Junk Cleaner' },
  { name: 'NetworkOptimizer', title: 'Network Optimizer' },
  { name: 'AdBlocker', title: 'Ad Blocker' },
  { name: 'RouterDashboard', title: 'Router Dashboard' },
  { name: 'BatteryOptimizer', title: 'Battery Optimizer' },
  { name: 'AppManager', title: 'App Manager' },
  { name: 'SystemMonitor', title: 'CPU / RAM Monitor' },
  { name: 'AppLock', title: 'App Lock' },
  { name: 'DuplicateFinder', title: 'Duplicate Finder' },
  { name: 'WifiScanner', title: 'WiFi Scanner' },
  { name: 'FakeAppDetector', title: 'Fake App Detector' },
  { name: 'TvRemote', title: 'TV Remote' },
];

export default function AppNavigator() {
  const { user, initializing } = useAuth();

  if (initializing) {
    return (
      <NavigationContainer theme={NavDarkTheme}>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Splash" component={SplashScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer theme={NavDarkTheme}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'fade' }}>
        {user ? (
          <>
            <Stack.Screen name="Dashboard" component={DashboardScreen} />
            <Stack.Screen name="Premium" component={PremiumScreen} options={{ headerShown: true, title: 'Premium' }} />
            <Stack.Screen
              name="PaymentRequest"
              component={PaymentRequestScreen}
              options={{ headerShown: true, title: 'Payment' }}
            />
            <Stack.Screen
              name="SpeedTest"
              component={SpeedTestScreen}
              options={{ headerShown: true, title: 'Speed Test' }}
            />
            <Stack.Screen
              name="StorageAnalyzer"
              component={StorageAnalyzerScreen}
              options={{ headerShown: true, title: 'Storage Analyzer' }}
            />
            <Stack.Screen
              name="QrTool"
              component={QrToolScreen}
              options={{ headerShown: true, title: 'QR Tool' }}
            />
            <Stack.Screen
              name="ClipboardCleaner"
              component={ClipboardCleanerScreen}
              options={{ headerShown: true, title: 'Clipboard Cleaner' }}
            />
            {PLACEHOLDER_SCREENS.map((s) => (
              <Stack.Screen
                key={s.name}
                name={s.name}
                component={PlaceholderScreen}
                initialParams={{ title: s.title }}
                options={{ headerShown: true, title: s.title }}
              />
            ))}
          </>
        ) : (
          <>
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Register" component={RegisterScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

/**
 * HOW TO REPLACE A PLACEHOLDER WITH A REAL SCREEN (future batches):
 * 1. Import the real screen component at the top of this file.
 * 2. Remove that screen's entry from PLACEHOLDER_SCREENS above.
 * 3. Add its own <Stack.Screen name="X" component={RealScreen} /> next to
 *    the other named screens (Premium, PaymentRequest) above.
 */
