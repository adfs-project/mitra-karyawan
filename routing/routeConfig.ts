import React from 'react';
import { Role } from '../packages/shared/types';
import { lazyWithTimeout } from '../packages/shared/utils/lazyWithTimeout';

// This interface defines the structure for a single route configuration object.
export interface RouteConfig {
    name: string; // A unique name for the route, used for permission checks.
    path: string; // The URL path for the route.
    component: React.LazyExoticComponent<React.ComponentType<any>>; // The lazily-loaded component.
    isPrivate: boolean; // True if the route requires authentication.
    layout?: 'user' | 'admin' | 'hr' | 'finance' | 'manager' | 'none'; // Specifies the layout wrapper.
}

// --- Component Lazy Loading ---
// Authentication
const LoginScreen = lazyWithTimeout(() => import('../screens/auth/LoginScreen'));
const RegisterScreen = lazyWithTimeout(() => import('../screens/auth/RegisterScreen'));
const DeactivatedAccountScreen = lazyWithTimeout(() => import('../screens/auth/DeactivatedAccountScreen'));

// User Screens
const HomeScreen = lazyWithTimeout(() => import('../screens/user/HomeScreen'));
const WalletScreen = lazyWithTimeout(() => import('../screens/user/WalletScreen'));
const MarketScreen = lazyWithTimeout(() => import('../screens/user/MarketScreen'));
const InfoNewsScreen = lazyWithTimeout(() => import('../screens/user/InfoNewsScreen'));
const HealthScreen = lazyWithTimeout(() => import('../screens/user/HealthScreen'));
const MyAccountScreen = lazyWithTimeout(() => import('../screens/user/MyAccountScreen'));
const CartScreen = lazyWithTimeout(() => import('../screens/user/CartScreen'));
const WishlistScreen = lazyWithTimeout(() => import('../screens/user/WishlistScreen'));
const MyProductsStoreScreen = lazyWithTimeout(() => import('../screens/user/MyProductsStoreScreen'));
const BookmarkedArticlesScreen = lazyWithTimeout(() => import('../screens/user/BookmarkedArticlesScreen'));
const LoyaltyScreen = lazyWithTimeout(() => import('../screens/user/LoyaltyScreen'));
const DoctorListScreen = lazyWithTimeout(() => import('../screens/user/health/DoctorListScreen'));
const DoctorDetailScreen = lazyWithTimeout(() => import('../screens/user/health/DoctorDetailScreen'));
const MyConsultationsScreen = lazyWithTimeout(() => import('../screens/user/health/MyConsultationsScreen'));
const ConsultationRoomScreen = lazyWithTimeout(() => import('../screens/user/health/ConsultationRoomScreen'));
const EprescriptionScreen = lazyWithTimeout(() => import('../screens/user/health/EprescriptionScreen'));
const PharmacyCheckoutScreen = lazyWithTimeout(() => import('../screens/user/health/PharmacyCheckoutScreen'));
const HealthRecordScreen = lazyWithTimeout(() => import('../screens/user/health/HealthRecordScreen'));
const InsuranceClaimScreen = lazyWithTimeout(() => import('../screens/user/health/InsuranceClaimScreen'));
const HealthPlusScreen = lazyWithTimeout(() => import('../screens/user/health/HealthPlusScreen'));
const SubscriptionUpsellScreen = lazyWithTimeout(() => import('../screens/user/health/SubscriptionUpsellScreen'));
const AttendanceHistoryScreen = lazyWithTimeout(() => import('../screens/user/AttendanceHistoryScreen'));
const OpexScreen = lazyWithTimeout(() => import('../screens/user/OpexScreen'));
const NewOpexRequestScreen = lazyWithTimeout(() => import('../screens/user/opex/NewOpexRequestScreen'));
const AllFeaturesScreen = lazyWithTimeout(() => import('../screens/user/AllFeaturesScreen'));

