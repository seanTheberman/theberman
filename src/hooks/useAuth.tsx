
import React, { createContext, useContext, useEffect, useRef, useState } from 'react';
import { type User, type Session, type AuthError } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { clearRateLimit } from '../lib/rateLimiter';

interface AuthContextType {
    user: User | null;
    session: Session | null;
    profile: Record<string, unknown> | null;
    loading: boolean;
    role: 'admin' | 'contractor' | 'user' | 'homeowner' | 'business' | null;
    signIn: (email: string, password: string) => Promise<{ data: { user: User | null, session: Session | null }, error: AuthError | null }>;
    signUp: (email: string, password: string, fullName: string, role: 'user' | 'contractor' | 'homeowner' | 'business', phone?: string) => Promise<{ data: { user: User | null, session: Session | null }, error: AuthError | null }>;
    resetPassword: (email: string) => Promise<{ data: Record<string, unknown> | null, error: AuthError | null }>;
    updateUserPassword: (password: string) => Promise<{ data: { user: User | null }, error: AuthError | null }>;
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

    const [profile, setProfile] = useState<Record<string, unknown> | null>(null);
    const isFetchingProfile = useRef(false);

    const fetchProfile = async (userId: string) => {
        if (isFetchingProfile.current) return;
        isFetchingProfile.current = true;
        try {
            // Update last_login first
            await supabase
                .from('profiles')
                .update({ last_login: new Date().toISOString() })
                .eq('id', userId);

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
        } finally {
            isFetchingProfile.current = false;
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
            if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
                // PASSWORD_RECOVERY fires when user clicks the admin-sent magic link.
                // We set the session so UpdatePassword page can call updateUser().
                // INITIAL_SESSION is excluded here because getSession() above already handles it.
                setSession(session);
                setUser(session?.user ?? null);
                if (session?.user?.id) {
                    fetchProfile(session.user.id);
                }
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
        const result = await supabase.auth.updateUser({
            password,
            data: { requires_password_change: false }
        });
        // Immediately sync the updated user into React state.
        // Without this, ProtectedRoute still sees the OLD user with requires_password_change: true
        // when navigate() is called (since onAuthStateChange fires async and too late).
        if (result.data?.user) {
            setUser(result.data.user);
            setSession(prev => prev ? { ...prev, user: result.data.user! } : prev);
            // Clear any rate limiting for this user since they've successfully reset their password
            if (result.data.user.email) {
                clearRateLimit(result.data.user.email);
            }
        }
        return result;
    };

    const signOut = async () => {
        sessionStorage.removeItem('pending_assessor_registration');
        sessionStorage.removeItem('pending_business_registration');
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
