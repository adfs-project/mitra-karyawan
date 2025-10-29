import {
    User, Role, Product, Article, Transaction, Notification, Doctor, Consultation, Dispute, ApiIntegration,
    IntegrationStatus, ScalabilityService, ScalabilityServiceStatus, LeaveRequest, MonetizationConfig, TaxConfig,
    HomePageConfig, AdminWallets, PersonalizationRule, Order, HealthChallenge, InsuranceClaim
} from '../types';

export const initialUsers: User[] = [
    {
        id: 'admin-001',
        email: 'admin@mitra.com',
        password: 'adminpassword',
        profile: {
            name: 'Super Admin',
            phone: '081234567890',
            photoUrl: 'https://i.pravatar.cc/150?u=admin@mitra.com',
        },
        role: Role.Admin,
        status: 'active',
        wallet: { balance: 10000000, isFrozen: false },
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [], healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'hr-jkt-001',
        email: 'hr.jakarta@mitra.com',
        password: 'hrpassword',
        profile: {
            name: 'HR Jakarta',
            phone: '081234567891',
            photoUrl: 'https://i.pravatar.cc/150?u=hr.jakarta@mitra.com',
            branch: 'Jakarta',
        },
        role: Role.HR,
        status: 'active',
        wallet: { balance: 500000, isFrozen: false },
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [], healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'user-jkt-001',
        email: 'budi.karyawan@mitra.com',
        password: 'userpassword',
        profile: {
            name: 'Budi Karyawan',
            phone: '081234567892',
            photoUrl: 'https://i.pravatar.cc/150?u=budi.karyawan@mitra.com',
            branch: 'Jakarta',
            joinDate: '2022-01-15T00:00:00.000Z',
            salary: 8000000
        },
        role: Role.User,
        status: 'active',
        wallet: { balance: 750000, isFrozen: false },
        achievements: ['First Purchase'],
        loyaltyPoints: 1250,
        wishlist: ['p-002'],
        bookmarkedArticles: ['a-001'],
        healthData: { 
            moodHistory: [
                { date: '2023-10-25', mood: 'Biasa' },
                { date: '2023-10-26', mood: 'Senang' },
            ], 
            activeChallenges: ['steps-challenge'],
            wearableData: {
                steps: [
                    { date: '2023-10-25', value: 8500 },
                    { date: '2023-10-26', value: 10200 },
                ],
                sleep: [
                    { date: '2023-10-25', value: 6.5 },
                    { date: '2023-10-26', value: 7.8 },
                ]
            }
        },
        payLater: { status: 'approved', limit: 2000000, used: 250000 },
        isPremium: true,
    },
     {
        id: 'user-bdg-001',
        email: 'siti.nurhaliza@mitra.com',
        password: 'userpassword',
        profile: {
            name: 'Siti Nurhaliza',
            phone: '081234567893',
            photoUrl: 'https://i.pravatar.cc/150?u=siti.nurhaliza@mitra.com',
            branch: 'Bandung',
            joinDate: '2023-05-20T00:00:00.000Z',
            salary: 7500000
        },
        role: Role.User,
        status: 'active',
        wallet: { balance: 1200000, isFrozen: false },
        achievements: [],
        loyaltyPoints: 500,
        wishlist: [],
        bookmarkedArticles: [],
        healthData: { moodHistory: [], activeChallenges: [] },
        payLater: { status: 'pending', limit: 0, used: 0 }
    },
    {
        id: 'user-jkt-002',
        email: 'inactive.user@mitra.com',
        password: 'userpassword',
        profile: {
            name: 'Inactive User',
            phone: '081234567894',
            photoUrl: 'https://i.pravatar.cc/150?u=inactive.user@mitra.com',
            branch: 'Jakarta',
            joinDate: '2021-11-10T00:00:00.000Z',
            salary: 9000000
        },
        role: Role.User,
        status: 'inactive',
        wallet: { balance: 50000, isFrozen: true },
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [], healthData: { moodHistory: [], activeChallenges: [] },
        payLater: { status: 'not_applied', limit: 0, used: 0 }
    }
];

