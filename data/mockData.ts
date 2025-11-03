// FIX: The file content was placeholder text. Replaced it with the application's mock data definitions.
import {
    User, Product, Article, Transaction, Notification, Doctor, Consultation,
    Dispute, ApiIntegration, ScalabilityService, LeaveRequest, MonetizationConfig,
    TaxConfig, HomePageConfig, AdminWallets, PersonalizationRule, Order,
    HealthChallenge, InsuranceClaim, AttendanceRecord, OpexRequest, Role,
    IntegrationType, IntegrationStatus, ScalabilityServiceStatus,
    PerformanceReview
} from '../types';

export const initialUsers: User[] = [
    {
        id: 'admin-001',
        email: 'admin@mitrakaryawan.com',
        password: 'password123',
        role: Role.Admin,
        profile: { name: 'Admin Utama', phone: '081234567890', photoUrl: 'https://i.pravatar.cc/150?u=admin@mitrakaryawan.com' },
        status: 'active',
        wallet: { balance: 0, isFrozen: false },
        isPremium: true,
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [],
        healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'hr-jakarta-001',
        email: 'hr.jakarta@mitrakaryawan.com',
        password: 'password123',
        role: Role.HR,
        profile: { name: 'HR Jakarta', phone: '081234567891', photoUrl: 'https://i.pravatar.cc/150?u=hr.jakarta@mitrakaryawan.com', branch: 'Jakarta', isHeadOfBranch: true },
        status: 'active',
        wallet: { balance: 100000, isFrozen: false },
        isPremium: false,
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [],
        healthData: { moodHistory: [], activeChallenges: [] }
    },
     {
        id: 'finance-jakarta-001',
        email: 'finance.jakarta@mitrakaryawan.com',
        password: 'password123',
        role: Role.Finance,
        profile: { name: 'Finance Jakarta', phone: '081234567892', photoUrl: 'https://i.pravatar.cc/150?u=finance.jakarta@mitrakaryawan.com', branch: 'Jakarta' },
        status: 'active',
        wallet: { balance: 50000, isFrozen: false },
        isPremium: false,
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [],
        healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'user-jakarta-001',
        email: 'budi.santoso@mitrakaryawan.com',
        password: 'password123',
        role: Role.User,
        profile: {
            name: 'Budi Santoso', phone: '081234567893', photoUrl: 'https://i.pravatar.cc/150?u=budi.santoso@mitrakaryawan.com',
            branch: 'Jakarta', salary: 8000000, joinDate: '2022-01-15', employmentStatus: 'Private Employee',
            companyName: 'Mitra Karyawan', employeeType: 'Permanent', placeOfBirth: 'Jakarta', dateOfBirth: '1995-05-20',
            managerId: 'hr-jakarta-001'
        },
        status: 'active',
        wallet: { balance: 500000, isFrozen: false },
        isPremium: true,
        achievements: ['First Purchase'],
        loyaltyPoints: 150,
        wishlist: ['prod-002'],
        bookmarkedArticles: ['art-001'],
        healthData: { moodHistory: [{ date: '2024-07-20', mood: 'Senang' }, { date: '2024-07-21', mood: 'Senang' }, { date: '2024-07-22', mood: 'Biasa' }], activeChallenges: ['hc-001'] },
        payLater: { status: 'approved', limit: 5000000, remainingLimit: 4500000 }
    },
    {
        id: 'user-jakarta-002',
        email: 'siti.aminah@mitrakaryawan.com',
        password: 'password123',
        role: Role.User,
        profile: {
            name: 'Siti Aminah', phone: '081234567894', photoUrl: 'https://i.pravatar.cc/150?u=siti.aminah@mitrakaryawan.com',
            branch: 'Jakarta', salary: 7500000, joinDate: '2023-03-10', employmentStatus: 'Private Employee',
            companyName: 'Mitra Karyawan', employeeType: 'Contract', placeOfBirth: 'Bandung', dateOfBirth: '1998-11-12',
            managerId: 'hr-jakarta-001'
        },
        status: 'active',
        wallet: { balance: 25000, isFrozen: false },
        isPremium: false,
        achievements: [], loyaltyPoints: 20, wishlist: [], bookmarkedArticles: [],
        healthData: { moodHistory: [{ date: '2024-07-22', mood: 'Sedih' }], activeChallenges: [] },
        payLater: { status: 'pending' }
    },
    {
        id: 'user-jakarta-003',
        email: 'charlie.darmawan@mitrakaryawan.com',
        password: 'password123',
        role: Role.User,
        profile: {
            name: 'Charlie Darmawan', phone: '081234567895', photoUrl: 'https://i.pravatar.cc/150?u=charlie.darmawan@mitrakaryawan.com',
            branch: 'Jakarta', salary: 9000000, joinDate: '2021-08-20', employmentStatus: 'Private Employee',
            companyName: 'Mitra Karyawan', employeeType: 'Permanent', placeOfBirth: 'Surabaya', dateOfBirth: '1992-03-15',
            managerId: 'hr-jakarta-001'
        },
        status: 'active',
        wallet: { balance: 1200000, isFrozen: false },
        isPremium: true,
        achievements: ['First Purchase', 'Top Spender'],
        loyaltyPoints: 500,
        wishlist: [],
        bookmarkedArticles: [],
        healthData: { moodHistory: [{ date: '2024-07-22', mood: 'Sangat Senang' }], activeChallenges: [] },
        payLater: { status: 'approved', limit: 10000000, remainingLimit: 8000000 }
    }
];

