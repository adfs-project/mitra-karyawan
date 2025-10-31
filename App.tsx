import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Role } from './types';

// Layouts
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import HrLayout from './components/layout/HrLayout';
import FinanceLayout from './components/layout/FinanceLayout';

// Auth Screens
import LoginScreen from './screens/auth/LoginScreen';
import RegisterScreen from './screens/auth/RegisterScreen';
import DeactivatedAccountScreen from './screens/auth/DeactivatedAccountScreen';

// User Screens
import HomeScreen from './screens/user/HomeScreen';
import WalletScreen from './screens/user/WalletScreen';
import MarketScreen from './screens/user/MarketScreen';
import InfoNewsScreen from './screens/user/InfoNewsScreen';
import HealthScreen from './screens/user/HealthScreen';
import MyAccountScreen from './screens/user/MyAccountScreen';
import CartScreen from './screens/user/CartScreen';
import WishlistScreen from './screens/user/WishlistScreen';
import MyProductsStoreScreen from './screens/user/MyProductsStoreScreen';
import BookmarkedArticlesScreen from './screens/user/BookmarkedArticlesScreen';
import LoyaltyScreen from './screens/user/LoyaltyScreen';
import AttendanceHistoryScreen from './screens/user/AttendanceHistoryScreen';
import OpexScreen from './screens/user/OpexScreen';
import NewOpexRequestScreen from './screens/user/opex/NewOpexRequestScreen';
import AllFeaturesScreen from './screens/user/AllFeaturesScreen';

// Health Sub-screens
import DoctorDetailScreen from './screens/user/health/DoctorDetailScreen';
import MyConsultationsScreen from './screens/user/health/MyConsultationsScreen';
import ConsultationRoomScreen from './screens/user/health/ConsultationRoomScreen';
import HealthRecordScreen from './screens/user/health/HealthRecordScreen';
import EprescriptionScreen from './screens/user/health/EprescriptionScreen';
import InsuranceClaimScreen from './screens/user/health/InsuranceClaimScreen';
import PharmacyCheckoutScreen from './screens/user/health/PharmacyCheckoutScreen';
import HealthPlusScreen from './screens/user/health/HealthPlusScreen';
import SubscriptionUpsellScreen from './screens/user/health/SubscriptionUpsellScreen';

// Admin Screens
import AdminDashboard from './screens/admin/AdminDashboard';
import AdminUserIntelligence from './screens/admin/AdminUserIntelligence';
import AdminFinancialHub from './screens/admin/AdminFinancialHub';
import AdminApiIntegration from './screens/admin/AdminApiIntegration';
import AdminScalability from './screens/admin/AdminScalability';
import AdminInfoNewsManagement from './screens/admin/AdminInfoNewsManagement';
import AdminMarketplaceOversight from './screens/admin/AdminMarketplaceOversight';
import AdminHealthProviderManagement from './screens/admin/AdminHealthProviderManagement';
import AdminMonetizationEngine from './screens/admin/AdminMonetizationEngine';
import AdminTaxManagement from './screens/admin/AdminTaxManagement';
import AdminPersonalizationEngine from './screens/admin/AdminPersonalizationEngine';
import AdminHomePageOrchestrator from './screens/admin/AdminHomePageOrchestrator';
import AdminAssistantHub from './screens/admin/AdminAssistantHub';
import AdminSystemControlsScreen from './screens/admin/AdminSystemControlsScreen';
import AdminServiceLinkageScreen from './screens/admin/AdminServiceLinkageScreen';
import AdminSystemIntegrityScreen from './screens/admin/AdminSystemIntegrityScreen';