export const initialProducts: Product[] = [
    {
        id: 'p-001', name: 'Keyboard Mekanikal Wireless', description: 'Keyboard mekanikal 65% dengan konektivitas bluetooth dan 2.4Ghz. Cocok untuk kerja dan gaming.',
        price: 850000, stock: 10, category: 'Elektronik', imageUrl: 'https://picsum.photos/seed/keyboard/400/400',
        sellerId: 'user-jkt-001', sellerName: 'Budi Karyawan', rating: 4.8, reviewCount: 25, reviews: []
    },
    {
        id: 'p-002', name: 'Tumbler Kopi Tahan Panas', description: 'Tumbler 500ml stainless steel yang menjaga suhu minuman hingga 8 jam.',
        price: 150000, stock: 30, category: 'Rumah Tangga', imageUrl: 'https://picsum.photos/seed/tumbler/400/400',
        sellerId: 'user-bdg-001', sellerName: 'Siti Nurhaliza', rating: 4.9, reviewCount: 40, reviews: []
    },
     {
        id: 'p-003', name: 'Buku "Atomic Habits"', description: 'Buku self-improvement oleh James Clear. Kondisi baru, segel.',
        price: 95000, stock: 5, category: 'Hobi', imageUrl: 'https://picsum.photos/seed/book/400/400',
        sellerId: 'user-jkt-001', sellerName: 'Budi Karyawan', rating: 5.0, reviewCount: 15, reviews: []
    },
    // Daily Needs Products
    {
        id: 'dn-001', name: 'Indomie Goreng (5 pcs)', description: 'Paket 5 bungkus Indomie Mie Instan Goreng.',
        price: 15000, stock: 100, category: 'Makanan & Minuman', imageUrl: 'https://picsum.photos/seed/indomie/400/400',
        sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 5.0, reviewCount: 250, reviews: []
    },
    {
        id: 'dn-002', name: 'Kopi Kapal Api Special (165g)', description: 'Kopi bubuk Kapal Api Special 165g.',
        price: 14500, stock: 80, category: 'Makanan & Minuman', imageUrl: 'https://picsum.photos/seed/kopi/400/400',
        sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 4.9, reviewCount: 180, reviews: []
    },
    {
        id: 'dn-003', name: 'Gulaku Gula Pasir Premium (1kg)', description: 'Gula pasir putih premium kemasan 1kg.',
        price: 18000, stock: 120, category: 'Kebutuhan Dapur', imageUrl: 'https://picsum.photos/seed/gula/400/400',
        sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 4.9, reviewCount: 210, reviews: []
    },
    {
        id: 'dn-004', name: 'Sabun Mandi Lifebuoy Cair (450ml)', description: 'Sabun mandi cair anti-bakteri Lifebuoy kemasan botol 450ml.',
        price: 22000, stock: 60, category: 'Kebersihan Diri', imageUrl: 'https://picsum.photos/seed/sabun/400/400',
        sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 4.8, reviewCount: 150, reviews: []
    },
    {
        id: 'dn-005', name: 'Minyak Goreng Sania (2L)', description: 'Minyak goreng kemasan pouch 2 liter.',
        price: 35000, stock: 75, category: 'Kebutuhan Dapur', imageUrl: 'https://picsum.photos/seed/minyak/400/400',
        sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 4.9, reviewCount: 195, reviews: []
    },
    {
        id: 'dn-006', name: 'Teh Celup Sariwangi (Box 25)', description: 'Teh celup asli Sariwangi isi 25 kantong.',
        price: 6500, stock: 150, category: 'Makanan & Minuman', imageUrl: 'https://picsum.photos/seed/teh/400/400',
        sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 4.9, reviewCount: 230, reviews: []
    }
];

