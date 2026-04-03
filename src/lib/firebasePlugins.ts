import { Capacitor, registerPlugin } from '@capacitor/core';

interface FirebaseAuthPlugin {
  getCurrentUser(): Promise<{ uid?: string; email?: string; isLoggedIn: boolean }>;
  signUp(options: { email: string; password: string }): Promise<{ uid: string; email: string; isLoggedIn: boolean }>;
  signIn(options: { email: string; password: string }): Promise<{ uid: string; email: string; isLoggedIn: boolean }>;
  signOut(): Promise<{ success: boolean }>;
}

interface FirestoreSyncPlugin {
  uploadSessions(options: { sessions: any[] }): Promise<{ success: boolean }>;
  downloadSessions(): Promise<{ sessions: any[] }>;
  deleteSession(options: { sessionId: string }): Promise<{ success: boolean }>;
  deleteAllSessions(): Promise<{ success: boolean }>;
}

const isNative = Capacitor.isNativePlatform();

const FirebaseAuthNative = isNative ? registerPlugin<FirebaseAuthPlugin>('FirebaseAuth') : null;
const FirestoreSyncNative = isNative ? registerPlugin<FirestoreSyncPlugin>('FirestoreSync') : null;

// Stub implementations for web (non-native) — accounts only work on Android
const stubAuth: FirebaseAuthPlugin = {
  getCurrentUser: async () => ({ isLoggedIn: false }),
  signUp: async () => { throw new Error('Accounts are only available in the Android app'); },
  signIn: async () => { throw new Error('Accounts are only available in the Android app'); },
  signOut: async () => ({ success: true }),
};

const stubSync: FirestoreSyncPlugin = {
  uploadSessions: async () => ({ success: false }),
  downloadSessions: async () => ({ sessions: [] }),
  deleteSession: async () => ({ success: false }),
  deleteAllSessions: async () => ({ success: false }),
};

export const FirebaseAuth = FirebaseAuthNative ?? stubAuth;
export const FirestoreSync = FirestoreSyncNative ?? stubSync;
export { isNative };
