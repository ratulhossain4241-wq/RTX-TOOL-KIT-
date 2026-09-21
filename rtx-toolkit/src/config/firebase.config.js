import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Firebase config - real values from the RTX Tool Kit Firebase project
 * (console.firebase.google.com, project: rtx-e0764).
 */
const firebaseConfig = {
  apiKey: 'AIzaSyBP-3WpFJnzMotkr0-4OruvNlgbqqGKaTk',
  authDomain: 'rtx-e0764.firebaseapp.com',
  projectId: 'rtx-e0764',
  storageBucket: 'rtx-e0764.firebasestorage.app',
  messagingSenderId: '337649482571',
  appId: '1:337649482571:web:7ce08f69812207172986ce',
};

// Avoid re-initializing Firebase on hot reload
const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

// Auth with AsyncStorage persistence (so login survives app restarts)
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// Firestore - stores users, plans, payment requests, feature limits
export const db = getFirestore(app);

export default app;
