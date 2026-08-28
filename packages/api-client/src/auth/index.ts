import type { AuthError, Session, User as SupabaseUser } from "@supabase/supabase-js";
import type { User } from "@repo/types";
import { supabase } from "../client";

// ---- Types ----
export interface AuthResult<T = null> {
  data: T | null;
  error: AuthError | Error | null;
}

export interface SignUpPayload {
  email: string;
  password: string;
  full_name: string;
  preferred_language?: "vi" | "en" | "ko";
}

export interface SignInPayload {
  email: string;
  password: string;
}

// ---- Sign Up (email + password) ----
export async function signUpWithEmail(payload: SignUpPayload): Promise<AuthResult<SupabaseUser>> {
  const { data, error } = await supabase.auth.signUp({
    email: payload.email,
    password: payload.password,
    options: {
      data: {
        full_name: payload.full_name,
        preferred_language: payload.preferred_language ?? "vi",
      },
    },
  });

  if (error) return { data: null, error };
  return { data: data.user, error: null };
}

// ---- Sign In (email + password) ----
export async function signInWithEmail(payload: SignInPayload): Promise<AuthResult<Session>> {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: payload.email,
    password: payload.password,
  });

  if (error) return { data: null, error };
  return { data: data.session, error: null };
}

// ---- OAuth providers (Google / Kakao / Apple) ----
export type OAuthProvider = "google" | "kakao" | "apple";

/**
 * `redirectTo` must be supplied by React Native callers (an app deep link such as
 * `longvonghp://auth/callback`). On the web it defaults to the current origin.
 */
function defaultRedirectTo(): string | undefined {
  if (typeof window === "undefined" || typeof window.location === "undefined") {
    return undefined;
  }
  return `${window.location.origin}/auth/callback`;
}

export async function signInWithOAuth(
  provider: OAuthProvider,
  redirectTo?: string
): Promise<AuthResult<{ url: string | null }>> {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectTo ?? defaultRedirectTo(),
      // Native callers open the returned URL themselves via expo-web-browser.
      skipBrowserRedirect: typeof window === "undefined",
    },
  });

  if (error) return { data: null, error };
  return { data: { url: data?.url ?? null }, error: null };
}

export async function signInWithGoogle(redirectTo?: string): Promise<AuthResult<{ url: string | null }>> {
  return signInWithOAuth("google", redirectTo);
}

// Kakao is the primary provider for the Korean expat audience.
export async function signInWithKakao(redirectTo?: string): Promise<AuthResult<{ url: string | null }>> {
  return signInWithOAuth("kakao", redirectTo);
}

export async function signInWithApple(redirectTo?: string): Promise<AuthResult<{ url: string | null }>> {
  return signInWithOAuth("apple", redirectTo);
}

// ---- Sign Out ----
export async function signOut(): Promise<AuthResult> {
  const { error } = await supabase.auth.signOut();
  return { data: null, error: error ?? null };
}

// ---- Get current session ----
export async function getSession(): Promise<AuthResult<Session>> {
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession();
  if (error) return { data: null, error };
  return { data: session, error: null };
}

// ---- Get current user profile (from public.users table) ----
export async function getCurrentUser(): Promise<AuthResult<User>> {
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) return { data: null, error: authError };

  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("id", user.id)
    .single();

  if (error) return { data: null, error };
  return { data: data as User, error: null };
}

// ---- Update user profile ----
export async function updateUserProfile(
  userId: string,
  updates: Partial<Pick<User, "full_name" | "avatar_url" | "preferred_language">>
): Promise<AuthResult<User>> {
  const { data, error } = await supabase
    .from("users")
    .update(updates)
    .eq("id", userId)
    .select()
    .single();

  if (error) return { data: null, error };
  return { data: data as User, error: null };
}

// ---- Reset password ----
export async function sendPasswordResetEmail(
  email: string,
  redirectTo?: string
): Promise<AuthResult> {
  const fallback =
    typeof window !== "undefined" && typeof window.location !== "undefined"
      ? `${window.location.origin}/auth/reset-password`
      : undefined;

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectTo ?? fallback,
  });
  return { data: null, error: error ?? null };
}

// ---- Subscribe to auth state changes ----
export function onAuthStateChange(
  callback: (session: Session | null) => void
) {
  return supabase.auth.onAuthStateChange((_event, session) => {
    callback(session);
  });
}
