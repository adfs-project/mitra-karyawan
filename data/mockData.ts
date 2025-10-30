import { Role, User, Product, Article, Transaction, Notification, Doctor, Consultation, Dispute, ApiIntegration, IntegrationStatus, ScalabilityService, ScalabilityServiceStatus, LeaveRequest, MonetizationConfig, TaxConfig, HomePageConfig, AdminWallets, PersonalizationRule, Order, HealthChallenge, InsuranceClaim, AttendanceRecord, OpexRequest, Eprescription, HealthDocument } from '../types';

export const initialUsers: User[] = [
    {
        id: 'admin-001',
        email: 'admin@mitra.com',
        password: 'password',
        profile: { name: 'Admin Utama', phone: '081234567890', photoUrl: 'https://i.pravatar.cc/150?u=admin-001' },
        role: Role.Admin,
        status: 'active',
        wallet: { balance: 0, isFrozen: false },
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [], healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'hr-jakarta-001',
        email: 'hr.jakarta@mitra.com',
        password: 'password',
        profile: { name: 'HR Jakarta', phone: '081234567891', photoUrl: 'https://i.pravatar.cc/150?u=hr-jakarta-001', branch: 'Jakarta', joinDate: '2022-01-15', salary: 15000000 },
        role: Role.HR,
        status: 'active',
        wallet: { balance: 250000, isFrozen: false },
        achievements: [], loyaltyPoints: 50, wishlist: [], bookmarkedArticles: [], healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'hr-bandung-001',
        email: 'hr.bandung@mitra.com',
        password: 'password',
        profile: { name: 'HR Bandung', phone: '081234567895', photoUrl: 'https://i.pravatar.cc/150?u=hr-bandung-001', branch: 'Bandung', joinDate: '2022-02-15', salary: 14000000 },
        role: Role.HR,
        status: 'active',
        wallet: { balance: 100000, isFrozen: false },
        achievements: [], loyaltyPoints: 40, wishlist: [], bookmarkedArticles: [], healthData: { moodHistory: [], activeChallenges: [] }
    },
     {
        id: 'finance-head-001',
        email: 'finance.head@mitra.com',
        password: 'password',
        profile: { name: 'Finance Head (Jakarta)', phone: '081234567888', photoUrl: 'https://i.pravatar.cc/150?u=finance-head-001', branch: 'Jakarta' },
        role: Role.Finance,
        status: 'active',
        wallet: { balance: 0, isFrozen: false },
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [], healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'finance-bandung-001',
        email: 'finance.bandung@mitra.com',
        password: 'password',
        profile: { name: 'Finance Bandung', phone: '081234567889', photoUrl: 'https://i.pravatar.cc/150?u=finance-bandung-001', branch: 'Bandung' },
        role: Role.Finance,
        status: 'active',
        wallet: { balance: 0, isFrozen: false },
        achievements: [], loyaltyPoints: 0, wishlist: [], bookmarkedArticles: [], healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'user-jakarta-001',
        email: 'budi.jakarta@mitra.com',
        password: 'password',
        profile: { name: 'Budi Santoso', phone: '081234567892', photoUrl: 'https://i.pravatar.cc/150?u=user-jakarta-001', branch: 'Jakarta', joinDate: '2023-03-20', salary: 8000000 },
        role: Role.User,
        status: 'active',
        wallet: { balance: 500000, isFrozen: false },
        achievements: ['First Purchase'], loyaltyPoints: 120, wishlist: ['p-001'], bookmarkedArticles: ['a-001'], healthData: { moodHistory: [{ date: '2023-10-26', mood: 'Senang'}], activeChallenges: [] }
    },
    {
        id: 'user-bandung-001',
        email: 'dina.bandung@mitra.com',
        password: 'password',
        profile: { name: 'Dina Sari', phone: '081234567894', photoUrl: 'https://i.pravatar.cc/150?u=user-bandung-001', branch: 'Bandung', joinDate: '2023-05-10', salary: 7800000 },
        role: Role.User,
        status: 'active',
        wallet: { balance: 200000, isFrozen: false },
        achievements: [], loyaltyPoints: 30, wishlist: [], bookmarkedArticles: [], healthData: { moodHistory: [], activeChallenges: [] }
    },
    {
        id: 'user-inactive-001',
        email: 'siti.inactive@mitra.com',
        password: 'password',
        profile: { name: 'Siti Aminah', phone: '081234567893', photoUrl: 'https://i.pravatar.cc/150?u=user-inactive-001', branch: 'Jakarta', joinDate: '2022-11-01', salary: 7500000 },
        role: Role.User,
        status: 'inactive',
        wallet: { balance: 15000, isFrozen: true },
        achievements: [], loyaltyPoints: 10, wishlist: [], bookmarkedArticles: [], healthData: { moodHistory: [], activeChallenges: [] }
    },
];

