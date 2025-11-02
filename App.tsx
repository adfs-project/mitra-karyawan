// FIX: The file content was placeholder text. Replaced it with the root application component, setting up providers and routing.
import React, { Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { HealthProvider } from './contexts/HealthContext';
import { MarketplaceProvider } from './contexts/MarketplaceContext';
import { HRProvider } from './contexts/HRContext';
import { PersonalizationProvider } from './contexts/PersonalizationContext';
import { routes, rolePermissions, RouteConfig } from './routing/routeConfig';
import { Role } from './types';
import ToastContainer from './components/common/ToastContainer';
import ErrorBoundary from './components/common/ErrorBoundary';
import RecoveryUI from './components/common/RecoveryUI';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import HrLayout from './components/layout/HrLayout';
import FinanceLayout from './components/layout/FinanceLayout';

const CenteredLoading: React.FC = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-text-primary">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const getHomeRoute = (user: any) => {
    if (!user) return '/login';
    switch (user.role) {
        case Role.Admin: return '/admin/dashboard';
        case Role.HR: return '/hr-portal';
        case Role.Finance: return '/finance/dashboard';
        default: return '/home';
    }
};

// FIX: New component to handle access denied logic safely without violating Rules of Hooks.
const AccessDeniedRedirect: React.FC<{ redirectTo: string }> = ({ redirectTo }) => {
    const { showToast } = useApp();
    useEffect(() => {
        showToast("Akses ditolak: Anda tidak memiliki izin yang diperlukan.", "error");
    }, [showToast]);
    return <Navigate to={redirectTo} replace />;
};


const RouteRenderer: React.FC<{ route: RouteConfig }> = ({ route }) => {
    // FIX: All hook calls are moved to the top level to conform to the Rules of Hooks.
    const { user } = useAuth();
    const location = useLocation();

    const PageComponent = <Suspense fallback={<CenteredLoading />}><route.component /></Suspense>;

    const renderWithLayout = (component: React.ReactNode) => {
        switch (route.layout) {
            case 'user': return <UserLayout>{component}</UserLayout>;
            case 'admin': return <AdminLayout>{component}</AdminLayout>;
            case 'hr': return <HrLayout>{component}</HrLayout>;
            case 'finance': return <FinanceLayout>{component}</FinanceLayout>;
            default: return component;
        }
    };
    
    // --- New Explicit Routing Logic ---

    // 1. Handle users who are NOT logged in
    if (!user) {
        // If they try to access a private page, redirect them to login.
        if (route.isPrivate) {
            return <Navigate to="/login" state={{ from: location }} replace />;
        }
        // Otherwise, they are on a public page (like /login), which is allowed.
        return renderWithLayout(PageComponent);
    }

    // 2. Handle users who ARE logged in
    // If they try to access a public page, redirect them to their home.
    if (!route.isPrivate) {
        return <Navigate to={getHomeRoute(user)} replace />;
    }

    // If they are on a private page, check their role permissions.
    const allowedRoutes = rolePermissions[user.role];
    if (!allowedRoutes || !allowedRoutes.includes(route.name)) {
        // FIX: Use the dedicated component for redirection to avoid conditional hook calls.
        return <AccessDeniedRedirect redirectTo={getHomeRoute(user)} />;
    }

    // If all checks pass, render the private page.
    return renderWithLayout(PageComponent);
};

const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Redirect root to the appropriate home page */}
            <Route path="/" element={<Navigate to={getHomeRoute(user)} replace />} />

            {/* Render all configured routes */}
            {routes.map((route) => (
                <Route
                    key={route.name}
                    path={route.path}
                    element={<RouteRenderer route={route} />}
                />
            ))}
            
            {/* Fallback for any other path is handled by the '*' in routes config */}
        </Routes>
    );
};

const App: React.FC = () => {
    return (
        <ErrorBoundary FallbackComponent={RecoveryUI}>
            <ThemeProvider>
                <AuthProvider>
                    <AppProvider>
                        <PersonalizationProvider>
                            <MarketplaceProvider>
                                <HealthProvider>
                                    <HRProvider>
                                        <Router>
                                            <AppRoutes />
                                            <ToastContainer />
                                        </Router>
                                    </HRProvider>
                                </HealthProvider>
                            </MarketplaceProvider>
                        </PersonalizationProvider>
                    </AppProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    );
};

export default App;