import React, { lazy, Suspense, useEffect, useState } from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import { Role } from './types';
import ToastContainer from './components/common/ToastContainer';


// Lazy load components for code splitting
const UserLayout = lazy(() => import('./components/layout/UserLayout'));
const AdminLayout = lazy(() => import('./components/layout/AdminLayout'));
const HrLayout = lazy(() => import('./components/layout/HrLayout'));
const FinanceLayout = lazy(() => import('./components/layout/FinanceLayout'));
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
const MyAccountScreen = lazy(() => import('./screens/user/MyAccountScreen'));
const CartScreen = lazy(() => import('./screens/user/CartScreen'));
const WishlistScreen = lazy(() => import('./screens/user/WishlistScreen'));
const MyProductsStoreScreen = lazy(() => import('./screens/user/MyProductsStoreScreen'));
const BookmarkedArticlesScreen = lazy(() => import('./screens/user/BookmarkedArticlesScreen'));
const LoyaltyScreen = lazy(() => import('./screens/user/LoyaltyScreen'));
const AttendanceHistoryScreen = lazy(() => import('./screens/user/AttendanceHistoryScreen'));
const OpexScreen = lazy(() => import('./screens/user/OpexScreen'));
const NewOpexRequestScreen = lazy(() => import('./screens/user/opex/NewOpexRequestScreen'));
const AllFeaturesScreen = lazy(() => import('./screens/user/AllFeaturesScreen'));

// Health Screens
const HealthScreen = lazy(() => import('./screens/user/HealthScreen'));
const DoctorDetailScreen = lazy(() => import('./screens/user/health/DoctorDetailScreen'));
const MyConsultationsScreen = lazy(() => import('./screens/user/health/MyConsultationsScreen'));
const ConsultationRoomScreen = lazy(() => import('./screens/user/health/ConsultationRoomScreen'));
const EprescriptionScreen = lazy(() => import('./screens/user/health/EprescriptionScreen'));
const PharmacyCheckoutScreen = lazy(() => import('./screens/user/health/PharmacyCheckoutScreen'));
const HealthRecordScreen = lazy(() => import('./screens/user/health/HealthRecordScreen'));
const InsuranceClaimScreen = lazy(() => import('./screens/user/health/InsuranceClaimScreen'));
const HealthPlusScreen = lazy(() => import('./screens/user/health/HealthPlusScreen'));
const SubscriptionUpsellScreen = lazy(() => import('./screens/user/health/SubscriptionUpsellScreen'));

// Admin Screens
const AdminDashboard = lazy(() => import('./screens/admin/AdminDashboard'));
const AdminUserIntelligence = lazy(() => import('./screens/admin/AdminUserIntelligence'));
const AdminApiIntegration = lazy(() => import('./screens/admin/AdminApiIntegration'));
const AdminScalability = lazy(() => import('./screens/admin/AdminScalability'));
const AdminFinancialHub = lazy(() => import('./screens/admin/AdminFinancialHub'));
const AdminInfoNewsManagement = lazy(() => import('./screens/admin/AdminInfoNewsManagement'));
const AdminMarketplaceOversight = lazy(() => import('./screens/admin/AdminMarketplaceOversight'));
const AdminHealthProviderManagement = lazy(() => import('./screens/admin/AdminHealthProviderManagement'));
const AdminMonetizationEngine = lazy(() => import('./screens/admin/AdminMonetizationEngine'));
const AdminTaxManagement = lazy(() => import('./screens/admin/AdminTaxManagement'));
const AdminHomePageOrchestrator = lazy(() => import('./screens/admin/AdminHomePageOrchestrator'));
const AdminAssistantHub = lazy(() => import('./screens/admin/AdminAssistantHub'));
const AdminPersonalizationEngine = lazy(() => import('./screens/admin/AdminPersonalizationEngine'));
const AdminServiceLinkageScreen = lazy(() => import('./screens/admin/AdminServiceLinkageScreen'));
const AdminSystemControlsScreen = lazy(() => import('./screens/admin/AdminSystemControlsScreen'));


// HR Screens
const HrPortalScreen = lazy(() => import('./screens/hr/HrPortalScreen'));
const HrDashboard = lazy(() => import('./screens/hr/HrDashboard'));
const HrOnboarding = lazy(() => import('./screens/hr/HrOnboarding'));
const HrLeaveManagement = lazy(() => import('./screens/hr/HrLeaveManagement'));
const HrPayroll = lazy(() => import('./screens/hr/HrPayroll'));
const HrAiCopilotScreen = lazy(() => import('./screens/hr/HrAiCopilotScreen'));
const HrAttendanceManagement = lazy(() => import('./screens/hr/HrAttendanceManagement'));
const HrOpexManagementScreen = lazy(() => import('./screens/hr/HrOpexManagementScreen'));
const HrBenefitManagement = lazy(() => import('./screens/hr/HrBenefitManagement'));
const HrWellnessManagement = lazy(() => import('./screens/hr/HrWellnessManagement'));

