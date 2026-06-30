
import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { supabase } from '../lib/supabase';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('admin' | 'contractor' | 'user' | 'homeowner' | 'business')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, role, profile, loading } = useAuth();
    const location = useLocation();

    // If user has an active session but requires_password_change is stuck,
    // clear it automatically. They proved identity by having a valid session.
    useEffect(() => {
        if (user?.user_metadata?.requires_password_change) {
            supabase.auth.updateUser({ data: { requires_password_change: false } });
        }
    }, [user]);

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        // Not logged in -> Go to login (admin-specific if trying to access admin)
        const loginPath = location.pathname.startsWith('/secure-admin-portal') ? '/secure-admin-login' : '/login';
        return <Navigate to={loginPath} state={{ from: location }} replace />;
    }

    if (allowedRoles && (!role || !allowedRoles.includes(role))) {
        // Logged in but wrong role -> Go to their respective dashboard
        if (role === 'admin') return <Navigate to="/secure-admin-portal" replace />;
        if (role === 'contractor') return <Navigate to="/dashboard/ber-assessor" replace />;
        if (role === 'business') return <Navigate to="/dashboard/business" replace />;
        return <Navigate to="/dashboard/user" replace />;
    }

    // Stage 1 Gating: Redirect pending businesses to membership payment if they haven't paid
    if (role === 'business' && profile?.registration_status === 'pending' &&
        location.pathname !== '/business-onboarding' &&
        location.pathname !== '/assessor-onboarding' &&
        location.pathname !== '/membership-payment' &&
        location.pathname !== '/registration-pending') {
        return <Navigate to="/membership-payment" replace />;
    }

    // If role is business but registration status is NOT pending/active, send to onboarding
    if (role === 'business' && !profile?.registration_status && location.pathname !== '/business-onboarding') {
        return <Navigate to="/business-onboarding" replace />;
    }

    const isContractor = role === 'contractor';

    // If contractor hasn't completed onboarding yet (no registration_status and no home_county) → redirect
    if (isContractor && !profile?.registration_status && !profile?.home_county && location.pathname !== '/assessor-onboarding') {
        return <Navigate to="/assessor-onboarding" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
