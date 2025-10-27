import { User, Role, ApiIntegration, IntegrationStatus, ScalabilityService, ScalabilityServiceStatus, Article, Product, Doctor, Transaction, Order, PersonalizationRule } from '../types';

// Hashing the password is a backend concern. For this frontend simulation, we store it as is.
// In a real app, this would NEVER be done.
const adminUser: User = {
    id: 'admin-001',
    email: 'secret3triple@gmail.com',
    password: 'Thunder!@#$%%12', // WARNING: Storing plain text password for simulation only
    role: Role.Admin,
    status: 'active',
    profile: {
        name: 'Super Admin',
        phone: '081234567890',
        photoUrl: 'https://i.pravatar.cc/150?u=admin-001',
        branch: 'HEAD_OFFICE',
    },
    wallet: {
        balance: 1000000000, // Platform wallet for initial funds
// FIX: Added missing 'isFrozen' property to conform to the User type.
        isFrozen: false,
    },
    achievements: [],
    loyaltyPoints: 0,
    wishlist: [],
    bookmarkedArticles: [],
};

const employeeUser: User = {
    id: 'user-001',
    email: 'karyawan@mitra.com',
    password: 'password123',
    role: Role.User,
    status: 'active',
    profile: {
        name: 'Budi Karyawan',
        phone: '081298765432',
        photoUrl: 'https://i.pravatar.cc/150?u=user-001',
        branch: 'JAKARTA_PUSAT',
    },
    wallet: {
        balance: 500000,
// FIX: Added missing 'isFrozen' property to conform to the User type.
        isFrozen: false,
    },
    achievements: [],
    loyaltyPoints: 250,
    wishlist: [],
    bookmarkedArticles: [],
    healthData: {
        moodHistory: [],
        activeChallenges: [],
    }
};


export const initialUsers: User[] = [adminUser, employeeUser];
export const initialTransactions: Transaction[] = [];
export const initialProducts: Product[] = [
    {
        id: 'med-001',
        sellerId: 'admin-001',
        sellerName: 'Apotek Mitra Sehat',
        name: 'Paracetamol 500mg',
        description: 'Meredakan sakit kepala, sakit gigi, dan demam.',
        price: 8000,
        imageUrl: 'https://picsum.photos/seed/paracetamol/400/400',
        category: 'Obat-obatan',
        stock: 100,
        reviews: [],
        rating: 4.8,
        reviewCount: 25,
    },
    {
        id: 'med-002',
        sellerId: 'admin-001',
        sellerName: 'Apotek Mitra Sehat',
        name: 'Amoxicillin 500mg',
        description: 'Antibiotik untuk infeksi bakteri. Membutuhkan resep dokter.',
        price: 15000,
        imageUrl: 'https://picsum.photos/seed/amoxicillin/400/400',
        category: 'Obat-obatan',
        stock: 50,
        reviews: [],
        rating: 4.9,
        reviewCount: 18,
    }
];
export const initialOrders: Order[] = [];
export const initialArticles: Article[] = [];
export const initialDoctors: Doctor[] = [
     {
        id: 'doc-001',
        name: 'Dr. Budi Santoso',
        specialty: 'Dokter Umum',
        consultationFee: 50000,
        bio: 'Lulusan Universitas Indonesia dengan pengalaman 10 tahun sebagai dokter umum. Fokus pada penanganan penyakit umum dan pencegahan.',
        imageUrl: 'https://i.pravatar.cc/150?u=doc-001',
        availableSlots: [
            { time: '09:00', isBooked: false },
            { time: '10:00', isBooked: true },
            { time: '11:00', isBooked: false },
        ]
    },
    {
        id: 'doc-002',
        name: 'Dr. Citra Wijaya',
        specialty: 'Psikolog',
        consultationFee: 150000,
        bio: 'Psikolog klinis dengan spesialisasi kesehatan mental di lingkungan kerja. Siap membantu Anda mengelola stres dan burnout.',
        imageUrl: 'https://i.pravatar.cc/150?u=doc-002',
        availableSlots: [
            { time: '13:00', isBooked: false },
            { time: '14:00', isBooked: false },
            { time: '15:00', isBooked: false },
        ]
    },
    {
        id: 'doc-003',
        name: 'Dr. Rina Amelia',
        specialty: 'Dokter Anak',
        consultationFee: 75000,
        bio: 'Spesialis kesehatan anak dengan pendekatan yang ramah dan komunikatif. Berpengalaman menangani berbagai masalah kesehatan anak.',
        imageUrl: 'https://i.pravatar.cc/150?u=doc-003',
        availableSlots: [
            { time: '09:00', isBooked: false },
            { time: '10:00', isBooked: false },
        ]
    }
];

