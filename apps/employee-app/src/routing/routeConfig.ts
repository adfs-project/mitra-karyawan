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

// Common Screens
const NotFoundScreen = lazyWithTimeout(() => import('../screens/common/NotFoundScreen'));
const FunctionalPlaceholderScreen = lazyWithTimeout(() => import('../screens/common/FunctionalPlaceholderScreen'));

// --- Route Definitions ---
export const employeeRoutes: RouteConfig[] = [
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

    // Fallback route
    { name: 'notfound', path: '*', component: NotFoundScreen, isPrivate: false, layout: 'none' },
];

// --- Role-Based Permissions ---
export const rolePermissions: Record<Role, string[]> = {
    [Role.Admin]: [],
    [Role.HR]: [],
    [Role.Finance]: [],
    [Role.User]: [
        'home', 'wallet', 'market', 'news', 'health', 'account', 'cart', 'wishlist',
        'my-products', 'bookmarked-articles', 'loyalty', 'teleconsultation', 'doctor-detail',
        'my-consultations', 'consultation-room', 'prescriptions', 'pharmacy-checkout', 'health-records',
        'insurance-claims', 'health-plus', 'subscribe-health-plus', 'attendance-history', 'opex', 'new-opex', 'features',
        'services-ppob', 'services-gov', 'services-lifestyle', 'services-topup', 'services-cashout', 'services-daily',
        'gov-pbb', 'gov-samsat', 'gov-mpn', 'lifestyle-cinema', 'lifestyle-game', 'lifestyle-donation',
        'placeholder-feature'
    ],
};