export const initialProducts: Product[] = [
    { id: 'prod-001', name: 'Headphone Bluetooth', description: 'Headphone wireless dengan noise cancelling.', price: 750000, stock: 10, category: 'Elektronik', imageUrl: 'https://picsum.photos/seed/prod-001/400/400', sellerId: 'user-jakarta-001', sellerName: 'Budi Santoso', rating: 4.5, reviewCount: 20, reviews: [], status: 'Listed', createdAt: new Date().toISOString() },
    { id: 'prod-002', name: 'Meja Kerja Ergonomis', description: 'Meja kerja yang dapat diatur ketinggiannya.', price: 2500000, stock: 5, category: 'Furnitur', imageUrl: 'https://picsum.photos/seed/prod-002/400/400', sellerId: 'admin-001', sellerName: 'Koperasi Karyawan', rating: 4.8, reviewCount: 15, reviews: [], status: 'Needs Review', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'prod-k-001', name: 'Kopi Instan Sachet (10 pcs)', description: 'Kopi hitam instan untuk memulai hari Anda.', price: 15000, stock: 100, category: 'Kebutuhan Harian', imageUrl: 'https://picsum.photos/seed/kopi/400/400', sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 4.9, reviewCount: 150, reviews: [], status: 'Listed', createdAt: new Date().toISOString() },
    { id: 'prod-k-002', name: 'Mie Instan Goreng (5 pcs)', description: 'Paket 5 bungkus mie instan goreng.', price: 14500, stock: 200, category: 'Kebutuhan Harian', imageUrl: 'https://picsum.photos/seed/mie/400/400', sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 4.8, reviewCount: 250, reviews: [], status: 'Listed', createdAt: new Date().toISOString() },
    { id: 'prod-k-003', name: 'Sabun Mandi Cair 450ml', description: 'Sabun mandi cair dengan aroma menyegarkan.', price: 22000, stock: 50, category: 'Perawatan Diri', imageUrl: 'https://picsum.photos/seed/sabun/400/400', sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 4.7, reviewCount: 80, reviews: [], status: 'Listed', createdAt: new Date().toISOString() },
];