export const initialApiIntegrations: ApiIntegration[] = [
    { id: 'bca', name: 'BCA', type: 'Bank', status: IntegrationStatus.Inactive },
    { id: 'jago', name: 'Bank Jago', type: 'Bank', status: IntegrationStatus.Inactive },
    { id: 'mandiri', name: 'Mandiri', type: 'Bank', status: IntegrationStatus.Inactive },
    { id: 'bni', name: 'BNI', type: 'Bank', status: IntegrationStatus.Inactive },
    { id: 'bri', name: 'BRI', type: 'Bank', status: IntegrationStatus.Inactive },
    { id: 'gopay', name: 'GoPay', type: 'E-Wallet', status: IntegrationStatus.Inactive },
    { id: 'ovo', name: 'OVO', type: 'E-Wallet', status: IntegrationStatus.Inactive },
    { id: 'dana', name: 'DANA', type: 'E-Wallet', status: IntegrationStatus.Inactive },
    { id: 'shopeepay', name: 'ShopeePay', type: 'E-Wallet', status: IntegrationStatus.Inactive },
    { id: 'alfamart', name: 'Alfamart', type: 'Retail', status: IntegrationStatus.Inactive },
    { id: 'indomart', name: 'Indomart', type: 'Retail', status: IntegrationStatus.Inactive },
];

export const initialScalabilityServices: ScalabilityService[] = [
    {
        id: 'load_balancer',
        name: 'Global Load Balancer & Auto-Scaling',
        type: 'load_balancer',
        description: 'Distribute incoming traffic across multiple servers and automatically scale the number of servers based on demand.',
        status: ScalabilityServiceStatus.Inactive,
        logs: [],
        cost: 0,
        metadata: { servers: 3, rps: 150 } // requests per second
    },
    {
        id: 'cdn',
        name: 'Content Delivery Network (CDN)',
        type: 'cdn',
        description: 'Cache static assets (images, files) across the globe to reduce latency and improve load times for all users.',
        status: ScalabilityServiceStatus.Inactive,
        logs: [],
        cost: 0,
        metadata: { cacheHitRatio: 0, latency: 250 } // ms
    },
    {
        id: 'redis',
        name: 'In-Memory Caching (Redis)',
        type: 'redis',
        description: 'Accelerate data retrieval for frequently accessed information like user profiles and popular products.',
        status: ScalabilityServiceStatus.Inactive,
        logs: [],
        cost: 0,
        metadata: { cacheHitRatio: 0, memoryUsage: 0, keys: 0 }
    },
    {
        id: 'rabbitmq',
        name: 'Async Task Queue (RabbitMQ)',
        type: 'rabbitmq',
        description: 'Offload time-consuming tasks like sending bulk notifications or processing reports to background workers.',
        status: ScalabilityServiceStatus.Inactive,
        logs: [],
        cost: 0,
        metadata: { queueLength: 0, processedPerSec: 0, workers: 5 }
    },
    {
        id: 'read_replicas',
        name: 'Database Read Replicas',
        type: 'read_replicas',
        description: 'Distribute database read operations across multiple database copies to handle high traffic without slowing down writes.',
        status: ScalabilityServiceStatus.Inactive,
        logs: [],
        cost: 0,
        metadata: { primaryLoad: 5, replicaLoad: 5, replicaLag: 15 } // ms
    },
    {
        id: 'db_sharding',
        name: 'Database Sharding',
        type: 'db_sharding',
        description: 'Partition the main database into smaller, faster, more easily managed parts to handle massive data volume.',
        status: ScalabilityServiceStatus.Inactive,
        logs: [],
        cost: 0,
        metadata: { shards: 1 }
    }
];

export const initialPersonalizationRules: PersonalizationRule[] = [];