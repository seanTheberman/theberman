
import React, { createContext, useContext, useEffect, useState } from 'react';
import { type User, type Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: any | null;
    loading: boolean;
    role: 'admin' | 'contractor' | 'user' | 'homeowner' | 'business' | null;
    signIn: (email: string, password: string) => Promise<{ data: { user: User | null, session: Session | null }, error: any }>;
    signUp: (email: string, password: string, fullName: string, role: 'user' | 'contractor' | 'homeowner' | 'business', phone?: string) => Promise<{ data: { user: User | null, session: Session | null }, error: any }>;
    resetPassword: (email: string) => Promise<{ data: any, error: any }>;
    updateUserPassword: (password: string) => Promise<{ data: { user: User | null }, error: any }>;
    signOut: () => Promise<void>;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [session, setSession] = useState<Session | null>(null);
    const [role, setRole] = useState<'admin' | 'contractor' | 'user' | 'homeowner' | 'business' | null>(null);
    const [loading, setLoading] = useState(true);
    const [isInitialCheckDone, setIsInitialCheckDone] = useState(false);

    const [profile, setProfile] = useState<any | null>(null);

    const fetchProfile = async (userId: string) => {
        try {
            const { data } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .maybeSingle();

            if (data) {
                setRole(data.role);
                // Fallback for registration_status from user metadata if missing in profile table
                const profileWithMetadata = {
                    ...data,
                    registration_status: data.registration_status || user?.user_metadata?.registration_status
                };
                setProfile(profileWithMetadata);
            } else {
                setRole('user');
                setProfile(null);
            }
        } catch (err) {
            console.error('Error fetching profile:', err);
            setRole('user');
            setProfile(null);
        }
    };

    useEffect(() => {
        // Initial session check
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setUser(session?.user ?? null);
            if (session?.user) {
                fetchProfile(session.user.id).finally(() => {
                    setLoading(false);
                    setIsInitialCheckDone(true);
                });
            } else {
                setRole(null);
                setLoading(false);
                setIsInitialCheckDone(true);
            }
        });

        // Listen for changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            // Only update state if it changed to prevent unnecessary re-renders
            // But always fetch profile on sign in
            if (event === 'SIGNED_IN') {
                setSession(session);
                setUser(session?.user ?? null);
                fetchProfile(session?.user?.id || '');
            } else if (event === 'SIGNED_OUT') {
                setSession(null);
                setUser(null);
                setRole(null);
                setLoading(false);
            }
        });

        return () => subscription.unsubscribe();
    }, []);

    const signIn = async (email: string, password: string) => {
        setLoading(true);
        try {
            const result = await supabase.auth.signInWithPassword({ email, password });

            if (result.data.user) {
                setSession(result.data.session);
                setUser(result.data.user);
                await fetchProfile(result.data.user.id);
            }

            return result;
        } finally {
            setLoading(false);
        }
    };

    const signUp = async (email: string, password: string, fullName: string, role: 'user' | 'contractor' | 'homeowner' | 'business', phone?: string) => {
        return await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: fullName,
                    role: role,
                    phone: phone,
                    registration_status: (role === 'business' || role === 'contractor') ? 'pending' : 'active',
                },
            },
        });
    };

    const resetPassword = async (email: string) => {
        return await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: window.location.origin + '/update-password',
        });
    };

    const updateUserPassword = async (password: string) => {
        return await supabase.auth.updateUser({ password });
    };

    const signOut = async () => {
        await supabase.auth.signOut();
        setRole(null);
        setUser(null);
        setSession(null);
    };

    const refreshProfile = async () => {
        if (user) {
            await fetchProfile(user.id);
        }
    };

    return (
        <AuthContext.Provider value={{ user, session, profile, loading, role, signIn, signUp, resetPassword, updateUserPassword, signOut, refreshProfile }}>
            {isInitialCheckDone ? children : (
                <div className="min-h-screen flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#007F00]"></div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