export const initialArticles: Article[] = [
    {
        id: 'a-001', title: 'Tips Produktif Saat Bekerja dari Rumah', summary: 'Maksimalkan produktivitas Anda dengan tips jitu ini saat WFH.', content: '',
        category: 'Produktivitas', author: 'HR Mitra', timestamp: '2023-10-26T10:00:00Z', status: 'Published',
        imageUrl: 'https://picsum.photos/seed/wfh/800/400',
        likes: ['user-bdg-001'], comments: [{ userId: 'user-bdg-001', userName: 'Siti Nurhaliza', comment: 'Sangat membantu, terima kasih!', timestamp: '2023-10-26T11:00:00Z', likes: [] }],
        type: 'standard'
    },
    {
        id: 'a-002', title: 'Polling: Menu Kantin Favorit Anda?', summary: 'Bantu kami menentukan menu baru untuk kantin bulan depan!', content: '',
        category: 'Kantor', author: 'GA Mitra', timestamp: '2023-10-25T14:00:00Z', status: 'Published',
        likes: ['user-jkt-001'], comments: [], type: 'poll',
        pollOptions: [
            { text: 'Nasi Goreng Spesial', votes: ['user-jkt-001'] },
            { text: 'Ayam Geprek Sambal Matah', votes: [] },
            { text: 'Soto Ayam Lamongan', votes: ['user-bdg-001'] }
        ]
    },
    {
        id: 'a-003', title: 'Pentingnya Dana Darurat dan Cara Memulainya', summary: 'Video penjelasan singkat mengenai perencanaan keuangan pribadi.', content: '',
        category: 'Keuangan', author: 'Finance Mitra', timestamp: '2023-10-27T09:00:00Z', status: 'Published',
        youtubeId: '8vbQd_b4daM', likes: [], comments: [], type: 'standard'
    }
];

export const initialTransactions: Transaction[] = [
    { id: 'tx-001', userId: 'user-jkt-001', userName: 'Budi Karyawan', type: 'Marketplace', amount: -150000, description: 'Pembelian Tumbler Kopi Tahan Panas', timestamp: new Date().toISOString(), status: 'Completed' },
    { id: 'tx-002', userId: 'user-bdg-001', userName: 'Siti Nurhaliza', type: 'Marketplace', amount: 150000, description: 'Penjualan Tumbler Kopi Tahan Panas', timestamp: new Date().toISOString(), status: 'Completed' },
    { id: 'tx-003', userId: 'user-jkt-001', userName: 'Budi Karyawan', type: 'Top-Up', amount: 500000, description: 'Top-Up via BCA Virtual Account', timestamp: new Date(Date.now() - 86400000).toISOString(), status: 'Completed' },
];

export const initialNotifications: Notification[] = [
    { id: 'n-001', userId: 'user-jkt-001', message: 'Pembelian Anda untuk Tumbler Kopi Tahan Panas telah berhasil.', type: 'success', read: false, timestamp: new Date().toISOString() }
];

export const initialDoctors: Doctor[] = [
    {
        id: 'doc-001', name: 'Dr. Budi Santoso', specialty: 'Dokter Umum', bio: 'Lulusan Universitas Indonesia dengan pengalaman 5 tahun di UGD.',
        imageUrl: 'https://i.pravatar.cc/150?u=doc-001', consultationFee: 75000,
        availableSlots: [
            { time: '09:00', isBooked: false }, { time: '09:30', isBooked: true }, { time: '10:00', isBooked: false },
            { time: '10:30', isBooked: false }, { time: '11:00', isBooked: false }, { time: '11:30', isBooked: true },
        ]
    },
    {
        id: 'doc-002', name: 'Dr. Siti Aminah', specialty: 'Psikolog', bio: 'Spesialis kesehatan mental dengan fokus pada manajemen stres dan kecemasan di tempat kerja.',
        imageUrl: 'https://i.pravatar.cc/150?u=doc-002', consultationFee: 150000,
        availableSlots: [
            { time: '13:00', isBooked: false }, { time: '14:00', isBooked: false }, { time: '15:00', isBooked: false },
        ]
    },
    {
        id: 'doc-003', name: 'Dr. Rina Wulandari', specialty: 'Ahli Gizi', bio: 'Membantu Anda merencanakan diet sehat dan seimbang untuk gaya hidup yang lebih baik.',
        imageUrl: 'https://i.pravatar.cc/150?u=doc-003', consultationFee: 120000,
        availableSlots: [
            { time: '10:00', isBooked: false }, { time: '11:00', isBooked: false },
        ]
    },
    {
        id: 'doc-004', name: 'Dr. Amanda Sari, Sp.KK', specialty: 'Spesialis Kulit', bio: 'Spesialis kulit dan kelamin dengan pengalaman 8 tahun di bidang dermatologi kosmetik dan klinis.',
        imageUrl: 'https://i.pravatar.cc/150?u=doc-004', consultationFee: 250000,
        availableSlots: [
            { time: '14:00', isBooked: false }, { time: '14:30', isBooked: false }, { time: '15:00', isBooked: false },
        ]
    },
    {
        id: 'doc-005', name: 'Dr. David Setiawan, Sp.A', specialty: 'Spesialis Anak', bio: 'Dokter anak yang berdedikasi untuk memberikan perawatan terbaik bagi buah hati Anda, dari bayi hingga remaja.',
        imageUrl: 'https://i.pravatar.cc/150?u=doc-005', consultationFee: 200000,
        availableSlots: [
            { time: '09:00', isBooked: true }, { time: '09:30', isBooked: false }, { time: '10:00', isBooked: false },
        ]
    }
];

