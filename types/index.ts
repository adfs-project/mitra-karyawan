export enum Role {
    Admin = 'Admin',
    HR = 'HR',
    User = 'User',
}

export enum IntegrationStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Error = 'Error',
}

export enum ScalabilityServiceStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Provisioning = 'Provisioning',
    AwaitingConfig = 'Awaiting Config',
    Scaling = 'Scaling',
    Migrating = 'Migrating',
    Error = 'Error',
}

// --- Interfaces & Types ---

export interface Wallet {
    balance: number;
    isFrozen: boolean;
}

export interface MoodHistory {
    date: string;
    mood: 'Sangat Sedih' | 'Sedih' | 'Biasa' | 'Senang' | 'Sangat Senang';
}

export interface HealthData {
    moodHistory: MoodHistory[];
    activeChallenges: string[];
}

export interface PayLater {
    status: 'not_applied' | 'pending' | 'approved' | 'rejected';
    limit: number;
    used: number;
}

export interface UserProfile {
    name: string;
    phone: string;
    photoUrl: string;
    branch?: string;
    joinDate?: string;
    salary?: number;
}

export type Achievement = 'First Purchase' | 'Punctual Payer' | 'Top Spender';

export interface User {
    id: string;
    email: string;
    password?: string;
    profile: UserProfile;
    role: Role;
    status: 'active' | 'inactive';
    wallet: Wallet;
    achievements: Achievement[];
    loyaltyPoints: number;
    wishlist: string[];
    bookmarkedArticles: string[];
    healthData: HealthData;
    payLater?: PayLater;
}

export interface ProductReview {
    userId: string;
    userName: string;
    rating: number;
    comment: string;
    timestamp: string;
}

export interface Product {
    id: string;
    name: string;
    description: string;
    price: number;
    stock: number;
    category: string;
    imageUrl: string;
    sellerId: string;
    sellerName: string;
    rating: number;
    reviewCount: number;
    reviews: ProductReview[];
    monetization?: {
        enabled: boolean;
        revenueGenerated: number;
    };
}

export interface ArticleComment {
    userId: string;
    userName: string;
    comment: string;
    timestamp: string;
    likes: string[];
}

export interface PollOption {
    text: string;
    votes: string[];
}

export interface Article {
    id: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    author: string;
    timestamp: string;
    status: 'Published' | 'Draft';
    imageUrl?: string;
    youtubeId?: string;
    likes: string[];
    comments: ArticleComment[];
    type: 'standard' | 'poll' | 'qa' | 'Banner';
    pollOptions?: PollOption[];
    monetization?: {
        enabled: boolean;
        revenueGenerated: number;
    };
}

export interface Transaction {
    id: string;
    userId: string;
    userName: string;
    type: 'Marketplace' | 'Top-Up' | 'Transfer' | 'Teleconsultation' | 'PPOB' | 'Refund' | 'Reversal' | 'Commission' | 'Tax' | 'Operational Expense' | 'Internal Transfer';
    amount: number;
    description: string;
    timestamp: string;
    status: 'Completed' | 'Pending' | 'Failed';
    relatedId?: string;
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
    read: boolean;
    timestamp: string;
}

export interface DoctorSlot {
    time: string;
    isBooked: boolean;
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    bio: string;
    imageUrl: string;
    consultationFee: number;
    availableSlots: DoctorSlot[];
}

export interface Consultation {
    id: string;
    userId: string;
    userName: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    scheduledTime: string;
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    notes?: string;
    prescription?: string;
}

export interface Dispute {
    id: string;
    orderId: string;
    buyerId: string;
    buyerName: string;
    sellerId: string;
    sellerName: string;
    reason: string;
    status: 'Open' | 'Resolved';
    resolution?: string;
    timestamp: string;
}

export interface OrderItem {
    productId: string;
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    total: number;
    status: 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
    timestamp: string;
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

export interface ScalabilityService {
    id: string;
    type: 'load_balancer' | 'cdn' | 'redis' | 'rabbitmq' | 'read_replicas' | 'db_sharding';
    name: string;
    description: string;
    status: ScalabilityServiceStatus;
    cost: number;
    logs: string[];
    metadata?: Record<string, any>;
}

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

export interface MonetizationConfig {
    marketplaceCommission: number;
    marketingCPA: number;
}

export interface TaxConfig {
    ppnRate: number;
    pph21Rate: number;
}

export interface HomePageConfig {
    globalAnnouncement: {
        active: boolean;
        message: string;
    };
    pinnedItemId: string;
    quickAccessOrder: string[];
    featureFlags: {
        aiInvestmentBot: boolean;
    };
}

export interface AdminWallets {
    profit: number;
    tax: number;
    cash: number;
}

export type ConditionField = 'profile.branch' | 'role' | 'transactionCount';
export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than';
export type ActionType = 'PIN_ITEM' | 'SHOW_ANNOUNCEMENT';

export interface PersonalizationCondition {
    field: ConditionField;
    operator: ConditionOperator;
    value: string | number;
}

export interface PersonalizationRule {
    id: string;
    name: string;
    conditions: PersonalizationCondition[];
    action: {
        type: ActionType;
        payload: {
            itemId?: string;
            message?: string;
        };
    };
    isActive: boolean;
}

export interface CartItem {
    productId: string;
    quantity: number;
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

export interface AssistantLog {
    id: string;
    userId: string;
    query: string;
    detectedIntent: string;
    timestamp: string;
}

export interface EngagementAnalytics {
    forYouClicks: Record<string, number>;
    quickAccessClicks: Record<string, number>;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}