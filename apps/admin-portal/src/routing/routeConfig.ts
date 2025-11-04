
import React from 'react';
import { Role, lazyWithTimeout } from '@mk/shared';

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
const DeactivatedAccountScreen = lazyWithTimeout(() => import('../screens/auth/DeactivatedAccountScreen'));

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

// --- Route Definitions ---
export const adminRoutes: RouteConfig[] = [
    // Public routes
    { name: 'login', path: '/login', component: LoginScreen, isPrivate: false, layout: 'none' },
    { name: 'deactivated', path: '/deactivated', component: DeactivatedAccountScreen, isPrivate: false, layout: 'none' },
    
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
        'hr-dashboard', 'hr-onboarding', 'hr-leave', 'hr-payroll', 'hr-copilot', 'hr-wellness', 
        'hr-attendance', 'hr-opex', 'hr-benefits', 'hr-pay-later', 'hr-performance', 'hr-analytics'
    ],
    [Role.Finance]: [
        'finance-dashboard', 'finance-command-center', 'finance-payroll-report', 'finance-pay-later'
    ],
    [Role.User]: [
        // Users might be managers, so they need access to the manager dashboard.
        'manager-dashboard'
    ],
};