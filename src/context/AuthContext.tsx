'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { UserProfile } from '../types';

interface AuthResponse {
  success: boolean;
  error?: string;
  requiresEmailConfirmation?: boolean;
  message?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResponse>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Helper to load or sync user profile
  const fetchProfile = async (currentUser: User) => {
    const metaName =
      currentUser.user_metadata?.name ||
      currentUser.user_metadata?.full_name ||
      currentUser.email?.split('@')[0] ||
      'সম্মানিত পাঠক';

    const defaultProfile: UserProfile = {
      id: currentUser.id,
      name: metaName,
      email: currentUser.email || '',
      phone: currentUser.phone || '',
      created_at: currentUser.created_at,
      updated_at: new Date().toISOString(),
    };

    setProfile(defaultProfile);

    // Also attempt to read from public.profiles table if present
    if (isSupabaseConfigured() && supabase) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', currentUser.id)
          .maybeSingle();

        if (!error && data) {
          setProfile({
            id: data.id,
            name: data.name || metaName,
            email: data.email || currentUser.email || '',
            phone: data.phone || '',
            created_at: data.created_at,
            updated_at: data.updated_at,
          });
        } else if (!data) {
          // If trigger hasn't populated profile yet, attempt safe insert
          await supabase.from('profiles').upsert({
            id: currentUser.id,
            name: metaName,
            email: currentUser.email || '',
          });
        }
      } catch (err) {
        // Non-blocking: profile falls back to user_metadata safely
        console.warn('[Auth] Note fetching profile from table:', err);
      }
    }
  };

  useEffect(() => {
    let isMounted = true;

    if (!isSupabaseConfigured() || !supabase) {
      setIsLoading(false);
      return;
    }

    // 1. Restore existing session on mount (refresh / tab restore)
    supabase.auth
      .getSession()
      .then(({ data: { session: currentSession }, error }) => {
        if (!isMounted) return;
        if (error) {
          console.warn('[Auth] Error getting session:', error.message);
        }
        setSession(currentSession);
        setUser(currentSession?.user ?? null);
        if (currentSession?.user) {
          fetchProfile(currentSession.user);
        }
      })
      .catch((err) => {
        console.warn('[Auth] Exception restoring session:', err);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    // 2. Listen to real-time auth changes (login, logout, token refresh, password recovery)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, newSession) => {
      if (!isMounted) return;

      setSession(newSession);
      const newUser = newSession?.user ?? null;
      setUser(newUser);

      if (newUser) {
        fetchProfile(newUser);
      } else {
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  /**
   * Normal User Sign Up with Name, Email, Password
   */
  const signUp = async (name: string, email: string, password: string): Promise<AuthResponse> => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      return { success: false, error: 'দয়া করে আপনার নাম প্রদান করুন।' };
    }
    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'দয়া করে একটি সঠিক ইমেইল এড্রেস প্রদান করুন।' };
    }
    if (!password || password.length < 6) {
      return { success: false, error: 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।' };
    }

    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        error: 'Supabase ডাটাবেজ কানেকশন পাওয়া যায়নি। দয়া করে পরিবেশ পরিবর্তনশীলগুলো চেক করুন।',
      };
    }

    try {
      const { data, error } = await supabase.auth.signUp({
        email: trimmedEmail,
        password,
        options: {
          data: {
            name: trimmedName,
            full_name: trimmedName,
          },
        },
      });

      if (error) {
        let bengaliError = error.message;

        if (
          error.message.toLowerCase().includes('already registered') ||
          error.message.toLowerCase().includes('already in use') ||
          error.status === 422
        ) {
          bengaliError = 'এই ইমেইলটি ইতিমধ্যে ব্যবহৃত হয়েছে। অনুগ্রহ করে লগইন করুন।';
        } else if (error.message.toLowerCase().includes('password should be at least')) {
          bengaliError = 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে।';
        } else if (error.message.toLowerCase().includes('valid email')) {
          bengaliError = 'দয়া করে একটি সঠিক ইমেইল এড্রেস লিখুন।';
        }

        return { success: false, error: bengaliError };
      }

      // Check if email confirmation is required by Supabase Auth configuration
      // When email confirmation is enabled, data.user is created but data.session is null until confirmed.
      const requiresConfirmation = Boolean(data.user && !data.session);

      if (data.user && data.session) {
        setUser(data.user);
        setSession(data.session);
        fetchProfile(data.user);
      }

      return {
        success: true,
        requiresEmailConfirmation: requiresConfirmation,
        message: requiresConfirmation
          ? 'আপনার রেজিস্ট্রেশন সফল হয়েছে! অ্যাকাউন্ট নিশ্চিত করতে আপনার ইমেইল চেক করুন।'
          : 'স্বাগতম! আপনার অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে।',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'রেজিস্ট্রেশনের সময় অভ্যন্তরীণ ত্রুটি হয়েছে।',
      };
    }
  };

  /**
   * Normal User Log In with Email and Password
   */
  const signIn = async (email: string, password: string): Promise<AuthResponse> => {
    const trimmedEmail = email.trim();

    if (!trimmedEmail || !trimmedEmail.includes('@')) {
      return { success: false, error: 'দয়া করে আপনার নিবন্ধিত ইমেইল এড্রেস প্রদান করুন।' };
    }
    if (!password) {
      return { success: false, error: 'পাসওয়ার্ড প্রদান করা আবশ্যক।' };
    }

    if (!isSupabaseConfigured() || !supabase) {
      return {
        success: false,
        error: 'Supabase ডাটাবেজ কানেকশন পাওয়া যায়নি।',
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        let bengaliError = error.message;

        if (
          error.message.toLowerCase().includes('invalid login credentials') ||
          error.message.toLowerCase().includes('invalid credentials')
        ) {
          bengaliError = 'ভুল ইমেইল বা পাসওয়ার্ড প্রদান করেছেন! পুনরায় চেষ্টা করুন।';
        } else if (error.message.toLowerCase().includes('email not confirmed')) {
          bengaliError = 'আপনার ইমেইলটি এখনও কনফার্ম করা হয়নি। অনুগ্রহ করে ইনবক্স চেক করে ইমেইল ভেরিফাই করুন।';
        }

        return { success: false, error: bengaliError };
      }

      if (data.session && data.user) {
        setSession(data.session);
        setUser(data.user);
        fetchProfile(data.user);
      }

      return {
        success: true,
        message: 'লগইন সফল হয়েছে! স্বাগতম শেষের পাতায়।',
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'লগইন করার সময় অভ্যন্তরীণ সমস্যা দেখা দিয়েছে।',
      };
    }
  };

  /**
   * Log out current normal user
   */
  const signOut = async () => {
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.warn('[Auth] Error signing out:', err);
      }
    }
    setUser(null);
    setSession(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    if (user) {
      await fetchProfile(user);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        profile,
        isLoading,
        signIn,
        signUp,
        signOut,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
