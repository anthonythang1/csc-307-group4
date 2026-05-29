import {
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import {
  isSupabaseConfigured,
  supabase,
} from '../lib/supabaseClient';
import { AuthContext, type AuthContextValue } from './useAuth';

function getSupabaseClient() {
  if (!supabase) {
    throw new Error(
      'Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
    );
  }

  return supabase;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(isSupabaseConfigured);

  useEffect(() => {
    if (!supabase) {
      return undefined;
    }

    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      getAccessToken: async () => {
        const client = getSupabaseClient();
        const { data } = await client.auth.getSession();
        return data.session?.access_token ?? null;
      },
      isConfigured: isSupabaseConfigured,
      loading,
      session,
      signInWithPassword: async (email, password) => {
        const client = getSupabaseClient();
        const { error } = await client.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          throw error;
        }
      },
      signOut: async () => {
        const client = getSupabaseClient();
        const { error } = await client.auth.signOut();

        if (error) {
          throw error;
        }
      },
      signUpWithPassword: async ({
        email,
        firstName,
        lastName,
        password,
      }) => {
        const client = getSupabaseClient();
        const { data, error } = await client.auth.signUp({
          email,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
            },
            emailRedirectTo: window.location.origin,
          },
          password,
        });

        if (error) {
          throw error;
        }

        return { needsEmailConfirmation: !data.session };
      },
      user: session?.user ?? null,
    }),
    [loading, session]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
