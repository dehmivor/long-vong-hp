import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Session } from '@supabase/supabase-js';
import type { User } from '@repo/types';
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { isSupabaseReady } from '@/constants/supabase';

interface AuthContextValue {
  session: Session | null;
  user: User | null;
  /** True while the persisted session is being restored. */
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signUp: (
    email: string,
    password: string,
    fullName: string,
  ) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  user: null,
  loading: true,
  signIn: async () => ({ error: 'Supabase is not configured' }),
  signUp: async () => ({ error: 'Supabase is not configured' }),
  signOut: async () => {},
  refreshUser: async () => {},
});

export function useAuth(): AuthContextValue {
  return useContext(AuthContext);
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(isSupabaseReady);

  const loadProfile = useCallback(async (active: Session | null) => {
    if (!active) {
      setUser(null);
      return;
    }
    try {
      const { getCurrentUser } = await import('@repo/api-client/auth');
      const { data } = await getCurrentUser();
      setUser(data);
    } catch {
      // The session is still valid even if the profile row cannot be read;
      // screens fall back to the auth email.
      setUser(null);
    }
  }, []);

  useEffect(() => {
    if (!isSupabaseReady) {
      setLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;
    let cancelled = false;

    (async () => {
      // Registered before any auth call so supabase-js persists the session
      // in AsyncStorage instead of its in-memory fallback.
      const { setAuthStorage } = await import('@repo/api-client');
      setAuthStorage(AsyncStorage);

      const { getSession, onAuthStateChange } = await import('@repo/api-client/auth');
      const { data } = await getSession();
      if (cancelled) return;

      setSession(data);
      await loadProfile(data);
      setLoading(false);

      const { data: listener } = onAuthStateChange((next) => {
        setSession(next);
        void loadProfile(next);
      });
      unsubscribe = () => listener.subscription.unsubscribe();
    })().catch(() => {
      if (!cancelled) setLoading(false);
    });

    return () => {
      cancelled = true;
      unsubscribe?.();
    };
  }, [loadProfile]);

  const signIn = useCallback<AuthContextValue['signIn']>(async (email, password) => {
    if (!isSupabaseReady) return { error: 'Supabase is not configured' };
    try {
      const { signInWithEmail } = await import('@repo/api-client/auth');
      const { error } = await signInWithEmail({ email, password });
      return { error: error ? message(error) : null };
    } catch (err) {
      return { error: message(err) };
    }
  }, []);

  const signUp = useCallback<AuthContextValue['signUp']>(async (email, password, fullName) => {
    if (!isSupabaseReady) return { error: 'Supabase is not configured' };
    try {
      const { signUpWithEmail } = await import('@repo/api-client/auth');
      const { error } = await signUpWithEmail({ email, password, full_name: fullName });
      return { error: error ? message(error) : null };
    } catch (err) {
      return { error: message(err) };
    }
  }, []);

  const signOut = useCallback(async () => {
    if (!isSupabaseReady) return;
    try {
      const { signOut: doSignOut } = await import('@repo/api-client/auth');
      await doSignOut();
    } finally {
      setSession(null);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await loadProfile(session);
  }, [loadProfile, session]);

  const value = useMemo<AuthContextValue>(
    () => ({ session, user, loading, signIn, signUp, signOut, refreshUser }),
    [session, user, loading, signIn, signUp, signOut, refreshUser],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
