import React from 'react';
import { Role } from '../types';

type LayoutType = 'user' | 'admin' | 'hr' | 'finance' | 'none';

export interface RouteConfig {
    name: string; // Unique name for the route
    path: string;
    component: React.ComponentType;
    layout: LayoutType;
    isPrivate: boolean;
}

// Lazy load components
const LoginScreen = React.lazy(() => import('../screens/auth/LoginScreen'));
const RegisterScreen = React.lazy(() => import('../screens/auth/RegisterScreen'));
const DeactivatedAccountScreen = React.lazy(() => import('../screens/auth/DeactivatedAccountScreen'));
const HomeScreen = React.lazy(() => import('../screens/user/HomeScreen'));
const WalletScreen = React.lazy(() => import('../screens/user/WalletScreen'));
const MarketScreen = React.lazy(() => import('../screens/user/MarketScreen'));
const InfoNewsScreen = React.lazy(() => import('../screens/user/InfoNewsScreen'));
const HealthScreen = React.lazy(() => import('../screens/user/HealthScreen'));
const MyAccountScreen = React.lazy(() => import('../screens/user/MyAccountScreen'));
const LoyaltyScreen = React.lazy(() => import('../screens/user/LoyaltyScreen'));
const CartScreen = React.lazy(() => import('../screens/user/CartScreen'));
const WishlistScreen = React.lazy(() => import('../screens/user/WishlistScreen'));
const MyProductsStoreScreen = React.lazy(() => import('../screens/user/MyProductsStoreScreen'));
const BookmarkedArticlesScreen = React.lazy(() => import('../screens/user/BookmarkedArticlesScreen'));
const AllFeaturesScreen = React.lazy(() => import('../screens/user/AllFeaturesScreen'));
const AttendanceHistoryScreen = React.lazy(() => import('../screens/user/AttendanceHistoryScreen'));
const OpexScreen = React.lazy(() => import('../screens/user/OpexScreen'));
const NewOpexRequestScreen = React.lazy(() => import('../screens/user/opex/NewOpexRequestScreen'));
const DoctorDetailScreen = React.lazy(() => import('../screens/user/health/DoctorDetailScreen'));
const MyConsultationsScreen = React.lazy(() => import('../screens/user/health/MyConsultationsScreen'));
const ConsultationRoomScreen = React.lazy(() => import('../screens/user/health/ConsultationRoomScreen'));
const EprescriptionScreen = React.lazy(() => import('../screens/user/health/EprescriptionScreen'));
const HealthRecordScreen = React.lazy(() => import('../screens/user/health/HealthRecordScreen'));
const InsuranceClaimScreen = React.lazy(() => import('../screens/user/health/InsuranceClaimScreen'));
const PharmacyCheckoutScreen = React.lazy(() => import('../screens/user/health/PharmacyCheckoutScreen'));
const HealthPlusScreen = React.lazy(() => import('../screens/user/health/HealthPlusScreen'));
const SubscriptionUpsellScreen = React.lazy(() => import('../screens/user/health/SubscriptionUpsellScreen'));
const FunctionalPlaceholderScreen = React.lazy(() => import('../screens/common/FunctionalPlaceholderScreen'));
const NotFoundScreen = React.lazy(() => import('../screens/common/NotFoundScreen')); // New import
const AdminDashboard = React.lazy(() => import('../screens/admin/AdminDashboard'));
const AdminUserIntelligence = React.lazy(() => import('../screens/admin/AdminUserIntelligence'));
const AdminApiIntegration = React.lazy(() => import('../screens/admin/AdminApiIntegration'));
const AdminScalability = React.lazy(() => import('../screens/admin/AdminScalability'));
const AdminFinancialHub = React.lazy(() => import('../screens/admin/AdminFinancialHub'));
const AdminInfoNewsManagement = React.lazy(() => import('../screens/admin/AdminInfoNewsManagement'));
const AdminMarketplaceOversight = React.lazy(() => import('../screens/admin/AdminMarketplaceOversight'));
const AdminHealthProviderManagement = React.lazy(() => import('../screens/admin/AdminHealthProviderManagement'));
const AdminMonetizationEngine = React.lazy(() => import('../screens/admin/AdminMonetizationEngine'));
const AdminTaxManagement = React.lazy(() => import('../screens/admin/AdminTaxManagement'));
const AdminPersonalizationEngine = React.lazy(() => import('../screens/admin/AdminPersonalizationEngine'));
const AdminHomePageOrchestrator = React.lazy(() => import('../screens/admin/AdminHomePageOrchestrator'));
const AdminAssistantHub = React.lazy(() => import('../screens/admin/AdminAssistantHub'));
const AdminSystemControlsScreen = React.lazy(() => import('../screens/admin/AdminSystemControlsScreen'));
const AdminServiceLinkageScreen = React.lazy(() => import('../screens/admin/AdminServiceLinkageScreen'));
const AdminSystemIntegrityScreen = React.lazy(() => import('../screens/admin/AdminSystemIntegrityScreen'));
const HrPortalScreen = React.lazy(() => import('../screens/hr/HrPortalScreen'));
const HrDashboard = React.lazy(() => import('../screens/hr/HrDashboard'));
const HrOnboarding = React.lazy(() => import('../screens/hr/HrOnboarding'));
const HrLeaveManagement = React.lazy(() => import('../screens/hr/HrLeaveManagement'));
const HrPayroll = React.lazy(() => import('../screens/hr/HrPayroll'));
const HrBenefitManagement = React.lazy(() => import('../screens/hr/HrBenefitManagement'));
const HrWellnessManagement = React.lazy(() => import('../screens/hr/HrWellnessManagement'));
const HrAiCopilotScreen = React.lazy(() => import('../screens/hr/HrAiCopilotScreen'));
const HrAttendanceManagement = React.lazy(() => import('../screens/hr/HrAttendanceManagement'));
const HrOpexManagementScreen = React.lazy(() => import('../screens/hr/HrOpexManagementScreen'));
const FinanceDashboard = React.lazy(() => import('../screens/finance/FinanceDashboard'));
const FinanceCommandCenter = React.lazy(() => import('../screens/finance/FinanceCommandCenter'));
const FinancePayrollReport = React.lazy(() => import('../screens/finance/FinancePayrollReport'));