export const initialArticles: Article[] = [
    { id: 'art-001', title: 'Tips Menjaga Kesehatan di Kantor', summary: 'Cara sederhana untuk tetap sehat saat bekerja.', content: 'Bekerja di kantor seringkali membuat kita lupa...', author: 'Admin Utama', timestamp: new Date().toISOString(), category: 'Kesehatan', imageUrl: 'https://picsum.photos/seed/art-001/800/400', likes: ['user-jakarta-001'], comments: [], status: 'Published', type: 'standard', monetization: { enabled: true, revenueGenerated: 15000 } },
    { id: 'art-002', title: 'Polling: WFH atau WFO?', summary: 'Bagaimana preferensi kerja Anda?', content: 'Berikan suara Anda!', author: 'HR Jakarta', timestamp: new Date(Date.now() - 86400000 * 2).toISOString(), category: 'Info HR', likes: [], comments: [], status: 'Published', type: 'poll', pollOptions: [{ text: 'Full WFH', votes: []}, { text: 'Hybrid', votes: ['user-jakarta-001']}, { text: 'Full WFO', votes: []}], monetization: { enabled: false, revenueGenerated: 0 } },
];

export const initialTransactions: Transaction[] = [
    { id: 'tx-001', userId: 'user-jakarta-001', userName: 'Budi Santoso', type: 'Top-Up', amount: 1000000, description: 'Top-Up via BCA Virtual Account', status: 'Completed', timestamp: new Date().toISOString() },
    { id: 'tx-002', userId: 'user-jakarta-001', userName: 'Budi Santoso', type: 'Marketplace', amount: -750000, description: 'Pembelian Headphone Bluetooth', status: 'Completed', timestamp: new Date(Date.now() - 3600000).toISOString(), relatedId: 'order-001' },
];

export const initialNotifications: Notification[] = [
    { id: 'notif-001', userId: 'user-jakarta-001', message: 'Top-Up sebesar Rp 1.000.000 berhasil!', read: true, timestamp: new Date().toISOString(), type: 'success' },
];

export const initialDoctors: Doctor[] = [
    { id: 'doc-001', name: 'Dr. John Doe', specialty: 'Dokter Umum', bio: 'Lulusan Universitas Indonesia dengan pengalaman 5 tahun.', consultationFee: 150000, imageUrl: 'https://i.pravatar.cc/150?u=doc-001', availableSlots: [{ time: '09:00', isBooked: false }, { time: '10:00', isBooked: true }] },
];

export const initialConsultations: Consultation[] = [
    { id: 'cons-001', userId: 'user-jakarta-001', userName: 'Budi Santoso', doctorId: 'doc-001', doctorName: 'Dr. John Doe', doctorSpecialty: 'Dokter Umum', scheduledTime: new Date(Date.now() + 86400000).toISOString(), status: 'Scheduled' }
];

export const initialDisputes: Dispute[] = [
    { id: 'disp-001', orderId: 'order-001', userId: 'user-jakarta-001', reason: 'Barang tidak sesuai deskripsi.', status: 'Open', timestamp: new Date().toISOString() }
];

