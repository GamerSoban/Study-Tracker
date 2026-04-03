import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { FirebaseAuth, isNative } from '@/lib/firebasePlugins';

interface AuthUser {
  uid: string;
  email: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  isNativePlatform: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const refreshUser = useCallback(async () => {
    try {
      const result = await FirebaseAuth.getCurrentUser();
      if (result.isLoggedIn && result.uid && result.email) {
        setUser({ uid: result.uid, email: result.email });
      } else {
        setUser(null);
      }
    } catch {
      setUser(null);
    }
  }, []);

  useEffect(() => {
    refreshUser().finally(() => setIsLoading(false));
  }, [refreshUser]);

  const signIn = async (email: string, password: string) => {
    const result = await FirebaseAuth.signIn({ email, password });
    setUser({ uid: result.uid, email: result.email });
  };

  const signUp = async (email: string, password: string) => {
    const result = await FirebaseAuth.signUp({ email, password });
    setUser({ uid: result.uid, email: result.email });
  };

  const signOut = async () => {
    await FirebaseAuth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isLoggedIn: !!user,
      isLoading,
      isNativePlatform: isNative,
      signIn,
      signUp,
      signOut,
      refreshUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