export const initialProducts: Product[] = [
    { id: 'p-001', name: 'Keyboard Mekanikal Bekas', description: 'Kondisi 90%, switch biru, jarang dipakai.', price: 450000, stock: 1, category: 'Elektronik', imageUrl: 'https://picsum.photos/seed/keyboard/400/400', sellerId: 'user-jakarta-001', sellerName: 'Budi Santoso', rating: 4.8, reviewCount: 5, reviews: [], status: 'Listed', createdAt: '2023-10-20T10:00:00Z', isFeatured: true },
    { id: 'p-002', name: 'Novel "Bumi Manusia"', description: 'Koleksi pribadi, kondisi baik.', price: 75000, stock: 1, category: 'Hobi', imageUrl: 'https://picsum.photos/seed/book/400/400', sellerId: 'hr-jakarta-001', sellerName: 'HR Jakarta', rating: 5, reviewCount: 2, reviews: [], status: 'Listed', createdAt: '2023-10-25T10:00:00Z' },
    { id: 'p-003', name: 'Air Minum Galon', description: 'Kebutuhan air minum kantor.', price: 19000, stock: 100, category: 'Kebutuhan Harian', imageUrl: 'https://picsum.photos/seed/water/400/400', sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 4.5, reviewCount: 10, reviews: [], status: 'Listed', createdAt: '2023-09-01T10:00:00Z' },
    { id: 'p-004', name: 'Mouse Gaming Logitech', description: 'Salah beli, barang baru belum dibuka. Jual rugi.', price: 600000, stock: 1, category: 'Elektronik', imageUrl: 'https://picsum.photos/seed/mouse/400/400', sellerId: 'user-bandung-001', sellerName: 'Dina Sari', rating: 0, reviewCount: 0, reviews: [], status: 'Listed', createdAt: new Date().toISOString() },
    { id: 'p-005', name: 'Obat Kuat Viagra Asli', description: 'Rahasia keharmonisan rumah tangga. Dijamin ori.', price: 100000, stock: 10, category: 'Kesehatan', imageUrl: 'https://picsum.photos/seed/pills/400/400', sellerId: 'user-jakarta-001', sellerName: 'Budi Santoso', rating: 0, reviewCount: 0, reviews: [], status: 'Needs Review', createdAt: new Date().toISOString() },

];

export const initialArticles: Article[] = [
    { id: 'a-001', title: 'Tips Menjaga Kesehatan di Lingkungan Kantor', summary: 'Cara sederhana untuk tetap bugar meskipun bekerja di depan komputer seharian.', content: '...', author: 'Admin', timestamp: '2023-10-27T10:00:00Z', category: 'Kesehatan', status: 'Published', type: 'standard', imageUrl: 'https://picsum.photos/seed/health/400/200', likes: ['user-jakarta-001'], comments: [] },
    { id: 'a-002', title: 'Pengumuman Town Hall Q4 2023', summary: 'Seluruh karyawan diundang untuk menghadiri town hall kuartal keempat.', content: '...', author: 'Admin', timestamp: '2023-10-26T15:00:00Z', category: 'Pengumuman', status: 'Published', type: 'standard', imageUrl: 'https://picsum.photos/seed/townhall/400/200', likes: [], comments: [] },
];

export const initialTransactions: Transaction[] = [];
export const initialNotifications: Notification[] = [];

export const initialDoctors: Doctor[] = [
    { id: 'doc-001', name: 'Dr. Anisa Putri', specialty: 'Dokter Umum', bio: 'Lulusan Universitas Indonesia dengan pengalaman 5 tahun di UGD.', imageUrl: 'https://i.pravatar.cc/150?u=doc-001', consultationFee: 75000, availableSlots: [{time: '09:00', isBooked: false}, {time: '10:00', isBooked: true}, {time: '11:00', isBooked: false}, {time: '14:00', isBooked: false}] },
    { id: 'doc-002', name: 'Dr. Budi Hartono', specialty: 'Psikolog Klinis', bio: 'Spesialisasi dalam manajemen stres dan kecemasan di lingkungan kerja.', imageUrl: 'https://i.pravatar.cc/150?u=doc-002', consultationFee: 150000, availableSlots: [{time: '13:00', isBooked: false}, {time: '15:00', isBooked: false}] },
];

export const initialConsultations: Consultation[] = [];
export const initialEprescriptions: Eprescription[] = [];
export const initialHealthDocuments: HealthDocument[] = [];