// Finance Screens
const FinanceDashboard = lazy(() => import('./screens/finance/FinanceDashboard'));
const FinanceCommandCenter = lazy(() => import('./screens/finance/FinanceCommandCenter'));
const FinancePayrollReport = lazy(() => import('./screens/finance/FinancePayrollReport'));

// Placeholder Screens for Demo
const PPOBScreen = lazy(() => import('./screens/user/placeholders/PPOBScreen'));
const GovernmentServicesScreen = lazy(() => import('./screens/user/placeholders/GovernmentServicesScreen'));
const LifestyleScreen = lazy(() => import('./screens/user/placeholders/LifestyleScreen'));
const MobileTopUpScreen = lazy(() => import('./screens/user/placeholders/MobileTopUpScreen'));
const CashOutScreen = lazy(() => import('./screens/user/placeholders/CashOutScreen'));
const DailyNeedsScreen = lazy(() => import('./screens/user/placeholders/DailyNeedsScreen'));
const PbbTaxScreen = lazy(() => import('./screens/user/placeholders/government/PbbTaxScreen'));
const ESamsatScreen = lazy(() => import('./screens/user/placeholders/government/ESamsatScreen'));
const MpnG3Screen = lazy(() => import('./screens/user/placeholders/government/MpnG3Screen'));
const CinemaTicketScreen = lazy(() => import('./screens/user/placeholders/lifestyle/CinemaTicketScreen'));
const GameVoucherScreen = lazy(() => import('./screens/user/placeholders/lifestyle/GameVoucherScreen'));
const DonationScreen = lazy(() => import('./screens/user/placeholders/lifestyle/DonationScreen'));


