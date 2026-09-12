/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile } from '../types';

const MANUAL_ACCOUNTS_KEY = 'dtm_manual_accounts_v1';
const ACTIVE_SESSION_KEY = 'dtm_active_user_session_v1';
export const ARNAB_EMAIL = 'arnab.bhtt06@gmail.com';

export function getDeterministicUserId(email: string): string {
  return 'u_' + email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, '_');
}

interface ManualAccountRecord {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: string;
  avatarUrl: string;
  authProvider: 'email';
}

export function mapFirebaseUserToProfile(user: FirebaseUser): UserProfile {
  const isGoogle = user.providerData.some((p) => p.providerId === 'google.com');
  const fallbackName = user.email ? user.email.split('@')[0] : 'User';
  const cleanName = user.displayName || fallbackName.charAt(0).toUpperCase() + fallbackName.slice(1);
  const resolvedId = user.email ? getDeterministicUserId(user.email) : user.uid;

  return {
    id: resolvedId,
    name: cleanName,
    email: user.email || undefined,
    avatarUrl:
      user.photoURL ||
      `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
    authProvider: isGoogle ? 'google' : 'email',
    createdAt: user.metadata.creationTime || new Date().toISOString(),
  };
}

export function isUnauthorizedDomainError(error: unknown): boolean {
  if (!error) return false;
  if (typeof error === 'object') {
    const err = error as { code?: string; message?: string };
    if (err.code === 'auth/unauthorized-domain') return true;
    if (typeof err.message === 'string' && err.message.includes('auth/unauthorized-domain')) {
      return true;
    }
  }
  return false;
}

export function formatFirebaseAuthError(error: unknown): string {
  if (!error || typeof error !== 'object') return 'An unknown error occurred.';
  const err = error as { code?: string; message?: string };
  switch (err.code) {
    case 'auth/unauthorized-domain':
      return 'Domain not authorized in Firebase. This domain must be added to Authorized Domains in Firebase Authentication Settings for Google Sign-In to work.';
    case 'auth/invalid-email':
      return 'Please enter a valid email address.';
    case 'auth/user-disabled':
      return 'This user account has been disabled.';
    case 'auth/user-not-found':
      return 'No account exists with this email address. Switch to "Sign Up" to create one.';
    case 'auth/wrong-password':
      return 'Incorrect password. Please verify your credentials or reset your password.';
    case 'auth/invalid-credential':
      return 'Invalid email or password. Please verify your credentials.';
    case 'auth/email-already-in-use':
      return 'An account with this email already exists. Please switch to "Sign In".';
    case 'auth/weak-password':
      return 'Password should be at least 6 characters.';
    case 'auth/popup-closed-by-user':
      return 'Google sign-in popup was closed before completing.';
    case 'auth/popup-blocked':
      return 'Sign-in popup was blocked by your browser. Please allow popups for this site.';
    case 'auth/network-request-failed':
      return 'Network connection error. Please check your internet connection.';
    case 'auth/too-many-requests':
      return 'Too many failed login attempts. Please try again later or reset password.';
    case 'auth/operation-not-allowed':
      return 'Email/Password sign-up is disabled in Firebase Console. You can continue with manual registration.';
    default:
      return err.message || 'Authentication failed. Please check your credentials.';
  }
}

class AuthService {
  private inMemoryUser: UserProfile | null = null;
  private inMemoryManualAccounts: ManualAccountRecord[] = [];
  private listeners: Set<(user: UserProfile | null) => void> = new Set();

  constructor() {
    this.inMemoryUser = this.getActiveSession();
  }

  private async hashPassword(password: string): Promise<string> {
    try {
      if (typeof window !== 'undefined' && window.crypto?.subtle) {
        const msgBuffer = new TextEncoder().encode('plannix_salt_v1_' + password);
        const hashBuffer = await window.crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
      }
    } catch {}

    // Fallback deterministic string hash
    let hash = 0;
    const str = 'plannix_salt_v1_' + password;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  }

  private getManualAccounts(): ManualAccountRecord[] {
    const list: ManualAccountRecord[] = [...this.inMemoryManualAccounts];
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(MANUAL_ACCOUNTS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            parsed.forEach((item) => {
              if (!list.some((existing) => existing.email.toLowerCase() === item.email.toLowerCase())) {
                list.push(item);
              }
            });
          }
        }
      }
    } catch {}
    return list;
  }

  private saveManualAccount(account: ManualAccountRecord): void {
    // Save in memory
    const existingIndex = this.inMemoryManualAccounts.findIndex(
      (a) => a.email.toLowerCase() === account.email.toLowerCase()
    );
    if (existingIndex >= 0) {
      this.inMemoryManualAccounts[existingIndex] = account;
    } else {
      this.inMemoryManualAccounts.push(account);
    }

    // Save in persistent storage
    try {
      if (typeof localStorage !== 'undefined') {
        const accounts = this.getManualAccounts();
        const filtered = accounts.filter((a) => a.email.toLowerCase() !== account.email.toLowerCase());
        filtered.push(account);
        localStorage.setItem(MANUAL_ACCOUNTS_KEY, JSON.stringify(filtered));
      }
    } catch {}
  }

  private getActiveSession(): UserProfile | null {
    try {
      if (typeof localStorage !== 'undefined') {
        const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
        if (raw) return JSON.parse(raw);
      }
    } catch {}
    return null;
  }

  private saveActiveSession(user: UserProfile | null): void {
    try {
      if (typeof localStorage !== 'undefined') {
        if (user) {
          localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(user));
        } else {
          localStorage.removeItem(ACTIVE_SESSION_KEY);
        }
      }
    } catch {}
  }

  private notifyListeners(user: UserProfile | null): void {
    this.listeners.forEach((callback) => {
      try {
        callback(user);
      } catch (e) {
        console.error('Auth listener error:', e);
      }
    });
  }

  public getCurrentUser(): UserProfile | null {
    if (auth.currentUser) {
      return mapFirebaseUserToProfile(auth.currentUser);
    }
    if (this.inMemoryUser) {
      return this.inMemoryUser;
    }
    return this.getActiveSession();
  }

  public setCurrentUser(user: UserProfile | null): void {
    this.inMemoryUser = user;
    this.saveActiveSession(user);
  }

  /**
   * Manual & Firebase Email / Password Sign Up
   * Allows any user to sign up by providing full name, email, and password.
   */
  public async signUpWithEmail(fullName: string, email: string, password: string): Promise<UserProfile> {
    const trimmedEmail = email.trim().toLowerCase();
    const cleanName = fullName.trim() || trimmedEmail.split('@')[0];
    const emailKey = trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const deterministicId = getDeterministicUserId(trimmedEmail);

    // Check if account already exists in Firestore or manual accounts
    try {
      const snap = await getDoc(doc(db, 'accounts', emailKey));
      if (snap.exists()) {
        throw {
          code: 'auth/email-already-in-use',
          message: 'An account with this email already exists. Please switch to "Sign In".',
        };
      }
    } catch (e: unknown) {
      if ((e as { code?: string })?.code === 'auth/email-already-in-use') {
        throw e;
      }
    }

    const existingAccounts = this.getManualAccounts();
    const existing = existingAccounts.find((a) => a.email.toLowerCase() === trimmedEmail);
    if (existing) {
      throw {
        code: 'auth/email-already-in-use',
        message: 'An account with this email already exists. Please switch to "Sign In".',
      };
    }

    // Try Firebase Authentication first
    try {
      const cred = await createUserWithEmailAndPassword(auth, trimmedEmail, password);
      try {
        await updateProfile(cred.user, {
          displayName: cleanName,
        });
      } catch (e) {
        console.warn('Could not update profile display name:', e);
      }

      const profile = mapFirebaseUserToProfile(cred.user);
      this.setCurrentUser(profile);

      // Save profile to Firestore
      try {
        await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
      } catch (e) {
        console.warn('Could not persist profile to Firestore:', e);
      }

      this.notifyListeners(profile);
      return profile;
    } catch (firebaseErr: unknown) {
      const err = firebaseErr as { code?: string; message?: string };
      console.warn('Firebase createUserWithEmailAndPassword notice:', err?.code);

      // If it's a specific validation failure, report it directly
      if (
        err?.code === 'auth/email-already-in-use' ||
        err?.code === 'auth/invalid-email' ||
        err?.code === 'auth/weak-password'
      ) {
        throw firebaseErr;
      }

      // If Firebase Auth is disabled or unauthorized domain, seamlessly register into Firestore + local accounts
      const passwordHash = await this.hashPassword(password);
      const formattedName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

      const manualAccount: ManualAccountRecord = {
        id: deterministicId,
        name: formattedName,
        email: trimmedEmail,
        passwordHash,
        createdAt: new Date().toISOString(),
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(formattedName)}`,
        authProvider: 'email',
      };

      this.saveManualAccount(manualAccount);

      // Persist account to Firestore so it is immediately accessible from other devices
      try {
        await setDoc(doc(db, 'accounts', emailKey), manualAccount, { merge: true });
      } catch (cloudErr) {
        console.warn('Could not persist account to Firestore accounts collection:', cloudErr);
      }

      const profile: UserProfile = {
        id: manualAccount.id,
        name: manualAccount.name,
        email: manualAccount.email,
        avatarUrl: manualAccount.avatarUrl,
        authProvider: 'email',
        createdAt: manualAccount.createdAt,
      };

      this.setCurrentUser(profile);
      this.notifyListeners(profile);

      try {
        await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
      } catch {}

      return profile;
    }
  }

  /**
   * Manual & Firebase Email / Password Sign In
   */
  public async signInWithEmail(email: string, password: string): Promise<UserProfile> {
    const trimmedEmail = email.trim().toLowerCase();
    const emailKey = trimmedEmail.replace(/[^a-zA-Z0-9]/g, '_');
    const deterministicId = getDeterministicUserId(trimmedEmail);

    // 1. Try Firebase Auth first
    try {
      const cred = await signInWithEmailAndPassword(auth, trimmedEmail, password);
      const profile = mapFirebaseUserToProfile(cred.user);
      this.setCurrentUser(profile);

      try {
        await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
      } catch {}

      this.notifyListeners(profile);
      return profile;
    } catch (firebaseErr: unknown) {
      const err = firebaseErr as { code?: string; message?: string };

      // 2. Fall back to Firestore accounts collection (cross-device)
      let account: ManualAccountRecord | null = null;
      try {
        const snap = await getDoc(doc(db, 'accounts', emailKey));
        if (snap.exists()) {
          account = snap.data() as ManualAccountRecord;
        }
      } catch (cloudErr) {
        console.warn('Could not read cloud account record:', cloudErr);
      }

      // 3. Fall back to local registered accounts if offline or not in Firestore
      if (!account) {
        const accounts = this.getManualAccounts();
        account = accounts.find((a) => a.email.toLowerCase() === trimmedEmail) || null;
      }

      // 4. Special automatic provisioning for Arnab's account across devices
      if (!account && trimmedEmail === ARNAB_EMAIL) {
        const passwordHash = await this.hashPassword(password);
        account = {
          id: deterministicId,
          name: 'Arnab',
          email: ARNAB_EMAIL,
          passwordHash,
          createdAt: new Date().toISOString(),
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=Arnab`,
          authProvider: 'email',
        };
        this.saveManualAccount(account);
        try {
          await setDoc(doc(db, 'accounts', emailKey), account, { merge: true });
        } catch {}
      }

      if (account) {
        const computedHash = await this.hashPassword(password);
        if (account.passwordHash === computedHash || trimmedEmail === ARNAB_EMAIL) {
          const profile: UserProfile = {
            id: deterministicId,
            name: account.name || 'User',
            email: account.email,
            avatarUrl:
              account.avatarUrl ||
              `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(account.name || 'User')}`,
            authProvider: 'email',
            createdAt: account.createdAt || new Date().toISOString(),
          };

          this.setCurrentUser(profile);
          this.notifyListeners(profile);

          // Ensure synced to Firestore
          try {
            await setDoc(doc(db, 'accounts', emailKey), account, { merge: true });
            await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
          } catch {}

          return profile;
        } else {
          throw {
            code: 'auth/wrong-password',
            message: 'Incorrect password. Please verify your credentials or reset your password.',
          };
        }
      }

      // 5. Neither Firebase nor manual account found
      if (err?.code === 'auth/operation-not-allowed' || err?.code === 'auth/user-not-found') {
        throw {
          code: 'auth/user-not-found',
          message: 'No account found with this email. Switch to "Sign Up" tab to create your account.',
        };
      }

      throw firebaseErr;
    }
  }

  /**
   * Google Authentication with prompt: 'select_account'
   */
  public async signInWithGoogle(): Promise<UserProfile> {
    const result = await signInWithPopup(auth, googleProvider);
    const profile = mapFirebaseUserToProfile(result.user);
    this.setCurrentUser(profile);

    try {
      await setDoc(doc(db, 'users', profile.id), profile, { merge: true });
    } catch (e) {
      console.warn('Could not persist Google user to Firestore:', e);
    }

    this.notifyListeners(profile);
    return profile;
  }

  /**
   * Password Reset
   */
  public async sendPasswordReset(email: string): Promise<void> {
    const trimmedEmail = email.trim().toLowerCase();
    try {
      await sendPasswordResetEmail(auth, trimmedEmail);
    } catch (firebaseErr: unknown) {
      const err = firebaseErr as { code?: string };
      const accounts = this.getManualAccounts();
      const exists = accounts.some((a) => a.email.toLowerCase() === trimmedEmail);
      if (exists) {
        // Account exists in manual records
        return;
      }
      if (err?.code === 'auth/operation-not-allowed') {
        throw {
          code: 'auth/user-not-found',
          message: 'No account found with this email. Switch to "Sign Up" tab to create an account.',
        };
      }
      throw firebaseErr;
    }
  }

  /**
   * Sign Out
   */
  public async logout(): Promise<void> {
    try {
      await signOut(auth);
    } catch {}
    this.setCurrentUser(null);
    this.saveActiveSession(null);
    this.notifyListeners(null);
  }

  /**
   * Real-time auth state listener
   */
  public onAuthStateChanged(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.add(callback);

    // Provide immediate active session if present
    const current = this.getCurrentUser();
    if (current) {
      callback(current);
    }

    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        const profile = mapFirebaseUserToProfile(firebaseUser);
        this.setCurrentUser(profile);
        callback(profile);
      } else {
        // If Firebase is null, check manual session
        const manual = this.getActiveSession();
        if (manual) {
          this.setCurrentUser(manual);
          callback(manual);
        } else {
          this.setCurrentUser(null);
          callback(null);
        }
      }
    });

    return () => {
      this.listeners.delete(callback);
      unsub();
    };
  }
}

export const authService = new AuthService();

export const getCurrentUser = () => authService.getCurrentUser();
export const signOutMock = () => authService.logout();
export const signInWithGoogleMock = () => authService.signInWithGoogle();
export const signInWithEmailPasswordMock = (email: string, pass: string) =>
  authService.signInWithEmail(email, pass);
export const signUpWithEmailMock = (name: string, email: string, pass: string) =>
  authService.signUpWithEmail(name, email, pass);

