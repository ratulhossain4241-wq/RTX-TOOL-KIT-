import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Firebase config values.
 * IMPORTANT: never hardcode real keys directly in this file for a public repo.
 * Put real values in a local `.env` file (gitignored) and load them via
 * `expo-constants` / `react-native-dotenv`, or paste them here only in your
 * PRIVATE repo. Placeholder values below - replace with your real Firebase
 * project settings from Firebase Console > Project Settings.
 */
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY || 'REPLACE_ME',
  authDomain: process.env.FIREBASE_AUTH_DOMAIN || 'REPLACE_ME.firebaseapp.com',
  projectId: process.env.FIREBASE_PROJECT_ID || 'REPLACE_ME',
  storageBucket: process.env.FIREBASE_STORAGE_BUCKET || 'REPLACE_ME.appspot.com',
  messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID || 'REPLACE_ME',
  appId: process.env.FIREBASE_APP_ID || 'REPLACE_ME',
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