export const initialConsultations: Consultation[] = [];

export const initialDisputes: Dispute[] = [
    {
        id: 'dispute-001',
        orderId: 'order-001',
        buyerId: 'user-jkt-001',
        buyerName: 'Budi Karyawan',
        sellerId: 'user-bdg-001',
        sellerName: 'Siti Nurhaliza',
        reason: 'Barang yang diterima rusak.',
        status: 'Open',
        timestamp: new Date().toISOString()
    }
];


// FIX: Added initialOrders for the admin dashboard GMV calculation.
export const initialOrders: Order[] = [
    {
        id: 'order-001',
        userId: 'user-jkt-001',
        items: [{ productId: 'p-002', quantity: 1 }],
        total: 150000,
        status: 'Completed',
        timestamp: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
    },
    {
        id: 'order-002',
        userId: 'user-bdg-001',
        items: [{ productId: 'p-003', quantity: 1 }],
        total: 95000,
        status: 'Shipped',
        timestamp: new Date(Date.now() - 3 * 86400000).toISOString(), // 3 days ago
    },
    {
        id: 'order-003',
        userId: 'user-jkt-001',
        items: [{ productId: 'p-001', quantity: 1 }, { productId: 'p-003', quantity: 1 }],
        total: 945000,
        status: 'Processing',
        timestamp: new Date(Date.now() - 1 * 86400000).toISOString(), // 1 day ago
    },
];

export const initialApiIntegrations: ApiIntegration[] = [
    // Banks
    { id: 'api-bca', name: 'BCA', type: 'Bank', status: IntegrationStatus.Inactive },
    { id: 'api-jago', name: 'Bank Jago', type: 'Bank', status: IntegrationStatus.Inactive },
    { id: 'api-mandiri', name: 'Mandiri', type: 'Bank', status: IntegrationStatus.Inactive },
    { id: 'api-bni', name: 'BNI', type: 'Bank', status: IntegrationStatus.Inactive },
    { id: 'api-bri', name: 'BRI', type: 'Bank', status: IntegrationStatus.Inactive },
    
    // E-Wallets
    { id: 'api-gopay', name: 'GoPay', type: 'E-Wallet', status: IntegrationStatus.Inactive },
    { id: 'api-ovo', name: 'OVO', type: 'E-Wallet', status: IntegrationStatus.Inactive },
    { id: 'api-dana', name: 'DANA', type: 'E-Wallet', status: IntegrationStatus.Inactive },
    { id: 'api-shopeepay', name: 'ShopeePay', type: 'E-Wallet', status: IntegrationStatus.Inactive },
    
    // Retail
    { id: 'api-alfamart', name: 'Alfamart', type: 'Retail', status: IntegrationStatus.Inactive },
    { id: 'api-indomart', name: 'Indomart', type: 'Retail', status: IntegrationStatus.Inactive },
];

export const initialScalabilityServices: ScalabilityService[] = [
    { id: 'scale-lb', type: 'load_balancer', name: 'Global Load Balancer', description: 'Distributes traffic across multiple servers to ensure high availability and prevent overload.', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: { servers: 1, rps: 150 } },
    { id: 'scale-cdn', type: 'cdn', name: 'Content Delivery Network', description: 'Caches static content at edge locations globally to reduce latency for users.', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: { cacheHitRatio: 0, latency: 250 } },
    { id: 'scale-redis', type: 'redis', name: 'In-Memory Cache (Redis)', description: 'Provides lightning-fast data access for frequently requested information, reducing database load.', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: { cacheHitRatio: 0, memoryUsage: 16, keys: 1200 } },
    { id: 'scale-rmq', type: 'rabbitmq', name: 'Message Queue (RabbitMQ)', description: 'Handles asynchronous tasks like notifications and processing, ensuring system responsiveness.', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: { queueLength: 0, processedPerSec: 0, workers: 2 } },
    { id: 'scale-replicas', type: 'read_replicas', name: 'Database Read Replicas', description: 'Creates copies of the database to handle high read traffic without impacting write performance.', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: { primaryLoad: 12, replicaLoad: 0, replicaLag: 5 } },
    { id: 'scale-sharding', type: 'db_sharding', name: 'Database Sharding', description: 'Horizontally partitions the database across multiple servers to handle massive data volumes.', status: ScalabilityServiceStatus.Inactive, cost: 0, logs: [], metadata: { shards: 1 } },
];