// HR Screens
import HrDashboard from './screens/hr/HrDashboard';
import HrPortalScreen from './screens/hr/HrPortalScreen';
import HrOnboarding from './screens/hr/HrOnboarding';
import HrLeaveManagement from './screens/hr/HrLeaveManagement';
import HrPayroll from './screens/hr/HrPayroll';
import HrBenefitManagement from './screens/hr/HrBenefitManagement';
import HrWellnessManagement from './screens/hr/HrWellnessManagement';
import HrAttendanceManagement from './screens/hr/HrAttendanceManagement';
import HrOpexManagementScreen from './screens/hr/HrOpexManagementScreen';
import HrAiCopilotScreen from './screens/hr/HrAiCopilotScreen';

// Finance Screens
import FinanceDashboard from './screens/finance/FinanceDashboard';
import FinanceCommandCenter from './screens/finance/FinanceCommandCenter';
import FinancePayrollReport from './screens/finance/FinancePayrollReport';

// Common & Placeholders
import UnderConstructionScreen from './screens/common/UnderConstructionScreen';
import FunctionalPlaceholderScreen from './screens/common/FunctionalPlaceholderScreen';
import ToastContainer from './components/common/ToastContainer';
import InstallBanner from './components/common/InstallBanner';
import OnboardingTour from './components/user/OnboardingTour';

// Placeholder Screens
import PPOBScreen from './screens/user/placeholders/PPOBScreen';
import GovernmentServicesScreen from './screens/user/placeholders/GovernmentServicesScreen';
import LifestyleScreen from './screens/user/placeholders/LifestyleScreen';
import MobileTopUpScreen from './screens/user/placeholders/MobileTopUpScreen';
import CashOutScreen from './screens/user/placeholders/CashOutScreen';
import DailyNeedsScreen from './screens/user/placeholders/DailyNeedsScreen';
import PbbTaxScreen from './screens/user/placeholders/government/PbbTaxScreen';
import ESamsatScreen from './screens/user/placeholders/government/ESamsatScreen';
import MpnG3Screen from './screens/user/placeholders/government/MpnG3Screen';
import CinemaTicketScreen from './screens/user/placeholders/lifestyle/CinemaTicketScreen';
import GameVoucherScreen from './screens/user/placeholders/lifestyle/GameVoucherScreen';
import DonationScreen from './screens/user/placeholders/lifestyle/DonationScreen';


// FIX: Changed children type from JSX.Element to React.ReactNode to fix JSX namespace error and improve type flexibility.
const ProtectedRoute: React.FC<{ role: Role, children: React.ReactNode }> = ({ role, children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    if (user.role !== role) return <Navigate to="/" />; // Or a dedicated "Unauthorized" page
    return <>{children}</>;
};

// FIX: Changed children type from JSX.Element to React.ReactNode to fix JSX namespace error and improve type flexibility.
const UserRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    if (!user) return <Navigate to="/login" />;
    return <UserLayout>{children}</UserLayout>;
}

