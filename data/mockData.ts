
import {
    User, Product, Article, Transaction, Notification, Doctor, Consultation,
    Dispute, ApiIntegration, ScalabilityService, LeaveRequest, MonetizationConfig,
    TaxConfig, HomePageConfig, AdminWallets, PersonalizationRule, Order,
    HealthChallenge, InsuranceClaim, AttendanceRecord, Role, IntegrationStatus,
    IntegrationType, ScalabilityServiceStatus, OpexRequest
} from '../types';

const now = new Date();
const yesterday = new Date(now);
yesterday.setDate(now.getDate() - 1);

export const initialUsers: User[] = [
    {
        id: 'admin-001',
        email: 'admin@mitra.com',
        password: 'password123',
        role: Role.Admin,
        profile: { name: 'Admin Mitra', phone: '081234567890', photoUrl: 'https://i.pravatar.cc/150?u=admin@mitra.com' },
        status: 'active',
        wallet: { balance: 1000000, isFrozen: false },
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [],
        healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'hr-001',
        email: 'hr.jakarta@mitra.com',
        password: 'password123',
        role: Role.HR,
        profile: { name: 'HR Jakarta', phone: '081234567891', photoUrl: 'https://i.pravatar.cc/150?u=hr.jakarta@mitra.com', branch: 'Jakarta' },
        status: 'active',
        wallet: { balance: 500000, isFrozen: false },
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [],
        healthData: { moodHistory: [], activeChallenges: [] }
    },
     {
        id: 'finance-001',
        email: 'finance.jakarta@mitra.com',
        password: 'password123',
        role: Role.Finance,
        profile: { name: 'Finance Jakarta', phone: '081234567893', photoUrl: 'https://i.pravatar.cc/150?u=finance.jakarta@mitra.com', branch: 'Jakarta' },
        status: 'active',
        wallet: { balance: 250000, isFrozen: false },
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [],
        healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'user-001',
        email: 'budi.employee@mitra.com',
        password: 'password123',
        role: Role.User,
        profile: { name: 'Budi Santoso', phone: '081234567892', photoUrl: 'https://i.pravatar.cc/150?u=budi.employee@mitra.com', branch: 'Jakarta', salary: 10000000, joinDate: '2023-01-15' },
        status: 'active',
        isPremium: true,
        wallet: { balance: 150000, isFrozen: false },
        achievements: ['First Purchase'], loyaltyPoints: 250, wishlist: ['p-002'], bookmarkedArticles: ['art-001'],
        healthData: { moodHistory: [{ date: '2023-10-26', mood: 'Senang' }], activeChallenges: [] }
    },
     {
        id: 'user-002',
        email: 'siti.employee@mitra.com',
        password: 'password123',
        role: Role.User,
        profile: { name: 'Siti Aminah', phone: '081234567894', photoUrl: 'https://i.pravatar.cc/150?u=siti.employee@mitra.com', branch: 'Jakarta', salary: 8000000, joinDate: '2022-05-20' },
        status: 'active',
        wallet: { balance: 75000, isFrozen: false },
        achievements: [], loyaltyPoints: 100, wishlist: [], bookmarkedArticles: [],
        healthData: { moodHistory: [{ date: '2023-10-26', mood: 'Biasa' }], activeChallenges: [] }
    },
];

export const initialProducts: Product[] = [
    { id: 'p-001', name: 'Keyboard Mekanikal', description: 'Keyboard bekas, kondisi 90%, switch biru.', price: 500000, stock: 1, category: 'Elektronik', imageUrl: 'https://picsum.photos/seed/keyboard/400/400', sellerId: 'user-002', sellerName: 'Siti Aminah', rating: 4.5, reviewCount: 12, reviews: [], status: 'Listed', createdAt: new Date().toISOString() },
    { id: 'p-002', name: 'Tas Ransel Eiger', description: 'Tas ransel original Eiger, jarang dipakai.', price: 350000, stock: 1, category: 'Fashion', imageUrl: 'https://picsum.photos/seed/backpack/400/400', sellerId: 'user-001', sellerName: 'Budi Santoso', rating: 4.8, reviewCount: 8, reviews: [], status: 'Listed', createdAt: new Date().toISOString() },
];