export const initialLeaveRequests: LeaveRequest[] = [
    { id: 'lr-001', userId: 'user-jkt-001', userName: 'Budi Karyawan', branch: 'Jakarta', startDate: '2023-12-26', endDate: '2023-12-27', reason: 'Acara keluarga.', status: 'Pending' }
];

export const initialMonetizationConfig: MonetizationConfig = {
    marketplaceCommission: 0.05,
    marketingCPA: 25000,
};

export const initialTaxConfig: TaxConfig = {
    ppnRate: 0.11,
    pph21Rate: 0.025,
};

export const initialHomePageConfig: HomePageConfig = {
    globalAnnouncement: {
        active: true,
        message: "Selamat datang di platform Mitra Karyawan! Jelajahi semua fiturnya.",
    },
    pinnedItemId: 'p-001',
    quickAccessOrder: ['ppob', 'market', 'health', 'gov', 'lifestyle', 'pulsa', 'cashout', 'daily'],
    featureFlags: {
        aiInvestmentBot: false,
    },
};

export const initialAdminWallets: AdminWallets = {
    profit: 7500, // From 5% commission on 150k sale
    tax: 0,
    cash: 50000000, // Initial cash
};

export const initialPersonalizationRules: PersonalizationRule[] = [
    {
        id: 'rule-1',
        name: 'Promo Bandung',
        conditions: [{ field: 'profile.branch', operator: 'equals', value: 'Bandung' }],
        action: { type: 'PIN_ITEM', payload: { itemId: 'p-002' } },
        isActive: true,
    }
];

export const initialHealthChallenges: HealthChallenge[] = [
    {
        id: 'steps-challenge',
        title: 'Tantangan 10.000 Langkah',
        description: 'Jalan 10.000 langkah setiap hari selama seminggu.',
        creator: 'System',
        participants: [
            { userId: 'user-jkt-001', progress: 85 },
            { userId: 'hr-jkt-001', progress: 60 },
        ]
    }
];

// Placeholder base64 image for receipts
const placeholderReceipt = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPoAAAFaCAYAAAB2Q6soAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAAJcEhZcwAADsMAAA7DAcdvqGQAAARpSURBVHja7cExAQAAAMKg9U/tbwagAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD43w4gGgAB3tLdAAAAAElFTkSuQmCC';

export const initialInsuranceClaims: InsuranceClaim[] = [
    {
        id: 'ic-001',
        userId: 'user-jkt-001',
        userName: 'Budi Karyawan',
        branch: 'Jakarta',
        type: 'Kacamata',
        amount: 750000,
        submissionDate: new Date(Date.now() - 2 * 86400000).toISOString(), // 2 days ago
        receiptUrl: placeholderReceipt,
        status: 'Pending'
    },
    {
        id: 'ic-002',
        userId: 'user-jkt-002',
        userName: 'Inactive User',
        branch: 'Jakarta',
        type: 'Rawat Jalan',
        amount: 150000,
        submissionDate: new Date(Date.now() - 5 * 86400000).toISOString(), // 5 days ago
        receiptUrl: placeholderReceipt,
        status: 'Approved'
    },
    {
        id: 'ic-003',
        userId: 'user-jkt-001',
        userName: 'Budi Karyawan',
        branch: 'Jakarta',
        type: 'Rawat Inap',
        amount: 2500000,
        submissionDate: new Date(Date.now() - 10 * 86400000).toISOString(), // 10 days ago
        receiptUrl: placeholderReceipt,
        status: 'Rejected'
    }
];