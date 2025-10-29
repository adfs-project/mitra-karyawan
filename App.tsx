import React, { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Role } from './types';
import ToastContainer from './components/common/ToastContainer';

// Lazy load components for code splitting
const UserLayout = lazy(() => import('./components/layout/UserLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const LoginScreen = lazy(() => import('./screens/auth/LoginScreen'));
const RegisterScreen = lazy(() => import('./screens/auth/RegisterScreen'));
const DeactivatedAccountScreen = lazy(() => import('./screens/auth/DeactivatedAccountScreen'));
const UnderConstructionScreen = lazy(() => import('./screens/common/UnderConstructionScreen'));
const FunctionalPlaceholderScreen = lazy(() => import('./screens/common/FunctionalPlaceholderScreen'));
const OnboardingTour = lazy(() => import('./components/user/OnboardingTour'));


// User Screens
const HomeScreen = lazy(() => import('./screens/user/HomeScreen'));
const WalletScreen = lazy(() => import('./screens/user/WalletScreen'));
const MarketScreen = lazy(() => import('./screens/user/MarketScreen'));
const InfoNewsScreen = lazy(() => import('./screens/user/InfoNewsScreen'));
const HealthScreen = lazy(() => import('./screens/user/HealthScreen'));
const MyAccountScreen = lazy(() => import('./screens/user/MyAccountScreen'));
const CartScreen = lazy(() => import('./screens/user/CartScreen'));
const WishlistScreen = lazy(() => import('./screens/user/WishlistScreen'));
const MyProductsStoreScreen = lazy(() => import('./screens/user/MyProductsStoreScreen'));
const BookmarkedArticlesScreen = lazy(() => import('./screens/user/BookmarkedArticlesScreen'));
const MyConsultationsScreen = lazy(() => import('./screens/user/health/MyConsultationsScreen'));
const ConsultationRoomScreen = lazy(() => import('./screens/user/health/ConsultationRoomScreen'));
const DoctorDetailScreen = lazy(() => import('./screens/user/health/DoctorDetailScreen'));
const LoyaltyScreen = lazy(() => import('./screens/user/LoyaltyScreen'));
const HealthRecordScreen = lazy(() => import('./screens/user/health/HealthRecordScreen'));
const EprescriptionScreen = lazy(() => import('./screens/user/health/EprescriptionScreen'));
const InsuranceClaimScreen = lazy(() => import('./screens/user/health/InsuranceClaimScreen'));
const PharmacyCheckoutScreen = lazy(() => import('./screens/user/health/PharmacyCheckoutScreen'));
const HealthPlusScreen = lazy(() => import('./screens/user/health/HealthPlusScreen'));
const SubscriptionUpsellScreen = lazy(() => import('./screens/user/health/SubscriptionUpsellScreen'));


// Admin Screens
const AdminDashboard = lazy(() => import('./screens/admin/AdminDashboard'));
const AdminFinancialHub = lazy(() => import('./screens/admin/AdminFinancialHub'));
const AdminMarketplaceOversight = lazy(() => import('./screens/admin/AdminMarketplaceOversight'));
const AdminUserIntelligence = lazy(() => import('./screens/admin/AdminUserIntelligence'));
const AdminHealthProviderManagement = lazy(() => import('./screens/admin/AdminHealthProviderManagement'));
const AdminMonetizationEngine = lazy(() => import('./screens/admin/AdminMonetizationEngine'));
const AdminInfoNewsManagement = lazy(() => import('./screens/admin/AdminInfoNewsManagement'));
const AdminApiIntegration = lazy(() => import('./screens/admin/AdminApiIntegration'));
const AdminScalability = lazy(() => import('./screens/admin/AdminScalability'));
const AdminTaxManagement = lazy(() => import('./screens/admin/AdminTaxManagement'));
const AdminPersonalizationEngine = lazy(() => import('./screens/admin/AdminPersonalizationEngine'));
const AdminAssistantHub = lazy(() => import('./screens/admin/AdminAssistantHub'));
const AdminSystemControlsScreen = lazy(() => import('./screens/admin/AdminSystemControlsScreen'));


// HR Screens
const HrPortalScreen = lazy(() => import('./screens/hr/HrPortalScreen'));
const HrDashboard = lazy(() => import('./screens/hr/HrDashboard'));
const HrOnboarding = lazy(() => import('./screens/hr/HrOnboarding'));
const HrLeaveManagement = lazy(() => import('./screens/hr/HrLeaveManagement'));
const HrPayroll = lazy(() => import('./screens/hr/HrPayroll'));
const HrAiCopilotScreen = lazy(() => import('./screens/hr/HrAiCopilotScreen'));
const HrBenefitManagement = lazy(() => import('./screens/hr/HrBenefitManagement'));
const HrWellnessManagement = lazy(() => import('./screens/hr/HrWellnessManagement'));


const Spinner = () => (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);

const App: React.FC = () => {
    const { user } = useAuth();
    const [showOnboardingTour, setShowOnboardingTour] = useState(false);

    // Signal a successful render to the crash loop detector.
    useEffect(() => {
        sessionStorage.removeItem('crash_count');
    }, []);

    // Check if the onboarding tour should be shown for new users.
    useEffect(() => {
        if (user && (user.role === Role.User || user.role === Role.HR)) {
            const hasSeenTour = localStorage.getItem('app_has_seen_onboarding_tour');
            if (hasSeenTour !== 'true') {
                setShowOnboardingTour(true);
            }
        }
    }, [user]);

    const handleOnboardingComplete = () => {
        localStorage.setItem('app_has_seen_onboarding_tour', 'true');
        setShowOnboardingTour(false);
    };

    const renderLayout = () => {
        if (!user) {
            return <Navigate to="/login" />;
        }
        if (user.status === 'inactive') {
            return <Navigate to="/deactivated" />;
        }
        if (user.role === Role.Admin) {
            return (
                <AdminLayout>
                    <Routes>
                        <Route index element={<Navigate to="/admin/dashboard" />} />
                        <Route path="admin/dashboard" element={<AdminDashboard />} />
                        <Route path="admin/personalization" element={<AdminPersonalizationEngine />} />
                        <Route path="admin/assistant-hub" element={<AdminAssistantHub />} />
                        <Route path="admin/financials" element={<AdminFinancialHub />} />
                        <Route path="admin/marketplace" element={<AdminMarketplaceOversight />} />
                        <Route path="admin/users" element={<AdminUserIntelligence />} />
                        <Route path="admin/health" element={<AdminHealthProviderManagement />} />
                        <Route path="admin/monetization" element={<AdminMonetizationEngine />} />
                        <Route path="admin/news" element={<AdminInfoNewsManagement />} />
                        <Route path="admin/tax" element={<AdminTaxManagement />} />
                        <Route path="admin/system/api" element={<AdminApiIntegration />} />
                        <Route path="admin/system/scalability" element={<AdminScalability />} />
                        <Route path="admin/system/controls" element={<AdminSystemControlsScreen />} />
                        <Route path="*" element={<Navigate to="/admin/dashboard" />} />
                    </Routes>
                </AdminLayout>
            );
        }
        
        // Both User and HR roles will use the UserLayout for an integrated experience
        return (
            <UserLayout>
                <Routes>
                    {/* Common User Routes */}
                    <Route index element={<Navigate to="/home" />} />
                    <Route path="home" element={<HomeScreen />} />
                    <Route path="wallet" element={<WalletScreen />} />
                    <Route path="market" element={<MarketScreen />} />
                    <Route path="news" element={<InfoNewsScreen />} />
                    <Route path="health" element={<HealthScreen />} />
                    <Route path="account" element={<MyAccountScreen />} />
                    <Route path="cart" element={<CartScreen />} />
                    <Route path="wishlist" element={<WishlistScreen />} />
                    <Route path="my-products" element={<MyProductsStoreScreen />} />
                    <Route path="bookmarked-articles" element={<BookmarkedArticlesScreen />} />
                    <Route path="my-consultations" element={<MyConsultationsScreen />} />
                    <Route path="consultation/:id" element={<ConsultationRoomScreen />} />
                    <Route path="doctor/:id" element={<DoctorDetailScreen />} />
                    <Route path="loyalty" element={<LoyaltyScreen />} />
                    <Route path="health-record" element={<HealthRecordScreen />} />
                    <Route path="prescriptions" element={<EprescriptionScreen />} />
                    <Route path="insurance-claim" element={<InsuranceClaimScreen />} />
                    <Route path="pharmacy-checkout/:eprescriptionId" element={<PharmacyCheckoutScreen />} />
                    <Route path="health-plus" element={<HealthPlusScreen />} />
                    <Route path="subscribe-health-plus" element={<SubscriptionUpsellScreen />} />
                    <Route path="under-construction" element={<UnderConstructionScreen />} />
                    <Route path="placeholder/:featureName" element={<FunctionalPlaceholderScreen />} />


                    {/* HR-specific Routes, rendered within UserLayout */}
                    {user.role === Role.HR && (
                        <>
                            <Route path="hr-portal" element={<HrPortalScreen />} />
                            <Route path="hr/dashboard" element={<HrDashboard />} />
                            <Route path="hr/onboarding" element={<HrOnboarding />} />
                            <Route path="hr/leave" element={<HrLeaveManagement />} />
                            <Route path="hr/payroll" element={<HrPayroll />} />
                            <Route path="hr/copilot" element={<HrAiCopilotScreen />} />
                            <Route path="hr/benefits" element={<HrBenefitManagement />} />
                            <Route path="hr/wellness" element={<HrWellnessManagement />} />
                        </>
                    )}
                    
                    <Route path="*" element={<Navigate to="/home" />} />
                </Routes>
            </UserLayout>
        );
    };

    return (
        <>
            <ToastContainer />
            {showOnboardingTour && (
                <Suspense fallback={<Spinner />}>
                    <OnboardingTour onComplete={handleOnboardingComplete} />
                </Suspense>
            )}
            <HashRouter>
                <Suspense fallback={<Spinner />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginScreen />} />
                        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterScreen />} />
                        <Route path="/deactivated" element={<DeactivatedAccountScreen />} />

                        {/* Protected Routes Wrapper */}
                        <Route path="/*" element={renderLayout()} />
                    </Routes>
                </Suspense>
            </HashRouter>
        </>
    );
};

export default App;