const App: React.FC = () => {
    const { user } = useAuth();
    const [installPrompt, setInstallPrompt] = useState<any>(null);
    const [showInstallBanner, setShowInstallBanner] = useState(false);
    const [showTour, setShowTour] = useState(false);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setInstallPrompt(e);
            if (!localStorage.getItem('install_banner_dismissed')) {
                setShowInstallBanner(true);
            }
        };
        window.addEventListener('beforeinstallprompt', handler);

        // First time user tour logic
        if (user && !localStorage.getItem(`tour_completed_${user.id}`)) {
            setShowTour(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [user]);

    const handleInstall = () => {
        if (installPrompt) {
            installPrompt.prompt();
            installPrompt.userChoice.then(() => {
                setInstallPrompt(null);
                setShowInstallBanner(false);
            });
        }
    };
    
    const handleDismissInstall = () => {
        localStorage.setItem('install_banner_dismissed', 'true');
        setShowInstallBanner(false);
    }
    
    const handleTourComplete = () => {
        if (user) {
            localStorage.setItem(`tour_completed_${user.id}`, 'true');
        }
        setShowTour(false);
    }

    return (
        <Router>
            <ToastContainer />
            {showInstallBanner && <InstallBanner onInstall={handleInstall} onDismiss={handleDismissInstall} />}
            {showTour && <OnboardingTour onComplete={handleTourComplete} />}
            <Routes>
                {/* Auth Routes */}
                <Route path="/login" element={user ? <Navigate to="/" /> : <LoginScreen />} />
                <Route path="/register" element={user ? <Navigate to="/" /> : <RegisterScreen />} />
                <Route path="/deactivated" element={<DeactivatedAccountScreen />} />

                {/* User Routes */}
                <Route path="/" element={<UserRoute><HomeScreen /></UserRoute>} />
                <Route path="/home" element={<UserRoute><HomeScreen /></UserRoute>} />
                <Route path="/wallet" element={<UserRoute><WalletScreen /></UserRoute>} />
                <Route path="/market" element={<UserRoute><MarketScreen /></UserRoute>} />
                <Route path="/news" element={<UserRoute><InfoNewsScreen /></UserRoute>} />
                <Route path="/health" element={<UserRoute><HealthScreen /></UserRoute>} />
                <Route path="/account" element={<UserRoute><MyAccountScreen /></UserRoute>} />
                <Route path="/cart" element={<UserRoute><CartScreen /></UserRoute>} />
                <Route path="/wishlist" element={<UserRoute><WishlistScreen /></UserRoute>} />
                <Route path="/my-products" element={<UserRoute><MyProductsStoreScreen /></UserRoute>} />
                <Route path="/bookmarked-articles" element={<UserRoute><BookmarkedArticlesScreen /></UserRoute>} />
                <Route path="/loyalty" element={<UserRoute><LoyaltyScreen /></UserRoute>} />
                <Route path="/attendance-history" element={<UserRoute><AttendanceHistoryScreen /></UserRoute>} />
                <Route path="/opex" element={<UserRoute><OpexScreen /></UserRoute>} />
                <Route path="/opex/new" element={<UserRoute><NewOpexRequestScreen /></UserRoute>} />
                <Route path="/features" element={<UserRoute><AllFeaturesScreen /></UserRoute>} />
                <Route path="/doctor/:id" element={<UserRoute><DoctorDetailScreen /></UserRoute>} />
                <Route path="/my-consultations" element={<UserRoute><MyConsultationsScreen /></UserRoute>} />
                <Route path="/consultation/:id" element={<UserRoute><ConsultationRoomScreen /></UserRoute>} />
                <Route path="/health-records" element={<UserRoute><HealthRecordScreen /></UserRoute>} />
                <Route path="/prescriptions" element={<UserRoute><EprescriptionScreen /></UserRoute>} />
                <Route path="/insurance-claims" element={<UserRoute><InsuranceClaimScreen /></UserRoute>} />
                <Route path="/pharmacy-checkout/:eprescriptionId" element={<UserRoute><PharmacyCheckoutScreen /></UserRoute>} />
                <Route path="/health-plus" element={<UserRoute><HealthPlusScreen /></UserRoute>} />
                <Route path="/subscribe-health-plus" element={<UserRoute><SubscriptionUpsellScreen /></UserRoute>} />

                {/* Placeholders */}
                <Route path="/placeholder/PPOB & Tagihan" element={<UserRoute><PPOBScreen /></UserRoute>} />
                <Route path="/placeholder/Layanan Pemerintah" element={<UserRoute><GovernmentServicesScreen /></UserRoute>} />
                <Route path="/placeholder/Gaya Hidup" element={<UserRoute><LifestyleScreen /></UserRoute>} />
                <Route path="/placeholder/Pulsa & Data" element={<UserRoute><MobileTopUpScreen /></UserRoute>} />
                <Route path="/placeholder/Tarik Tunai" element={<UserRoute><CashOutScreen /></UserRoute>} />
                <Route path="/placeholder/Belanja Harian" element={<UserRoute><DailyNeedsScreen /></UserRoute>} />
                <Route path="/government/pbb" element={<UserRoute><PbbTaxScreen /></UserRoute>} />
                <Route path="/government/samsat" element={<UserRoute><ESamsatScreen /></UserRoute>} />
                <Route path="/government/mpn" element={<UserRoute><MpnG3Screen /></UserRoute>} />
                <Route path="/lifestyle/cinema" element={<UserRoute><CinemaTicketScreen /></UserRoute>} />
                <Route path="/lifestyle/game-voucher" element={<UserRoute><GameVoucherScreen /></UserRoute>} />
                <Route path="/lifestyle/donation" element={<UserRoute><DonationScreen /></UserRoute>} />
                <Route path="/placeholder/:featureName" element={<UserRoute><FunctionalPlaceholderScreen /></UserRoute>} />

                {/* Admin Routes */}
                <Route path="/admin/*" element={
                    <ProtectedRoute role={Role.Admin}>
                        <AdminLayout>
                            <Routes>
                                <Route path="dashboard" element={<AdminDashboard />} />
                                <Route path="users" element={<AdminUserIntelligence />} />
                                <Route path="financials" element={<AdminFinancialHub />} />
                                <Route path="news" element={<AdminInfoNewsManagement />} />
                                <Route path="marketplace" element={<AdminMarketplaceOversight />} />
                                <Route path="health" element={<AdminHealthProviderManagement />} />
                                <Route path="monetization" element={<AdminMonetizationEngine />} />
                                <Route path="tax" element={<AdminTaxManagement />} />
                                <Route path="personalization" element={<AdminPersonalizationEngine />} />
                                <Route path="home-orchestrator" element={<AdminHomePageOrchestrator />} />
                                <Route path="assistant-hub" element={<AdminAssistantHub />} />
                                <Route path="system/api" element={<AdminApiIntegration />} />
                                <Route path="system/scalability" element={<AdminScalability />} />
                                <Route path="system/controls" element={<AdminSystemControlsScreen />} />
                                <Route path="system/service-linkage" element={<AdminServiceLinkageScreen />} />
                                <Route path="system/integrity" element={<AdminSystemIntegrityScreen />} />
                                <Route path="*" element={<Navigate to="dashboard" />} />
                            </Routes>
                        </AdminLayout>
                    </ProtectedRoute>
                }/>

                {/* HR Routes */}
                <Route path="/hr-portal" element={<UserLayout><HrPortalScreen /></UserLayout>} />
                <Route path="/hr/*" element={
                    <ProtectedRoute role={Role.HR}>
                        <HrLayout>
                             <Routes>
                                <Route path="dashboard" element={<HrDashboard />} />
                                <Route path="onboarding" element={<HrOnboarding />} />
                                <Route path="leave" element={<HrLeaveManagement />} />
                                <Route path="payroll" element={<HrPayroll />} />
                                <Route path="benefits" element={<HrBenefitManagement />} />
                                <Route path="wellness" element={<HrWellnessManagement />} />
                                <Route path="attendance" element={<HrAttendanceManagement />} />
                                <Route path="opex" element={<HrOpexManagementScreen />} />
                                <Route path="copilot" element={<HrAiCopilotScreen />} />
                                <Route path="*" element={<Navigate to="dashboard" />} />
                             </Routes>
                        </HrLayout>
                    </ProtectedRoute>
                }/>

                 {/* Finance Routes */}
                <Route path="/finance/*" element={
                    <ProtectedRoute role={Role.Finance}>
                        <FinanceLayout>
                             <Routes>
                                <Route path="dashboard" element={<FinanceDashboard />} />
                                <Route path="command-center" element={<FinanceCommandCenter />} />
                                <Route path="payroll-report" element={<FinancePayrollReport />} />
                                <Route path="*" element={<Navigate to="dashboard" />} />
                             </Routes>
                        </FinanceLayout>
                    </ProtectedRoute>
                }/>

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

export default App;