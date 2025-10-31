import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Role } from './types';

// Layouts
import UserLayout from './components/layout/UserLayout';
import AdminLayout from './components/layout/AdminLayout';
import HrLayout from './components/layout/HrLayout';
import FinanceLayout from './components/layout/FinanceLayout';

// Auth Screens
const LoginScreen = React.lazy(() => import('./screens/auth/LoginScreen'));
const RegisterScreen = React.lazy(() => import('./screens/auth/RegisterScreen'));
const DeactivatedAccountScreen = React.lazy(() => import('./screens/auth/DeactivatedAccountScreen'));

// User Screens (Lazy Loaded for performance)
const HomeScreen = React.lazy(() => import('./screens/user/HomeScreen'));
const WalletScreen = React.lazy(() => import('./screens/user/WalletScreen'));
const MarketScreen = React.lazy(() => import('./screens/user/MarketScreen'));
const InfoNewsScreen = React.lazy(() => import('./screens/user/InfoNewsScreen'));
const HealthScreen = React.lazy(() => import('./screens/user/HealthScreen'));
const MyAccountScreen = React.lazy(() => import('./screens/user/MyAccountScreen'));
const CartScreen = React.lazy(() => import('./screens/user/CartScreen'));
const WishlistScreen = React.lazy(() => import('./screens/user/WishlistScreen'));
const MyProductsStoreScreen = React.lazy(() => import('./screens/user/MyProductsStoreScreen'));
const BookmarkedArticlesScreen = React.lazy(() => import('./screens/user/BookmarkedArticlesScreen'));
const LoyaltyScreen = React.lazy(() => import('./screens/user/LoyaltyScreen'));
const AttendanceHistoryScreen = React.lazy(() => import('./screens/user/AttendanceHistoryScreen'));
const OpexScreen = React.lazy(() => import('./screens/user/OpexScreen'));
const NewOpexRequestScreen = React.lazy(() => import('./screens/user/opex/NewOpexRequestScreen'));
const AllFeaturesScreen = React.lazy(() => import('./screens/user/AllFeaturesScreen'));

// Health Sub-screens
const DoctorDetailScreen = React.lazy(() => import('./screens/user/health/DoctorDetailScreen'));
const MyConsultationsScreen = React.lazy(() => import('./screens/user/health/MyConsultationsScreen'));
const ConsultationRoomScreen = React.lazy(() => import('./screens/user/health/ConsultationRoomScreen'));
const HealthRecordScreen = React.lazy(() => import('./screens/user/health/HealthRecordScreen'));
const EprescriptionScreen = React.lazy(() => import('./screens/user/health/EprescriptionScreen'));
const InsuranceClaimScreen = React.lazy(() => import('./screens/user/health/InsuranceClaimScreen'));
const PharmacyCheckoutScreen = React.lazy(() => import('./screens/user/health/PharmacyCheckoutScreen'));
const HealthPlusScreen = React.lazy(() => import('./screens/user/health/HealthPlusScreen'));
const SubscriptionUpsellScreen = React.lazy(() => import('./screens/user/health/SubscriptionUpsellScreen'));

// Admin Screens
const AdminDashboard = React.lazy(() => import('./screens/admin/AdminDashboard'));
const AdminUserIntelligence = React.lazy(() => import('./screens/admin/AdminUserIntelligence'));
const AdminFinancialHub = React.lazy(() => import('./screens/admin/AdminFinancialHub'));
const AdminApiIntegration = React.lazy(() => import('./screens/admin/AdminApiIntegration'));
const AdminScalability = React.lazy(() => import('./screens/admin/AdminScalability'));
const AdminInfoNewsManagement = React.lazy(() => import('./screens/admin/AdminInfoNewsManagement'));
const AdminMarketplaceOversight = React.lazy(() => import('./screens/admin/AdminMarketplaceOversight'));
const AdminHealthProviderManagement = React.lazy(() => import('./screens/admin/AdminHealthProviderManagement'));
const AdminMonetizationEngine = React.lazy(() => import('./screens/admin/AdminMonetizationEngine'));
const AdminTaxManagement = React.lazy(() => import('./screens/admin/AdminTaxManagement'));
const AdminPersonalizationEngine = React.lazy(() => import('./screens/admin/AdminPersonalizationEngine'));
const AdminHomePageOrchestrator = React.lazy(() => import('./screens/admin/AdminHomePageOrchestrator'));
const AdminAssistantHub = React.lazy(() => import('./screens/admin/AdminAssistantHub'));
const AdminSystemControlsScreen = React.lazy(() => import('./screens/admin/AdminSystemControlsScreen'));
const AdminServiceLinkageScreen = React.lazy(() => import('./screens/admin/AdminServiceLinkageScreen'));
const AdminSystemIntegrityScreen = React.lazy(() => import('./screens/admin/AdminSystemIntegrityScreen'));

