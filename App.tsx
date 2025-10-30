import React, { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Role } from './types';
import ToastContainer from './components/common/ToastContainer';

// Lazy load components for code splitting
const UserLayout = lazy(() => import('./components/layout/UserLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const HrLayout = lazy(() => import('./components/layout/HrLayout'));
const LoginScreen = lazy(() => import('./screens/auth/LoginScreen'));
const RegisterScreen = lazy(() => import('./screens/auth/RegisterScreen'));
const DeactivatedAccountScreen = lazy(() => import('./screens/auth/DeactivatedAccountScreen'));
const UnderConstructionScreen = lazy(() => import('./screens/common/UnderConstructionScreen'));
const FunctionalPlaceholderScreen = lazy(() => import('./screens/common/FunctionalPlaceholderScreen'));
const OnboardingTour = lazy(() => import('./components/user/OnboardingTour'));
const InstallBanner = lazy(() => import('./components/common/InstallBanner'));


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
const AttendanceHistoryScreen = lazy(() => import('./screens/user/AttendanceHistoryScreen'));
const OpexScreen = lazy(() => import('./screens/user/OpexScreen'));
const NewOpexRequestScreen = lazy(() => import('./screens/user/opex/NewOpexRequestScreen'));
const AllFeaturesScreen = lazy(() => import('./screens/user/AllFeaturesScreen'));


// Main Placeholder Screens
const PPOBScreen = lazy(() => import('./screens/user/placeholders/PPOBScreen'));
const GovernmentServicesScreen = lazy(() => import('./screens/user/placeholders/GovernmentServicesScreen'));
const LifestyleScreen = lazy(() => import('./screens/user/placeholders/LifestyleScreen'));
const MobileTopUpScreen = lazy(() => import('./screens/user/placeholders/MobileTopUpScreen'));
const CashOutScreen = lazy(() => import('./screens/user/placeholders/CashOutScreen'));
const DailyNeedsScreen = lazy(() => import('./screens/user/placeholders/DailyNeedsScreen'));

// Detailed Placeholder Screens
const CinemaTicketScreen = lazy(() => import('./screens/user/placeholders/lifestyle/CinemaTicketScreen'));
const GameVoucherScreen = lazy(() => import('./screens/user/placeholders/lifestyle/GameVoucherScreen'));
const DonationScreen = lazy(() => import('./screens/user/placeholders/lifestyle/DonationScreen'));
const PbbTaxScreen = lazy(() => import('./screens/user/placeholders/government/PbbTaxScreen'));
const ESamsatScreen = lazy(() => import('./screens/user/placeholders/government/ESamsatScreen'));
const MpnG3Screen = lazy(() => import('./screens/user/placeholders/government/MpnG3Screen'));


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
const AdminHomePageOrchestrator = lazy(() => import('./screens/admin/AdminHomePageOrchestrator'));
const AdminAssistantHub = lazy(() => import('./screens/admin/AdminAssistantHub'));
const AdminSystemControlsScreen = lazy(() => import('./screens/admin/AdminSystemControlsScreen'));
const AdminServiceLinkageScreen = lazy(() => import('./screens/admin/AdminServiceLinkageScreen'));


// HR Screens
const HrPortalScreen = lazy(() => import('./screens/hr/HrPortalScreen'));
const HrDashboard = lazy(() => import('./screens/hr/HrDashboard'));
const HrOnboarding = lazy(() => import('./screens/hr/HrOnboarding'));
const HrLeaveManagement = lazy(() => import('./screens/hr/HrLeaveManagement'));
const HrPayroll = lazy(() => import('./screens/hr/HrPayroll'));
const HrOpexManagementScreen = lazy(() => import('./screens/hr/HrOpexManagementScreen'));
const HrAiCopilotScreen = lazy(() => import('./screens/hr/HrAiCopilotScreen'));
const HrBenefitManagement = lazy(() => import('./screens/hr/HrBenefitManagement'));
const HrWellnessManagement = lazy(() => import('./screens/hr/HrWellnessManagement'));
const HrAttendanceManagement = lazy(() => import('./screens/hr/HrAttendanceManagement'));


const Spinner = () => (
    <div className="flex items-center justify-center h-screen w-screen bg-background">
        <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
);

// Group HR routes under a dedicated layout
const HrRoutes: React.FC = () => (
    <Suspense fallback={<Spinner />}>
        <HrLayout>
            <Routes>
                <Route index element={<Navigate to="dashboard" />} />
                <Route path="dashboard" element={<HrDashboard />} />
                <Route path="onboarding" element={<HrOnboarding />} />
                <Route path="leave" element={<HrLeaveManagement />} />
                <Route path="payroll" element={<HrPayroll />} />
                <Route path="opex" element={<HrOpexManagementScreen />} />
                <Route path="copilot" element={<HrAiCopilotScreen />} />
                <Route path="benefits" element={<HrBenefitManagement />} />
                <Route path="wellness" element={<HrWellnessManagement />} />
                <Route path="attendance" element={<HrAttendanceManagement />} />
                <Route path="*" element={<Navigate to="dashboard" />} />
            </Routes>
        </HrLayout>
    </Suspense>
);


const App: React.FC = () => {
    const { user } = useAuth();
    const [showOnboardingTour, setShowOnboardingTour] = useState(false);
    const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);

    // Signal a successful render to the crash loop detector.
    useEffect(() => {
        sessionStorage.removeItem('crash_count');
    }, []);

    // PWA Install Prompt Logic
    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setInstallPromptEvent(e);
            // Check if the user has already dismissed the banner in this session
            if (!sessionStorage.getItem('app_install_dismissed')) {
                setShowInstallBanner(true);
            }
        };

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);
    
    const handleInstallClick = () => {
        if (!installPromptEvent) return;
        installPromptEvent.prompt();
        installPromptEvent.userChoice.then((choiceResult: { outcome: 'accepted' | 'dismissed' }) => {
            setShowInstallBanner(false);
            setInstallPromptEvent(null);
        });
    };
    
    const handleDismissInstall = () => {
        sessionStorage.setItem('app_install_dismissed', 'true');
        setShowInstallBanner(false);
    };


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

    const renderProtectedLayout = () => {
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
                        <Route path="admin/home-orchestrator" element={<AdminHomePageOrchestrator />} />
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
                        <Route path="admin/system/service-linkage" element={<AdminServiceLinkageScreen />} />
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
                    <Route path="attendance-history" element={<AttendanceHistoryScreen />} />
                    <Route path="opex" element={<OpexScreen />} />
                    <Route path="opex/new" element={<NewOpexRequestScreen />} />
                    <Route path="under-construction" element={<UnderConstructionScreen />} />
                    <Route path="features" element={<AllFeaturesScreen />} />
                    
                    {/* Main placeholder routes */}
                    <Route path="ppob" element={<PPOBScreen />} />
                    <Route path="government-services" element={<GovernmentServicesScreen />} />
                    <Route path="lifestyle" element={<LifestyleScreen />} />
                    <Route path="mobile-topup" element={<MobileTopUpScreen />} />
                    <Route path="cash-out" element={<CashOutScreen />} />
                    <Route path="daily-needs" element={<DailyNeedsScreen />} />
                    
                    {/* Detailed placeholder routes */}
                    <Route path="lifestyle/cinema" element={<CinemaTicketScreen />} />
                    <Route path="lifestyle/game-voucher" element={<GameVoucherScreen />} />
                    <Route path="lifestyle/donation" element={<DonationScreen />} />
                    <Route path="government/pbb" element={<PbbTaxScreen />} />
                    <Route path="government/samsat" element={<ESamsatScreen />} />
                    <Route path="government/mpn" element={<MpnG3Screen />} />

                    <Route path="placeholder/:featureName" element={<FunctionalPlaceholderScreen />} />


                    {/* HR-specific entry point, rendered within UserLayout */}
                    {user.role === Role.HR && (
                        <Route path="hr-portal" element={<HrPortalScreen />} />
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
            {showInstallBanner && (
                 <Suspense fallback={<div/>}>
                     <InstallBanner
                        onInstall={handleInstallClick}
                        onDismiss={handleDismissInstall}
                     />
                 </Suspense>
            )}
            <HashRouter>
                <Suspense fallback={<Spinner />}>
                    <Routes>
                        {/* Public Routes */}
                        <Route path="/login" element={user ? <Navigate to="/" /> : <LoginScreen />} />
                        <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterScreen />} />
                        <Route path="/deactivated" element={<DeactivatedAccountScreen />} />

                        {/* HR Portal Routes (uses its own layout) */}
                        <Route path="/hr/*" element={
                            !user ? <Navigate to="/login" /> :
                            user.status === 'inactive' ? <Navigate to="/deactivated" /> :
                            user.role !== Role.HR ? <Navigate to="/" /> : // If not HR, redirect away
                            <HrRoutes />
                        } />

                        {/* Main Protected Routes Wrapper */}
                        <Route path="/*" element={renderProtectedLayout()} />
                    </Routes>
                </Suspense>
            </HashRouter>
        </>
    );
};

export default App;