const App: React.FC = () => {
    const { user } = useAuth();
    const [showOnboarding, setShowOnboarding] = useState(localStorage.getItem('onboarding_complete') !== 'true');
    const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<any>(null);

    useEffect(() => {
        const handleBeforeInstallPrompt = (e: Event) => {
            e.preventDefault();
            setDeferredInstallPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
        };
    }, []);

    const handleInstall = () => {
        if (deferredInstallPrompt) {
            deferredInstallPrompt.prompt();
            deferredInstallPrompt.userChoice.then(() => {
                setDeferredInstallPrompt(null);
            });
        }
    };
    
    const handleOnboardingComplete = () => {
        setShowOnboarding(false);
        localStorage.setItem('onboarding_complete', 'true');
    };

    if (!user) {
        return (
            <HashRouter>
                <Suspense fallback={<div>Loading...</div>}>
                    <Routes>
                        <Route path="/login" element={<LoginScreen />} />
                        <Route path="/register" element={<RegisterScreen />} />
                        <Route path="/deactivated" element={<DeactivatedAccountScreen />} />
                        <Route path="*" element={<Navigate to="/login" replace />} />
                    </Routes>
                </Suspense>
            </HashRouter>
        );
    }
    
    if (user.status === 'inactive') {
        return <Navigate to="/deactivated" replace />;
    }

    const MainContent = () => {
        const roleRoutes = {
            [Role.Admin]: <Navigate to="/admin/dashboard" replace />,
            [Role.HR]: <Navigate to="/hr-portal" replace />,
            [Role.Finance]: <Navigate to="/finance/dashboard" replace />,
            [Role.User]: <Navigate to="/home" replace />,
        };

        return (
            <>
                {showOnboarding && user.role === Role.User && <OnboardingTour onComplete={handleOnboardingComplete} />}
                {deferredInstallPrompt && <InstallBanner onInstall={handleInstall} onDismiss={() => setDeferredInstallPrompt(null)} />}
                <ToastContainer />

                <Suspense fallback={
                     <div className="flex items-center justify-center h-screen w-screen">
                        <div>
                          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      </div>
                }>
                    <Routes>
                        {/* User Routes */}
                        <Route path="/" element={roleRoutes[user.role]} />
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
                        <Route path="/features" element={<UserLayout><AllFeaturesScreen/></UserLayout>} />
                        
                        {/* Health Sub-Routes */}
                        <Route path="/health-plus" element={<UserLayout><HealthPlusScreen /></UserLayout>} />
                        <Route path="/subscribe-health-plus" element={<UserLayout><SubscriptionUpsellScreen /></UserLayout>} />
                        <Route path="/doctor/:id" element={<UserLayout><DoctorDetailScreen /></UserLayout>} />
                        <Route path="/my-consultations" element={<UserLayout><MyConsultationsScreen /></UserLayout>} />
                        <Route path="/consultation/:id" element={<ConsultationRoomScreen />} />
                        <Route path="/prescriptions" element={<UserLayout><EprescriptionScreen /></UserLayout>} />
                        <Route path="/pharmacy-checkout/:eprescriptionId" element={<UserLayout><PharmacyCheckoutScreen /></UserLayout>} />
                        <Route path="/health-records" element={<UserLayout><HealthRecordScreen /></UserLayout>} />
                        <Route path="/insurance-claims" element={<UserLayout><InsuranceClaimScreen /></UserLayout>} />

                        {/* Admin Routes */}
                        <Route path="/admin/dashboard" element={<AdminLayout><AdminDashboard /></AdminLayout>} />
                        <Route path="/admin/users" element={<AdminLayout><AdminUserIntelligence /></AdminLayout>} />
                        <Route path="/admin/system/api" element={<AdminLayout><AdminApiIntegration /></AdminLayout>} />
                        <Route path="/admin/system/scalability" element={<AdminLayout><AdminScalability /></AdminLayout>} />
                        <Route path="/admin/financials" element={<AdminLayout><AdminFinancialHub /></AdminLayout>} />
                        <Route path="/admin/news" element={<AdminLayout><AdminInfoNewsManagement /></AdminLayout>} />
                        <Route path="/admin/marketplace" element={<AdminLayout><AdminMarketplaceOversight /></AdminLayout>} />
                        <Route path="/admin/health" element={<AdminLayout><AdminHealthProviderManagement /></AdminLayout>} />
                        <Route path="/admin/monetization" element={<AdminLayout><AdminMonetizationEngine /></AdminLayout>} />
                        <Route path="/admin/tax" element={<AdminLayout><AdminTaxManagement /></AdminLayout>} />
                        <Route path="/admin/home-orchestrator" element={<AdminLayout><AdminHomePageOrchestrator /></AdminLayout>} />
                        <Route path="/admin/assistant-hub" element={<AdminLayout><AdminAssistantHub /></AdminLayout>} />
                        <Route path="/admin/personalization" element={<AdminLayout><AdminPersonalizationEngine /></AdminLayout>} />
                        <Route path="/admin/system/service-linkage" element={<AdminLayout><AdminServiceLinkageScreen /></AdminLayout>} />
                        <Route path="/admin/system/controls" element={<AdminLayout><AdminSystemControlsScreen /></AdminLayout>} />
                        
                        {/* HR Routes */}
                        <Route path="/hr-portal" element={<UserLayout><HrPortalScreen /></UserLayout>} />
                        <Route path="/hr/dashboard" element={<HrLayout><HrDashboard /></HrLayout>} />
                        <Route path="/hr/onboarding" element={<HrLayout><HrOnboarding /></HrLayout>} />
                        <Route path="/hr/leave" element={<HrLayout><HrLeaveManagement /></HrLayout>} />
                        <Route path="/hr/payroll" element={<HrLayout><HrPayroll /></HrLayout>} />
                        <Route path="/hr/copilot" element={<HrLayout><HrAiCopilotScreen /></HrLayout>} />
                        <Route path="/hr/attendance" element={<HrLayout><HrAttendanceManagement /></HrLayout>} />
                        <Route path="/hr/opex" element={<HrLayout><HrOpexManagementScreen /></HrLayout>} />
                        <Route path="/hr/benefits" element={<HrLayout><HrBenefitManagement /></HrLayout>} />
                        <Route path="/hr/wellness" element={<HrLayout><HrWellnessManagement /></HrLayout>} />
                        
                        {/* Finance Routes */}
                        <Route path="/finance/dashboard" element={<FinanceLayout><FinanceDashboard/></FinanceLayout>} />
                        <Route path="/finance/command-center" element={<FinanceLayout><FinanceCommandCenter/></FinanceLayout>} />
                        <Route path="/finance/payroll-report" element={<FinanceLayout><FinancePayrollReport/></FinanceLayout>} />

                        {/* Placeholder Routes */}
                        <Route path="/construction" element={<UserLayout><UnderConstructionScreen /></UserLayout>} />
                        <Route path="/placeholder/:featureName" element={<UserLayout><FunctionalPlaceholderScreen/></UserLayout>} />
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


                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Suspense>
            </>
        );
    };

    return (
        <HashRouter>
            <MainContent />
        </HashRouter>
    );
};

export default App;
