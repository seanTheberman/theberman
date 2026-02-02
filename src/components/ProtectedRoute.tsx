
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('admin' | 'contractor' | 'user' | 'homeowner')[];
}

const ProtectedRoute = ({ children, allowedRoles }: ProtectedRouteProps) => {
    const { user, role, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (!user) {
        // Not logged in -> Go to login
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (allowedRoles && role && !allowedRoles.includes(role)) {
        // Logged in but wrong role -> Go to their respective dashboard
        if (role === 'admin') return <Navigate to="/admin" replace />;
        if (role === 'contractor') return <Navigate to="/dashboard/contractor" replace />;
        return <Navigate to="/dashboard/user" replace />;
    }

    const isContractor = role === 'contractor';
    const { profile } = useAuth();

    // If contractor and missing SEAI number, and NOT already on onboarding page, redirect
    if (isContractor && (!profile?.seai_number || profile?.seai_number.trim() === '') && location.pathname !== '/contractor-onboarding') {
        return <Navigate to="/contractor-onboarding" replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
