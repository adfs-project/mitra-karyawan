import React, { Suspense, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import * as ErrorBoundaryModule from 'react-error-boundary';
import { AuthProvider, useAuth, DataProvider, useData, ThemeProvider, RecoveryUI, ToastContainer, Role, ScreenshotGuard, InstallBanner } from '@mk/shared';
import { employeeRoutes, rolePermissions, RouteConfig } from './routing/routeConfig';

// Layouts specific to this app
import UserLayout from './components/layout/UserLayout';

const CenteredLoading: React.FC = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-text-primary">
        <div>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading...</p>
        </div>
    </div>
);

const getHomeRoute = (user: any) => {
    if (!user) return '/login';
    // Employee app only has one home route
    return '/home';
};

const AccessDeniedRedirect: React.FC<{ redirectTo: string }> = ({ redirectTo }) => {
    const { showToast } = useData();
    useEffect(() => {
        showToast("Access denied: You don't have the required permissions.", "error");
    }, [showToast]);
    return <Navigate to={redirectTo} replace />;
};

const PrivateRoute: React.FC<{ children: React.ReactNode; route: RouteConfig }> = ({ children, route }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    // Redirect non-users to the admin portal
    if (user.role !== Role.User) {
        // In a real multi-domain setup, this would be a hard redirect.
        // For this demo, we'll just show an access denied message.
        return <AccessDeniedRedirect redirectTo="/login" />;
    }

    return <UserLayout>{children}</UserLayout>;
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (user) {
        return <Navigate to={getHomeRoute(user)} replace />;
    }
    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    const { user } = useAuth();
    return (
        <Routes>
            <Route path="/" element={<Navigate to={getHomeRoute(user)} replace />} />
            {employeeRoutes.map((route) => {
                const PageComponent = <Suspense fallback={<CenteredLoading />}><route.component /></Suspense>;
                return (
                    <Route
                        key={route.name}
                        path={route.path}
                        element={
                            route.isPrivate ? (
                                <PrivateRoute route={route}>{PageComponent}</PrivateRoute>
                            ) : (
                                <PublicRoute>{PageComponent}</PublicRoute>
                            )
                        }
                    />
                );
            })}
        </Routes>
    );
};

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const { isLoading } = useData();
    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
            if (!sessionStorage.getItem('install_banner_dismissed')) {
                setShowInstallBanner(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstallClick = () => {
        if (installPromptEvent) {
            installPromptEvent.prompt();
            setShowInstallBanner(false);
        }
    };

    const handleDismissInstall = () => {
        setShowInstallBanner(false);
        sessionStorage.setItem('install_banner_dismissed', 'true');
    };

    if (user && isLoading) {
        return <CenteredLoading />;
    }
    
    return (
        <ErrorBoundaryModule.ErrorBoundary FallbackComponent={RecoveryUI} resetKeys={[user]}>
            <Router>
                <AppRoutes />
                <ToastContainer />
            </Router>
            {showInstallBanner && (
                <InstallBanner
                    onInstall={handleInstallClick}
                    onDismiss={handleDismissInstall}
                />
            )}
        </ErrorBoundaryModule.ErrorBoundary>
    );
};

const App: React.FC = () => (
    <ThemeProvider>
        <AuthProvider>
            <DataProvider>
                <AppContent />
                <ScreenshotGuard />
            </DataProvider>
        </AuthProvider>
    </ThemeProvider>
);

export default App;