// Placeholders
const PPOBScreen = lazyWithTimeout(() => import('../screens/user/placeholders/PPOBScreen'));
const GovernmentServicesScreen = lazyWithTimeout(() => import('../screens/user/placeholders/GovernmentServicesScreen'));
const LifestyleScreen = lazyWithTimeout(() => import('../screens/user/placeholders/LifestyleScreen'));
const MobileTopUpScreen = lazyWithTimeout(() => import('../screens/user/placeholders/MobileTopUpScreen'));
const CashOutScreen = lazyWithTimeout(() => import('../screens/user/placeholders/CashOutScreen'));
const DailyNeedsScreen = lazyWithTimeout(() => import('../screens/user/placeholders/DailyNeedsScreen'));
const PbbTaxScreen = lazyWithTimeout(() => import('../screens/user/placeholders/government/PbbTaxScreen'));
const ESamsatScreen = lazyWithTimeout(() => import('../screens/user/placeholders/government/ESamsatScreen'));
const MpnG3Screen = lazyWithTimeout(() => import('../screens/user/placeholders/government/MpnG3Screen'));
const CinemaTicketScreen = lazyWithTimeout(() => import('../screens/user/placeholders/lifestyle/CinemaTicketScreen'));
const GameVoucherScreen = lazyWithTimeout(() => import('../screens/user/placeholders/lifestyle/GameVoucherScreen'));
const DonationScreen = lazyWithTimeout(() => import('../screens/user/placeholders/lifestyle/DonationScreen'));


// Admin Screens
const AdminDashboard = lazyWithTimeout(() => import('../screens/admin/AdminDashboard'));
const AdminUserIntelligence = lazyWithTimeout(() => import('../screens/admin/AdminUserIntelligence'));
const AdminApiIntegration = lazyWithTimeout(() => import('../screens/admin/AdminApiIntegration'));
const AdminScalability = lazyWithTimeout(() => import('../screens/admin/AdminScalability'));
const AdminFinancialHub = lazyWithTimeout(() => import('../screens/admin/AdminFinancialHub'));
const AdminInfoNewsManagement = lazyWithTimeout(() => import('../screens/admin/AdminInfoNewsManagement'));
const AdminMarketplaceOversight = lazyWithTimeout(() => import('../screens/admin/AdminMarketplaceOversight'));
const AdminHealthProviderManagement = lazyWithTimeout(() => import('../screens/admin/AdminHealthProviderManagement'));
const AdminMonetizationEngine = lazyWithTimeout(() => import('../screens/admin/AdminMonetizationEngine'));
const AdminTaxManagement = lazyWithTimeout(() => import('../screens/admin/AdminTaxManagement'));
const AdminHomePageOrchestrator = lazyWithTimeout(() => import('../screens/admin/AdminHomePageOrchestrator'));
const AdminAssistantHub = lazyWithTimeout(() => import('../screens/admin/AdminAssistantHub'));
const AdminPersonalizationEngine = lazyWithTimeout(() => import('../screens/admin/AdminPersonalizationEngine'));
const AdminSystemControlsScreen = lazyWithTimeout(() => import('../screens/admin/AdminSystemControlsScreen'));
const AdminServiceLinkageScreen = lazyWithTimeout(() => import('../screens/admin/AdminServiceLinkageScreen'));
const AdminSystemIntegrityScreen = lazyWithTimeout(() => import('../screens/admin/AdminSystemIntegrityScreen'));


// HR Screens
const HrPortalScreen = lazyWithTimeout(() => import('../screens/hr/HrPortalScreen'));
const HrDashboard = lazyWithTimeout(() => import('../screens/hr/HrDashboard'));
const HrOnboarding = lazyWithTimeout(() => import('../screens/hr/HrOnboarding'));
const HrLeaveManagement = lazyWithTimeout(() => import('../screens/hr/HrLeaveManagement'));
const HrPayroll = lazyWithTimeout(() => import('../screens/hr/HrPayroll'));
const HrAiCopilotScreen = lazyWithTimeout(() => import('../screens/hr/HrAiCopilotScreen'));
const HrWellnessManagement = lazyWithTimeout(() => import('../screens/hr/HrWellnessManagement'));
const HrAttendanceManagement = lazyWithTimeout(() => import('../screens/hr/HrAttendanceManagement'));
const HrOpexManagementScreen = lazyWithTimeout(() => import('../screens/hr/HrOpexManagementScreen'));
const HrBenefitManagement = lazyWithTimeout(() => import('../screens/hr/HrBenefitManagement'));
const HrPayLaterManagement = lazyWithTimeout(() => import('../screens/hr/HrPayLaterManagement'));
const HrPerformanceScreen = lazyWithTimeout(() => import('../screens/hr/HrPerformanceScreen'));
const HrPerformanceAnalytics = lazyWithTimeout(() => import('../screens/hr/HrPerformanceAnalytics'));


