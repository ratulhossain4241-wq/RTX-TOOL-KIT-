import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../config/firebase.config';

/**
 * authService
 * -----------
 * Thin wrapper around Firebase Auth + Firestore so screens never touch
 * Firebase SDK calls directly. Every function throws a plain Error with a
 * user-readable message - screens just catch and display err.message.
 */

export async function registerUser({ name, email, password }) {
  try {
    const { user } = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(user, { displayName: name });

    // Create the Firestore profile doc - starts everyone on the free plan
    await setDoc(doc(db, 'users', user.uid), {
      name,
      email,
      plan: 'free',
      expiryDate: null,
      createdAt: serverTimestamp(),
      usage: {
        junkCleanerToday: 0,
        appLockCount: 0,
        tvDevices: 0,
      },
    });

    return user;
  } catch (err) {
    throw new Error(mapFirebaseError(err));
  }
}

export async function loginUser({ email, password }) {
  try {
    const { user } = await signInWithEmailAndPassword(auth, email, password);
    return user;
  } catch (err) {
    throw new Error(mapFirebaseError(err));
  }
}

export async function logoutUser() {
  try {
    await signOut(auth);
  } catch (err) {
    throw new Error('লগআউট করতে সমস্যা হয়েছে, আবার চেষ্টা করুন।');
  }
}

// Convert Firebase's cryptic error codes into clear Bangla messages,
// so the user is never confused about what went wrong.
function mapFirebaseError(err) {
  const code = err?.code || '';
  switch (code) {
    case 'auth/email-already-in-use':
      return 'এই ইমেইল দিয়ে আগে থেকেই একাউন্ট আছে।';
    case 'auth/invalid-email':
      return 'সঠিক ইমেইল দিন।';
    case 'auth/weak-password':
      return 'পাসওয়ার্ড কমপক্ষে ৬ ক্যারেক্টার হতে হবে।';
    case 'auth/user-not-found':
    case 'auth/wrong-password':
    case 'auth/invalid-credential':
      return 'ইমেইল অথবা পাসওয়ার্ড ভুল।';
    case 'auth/too-many-requests':
      return 'অনেকবার চেষ্টা করা হয়েছে, কিছুক্ষণ পর আবার চেষ্টা করুন।';
    case 'auth/network-request-failed':
      return 'ইন্টারনেট কানেকশন চেক করুন।';
    default:
      return 'কিছু একটা সমস্যা হয়েছে, আবার চেষ্টা করুন।';
  }
                                     }