// The "Peta Rute Resmi" (Official Route Map)
export const routes: RouteConfig[] = [
    // Auth
    { name: 'login', path: '/login', component: LoginScreen, layout: 'none', isPrivate: false },
    { name: 'register', path: '/register', component: RegisterScreen, layout: 'none', isPrivate: false },
    { name: 'deactivated', path: '/deactivated', component: DeactivatedAccountScreen, layout: 'none', isPrivate: false },

    // User Core
    { name: 'home', path: '/home', component: HomeScreen, layout: 'user', isPrivate: true },
    { name: 'wallet', path: '/wallet', component: WalletScreen, layout: 'user', isPrivate: true },
    { name: 'market', path: '/market', component: MarketScreen, layout: 'user', isPrivate: true },
    { name: 'news', path: '/news', component: InfoNewsScreen, layout: 'user', isPrivate: true },
    { name: 'health', path: '/health', component: HealthScreen, layout: 'user', isPrivate: true },
    { name: 'account', path: '/account', component: MyAccountScreen, layout: 'user', isPrivate: true },
    { name: 'loyalty', path: '/loyalty', component: LoyaltyScreen, layout: 'user', isPrivate: true },
    { name: 'cart', path: '/cart', component: CartScreen, layout: 'user', isPrivate: true },
    { name: 'wishlist', path: '/wishlist', component: WishlistScreen, layout: 'user', isPrivate: true },
    { name: 'myProducts', path: '/my-products', component: MyProductsStoreScreen, layout: 'user', isPrivate: true },
    { name: 'bookmarkedArticles', path: '/bookmarked-articles', component: BookmarkedArticlesScreen, layout: 'user', isPrivate: true },
    { name: 'features', path: '/features', component: AllFeaturesScreen, layout: 'user', isPrivate: true },
    { name: 'attendanceHistory', path: '/attendance-history', component: AttendanceHistoryScreen, layout: 'user', isPrivate: true },
    { name: 'opex', path: '/opex', component: OpexScreen, layout: 'user', isPrivate: true },
    { name: 'newOpex', path: '/opex/new', component: NewOpexRequestScreen, layout: 'user', isPrivate: true },

    // User Health
    { name: 'doctorDetail', path: '/doctor/:id', component: DoctorDetailScreen, layout: 'user', isPrivate: true },
    { name: 'myConsultations', path: '/my-consultations', component: MyConsultationsScreen, layout: 'user', isPrivate: true },
    { name: 'consultationRoom', path: '/consultation/:id', component: ConsultationRoomScreen, layout: 'none', isPrivate: true },
    { name: 'prescriptions', path: '/prescriptions', component: EprescriptionScreen, layout: 'user', isPrivate: true },
    { name: 'healthRecords', path: '/health-records', component: HealthRecordScreen, layout: 'user', isPrivate: true },
    { name: 'insuranceClaims', path: '/insurance-claims', component: InsuranceClaimScreen, layout: 'user', isPrivate: true },
    { name: 'pharmacyCheckout', path: '/pharmacy-checkout/:eprescriptionId', component: PharmacyCheckoutScreen, layout: 'user', isPrivate: true },
    { name: 'healthPlus', path: '/health-plus', component: HealthPlusScreen, layout: 'user', isPrivate: true },
    { name: 'subscribeHealthPlus', path: '/subscribe-health-plus', component: SubscriptionUpsellScreen, layout: 'user', isPrivate: true },
    { name: 'placeholder', path: '/placeholder/:featureName', component: FunctionalPlaceholderScreen, layout: 'user', isPrivate: true },

    // Admin
    { name: 'adminDashboard', path: '/admin/dashboard', component: AdminDashboard, layout: 'admin', isPrivate: true },
    { name: 'adminUsers', path: '/admin/users', component: AdminUserIntelligence, layout: 'admin', isPrivate: true },
    { name: 'adminApi', path: '/admin/system/api', component: AdminApiIntegration, layout: 'admin', isPrivate: true },
    { name: 'adminScalability', path: '/admin/system/scalability', component: AdminScalability, layout: 'admin', isPrivate: true },
    { name: 'adminFinancials', path: '/admin/financials', component: AdminFinancialHub, layout: 'admin', isPrivate: true },
    { name: 'adminNews', path: '/admin/news', component: AdminInfoNewsManagement, layout: 'admin', isPrivate: true },
    { name: 'adminMarketplace', path: '/admin/marketplace', component: AdminMarketplaceOversight, layout: 'admin', isPrivate: true },
    { name: 'adminHealth', path: '/admin/health', component: AdminHealthProviderManagement, layout: 'admin', isPrivate: true },
    { name: 'adminMonetization', path: '/admin/monetization', component: AdminMonetizationEngine, layout: 'admin', isPrivate: true },
    { name: 'adminTax', path: '/admin/tax', component: AdminTaxManagement, layout: 'admin', isPrivate: true },
    { name: 'adminPersonalization', path: '/admin/personalization', component: AdminPersonalizationEngine, layout: 'admin', isPrivate: true },
    { name: 'adminHomeOrchestrator', path: '/admin/home-orchestrator', component: AdminHomePageOrchestrator, layout: 'admin', isPrivate: true },
    { name: 'adminAssistantHub', path: '/admin/assistant-hub', component: AdminAssistantHub, layout: 'admin', isPrivate: true },
    { name: 'adminSystemControls', path: '/admin/system/controls', component: AdminSystemControlsScreen, layout: 'admin', isPrivate: true },
    { name: 'adminServiceLinkage', path: '/admin/system/service-linkage', component: AdminServiceLinkageScreen, layout: 'admin', isPrivate: true },
    { name: 'adminSystemIntegrity', path: '/admin/system/integrity', component: AdminSystemIntegrityScreen, layout: 'admin', isPrivate: true },

    // HR
    { name: 'hrPortal', path: '/hr-portal', component: HrPortalScreen, layout: 'user', isPrivate: true },
    { name: 'hrDashboard', path: '/hr/dashboard', component: HrDashboard, layout: 'hr', isPrivate: true },
    { name: 'hrOnboarding', path: '/hr/onboarding', component: HrOnboarding, layout: 'hr', isPrivate: true },
    { name: 'hrLeave', path: '/hr/leave', component: HrLeaveManagement, layout: 'hr', isPrivate: true },
    { name: 'hrPayroll', path: '/hr/payroll', component: HrPayroll, layout: 'hr', isPrivate: true },
    { name: 'hrBenefits', path: '/hr/benefits', component: HrBenefitManagement, layout: 'hr', isPrivate: true },
    { name: 'hrWellness', path: '/hr/wellness', component: HrWellnessManagement, layout: 'hr', isPrivate: true },
    { name: 'hrCopilot', path: '/hr/copilot', component: HrAiCopilotScreen, layout: 'hr', isPrivate: true },
    { name: 'hrAttendance', path: '/hr/attendance', component: HrAttendanceManagement, layout: 'hr', isPrivate: true },
    { name: 'hrOpex', path: '/hr/opex', component: HrOpexManagementScreen, layout: 'hr', isPrivate: true },

    // Finance
    { name: 'financeDashboard', path: '/finance/dashboard', component: FinanceDashboard, layout: 'finance', isPrivate: true },
    { name: 'financeCommandCenter', path: '/finance/command-center', component: FinanceCommandCenter, layout: 'finance', isPrivate: true },
    { name: 'financePayrollReport', path: '/finance/payroll-report', component: FinancePayrollReport, layout: 'finance', isPrivate: true },

    // Catch-all
    { name: 'notFound', path: '*', component: NotFoundScreen, layout: 'user', isPrivate: true },
];