// Finance Screens
const FinanceDashboard = lazyWithTimeout(() => import('../screens/finance/FinanceDashboard'));
const FinanceCommandCenter = lazyWithTimeout(() => import('../screens/finance/FinanceCommandCenter'));
const FinancePayrollReport = lazyWithTimeout(() => import('../screens/finance/FinancePayrollReport'));
const FinancePayLaterScreen = lazyWithTimeout(() => import('../screens/finance/FinancePayLaterScreen'));


// Manager Screens
const ManagerDashboardScreen = lazyWithTimeout(() => import('../screens/manager/ManagerDashboardScreen'));


// Common Screens
const NotFoundScreen = lazyWithTimeout(() => import('../screens/common/NotFoundScreen'));
const UnderConstructionScreen = lazyWithTimeout(() => import('../screens/common/UnderConstructionScreen'));
const FunctionalPlaceholderScreen = lazyWithTimeout(() => import('../screens/common/FunctionalPlaceholderScreen'));


// --- Route Definitions ---
export const routes: RouteConfig[] = [
    // Public routes
    { name: 'login', path: '/login', component: LoginScreen, isPrivate: false, layout: 'none' },
    { name: 'register', path: '/register', component: RegisterScreen, isPrivate: false, layout: 'none' },
    { name: 'deactivated', path: '/deactivated', component: DeactivatedAccountScreen, isPrivate: false, layout: 'none' },
    
    // User routes
    { name: 'home', path: '/home', component: HomeScreen, isPrivate: true, layout: 'user' },
    { name: 'wallet', path: '/wallet', component: WalletScreen, isPrivate: true, layout: 'user' },
    { name: 'market', path: '/market', component: MarketScreen, isPrivate: true, layout: 'user' },
    { name: 'news', path: '/news', component: InfoNewsScreen, isPrivate: true, layout: 'user' },
    { name: 'health', path: '/health', component: HealthScreen, isPrivate: true, layout: 'user' },
    { name: 'account', path: '/account', component: MyAccountScreen, isPrivate: true, layout: 'user' },
    { name: 'cart', path: '/cart', component: CartScreen, isPrivate: true, layout: 'user' },
    { name: 'wishlist', path: '/wishlist', component: WishlistScreen, isPrivate: true, layout: 'user' },
    { name: 'my-products', path: '/my-products', component: MyProductsStoreScreen, isPrivate: true, layout: 'user' },
    { name: 'bookmarked-articles', path: '/bookmarked-articles', component: BookmarkedArticlesScreen, isPrivate: true, layout: 'user' },
    { name: 'loyalty', path: '/loyalty', component: LoyaltyScreen, isPrivate: true, layout: 'user' },
    { name: 'teleconsultation', path: '/teleconsultation', component: DoctorListScreen, isPrivate: true, layout: 'user' },
    { name: 'doctor-detail', path: '/doctor/:id', component: DoctorDetailScreen, isPrivate: true, layout: 'user' },
    { name: 'my-consultations', path: '/my-consultations', component: MyConsultationsScreen, isPrivate: true, layout: 'user' },
    { name: 'consultation-room', path: '/consultation/:id', component: ConsultationRoomScreen, isPrivate: true, layout: 'none' }, // Full-screen layout
    { name: 'prescriptions', path: '/prescriptions', component: EprescriptionScreen, isPrivate: true, layout: 'user' },
    { name: 'pharmacy-checkout', path: '/pharmacy-checkout/:eprescriptionId', component: PharmacyCheckoutScreen, isPrivate: true, layout: 'user' },
    { name: 'health-records', path: '/health-records', component: HealthRecordScreen, isPrivate: true, layout: 'user' },
    { name: 'insurance-claims', path: '/insurance-claims', component: InsuranceClaimScreen, isPrivate: true, layout: 'user' },
    { name: 'health-plus', path: '/health-plus', component: HealthPlusScreen, isPrivate: true, layout: 'user' },
    { name: 'subscribe-health-plus', path: '/subscribe-health-plus', component: SubscriptionUpsellScreen, isPrivate: true, layout: 'user' },
    { name: 'attendance-history', path: '/attendance-history', component: AttendanceHistoryScreen, isPrivate: true, layout: 'user' },
    { name: 'opex', path: '/opex', component: OpexScreen, isPrivate: true, layout: 'user' },
    { name: 'new-opex', path: '/opex/new', component: NewOpexRequestScreen, isPrivate: true, layout: 'user' },
    { name: 'features', path: '/features', component: AllFeaturesScreen, isPrivate: true, layout: 'user' },

    // Placeholder Service Routes
    { name: 'services-ppob', path: '/services/ppob', component: PPOBScreen, isPrivate: true, layout: 'user' },
    { name: 'services-gov', path: '/services/government', component: GovernmentServicesScreen, isPrivate: true, layout: 'user' },
    { name: 'services-lifestyle', path: '/services/lifestyle', component: LifestyleScreen, isPrivate: true, layout: 'user' },
    { name: 'services-topup', path: '/services/topup', component: MobileTopUpScreen, isPrivate: true, layout: 'user' },
    { name: 'services-cashout', path: '/services/cash-out', component: CashOutScreen, isPrivate: true, layout: 'user' },
    { name: 'services-daily', path: '/services/daily-needs', component: DailyNeedsScreen, isPrivate: true, layout: 'user' },
    { name: 'gov-pbb', path: '/government/pbb', component: PbbTaxScreen, isPrivate: true, layout: 'user' },
    { name: 'gov-samsat', path: '/government/samsat', component: ESamsatScreen, isPrivate: true, layout: 'user' },
    { name: 'gov-mpn', path: '/government/mpn', component: MpnG3Screen, isPrivate: true, layout: 'user' },
    { name: 'lifestyle-cinema', path: '/lifestyle/cinema', component: CinemaTicketScreen, isPrivate: true, layout: 'user' },
    { name: 'lifestyle-game', path: '/lifestyle/game-voucher', component: GameVoucherScreen, isPrivate: true, layout: 'user' },
    { name: 'lifestyle-donation', path: '/lifestyle/donation', component: DonationScreen, isPrivate: true, layout: 'user' },
    { name: 'placeholder-feature', path: '/placeholder/:featureName', component: FunctionalPlaceholderScreen, isPrivate: true, layout: 'user' },

    // Admin routes
    { name: 'admin-dashboard', path: '/admin/dashboard', component: AdminDashboard, isPrivate: true, layout: 'admin' },
    { name: 'admin-users', path: '/admin/users', component: AdminUserIntelligence, isPrivate: true, layout: 'admin' },
    { name: 'admin-system-api', path: '/admin/system/api', component: AdminApiIntegration, isPrivate: true, layout: 'admin' },
    { name: 'admin-system-scalability', path: '/admin/system/scalability', component: AdminScalability, isPrivate: true, layout: 'admin' },
    { name: 'admin-financials', path: '/admin/financials', component: AdminFinancialHub, isPrivate: true, layout: 'admin' },
    { name: 'admin-news', path: '/admin/news', component: AdminInfoNewsManagement, isPrivate: true, layout: 'admin' },
    { name: 'admin-marketplace', path: '/admin/marketplace', component: AdminMarketplaceOversight, isPrivate: true, layout: 'admin' },
    { name: 'admin-health', path: '/admin/health', component: AdminHealthProviderManagement, isPrivate: true, layout: 'admin' },
    { name: 'admin-monetization', path: '/admin/monetization', component: AdminMonetizationEngine, isPrivate: true, layout: 'admin' },
    { name: 'admin-tax', path: '/admin/tax', component: AdminTaxManagement, isPrivate: true, layout: 'admin' },
    { name: 'admin-home-orchestrator', path: '/admin/home-orchestrator', component: AdminHomePageOrchestrator, isPrivate: true, layout: 'admin' },
    { name: 'admin-assistant-hub', path: '/admin/assistant-hub', component: AdminAssistantHub, isPrivate: true, layout: 'admin' },
    { name: 'admin-personalization', path: '/admin/personalization', component: AdminPersonalizationEngine, isPrivate: true, layout: 'admin' },
    { name: 'admin-system-controls', path: '/admin/system/controls', component: AdminSystemControlsScreen, isPrivate: true, layout: 'admin' },
    { name: 'admin-system-service-linkage', path: '/admin/system/service-linkage', component: AdminServiceLinkageScreen, isPrivate: true, layout: 'admin' },
    { name: 'admin-system-integrity', path: '/admin/system/integrity', component: AdminSystemIntegrityScreen, isPrivate: true, layout: 'admin' },

    // HR routes
    { name: 'hr-portal', path: '/hr-portal', component: HrPortalScreen, isPrivate: true, layout: 'none' },
    { name: 'hr-dashboard', path: '/hr/dashboard', component: HrDashboard, isPrivate: true, layout: 'hr' },
    { name: 'hr-onboarding', path: '/hr/onboarding', component: HrOnboarding, isPrivate: true, layout: 'hr' },
    { name: 'hr-leave', path: '/hr/leave', component: HrLeaveManagement, isPrivate: true, layout: 'hr' },
    { name: 'hr-payroll', path: '/hr/payroll', component: HrPayroll, isPrivate: true, layout: 'hr' },
    { name: 'hr-copilot', path: '/hr/copilot', component: HrAiCopilotScreen, isPrivate: true, layout: 'hr' },
    { name: 'hr-wellness', path: '/hr/wellness', component: HrWellnessManagement, isPrivate: true, layout: 'hr' },
    { name: 'hr-attendance', path: '/hr/attendance', component: HrAttendanceManagement, isPrivate: true, layout: 'hr' },
    { name: 'hr-opex', path: '/hr/opex', component: HrOpexManagementScreen, isPrivate: true, layout: 'hr' },
    { name: 'hr-benefits', path: '/hr/benefits', component: HrBenefitManagement, isPrivate: true, layout: 'hr' },
    { name: 'hr-pay-later', path: '/hr/pay-later', component: HrPayLaterManagement, isPrivate: true, layout: 'hr' },
    { name: 'hr-performance', path: '/hr/performance', component: HrPerformanceScreen, isPrivate: true, layout: 'hr' },
    { name: 'hr-analytics', path: '/hr/analytics', component: HrPerformanceAnalytics, isPrivate: true, layout: 'hr' },


    // Finance routes
    { name: 'finance-dashboard', path: '/finance/dashboard', component: FinanceDashboard, isPrivate: true, layout: 'finance' },
    { name: 'finance-command-center', path: '/finance/command-center', component: FinanceCommandCenter, isPrivate: true, layout: 'finance' },
    { name: 'finance-payroll-report', path: '/finance/payroll-report', component: FinancePayrollReport, isPrivate: true, layout: 'finance' },
    { name: 'finance-pay-later', path: '/finance/pay-later', component: FinancePayLaterScreen, isPrivate: true, layout: 'finance' },

    // Manager routes
    { name: 'manager-dashboard', path: '/manager/dashboard', component: ManagerDashboardScreen, isPrivate: true, layout: 'manager' },

    // Fallback route
    { name: 'notfound', path: '*', component: NotFoundScreen, isPrivate: false, layout: 'none' },
];

