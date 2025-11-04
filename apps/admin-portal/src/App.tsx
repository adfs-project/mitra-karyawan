import React, { Suspense, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import * as ErrorBoundaryModule from 'react-error-boundary';
import { AuthProvider, useAuth, DataProvider, useData, ThemeProvider, RecoveryUI, ToastContainer, Role, ScreenshotGuard } from '@mk/shared';
import { adminRoutes, rolePermissions, RouteConfig } from './routing/routeConfig';

// Layouts specific to this app
import AdminLayout from './components/layout/AdminLayout';
import HrLayout from './components/layout/HrLayout';
import FinanceLayout from './components/layout/FinanceLayout';
import ManagerLayout from './components/layout/ManagerLayout';

const CenteredLoading: React.FC = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background text-text-primary">
        <div>
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p>Loading Portal...</p>
        </div>
    </div>
);

const getHomeRoute = (user: any) => {
    if (!user) return '/login';
    switch (user.role) {
        case Role.Admin: return '/admin/dashboard';
        case Role.HR: return '/hr/dashboard'; // Main HR dashboard
        case Role.Finance: return '/finance/dashboard';
        case Role.User: return '/login'; // Users should not be here
        default: return '/login';
    }
};

const renderWithLayout = (component: React.ReactNode, layout: RouteConfig['layout']) => {
    switch (layout) {
        case 'admin': return <AdminLayout>{component}</AdminLayout>;
        case 'hr': return <HrLayout>{component}</HrLayout>;
        case 'finance': return <FinanceLayout>{component}</FinanceLayout>;
        case 'manager': return <ManagerLayout>{component}</ManagerLayout>;
        default: return component;
    }
};

const PrivateRoute: React.FC<{ children: React.ReactNode; route: RouteConfig }> = ({ children, route }) => {
    const { user } = useAuth();
    const location = useLocation();

    if (!user) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }
    
    const allowedRoutes = rolePermissions[user.role];
    if (user.role === Role.User || !allowedRoutes || !allowedRoutes.includes(route.name)) {
        // For this demo, deny access. In a real multi-domain setup, this case might not even be possible.
        return <Navigate to="/login" replace />;
    }

    return renderWithLayout(children, route.layout);
};

const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (user && user.role !== Role.User) {
        return <Navigate to={getHomeRoute(user)} replace />;
    }
    // If a regular user is logged in, boot them out
    if (user && user.role === Role.User) {
        return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
};

const AppRoutes: React.FC = () => {
    const { user } = useAuth();
    return (
        <Routes>
            <Route path="/" element={<Navigate to={getHomeRoute(user)} replace />} />
            {adminRoutes.map((route) => {
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
    if (user && isLoading) {
        return <CenteredLoading />;
    }
    return (
         <ErrorBoundaryModule.ErrorBoundary FallbackComponent={RecoveryUI} resetKeys={[user]}>
            <Router>
                <AppRoutes />
                <ToastContainer />
            </Router>
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
