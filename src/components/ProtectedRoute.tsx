import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRoles?: string[];
    requireAuth?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
    children,
    requiredRoles = [],
    requireAuth = true,
}) => {
    const { isAuthenticated, isLoading, hasAnyRole, user } = useAuth();
    const location = useLocation();

    // Show loading state while checking authentication
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // Redirect to login if authentication is required but user is not authenticated
    if (requireAuth && !isAuthenticated) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    // Check role-based access
    if (requiredRoles.length > 0 && !hasAnyRole(requiredRoles)) {
        // Redirect to appropriate page based on user role
        if (user?.roles?.includes('admin')) {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user?.roles?.includes('freelancer')) {
            return <Navigate to="/dashboard" replace />;
        } else if (user?.roles?.includes('client')) {
            return <Navigate to="/dashboard" replace />;
        }

        // Fallback: redirect to home with error message
        return <Navigate to="/" replace />;
    }

    return <>{children}</>;
};

interface PublicRouteProps {
    children: React.ReactNode;
    redirectTo?: string;
}

export const PublicRoute: React.FC<PublicRouteProps> = ({
    children,
    redirectTo = '/dashboard',
}) => {
    const { isAuthenticated, isLoading, user } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    // If user is authenticated, redirect to appropriate dashboard
    if (isAuthenticated && user) {
        // Dynamic redirect based on user role
        if (user.roles?.includes('admin')) {
            return <Navigate to="/admin/dashboard" replace />;
        } else if (user.roles?.includes('freelancer')) {
            return <Navigate to="/dashboard" replace />;
        } else if (user.roles?.includes('client')) {
            return <Navigate to="/dashboard" replace />;
        }

        return <Navigate to={redirectTo} replace />;
    }

    return <>{children}</>;
};
