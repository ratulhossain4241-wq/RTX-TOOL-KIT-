import React, { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';

const AuthContext = createContext(null);

/**
 * AuthProvider
 * ------------
 * - Listens to Firebase auth state (logged in / logged out)
 * - Once logged in, also listens to the user's Firestore doc in real time,
 *   so when the Telegram admin bot approves a payment and flips
 *   `plan: "premium"`, the app updates INSTANTLY without the user
 *   needing to reopen the app.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);       // Firebase auth user
  const [profile, setProfile] = useState(null);  // Firestore doc: { plan, expiryDate, ... }
  const [initializing, setInitializing] = useState(true);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      if (!firebaseUser) {
        setProfile(null);
        setInitializing(false);
      }
    });
    return unsubscribeAuth;
  }, []);

  useEffect(() => {
    if (!user) return;

    // Real-time listener on /users/{uid} for live premium status updates
    const unsubscribeProfile = onSnapshot(
      doc(db, 'users', user.uid),
      (snap) => {
        setProfile(snap.exists() ? snap.data() : null);
        setInitializing(false);
      },
      (error) => {
        console.warn('Profile listener error:', error.message);
        setInitializing(false);
      }
    );
    return unsubscribeProfile;
  }, [user]);

  // Helper flags used all over the app to gate premium-only features
  const isPremium =
    !!profile &&
    profile.plan === 'premium' &&
    profile.expiryDate &&
    profile.expiryDate.toDate() > new Date();

  const value = {
    user,
    profile,
    isPremium,
    initializing,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}
