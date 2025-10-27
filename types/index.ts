
// types/index.ts

export enum Role {
    User = 'User',
    Admin = 'Admin',
    HR = 'HR',
}

export interface Profile {
    name: string;
    phone: string;
    photoUrl: string;
    branch?: string; // For HR and User
    joinDate?: string; // ISO date string
    salary?: number;
}

export interface Wallet {
    balance: number;
    isFrozen: boolean;
}

export type Achievement = 'First Purchase' | 'Punctual Payer' | 'Top Spender';

export interface HealthData {
    moodHistory: { mood: number; timestamp: string }[];
    activeChallenges: string[]; // challenge IDs
}

export interface PayLaterStatus {
    status: 'not_applied' | 'pending' | 'approved' | 'rejected';
    limit: number;
    used: number;
}

export interface User {
    id: string;
    email: string;
    password: string; // In a real app, this would be a hash
    profile: Profile;
    role: Role;
    status: 'active' | 'inactive';
    wallet: Wallet;
    achievements: Achievement[];
    loyaltyPoints: number;
    wishlist: string[]; // Array of product IDs
    bookmarkedArticles: string[]; // Array of article IDs
    healthData: HealthData;
    payLater?: PayLaterStatus;
}

export interface Transaction {
    id: string;
    userId: string;
    userName: string;
    type: 'Top-Up' | 'Transfer' | 'Marketplace' | 'PPOB' | 'Teleconsultation' | 'Refund' | 'Reversal' | 'Commission' | 'Tax';
    amount: number; // Positive for income, negative for outcome
    description: string;
    timestamp: string; // ISO date string
    status: 'Completed' | 'Pending' | 'Failed';
    relatedId?: string; // e.g., orderId, other transactionId for reversal
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
    read: boolean;
    timestamp: string; // ISO date string
}

export interface ProductReview {
    userId: string;
    userName: string;
    rating: number; // 1-5
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
}

export interface PollOption {
    text: string;
    votes: string[]; // Array of user IDs
}

export interface Comment {
    userId: string;
    userName: string;
    comment: string;
    timestamp: string;
    likes: string[];
}

export interface ArticleMonetization {
    enabled: boolean;
    cpm: number;
    views: number;
    revenueGenerated: number;
}

export interface Article {
    id: string;
    title: string;
    summary: string;
    content: string;
    category: string;
    imageUrl?: string;
    youtubeId?: string;
    author: string;
    timestamp: string; // ISO date string
    status: 'Draft' | 'Published';
    likes: string[]; // Array of user IDs
    comments: Comment[];
    type: 'standard' | 'poll' | 'qa' | 'Banner';
    pollOptions?: PollOption[];
    monetization?: ArticleMonetization;
}

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface Order {
    id: string;
    userId: string;
    items: CartItem[];
    total: number;
    status: 'Pending' | 'Processing' | 'Shipped' | 'Completed' | 'Cancelled';
    timestamp: string;
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    bio: string;
    imageUrl: string;
    consultationFee: number;
    availableSlots: { time: string; isBooked: boolean }[];
}

export interface Consultation {
    id: string;
    userId: string;
    userName: string;
    doctorId: string;
    doctorName: string;
    doctorSpecialty: string;
    scheduledTime: string; // ISO date string
    status: 'Scheduled' | 'Completed' | 'Cancelled';
    notes?: string;
    prescription?: string;
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

export enum IntegrationStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Error = 'Error',
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
    Active = 'Active',
    Inactive = 'Inactive',
    Provisioning = 'Provisioning',
    AwaitingConfig = 'Awaiting Config',
    Error = 'Error',
    Scaling = 'Scaling',
    Migrating = 'Migrating',
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
    nextDueDate: string; // ISO date string
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
    resolution?: 'Refund Buyer' | 'Pay Seller';
    timestamp: string;
}

export interface MonetizationConfig {
    marketplaceCommission: number; // e.g., 0.05 for 5%
    marketingCPA: number; // Cost Per Acquisition
}

export interface TaxConfig {
    ppnRate: number; // e.g., 0.11 for 11%
    pph21Rate: number; // e.g., 0.025 for 2.5%
}

export interface HomePageConfig {
    globalAnnouncement: {
        active: boolean;
        message: string;
    };
    pinnedItemId: string | null; // Product or Article ID
    quickAccessOrder: string[];
}

export interface AssistantLog {
    id: string;
    userId: string;
    query: string;
    detectedIntent: string;
    timestamp: string;
}

export interface EngagementAnalytics {
    forYouClicks: Record<string, number>; // e.g., { 'product:p-001': 10 }
    quickAccessClicks: Record<string, number>; // e.g., { 'market': 25 }
}

export interface AdminWallets {
    profit: number;
    tax: number;
    cash: number;
}

// Personalization Types
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
            itemId?: string; // for PIN_ITEM
            message?: string; // for SHOW_ANNOUNCEMENT
        }
    };
    isActive: boolean;
}
