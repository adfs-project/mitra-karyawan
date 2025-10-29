import { Role, User, Product, Article, Transaction, Notification, Doctor, Consultation, Dispute, ApiIntegration, IntegrationStatus, ScalabilityService, ScalabilityServiceStatus, LeaveRequest, MonetizationConfig, TaxConfig, HomePageConfig, AdminWallets, PersonalizationRule, Order, HealthChallenge, InsuranceClaim } from '../types';

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
    { id: 'p-001', name: 'Keyboard Mekanikal Bekas', description: 'Kondisi 90%, switch biru, jarang dipakai.', price: 450000, stock: 1, category: 'Elektronik', imageUrl: 'https://picsum.photos/seed/keyboard/400/400', sellerId: 'user-jakarta-001', sellerName: 'Budi Santoso', rating: 4.8, reviewCount: 5, reviews: [] },
    { id: 'p-002', name: 'Novel "Bumi Manusia"', description: 'Koleksi pribadi, kondisi baik.', price: 75000, stock: 1, category: 'Hobi', imageUrl: 'https://picsum.photos/seed/book/400/400', sellerId: 'hr-jakarta-001', sellerName: 'HR Jakarta', rating: 5, reviewCount: 2, reviews: [] },
    { id: 'p-003', name: 'Air Minum Galon', description: 'Kebutuhan air minum kantor.', price: 19000, stock: 100, category: 'Kebutuhan Harian', imageUrl: 'https://picsum.photos/seed/water/400/400', sellerId: 'admin-001', sellerName: 'Koperasi Mitra', rating: 4.5, reviewCount: 10, reviews: [] },
];

export const initialArticles: Article[] = [
    { id: 'a-001', title: 'Tips Menjaga Kesehatan di Lingkungan Kantor', summary: 'Cara sederhana untuk tetap bugar meskipun bekerja di depan komputer seharian.', content: '...', author: 'Admin', timestamp: '2023-10-27T10:00:00Z', category: 'Kesehatan', status: 'Published', type: 'standard', imageUrl: 'https://picsum.photos/seed/health/400/200', likes: ['user-jakarta-001'], comments: [] },
    { id: 'a-002', title: 'Pengumuman Town Hall Q4 2023', summary: 'Seluruh karyawan diundang untuk menghadiri town hall kuartal keempat.', content: '...', author: 'Admin', timestamp: '2023-10-26T15:00:00Z', category: 'Pengumuman', status: 'Published', type: 'standard', imageUrl: 'https://picsum.photos/seed/townhall/400/200', likes: [], comments: [] },
];

export const initialTransactions: Transaction[] = [];
export const initialNotifications: Notification[] = [];

export const initialDoctors: Doctor[] = [
    { id: 'doc-001', name: 'Dr. Anisa Putri', specialty: 'Dokter Umum', bio: 'Lulusan Universitas Indonesia dengan pengalaman 5 tahun di UGD.', imageUrl: 'https://i.pravatar.cc/150?u=doc-001', consultationFee: 75000, availableSlots: [{time: '09:00', isBooked: false}, {time: '10:00', isBooked: true}] },
    { id: 'doc-002', name: 'Dr. Budi Hartono', specialty: 'Psikolog Klinis', bio: 'Spesialisasi dalam manajemen stres dan kecemasan di lingkungan kerja.', imageUrl: 'https://i.pravatar.cc/150?u=doc-002', consultationFee: 150000, availableSlots: [{time: '13:00', isBooked: false}] },
];

export const initialConsultations: Consultation[] = [];
export const initialDisputes: Dispute[] = [];
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
export const initialMonetizationConfig: MonetizationConfig = { marketplaceCommission: 0.05, marketingCPA: 25000 };
export const initialTaxConfig: TaxConfig = { ppnRate: 0.11, pph21Rate: 0.025 };
export const initialHomePageConfig: HomePageConfig = { pinnedItemId: null, featureFlags: { aiInvestmentBot: false } };
export const initialAdminWallets: AdminWallets = { profit: 0, tax: 0, cash: 100000000 };
export const initialPersonalizationRules: PersonalizationRule[] = [];
export const initialOrders: Order[] = [];
export const initialHealthChallenges: HealthChallenge[] = [
    { id: 'hc-system-01', title: 'Tantangan 10.000 Langkah Harian', description: 'Jalan kaki minimal 10.000 langkah setiap hari selama 30 hari.', creator: 'System', participants: [] }
];
export const initialInsuranceClaims: InsuranceClaim[] = [];