// HR Screens
const HrDashboard = React.lazy(() => import('./screens/hr/HrDashboard'));
const HrPortalScreen = React.lazy(() => import('./screens/hr/HrPortalScreen'));
const HrOnboarding = React.lazy(() => import('./screens/hr/HrOnboarding'));
const HrLeaveManagement = React.lazy(() => import('./screens/hr/HrLeaveManagement'));
const HrPayroll = React.lazy(() => import('./screens/hr/HrPayroll'));
const HrBenefitManagement = React.lazy(() => import('./screens/hr/HrBenefitManagement'));
const HrWellnessManagement = React.lazy(() => import('./screens/hr/HrWellnessManagement'));
const HrAttendanceManagement = React.lazy(() => import('./screens/hr/HrAttendanceManagement'));
const HrOpexManagementScreen = React.lazy(() => import('./screens/hr/HrOpexManagementScreen'));
const HrAiCopilotScreen = React.lazy(() => import('./screens/hr/HrAiCopilotScreen'));

// Finance Screens
const FinanceDashboard = React.lazy(() => import('./screens/finance/FinanceDashboard'));
const FinanceCommandCenter = React.lazy(() => import('./screens/finance/FinanceCommandCenter'));
const FinancePayrollReport = React.lazy(() => import('./screens/finance/FinancePayrollReport'));

// Common & Placeholders
const FunctionalPlaceholderScreen = React.lazy(() => import('./screens/common/FunctionalPlaceholderScreen'));
const ToastContainer = React.lazy(() => import('./components/common/ToastContainer'));
const InstallBanner = React.lazy(() => import('./components/common/InstallBanner'));
const OnboardingTour = React.lazy(() => import('./components/user/OnboardingTour'));

// Placeholder Screens
const PPOBScreen = React.lazy(() => import('./screens/user/placeholders/PPOBScreen'));
const GovernmentServicesScreen = React.lazy(() => import('./screens/user/placeholders/GovernmentServicesScreen'));
const LifestyleScreen = React.lazy(() => import('./screens/user/placeholders/LifestyleScreen'));
const MobileTopUpScreen = React.lazy(() => import('./screens/user/placeholders/MobileTopUpScreen'));
const CashOutScreen = React.lazy(() => import('./screens/user/placeholders/CashOutScreen'));
const DailyNeedsScreen = React.lazy(() => import('./screens/user/placeholders/DailyNeedsScreen'));
const PbbTaxScreen = React.lazy(() => import('./screens/user/placeholders/government/PbbTaxScreen'));
const ESamsatScreen = React.lazy(() => import('./screens/user/placeholders/government/ESamsatScreen'));
const MpnG3Screen = React.lazy(() => import('./screens/user/placeholders/government/MpnG3Screen'));
const CinemaTicketScreen = React.lazy(() => import('./screens/user/placeholders/lifestyle/CinemaTicketScreen'));
const GameVoucherScreen = React.lazy(() => import('./screens/user/placeholders/lifestyle/GameVoucherScreen'));
const DonationScreen = React.lazy(() => import('./screens/user/placeholders/lifestyle/DonationScreen'));


const LoadingFallback = () => (
    <div className="flex h-screen w-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
    </div>
);

// VIP Section Bouncer: Checks for specific roles (authorization)
const RoleProtectedRoute: React.FC<{ role: Role, children: React.ReactNode }> = ({ role, children }) => {
    const { user } = useAuth();
    if (user?.role !== role) return <Navigate to="/home" replace />; 
    return <>{children}</>;
};