// --- The "Buku Peraturan Akses" (Access Rulebook) with Inheritance ---

const userRoutes = [
    'home', 'wallet', 'market', 'news', 'health', 'account', 'loyalty', 'cart', 'wishlist',
    'myProducts', 'bookmarkedArticles', 'features', 'attendanceHistory', 'opex', 'newOpex',
    'doctorDetail', 'myConsultations', 'consultationRoom', 'prescriptions', 'healthRecords',
    'insuranceClaims', 'pharmacyCheckout', 'healthPlus', 'subscribeHealthPlus', 'placeholder',
    'notFound'
];

const hrRoutes = [
    ...userRoutes,
    'hrPortal', 'hrDashboard', 'hrOnboarding', 'hrLeave', 'hrPayroll', 'hrBenefits',
    'hrWellness', 'hrCopilot', 'hrAttendance', 'hrOpex'
];

const financeRoutes = [
    ...userRoutes,
    'financeDashboard', 'financeCommandCenter', 'financePayrollReport'
];

const adminRoutes = [
    'adminDashboard', 'adminUsers', 'adminApi', 'adminScalability', 'adminFinancials',
    'adminNews', 'adminMarketplace', 'adminHealth', 'adminMonetization', 'adminTax',
    'adminPersonalization', 'adminHomeOrchestrator', 'adminAssistantHub', 'adminSystemControls',
    'adminServiceLinkage', 'adminSystemIntegrity'
];


export const rolePermissions: Record<Role, string[]> = {
    [Role.User]: userRoutes,
    [Role.HR]: hrRoutes,
    [Role.Finance]: financeRoutes,
    // Admin can access everything
    [Role.Admin]: [...new Set([...userRoutes, ...hrRoutes, ...financeRoutes, ...adminRoutes])],
};