// --- Role-Based Permissions ---
export const rolePermissions: Record<Role, string[]> = {
    [Role.Admin]: [
        'admin-dashboard', 'admin-users', 'admin-system-api', 'admin-system-scalability', 
        'admin-financials', 'admin-news', 'admin-marketplace', 'admin-health', 'admin-monetization',
        'admin-tax', 'admin-home-orchestrator', 'admin-assistant-hub', 'admin-personalization',
        'admin-system-controls', 'admin-system-service-linkage', 'admin-system-integrity'
    ],
    [Role.HR]: [
        'hr-portal', 'hr-dashboard', 'hr-onboarding', 'hr-leave', 'hr-payroll', 'hr-copilot', 'hr-wellness', 
        'hr-attendance', 'hr-opex', 'hr-benefits', 'hr-pay-later', 'hr-performance', 'hr-analytics'
    ],
    [Role.Finance]: [
        'finance-dashboard', 'finance-command-center', 'finance-payroll-report', 'finance-pay-later'
    ],
    [Role.User]: [
        'home', 'wallet', 'market', 'news', 'health', 'account', 'cart', 'wishlist',
        'my-products', 'bookmarked-articles', 'loyalty', 'teleconsultation', 'doctor-detail',
        'my-consultations', 'consultation-room', 'prescriptions', 'pharmacy-checkout', 'health-records',
        'insurance-claims', 'health-plus', 'subscribe-health-plus', 'attendance-history', 'opex', 'new-opex', 'features',
        'services-ppob', 'services-gov', 'services-lifestyle', 'services-topup', 'services-cashout', 'services-daily',
        'gov-pbb', 'gov-samsat', 'gov-mpn', 'lifestyle-cinema', 'lifestyle-game', 'lifestyle-donation',
        'placeholder-feature', 'manager-dashboard' // Allow User role to access manager dashboard if they are a manager
    ],
};