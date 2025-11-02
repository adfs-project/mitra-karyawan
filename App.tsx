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

// FIX: Dedicated component for access denied logic, ensuring hooks are always called correctly.
const AccessDeniedRedirect: React.FC<{ redirectTo: string }> = ({ redirectTo }) => {
    const { showToast } = useApp();
    useEffect(() => {
        showToast("Akses ditolak: Anda tidak memiliki izin yang diperlukan.", "error");
    }, [showToast]);
    return <Navigate to={redirectTo} replace />;
};

// FIX: Centralized layout rendering logic into a helper function.
const renderWithLayout = (component: React.ReactNode, layout: RouteConfig['layout']) => {
    switch (layout) {
        case 'user': return <UserLayout>{component}</UserLayout>;
        case 'admin': return <AdminLayout>{component}</AdminLayout>;
        case 'hr': return <HrLayout>{component}</HrLayout>;
        case 'finance': return <FinanceLayout>{component}</FinanceLayout>;
        default: return component;
    }
};

// FIX: New PrivateRoute guard component for clarity and robustness.
const PrivateRoute: React.FC<{ children: React.ReactNode; route: RouteConfig }> = ({ children, route }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    const allowedRoutes = rolePermissions[user.role];
    if (!allowedRoutes || !allowedRoutes.includes(route.name)) {
        return <AccessDeniedRedirect redirectTo={getHomeRoute(user)} />;
    }

    return renderWithLayout(children, route.layout);
};

// FIX: New PublicRoute guard component to handle logged-in users on public pages.
const PublicRoute: React.FC<{ children: React.ReactNode; route: RouteConfig }> = ({ children, route }) => {
    const { user } = useAuth();

    if (user) {
        return <Navigate to={getHomeRoute(user)} replace />;
    }

    return renderWithLayout(children, route.layout);
};


const AppRoutes: React.FC = () => {
    const { user } = useAuth();

    return (
        <Routes>
            {/* Redirect root to the appropriate home page */}
            <Route path="/" element={<Navigate to={getHomeRoute(user)} replace />} />

            {/* Render all configured routes using the new guard components */}
            {routes.map((route) => {
                const PageComponent = <Suspense fallback={<CenteredLoading />}><route.component /></Suspense>;
                
                return (
                    <Route
                        key={route.name}
                        path={route.path}
                        element={
                            route.isPrivate ? (
                                <PrivateRoute route={route}>{PageComponent}</PrivateRoute>
                            ) : (
                                <PublicRoute route={route}>{PageComponent}</PublicRoute>
                            )
                        }
                    />
                );
            })}
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