import { createContext, useContext } from 'react';
import type { Session, User } from '@supabase/supabase-js';

export type SignUpDetails = {
  email: string;
  firstName: string;
  lastName: string;
  password: string;
};

export type AuthContextValue = {
  getAccessToken: () => Promise<string | null>;
  isConfigured: boolean;
  loading: boolean;
  session: Session | null;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  signUpWithPassword: (
    details: SignUpDetails
  ) => Promise<{ needsEmailConfirmation: boolean }>;
  user: User | null;
};

export const AuthContext = createContext<AuthContextValue | undefined>(
  undefined
);

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }

  return context;
}