export const initialApiIntegrations: ApiIntegration[] = [
    // --- Bank BUMN ---
    { id: 'bank-mandiri', name: 'Bank Mandiri', type: IntegrationType.Bank, status: IntegrationStatus.Active },
    { id: 'bank-bri', name: 'Bank Rakyat Indonesia (BRI)', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    { id: 'bank-bni', name: 'Bank Negara Indonesia (BNI)', type: IntegrationType.Bank, status: IntegrationStatus.Active },
    { id: 'bank-btn', name: 'Bank Tabungan Negara (BTN)', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    // --- Bank Swasta ---
    { id: 'bca-va', name: 'BCA', type: IntegrationType.Bank, status: IntegrationStatus.Active },
    { id: 'bank-danamon', name: 'Bank Danamon', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    { id: 'bank-cimb', name: 'Bank CIMB Niaga', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    { id: 'bank-permata', name: 'Bank Permata', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    // --- Bank Daerah ---
    { id: 'bank-dki', name: 'Bank DKI', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    { id: 'bank-bjb', name: 'Bank BJB', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    { id: 'bank-sumsel', name: 'Bank Sumsel Babel', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    // --- Bank Asing ---
    { id: 'bank-citi', name: 'Citibank', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    { id: 'bank-hsbc', name: 'HSBC', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    { id: 'bank-sc', name: 'Standard Chartered', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    // --- Bank Syariah ---
    { id: 'bank-bsi', name: 'Bank Syariah Indonesia (BSI)', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },
    { id: 'bank-muamalat', name: 'Bank Muamalat', type: IntegrationType.Bank, status: IntegrationStatus.Inactive },

    // --- E-Wallets ---
    { id: 'gopay-gw', name: 'GoPay', type: IntegrationType.EWallet, status: IntegrationStatus.Inactive },
    { id: 'ovo-gw', name: 'OVO', type: IntegrationType.EWallet, status: IntegrationStatus.Active },
    { id: 'dana-gw', name: 'DANA', type: IntegrationType.EWallet, status: IntegrationStatus.Active },
    { id: 'linkaja-gw', name: 'LinkAja', type: IntegrationType.EWallet, status: IntegrationStatus.Inactive },
    { id: 'shopeepay-gw', name: 'ShopeePay', type: IntegrationType.EWallet, status: IntegrationStatus.Inactive },
    { id: 'bayarind-gw', name: 'Bayarind', type: IntegrationType.EWallet, status: IntegrationStatus.Inactive },
    { id: 'octo-gw', name: 'OCTO Mobile', type: IntegrationType.EWallet, status: IntegrationStatus.Inactive },
    { id: 'sakuku-gw', name: 'Sakuku', type: IntegrationType.EWallet, status: IntegrationStatus.Inactive },
    { id: 'jenius-gw', name: 'Jenius', type: IntegrationType.EWallet, status: IntegrationStatus.Inactive },
    { id: 'doku-gw', name: 'Doku Wallet', type: IntegrationType.EWallet, status: IntegrationStatus.Inactive },

    // --- Retail ---
    { id: 'alfamart-retail', name: 'Alfamart', type: IntegrationType.Retail, status: IntegrationStatus.Active },
    { id: 'indomaret-retail', name: 'Indomaret', type: IntegrationType.Retail, status: IntegrationStatus.Inactive },
];


export const initialScalabilityServices: ScalabilityService[] = [
    { id: 'redis-1', name: 'Redis Cache', type: 'redis', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: {} },
    { id: 'rabbitmq-1', name: 'RabbitMQ Queue', type: 'rabbitmq', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: {} },
    { id: 'read-replicas-1', name: 'Read Replicas', type: 'read_replicas', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: {} },
    { id: 'load-balancer-1', name: 'Load Balancer', type: 'load_balancer', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: {} },
    { id: 'cdn-1', name: 'CDN', type: 'cdn', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: {} },
    { id: 'db-sharding-1', name: 'DB Sharding', type: 'db_sharding', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: {} },
];

export const initialLeaveRequests: LeaveRequest[] = [
    { id: 'lr-001', userId: 'user-jakarta-001', userName: 'Budi Santoso', branch: 'Jakarta', startDate: '2024-08-01', endDate: '2024-08-03', reason: 'Acara keluarga.', status: 'Pending' }
];

export const initialMonetizationConfig: MonetizationConfig = { marketplaceCommission: 0.05, marketingCPA: 10000 };
export const initialTaxConfig: TaxConfig = { ppnRate: 0.11, pph21Rate: 0.025 };
export const initialHomePageConfig: HomePageConfig = { 
    pinnedItemId: null,
    featureFlags: { aiAnomalyDetection: true, aiSymptomChecker: true, aiHealthCoach: false, aiInvestmentBot: false },
    isIntegrityGuardianActive: true
};
export const initialAdminWallets: AdminWallets = { profit: 150000, tax: 50000, cash: 10000000 };
export const initialPersonalizationRules: PersonalizationRule[] = [];

export const initialOrders: Order[] = [
    { id: 'order-001', userId: 'user-jakarta-001', items: [{ productId: 'prod-001', productName: 'Headphone Bluetooth', quantity: 1, price: 750000 }], total: 750000, timestamp: new Date(Date.now() - 3600000).toISOString() }
];

export const initialHealthChallenges: HealthChallenge[] = [
    { id: 'hc-001', title: '10,000 Langkah Sehari', description: 'Jalan 10,000 langkah setiap hari selama 30 hari.', creator: { hrId: 'hr-jakarta-001', branch: 'Jakarta' }, participants: [{ userId: 'user-jakarta-001', progress: 50 }] }
];

export const initialInsuranceClaims: InsuranceClaim[] = [
    { id: 'ic-001', userId: 'user-jakarta-001', userName: 'Budi Santoso', branch: 'Jakarta', type: 'Rawat Jalan', amount: 250000, submissionDate: new Date().toISOString(), status: 'Pending', receiptUrl: '' }
];

export const initialAttendanceRecords: AttendanceRecord[] = [
    { id: 'att-001', userId: 'user-jakarta-001', userName: 'Budi Santoso', branch: 'Jakarta', date: new Date().toISOString().split('T')[0], clockInTime: new Date(new Date().setHours(8, 30, 0, 0)).toISOString(), clockInLocation: { latitude: -6.2, longitude: 106.8 } }
];

export const initialOpexRequests: OpexRequest[] = [
    { id: 'opex-001', userId: 'user-jakarta-001', userName: 'Budi Santoso', branch: 'Jakarta', type: 'Bensin', amount: 50000, description: 'Bensin untuk meeting klien.', timestamp: new Date().toISOString(), status: 'Pending HR Verification', proofLocation: { latitude: -6.2, longitude: 106.8 }, proofPhotoUrl1: '', proofPhotoUrl2: '' }
];

export const initialPerformanceReviews: PerformanceReview[] = [
    {
        id: 'pr-001',
        userId: 'user-jakarta-001',
        period: 'Q3 2024',
        kpis: [
            { id: 'kpi-001', metric: 'Sales Target', target: 500000000, actual: 0, weight: 50, employeeComment: '', managerComment: '' },
            { id: 'kpi-002', metric: 'Customer Satisfaction', target: 95, actual: 0, weight: 30, employeeComment: '', managerComment: '' },
            { id: 'kpi-003', metric: 'New Leads Generated', target: 50, actual: 0, weight: 20, employeeComment: '', managerComment: '' },
        ],
        finalScore: 0,
        status: 'Pending'
    },
    {
        id: 'pr-002',
        userId: 'user-jakarta-002',
        period: 'Q3 2024',
        kpis: [
            { id: 'kpi-004', metric: 'Project Delivery On-Time', target: 100, actual: 90, weight: 60, employeeComment: 'Ada beberapa kendala di proyek A, tapi berhasil diselesaikan.', managerComment: '' },
            { id: 'kpi-005', metric: 'Team Collaboration Score', target: 90, actual: 95, weight: 40, employeeComment: 'Berhasil berkolaborasi dengan baik dengan tim desain.', managerComment: '' },
        ],
        finalScore: 0,
        status: 'SelfAssessmentComplete'
    },
     {
        id: 'pr-003',
        userId: 'user-jakarta-003',
        period: 'Q3 2024',
        kpis: [
            { id: 'kpi-006', metric: 'Client Retention Rate', target: 95, actual: 98, weight: 70, employeeComment: 'Berhasil mempertahankan semua klien utama.', managerComment: 'Kerja bagus dalam menjaga hubungan dengan klien.' },
            { id: 'kpi-007', metric: 'Upsell Revenue', target: 200000000, actual: 250000000, weight: 30, employeeComment: 'Melebihi target upsell.', managerComment: 'Performa luar biasa, melebihi ekspektasi.' },
        ],
        finalScore: 110.11,
        status: 'Finalized'
    }
];