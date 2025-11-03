import React, { Suspense, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import * as ErrorBoundaryModule from 'react-error-boundary';
import { AuthProvider, useAuth } from './packages/shared/contexts/AuthContext';
import { DataProvider, useData } from './packages/shared/contexts/DataContext';
import { ThemeProvider } from './packages/shared/contexts/ThemeContext';
import { routes, rolePermissions, RouteConfig } from './routing/routeConfig';
import { Role } from './packages/shared/types';
import ToastContainer from './packages/shared/components/common/ToastContainer';
import RecoveryUI from './packages/shared/components/common/RecoveryUI';
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import HrLayout from './components/layout/HrLayout';
import FinanceLayout from './components/layout/FinanceLayout';
import ManagerLayout from './components/layout/ManagerLayout';

const CenteredLoading: React.FC = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-text-primary text-center">
        <div>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-lg font-semibold animate-pulse">Menyiapkan dasbor Anda...</p>
            <p className="text-sm text-text-secondary mt-1">Hampir selesai!</p>
        </div>
    </div>
);


// This component catches unhandled errors (async, event handlers) and passes them to the Error Boundary
const GlobalErrorCatcher: React.FC = () => {
    // Re-implementing useErrorHandler's logic to bypass CDN import issues.
    // This state setter is used to re-throw an error inside React's render cycle.
    const [_, setError] = useState<any>(null);

    useEffect(() => {
        const errorHandler = (event: ErrorEvent) => {
            // This is the core pattern that useErrorHandler uses internally.
            // Using the state setter to re-throw the error during the next render.
            setError(() => { throw event.error; });
        };
        
        const rejectionHandler = (event: PromiseRejectionEvent) => {
            // Also handle unhandled promise rejections
            setError(() => { throw event.reason; });
        };

        window.addEventListener('error', errorHandler);
        window.addEventListener('unhandledrejection', rejectionHandler);

        return () => {
            window.removeEventListener('error', errorHandler);
            window.removeEventListener('unhandledrejection', rejectionHandler);
        };
    }, []);

    // This component does not render anything. The error is thrown inside the
    // state setter, which React catches and propagates to the nearest error
    // boundary during the state update process.
    return null;
};


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
    const { showToast } = useData();
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
        case 'manager': return <ManagerLayout>{component}</ManagerLayout>;
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
    
    // FIX: If user object exists but core properties don't, it's a transitional state. Show loading to prevent crash.
    if (!user.role || !user.profile) {
        return <CenteredLoading />;
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

const AppContent: React.FC = () => {
    const { user } = useAuth();
    const { isLoading } = useData();
    
    // "Gudang Tua" architecture: a single global loading gate.
    // If the user is logged in but the main DataContext is still fetching
    // all the data, show a loading screen. This blocks rendering of the main app.
    if (user && isLoading) {
        return <CenteredLoading />;
    }
    
    return (
         <ErrorBoundaryModule.ErrorBoundary FallbackComponent={RecoveryUI} resetKeys={[user]}>
            <GlobalErrorCatcher />
            <AppRoutes />
            <ToastContainer />
        </ErrorBoundaryModule.ErrorBoundary>
    )
}

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <AuthProvider>
                <DataProvider>
                    <Router>
                        <AppContent />
                    </Router>
                </DataProvider>
            </AuthProvider>
        </ThemeProvider>
    );
};

export default App;