export const initialArticles: Article[] = [
    { id: 'art-001', title: 'Tips Menjaga Kesehatan di Kantor', summary: 'Berikut adalah beberapa tips sederhana untuk tetap sehat...', content: 'Konten lengkap...', author: 'Admin', timestamp: '2023-10-26T10:00:00Z', category: 'Kesehatan', imageUrl: 'https://picsum.photos/seed/health/400/200', likes: ['user-001'], comments: [], status: 'Published', type: 'standard' },
    { id: 'art-002', title: 'Polling: Fitur Apa yang Paling Kamu Inginkan?', summary: 'Bantu kami meningkatkan aplikasi dengan memilih fitur berikutnya!', content: '...', author: 'Admin', timestamp: '2023-10-25T14:00:00Z', category: 'Aplikasi', likes: [], comments: [], status: 'Published', type: 'poll', pollOptions: [{ text: 'Fitur Investasi', votes: [] }, { text: 'Fitur Pinjaman', votes: [] }] },
];

export const initialTransactions: Transaction[] = [
    { id: 'tx-001', userId: 'user-001', userName: 'Budi Santoso', type: 'Top-Up', amount: 200000, description: 'Top-Up via BCA VA', status: 'Completed', timestamp: '2023-10-26T09:00:00Z' }
];

export const initialNotifications: Notification[] = [
    { id: 'notif-001', userId: 'user-001', message: 'Selamat datang di Mitra Karyawan!', read: false, timestamp: '2023-10-26T08:00:00Z', type: 'info' }
];
export const initialDoctors: Doctor[] = [
    { id: 'doc-001', name: 'Dr. Strange', specialty: 'Dokter Umum', bio: 'Lulusan terbaik...', consultationFee: 75000, imageUrl: 'https://i.pravatar.cc/150?u=dr.strange', availableSlots: [{ time: '09:00', isBooked: false }] }
];
export const initialConsultations: Consultation[] = [];
export const initialDisputes: Dispute[] = [];
export const initialApiIntegrations: ApiIntegration[] = [
    { id: 'api-bca', name: 'BCA', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    { id: 'api-gopay', name: 'GoPay', type: IntegrationType.EWallet, status: IntegrationStatus.Inactive },
    { id: 'api-tixid', name: 'Tix ID', type: IntegrationType.Retail, status: IntegrationStatus.Inactive },
];
export const initialScalabilityServices: ScalabilityService[] = [
    { id: 'scale-redis', name: 'Redis Cache', type: 'redis', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: {} }
];
export const initialLeaveRequests: LeaveRequest[] = [];
export const initialMonetizationConfig: MonetizationConfig = { marketplaceCommission: 0.05, marketingCPA: 15000 };
export const initialTaxConfig: TaxConfig = { ppnRate: 0.11, pph21Rate: 0.025 };
export const initialHomePageConfig: HomePageConfig = { 
    pinnedItemId: null,
    featureFlags: {
        aiAnomalyDetection: false,
        aiSymptomChecker: true,
        aiHealthCoach: false,
        aiInvestmentBot: false,
    },
    isIntegrityGuardianActive: true,
};
export const initialAdminWallets: AdminWallets = { profit: 0, tax: 0, cash: 10000000 };
export const initialPersonalizationRules: PersonalizationRule[] = [];
export const initialOrders: Order[] = [];
export const initialHealthChallenges: HealthChallenge[] = [
    { id: 'hc-001', title: 'Tantangan 10.000 Langkah', description: 'Ayo berjalan 10.000 langkah setiap hari selama 30 hari!', creator: { hrId: 'hr-001', branch: 'Jakarta' }, participants: [] }
];
export const initialInsuranceClaims: InsuranceClaim[] = [];
export const initialAttendanceRecords: AttendanceRecord[] = [
    { id: 'att-001', userId: 'user-001', userName: 'Budi Santoso', branch: 'Jakarta', date: yesterday.toISOString().split('T')[0], clockInTime: `${yesterday.toISOString().split('T')[0]}T08:30:00.000Z`, clockOutTime: `${yesterday.toISOString().split('T')[0]}T17:00:00.000Z`, clockInLocation: { latitude: -6.20, longitude: 106.81 }, clockOutLocation: { latitude: -6.20, longitude: 106.81 } }
];
export const initialOpexRequests: OpexRequest[] = [];