// Main Bouncer: Checks for a ticket (authentication)
const ProtectedRoutes: React.FC = () => {
    const { user } = useAuth();
    return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Public Area Guard: Redirects logged-in users away from auth pages
const PublicRoutes: React.FC = () => {
    const { user } = useAuth();
    return user ? <Navigate to="/home" replace /> : <Outlet />;
};

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
            <React.Suspense fallback={<LoadingFallback />}>
                <ToastContainer />
                {showInstallBanner && <InstallBanner onInstall={handleInstall} onDismiss={handleDismissInstall} />}
                {showTour && <OnboardingTour onComplete={handleTourComplete} />}
                <Routes>
                    {/* Public routes (Login, Register). Logged-in users are redirected to /home. */}
                    <Route element={<PublicRoutes />}>
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="/register" element={<RegisterScreen />} />
                    </Route>
                    <Route path="/deactivated" element={<DeactivatedAccountScreen />} />

                    {/* All authenticated routes are nested here */}
                    <Route element={<ProtectedRoutes />}>
                        
                        {/* User Routes */}
                        <Route path="/home" element={<UserLayout><HomeScreen /></UserLayout>} />
                        <Route path="/wallet" element={<UserLayout><WalletScreen /></UserLayout>} />
                        <Route path="/market" element={<UserLayout><MarketScreen /></UserLayout>} />
                        <Route path="/news" element={<UserLayout><InfoNewsScreen /></UserLayout>} />
                        <Route path="/health" element={<UserLayout><HealthScreen /></UserLayout>} />
                        <Route path="/account" element={<UserLayout><MyAccountScreen /></UserLayout>} />
                        <Route path="/cart" element={<UserLayout><CartScreen /></UserLayout>} />
                        <Route path="/wishlist" element={<UserLayout><WishlistScreen /></UserLayout>} />
                        <Route path="/my-products" element={<UserLayout><MyProductsStoreScreen /></UserLayout>} />
                        <Route path="/bookmarked-articles" element={<UserLayout><BookmarkedArticlesScreen /></UserLayout>} />
                        <Route path="/loyalty" element={<UserLayout><LoyaltyScreen /></UserLayout>} />
                        <Route path="/attendance-history" element={<UserLayout><AttendanceHistoryScreen /></UserLayout>} />
                        <Route path="/opex" element={<UserLayout><OpexScreen /></UserLayout>} />
                        <Route path="/opex/new" element={<UserLayout><NewOpexRequestScreen /></UserLayout>} />
                        <Route path="/features" element={<UserLayout><AllFeaturesScreen /></UserLayout>} />
                        <Route path="/doctor/:id" element={<UserLayout><DoctorDetailScreen /></UserLayout>} />
                        <Route path="/my-consultations" element={<UserLayout><MyConsultationsScreen /></UserLayout>} />
                        <Route path="/consultation/:id" element={<UserLayout><ConsultationRoomScreen /></UserLayout>} />
                        <Route path="/health-records" element={<UserLayout><HealthRecordScreen /></UserLayout>} />
                        <Route path="/prescriptions" element={<UserLayout><EprescriptionScreen /></UserLayout>} />
                        <Route path="/insurance-claims" element={<UserLayout><InsuranceClaimScreen /></UserLayout>} />
                        <Route path="/pharmacy-checkout/:eprescriptionId" element={<UserLayout><PharmacyCheckoutScreen /></UserLayout>} />
                        <Route path="/health-plus" element={<UserLayout><HealthPlusScreen /></UserLayout>} />
                        <Route path="/subscribe-health-plus" element={<UserLayout><SubscriptionUpsellScreen /></UserLayout>} />
                        <Route path="/hr-portal" element={<UserLayout><HrPortalScreen /></UserLayout>} />

                        {/* Placeholder Routes */}
                        <Route path="/placeholder/PPOB & Tagihan" element={<UserLayout><PPOBScreen /></UserLayout>} />
                        <Route path="/placeholder/Layanan Pemerintah" element={<UserLayout><GovernmentServicesScreen /></UserLayout>} />
                        <Route path="/placeholder/Gaya Hidup" element={<UserLayout><LifestyleScreen /></UserLayout>} />
                        <Route path="/placeholder/Pulsa & Data" element={<UserLayout><MobileTopUpScreen /></UserLayout>} />
                        <Route path="/placeholder/Tarik Tunai" element={<UserLayout><CashOutScreen /></UserLayout>} />
                        <Route path="/placeholder/Belanja Harian" element={<UserLayout><DailyNeedsScreen /></UserLayout>} />
                        <Route path="/government/pbb" element={<UserLayout><PbbTaxScreen /></UserLayout>} />
                        <Route path="/government/samsat" element={<UserLayout><ESamsatScreen /></UserLayout>} />
                        <Route path="/government/mpn" element={<UserLayout><MpnG3Screen /></UserLayout>} />
                        <Route path="/lifestyle/cinema" element={<UserLayout><CinemaTicketScreen /></UserLayout>} />
                        <Route path="/lifestyle/game-voucher" element={<UserLayout><GameVoucherScreen /></UserLayout>} />
                        <Route path="/lifestyle/donation" element={<UserLayout><DonationScreen /></UserLayout>} />
                        <Route path="/placeholder/:featureName" element={<UserLayout><FunctionalPlaceholderScreen /></UserLayout>} />

                        {/* Admin Routes */}
                        <Route path="/admin/*" element={
                            <RoleProtectedRoute role={Role.Admin}>
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
                                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                                    </Routes>
                                </AdminLayout>
                            </RoleProtectedRoute>
                        }/>

                        {/* HR Routes */}
                        <Route path="/hr/*" element={
                            <RoleProtectedRoute role={Role.HR}>
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
                                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                                     </Routes>
                                </HrLayout>
                            </RoleProtectedRoute>
                        }/>

                         {/* Finance Routes */}
                        <Route path="/finance/*" element={
                            <RoleProtectedRoute role={Role.Finance}>
                                <FinanceLayout>
                                     <Routes>
                                        <Route path="dashboard" element={<FinanceDashboard />} />
                                        <Route path="command-center" element={<FinanceCommandCenter />} />
                                        <Route path="payroll-report" element={<FinancePayrollReport />} />
                                        <Route path="*" element={<Navigate to="dashboard" replace />} />
                                     </Routes>
                                </FinanceLayout>
                            </RoleProtectedRoute>
                        }/>
                        
                        {/* Catch-all for logged-in users, redirects to home */}
                        <Route path="*" element={<Navigate to="/home" replace />} />
                    </Route>
                </Routes>
            </React.Suspense>
        </Router>
    );
};

export default App;