export const initialDisputes: Dispute[] = [
    { id: 'd-001', orderId: 'ord-001', buyerId: 'user-bandung-001', buyerName: 'Dina Sari', sellerId: 'user-jakarta-001', sellerName: 'Budi Santoso', reason: 'Barang yang diterima tidak sesuai deskripsi, switch keyboard ternyata merah, bukan biru.', status: 'Open', timestamp: new Date().toISOString() },
];
export const initialApiIntegrations: ApiIntegration[] = [
    { id: 'api-bca-01', name: 'BCA', type: 'Bank', status: IntegrationStatus.Inactive },
    { id: 'api-gopay-01', name: 'GoPay', type: 'E-Wallet', status: IntegrationStatus.Inactive },
    { id: 'api-alfamart-01', name: 'Alfamart', type: 'Retail', status: IntegrationStatus.Inactive },
];
export const initialScalabilityServices: ScalabilityService[] = [
  { id: 'scale-001', name: 'Load Balancer', type: 'load_balancer', description: 'Distributes traffic across multiple servers to ensure high availability.', status: ScalabilityServiceStatus.Inactive, logs: [], cost: 0, metadata: {} },
  { id: 'scale-002', name: 'CDN', type: 'cdn', description: 'Caches static content at edge locations to reduce latency for global users.', status: ScalabilityServiceStatus.Inactive, logs: [], cost: 0, metadata: {} },
  { id: 'scale-003', name: 'Redis Cache', type: 'redis', description: 'In-memory data store for caching frequent queries and session data.', status: ScalabilityServiceStatus.Inactive, logs: [], cost: 0, metadata: {} },
  { id: 'scale-004', name: 'RabbitMQ Queue', type: 'rabbitmq', description: 'Message broker for handling asynchronous tasks and background jobs.', status: ScalabilityServiceStatus.Inactive, logs: [], cost: 0, metadata: {} },
  { id: 'scale-005', name: 'Read Replicas', type: 'read_replicas', description: 'Creates read-only copies of the database to handle high read traffic.', status: ScalabilityServiceStatus.Inactive, logs: [], cost: 0, metadata: {} },
  { id: 'scale-006', name: 'Database Sharding', type: 'db_sharding', description: 'Horizontally partitions the database to distribute load across multiple instances.', status: ScalabilityServiceStatus.Inactive, logs: [], cost: 0, metadata: {} },
];
export const initialLeaveRequests: LeaveRequest[] = [];
export const initialOpexRequests: OpexRequest[] = [
    {
        id: 'opex-jkt-001',
        userId: 'user-jakarta-001',
        userName: 'Budi Santoso',
        branch: 'Jakarta',
        type: 'Bensin',
        amount: 150000,
        description: 'Bensin untuk perjalanan dinas meeting klien',
        timestamp: '2023-10-28T09:00:00Z',
        status: 'Pending Finance Approval',
        proofPhotoUrl1: 'https://picsum.photos/seed/fuel/400/400',
        proofPhotoUrl2: 'https://picsum.photos/seed/receipt1/400/400',
        proofLocation: { latitude: -6.2088, longitude: 106.8456 },
        hrApproverId: 'hr-jakarta-001',
        hrApprovalTimestamp: '2023-10-28T10:00:00Z',
    },
    {
        id: 'opex-bdg-001',
        userId: 'user-bandung-001',
        userName: 'Dina Sari',
        branch: 'Bandung',
        type: 'Parkir',
        amount: 25000,
        description: 'Parkir di gedung klien',
        timestamp: '2023-10-28T11:00:00Z',
        status: 'Pending Finance Approval',
        proofPhotoUrl1: 'https://picsum.photos/seed/parking/400/400',
        proofPhotoUrl2: 'https://picsum.photos/seed/receipt2/400/400',
        proofLocation: { latitude: -6.9175, longitude: 107.6191 },
        hrApproverId: 'hr-bandung-001',
        hrApprovalTimestamp: '2023-10-28T12:00:00Z',
    },
    {
        id: 'opex-jkt-002',
        userId: 'user-jakarta-001',
        userName: 'Budi Santoso',
        branch: 'Jakarta',
        type: 'Beli Barang',
        amount: 75000,
        description: 'Pembelian ATK untuk kantor',
        timestamp: '2023-10-27T14:00:00Z',
        status: 'Approved',
        proofPhotoUrl1: 'https://picsum.photos/seed/atk/400/400',
        proofPhotoUrl2: 'https://picsum.photos/seed/receipt3/400/400',
        proofLocation: { latitude: -6.2088, longitude: 106.8456 },
        hrApproverId: 'hr-jakarta-001',
        hrApprovalTimestamp: '2023-10-27T15:00:00Z',
        financeApproverId: 'finance-head-001',
        financeApprovalTimestamp: '2023-10-27T16:00:00Z',
    }
];
export const initialMonetizationConfig: MonetizationConfig = { marketplaceCommission: 0.05, marketingCPA: 25000 };
export const initialTaxConfig: TaxConfig = { ppnRate: 0.11, pph21Rate: 0.025 };
export const initialHomePageConfig: HomePageConfig = { pinnedItemId: null, featureFlags: { aiInvestmentBot: false } };
export const initialAdminWallets: AdminWallets = { profit: 0, tax: 0, cash: 100000000 };
export const initialPersonalizationRules: PersonalizationRule[] = [];
export const initialOrders: Order[] = [
    { id: 'ord-001', userId: 'user-bandung-001', items: [{ productId: 'p-001', productName: 'Keyboard Mekanikal Bekas', price: 450000, quantity: 1 }], total: 450000, timestamp: '2023-10-28T10:00:00Z' }
];
export const initialHealthChallenges: HealthChallenge[] = [
    { id: 'hc-system-01', title: 'Tantangan 10.000 Langkah Harian', description: 'Jalan kaki minimal 10.000 langkah setiap hari selama 30 hari.', creator: 'System', participants: [] }
];
export const initialInsuranceClaims: InsuranceClaim[] = [];
export const initialAttendanceRecords: AttendanceRecord[] = [];