export enum Role {
    User = 'User',
    Admin = 'Admin',
    HR = 'HR'
}

export enum WorkerType {
    Private = 'Karyawan Swasta',
    BUMN = 'Karyawan BUMN',
    PNS = 'PNS'
}

export enum WorkerStatus {
    Contract = 'Kontrak / PKWT',
    Permanent = 'Tetap'
}

export interface User {
    id: string;
    email: string;
    password?: string;
    role: Role;
    status: 'active' | 'inactive';
    profile: {
        name: string;
        phone: string;
        photoUrl: string;
        birthPlace?: string;
        birthDate?: string;
        company?: string;
        salary?: number;
        workerType?: WorkerType;
        workerStatus?: WorkerStatus;
        joinDate?: string;
        branch?: string; // For HR Scoping
    };
    wallet: {
        balance: number;
        isFrozen: boolean;
    };
    achievements: Achievement[];
    loyaltyPoints: number;
    wishlist: string[]; // Array of product IDs
    bookmarkedArticles: string[]; // Array of article IDs
    healthData?: {
        moodHistory: MoodEntry[];
        activeChallenges: string[]; // Array of challenge IDs
    };
}

export interface Transaction {
    id: string;
    userId: string;
    userName: string;
    type: 'Top-Up' | 'Transfer' | 'PPOB' | 'Marketplace' | 'Teleconsultation' | 'Refund' | 'Reversal' | 'Commission' | 'Tax' | 'Doctor Fee' | 'PayLater Payment' | 'Adjustment';
    amount: number; // positive for income, negative for outcome
    status: 'Completed' | 'Pending' | 'Failed';
    description: string;
    timestamp: string;
    relatedId?: string; // e.g., orderId, targetUserId
}

export interface Review {
    id: string;
    productId: string;
    userId: string;
    userName: string;
    rating: number; // 1 to 5
    comment: string;
    timestamp: string;
}

export interface Product {
    id: string;
    sellerId: string;
    sellerName: string;
    name: string;
    description: string;
    price: number;
    imageUrl: string;
    category: string;
    stock: number;
    reviews: Review[];
    rating: number; // Average rating
    reviewCount: number;
}

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface Order {
    id:string;
    buyerId: string;
    sellerId: string;
    items: { productId: string; name: string; quantity: number; price: number }[];
    total: number;
    status: 'Pending' | 'Paid' | 'Shipped' | 'Completed' | 'Cancelled' | 'In Dispute';
    timestamp: string;
}

export interface Dispute {
    id: string;
    orderId: string;
    buyerId: string;
    sellerId: string;
    reason: string;
    status: 'Open' | 'Resolved - Refund Buyer' | 'Resolved - Pay Seller';
    timestamp: string;
}

export interface Article {
    id: string;
    title: string;
    summary: string;
    content: string;
    imageUrl: string;
    category: string;
    videoUrl?: string;
    youtubeId?: string;
    author: string;
    timestamp: string;
    status: 'Published' | 'Draft';
    likes: string[]; // Array of user IDs who liked the article
    comments: { 
        userId: string; 
        userName: string; 
        comment: string; 
        timestamp: string;
        likes: string[]; // For Q&A comment upvoting
    }[];
    type: 'standard' | 'poll' | 'qa'; // New type for interactive content
    pollOptions?: { text: string; votes: string[] }[]; // Options for polls
    monetization?: {
        enabled: boolean;
        revenueGenerated: number;
    };
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    consultationFee: number;
    bio: string;
    imageUrl: string;
    availableSlots: { time: string, isBooked: boolean }[];
}

export interface DigitalPrescriptionItem {
    medicineName: string;
    productId: string; // Corresponding product ID in marketplace
    dosage: string; // e.g., "3x1 Sehari"
    quantity: number;
}

export interface Consultation {
    id: string;
    userId: string;
    userName: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    scheduledTime: string;
    status: 'Scheduled' | 'In-Progress' | 'Completed' | 'Cancelled';
    chatHistory: { sender: 'user' | 'doctor'; message: string; timestamp: string }[];
    prescription?: DigitalPrescriptionItem[];
}

export interface HealthChallenge {
    id: string;
    title: string;
    description: string;
    durationDays: number;
    participants: { userId: string; userName: string; progress: number; }[]; // Progress is a percentage
}

export interface MoodEntry {
    mood: 'Sangat Senang' | 'Senang' | 'Biasa' | 'Sedih' | 'Sangat Sedih';
    notes: string;
    timestamp: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    timestamp: string;
    read: boolean;
    type: 'success' | 'error' | 'info' | 'warning';
}

export enum IntegrationStatus {
    Inactive = 'Inactive',
    Active = 'Active',
}

export interface ApiIntegration {
    id: string;
    name: string;
    type: 'Bank' | 'E-Wallet' | 'Retail';
    status: IntegrationStatus;
    credentials?: {
        apiKey: string;
        clientId: string;
        secretKey: string;
    };
}

export enum ScalabilityServiceStatus {
    Inactive = 'Inactive',
    Provisioning = 'Provisioning',
    AwaitingConfig = 'Awaiting Config',
    Active = 'Active',
    Error = 'Error',
    Scaling = 'Scaling',
    Migrating = 'Migrating',
}

export interface ScalabilityService {
    id: string;
    name: string;
    type: 'redis' | 'rabbitmq' | 'read_replicas' | 'load_balancer' | 'cdn' | 'db_sharding';
    description: string;
    status: ScalabilityServiceStatus;
    logs: string[];
    cost: number; // Simulated monthly cost in USD
    // Optional metadata for more complex components
    metadata?: {
        [key: string]: any;
    };
}

export interface Budget {
    id: string;
    userId: string;
    category: 'Marketplace' | 'PPOB' | 'Umum';
    limit: number;
    spent: number;
}

export interface ScheduledPayment {
    id: string;
    userId: string;
    description: string;
    amount: number;
    recurrence: 'monthly' | 'weekly';
    nextDueDate: string;
}

export interface HomePageConfig {
    pinnedItemId: string | null; // Can be a product or article ID
    quickAccessOrder: string[];
    globalAnnouncement: {
        message: string;
        active: boolean;
    } | null;
}

export interface AssistantLog {
    id: string;
    query: string;
    detectedIntent: string;
    timestamp: string;
    userId: string;
}

export interface EngagementAnalytics {
    forYouClicks: Record<string, number>; // key: 'type:id' (e.g., 'product:prod-123'), value: count
    quickAccessClicks: Record<string, number>; // key: item id, value: count
}

// --- START: Personalization Engine Types ---
export type ConditionField = 'role' | 'profile.branch' | 'transactionCount';
export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than';
export type ActionType = 'PIN_ITEM' | 'SHOW_ANNOUNCEMENT';

export interface PersonalizationCondition {
    field: ConditionField;
    operator: ConditionOperator;
    value: string | number | Role;
}

export interface PersonalizationAction {
    type: ActionType;
    payload: {
        itemId?: string; // for PIN_ITEM
        message?: string; // for SHOW_ANNOUNCEMENT
    };
}

export interface PersonalizationRule {
    id: string;
    name: string;
    conditions: PersonalizationCondition[];
    action: PersonalizationAction;
    isActive: boolean;
}
// --- END: Personalization Engine Types ---

// --- START: HR Module Types ---
export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  branch: string;
  startDate: string;
  endDate: string;
  reason: string;
  status: 'Pending' | 'Approved' | 'Rejected';
}
// --- END: HR Module Types ---


// FIX: Add Achievement type for LoyaltyScreen component
export type Achievement = 'First Purchase' | 'Punctual Payer' | 'Top Spender';