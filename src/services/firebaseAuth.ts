/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signOut,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Configure Google Auth Provider
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.email');
googleProvider.addScope('https://www.googleapis.com/auth/userinfo.profile');
// Force account selection dialog so users can pick any account on their device
googleProvider.setCustomParameters({
  prompt: 'select_account',
});

let cachedAccessToken: string | null = null;

export interface GoogleAuthResult {
  user: User;
  accessToken: string | null;
  email: string;
  displayName: string;
  photoURL: string | null;
}

/**
 * Initiates the real Google sign-in flow.
 * Triggers Google's account picker to select from accounts on the device.
 */
export async function signInWithGoogleDeviceAccounts(): Promise<GoogleAuthResult | null> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;
    const user = result.user;
    const email = user.email || '';

    if (!email) {
      throw new Error('Google account did not provide an email address.');
    }

    return {
      user,
      accessToken: cachedAccessToken,
      email,
      displayName: user.displayName || email.split('@')[0] || 'Google User',
      photoURL: user.photoURL || null,
    };
  } catch (err: unknown) {
    const firebaseError = err as { code?: string; message?: string };
    // Gracefully handle when user closes or cancels the popup
    if (
      firebaseError.code === 'auth/popup-closed-by-user' ||
      firebaseError.code === 'auth/cancelled-popup-request'
    ) {
      return null;
    }
    if (firebaseError.code === 'auth/popup-blocked') {
      throw new Error(
        'The Google sign-in popup was blocked by your browser. Please enable popups or open the app in a new browser tab.'
      );
    }
    if (firebaseError.code === 'auth/unauthorized-domain') {
      throw new Error(
        'Google sign-in domain authorization in progress. You can also use email sign-in/registration below.'
      );
    }
    console.warn('Google Sign-In notice:', firebaseError.message || err);
    const message = err instanceof Error ? err.message : 'Unable to sign in with Google account.';
    throw new Error(message);
  }
}

/**
 * Log out of Firebase
 */
export async function signOutFirebase(): Promise<void> {
  cachedAccessToken = null;
  await signOut(auth);
}

/**
 * Listen to auth state changes
 */
export function onFirebaseAuthStateChanged(
  onUserChanged: (user: User | null) => void
): () => void {
  return onAuthStateChanged(auth, onUserChanged);
}
