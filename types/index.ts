// FIX: Removed circular import of ScalabilityServiceStatus.

// This file contains all the core type definitions for the application.

export enum Role {
    Admin = 'Admin',
    HR = 'HR',
    Finance = 'Finance',
    User = 'User',
}

export interface UserProfile {
    name: string;
    phone: string;
    photoUrl: string;
    branch?: string;
    salary?: number;
    joinDate?: string;
    isHeadOfBranch?: boolean;
    employmentStatus?: 'Private Employee' | 'Civil Servant' | 'State-Owned Enterprise' | 'Freelance';
    companyName?: string;
    employeeType?: 'Contract' | 'Permanent';
    placeOfBirth?: string;
    dateOfBirth?: string;
}

export type Achievement = 'First Purchase' | 'Punctual Payer' | 'Top Spender';

export interface MoodHistory {
    date: string;
    mood: 'Sangat Sedih' | 'Sedih' | 'Biasa' | 'Senang' | 'Sangat Senang';
}

export interface PayLaterStatus {
    status: 'not_applied' | 'pending' | 'approved' | 'rejected';
    limit?: number;
    remainingLimit?: number;
}

export interface User {
    id: string;
    email: string;
    password: string; // This will be hashed and not sent to frontend
    role: Role;
    profile: UserProfile;
    status: 'active' | 'inactive';
    wallet: {
        balance: number;
        isFrozen: boolean;
    };
    isPremium?: boolean;
    achievements: Achievement[];
    loyaltyPoints: number;
    wishlist: string[]; // Array of product IDs
    bookmarkedArticles: string[]; // Array of article IDs
    healthData: {
        moodHistory: MoodHistory[];
        activeChallenges: string[]; // Array of challenge IDs
    };
    payLater?: PayLaterStatus;
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
    reviews: any[]; // Define review structure if needed
    status: 'Listed' | 'Unlisted' | 'Needs Review';
    createdAt: string;
}

export interface Article {
    id: string;
    title: string;
    summary: string;
    content: string;
    author: string;
    timestamp: string;
    category: string;
    imageUrl?: string;
    youtubeId?: string;
    likes: string[]; // Array of user IDs
    comments: ArticleComment[];
    status: 'Published' | 'Draft';
    type: 'standard' | 'poll' | 'qa' | 'Banner';
    pollOptions?: { text: string; votes: string[] }[];
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

export interface Transaction {
    id: string;
    userId: string;
    userName: string;
    type: 'Top-Up' | 'Transfer' | 'Marketplace' | 'PPOB' | 'Refund' | 'Reversal' | 'Commission' | 'Tax' | 'Teleconsultation' | 'Internal Transfer' | 'Operational Expense' | 'Insurance Claim' | 'Subscription' | 'Obat & Resep' | 'Dana Opex';
    amount: number;
    description: string;
    status: 'Completed' | 'Pending' | 'Failed';
    timestamp: string;
    relatedId?: string; // e.g., orderId, consultationId
}

export interface Notification {
    id: string;
    userId: string;
    message: string;
    read: boolean;
    timestamp: string;
    type: 'info' | 'success' | 'warning' | 'error';
}

export interface Doctor {
    id: string;
    name: string;
    specialty: string;
    bio: string;
    consultationFee: number;
    imageUrl: string;
    availableSlots: { time: string; isBooked: boolean }[];
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
    eprescriptionId?: string;
}

export interface EprescriptionItem {
    drugName: string;
    dosage: string;
    instructions: string;
}

export interface Eprescription {
    id: string;
    consultationId: string;
    patientId: string;
    doctorId: string;
    doctorName: string;
    issueDate: string;
    items: EprescriptionItem[];
    status: 'New' | 'Redeemed';
}

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface Dispute {
    id: string;
    orderId: string;
    userId: string;
    reason: string;
    status: 'Open' | 'Resolved' | 'Closed';
    timestamp: string;
    resolutionMethod?: 'Admin' | 'Guardian';
}

export enum IntegrationType {
    Bank = 'Bank',
    EWallet = 'E-Wallet',
    Retail = 'Retail',
}

export enum IntegrationStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Error = 'Error',
}

export interface ApiIntegration {
    id: string;
    name: string;
    type: IntegrationType;
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
    AwaitingConfig = 'AwaitingConfig',
    Migrating = 'Migrating',
    Error = 'Error',
}

export interface ScalabilityService {
    id: string;
    name: string;
    type: 'redis' | 'rabbitmq' | 'read_replicas' | 'load_balancer' | 'cdn' | 'db_sharding';
    status: ScalabilityServiceStatus;
    cost: number;
    logs: { timestamp: string; message: string }[];
    metadata: Record<string, any>;
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

export interface MonetizationConfig {
    marketplaceCommission: number; // e.g., 0.05 for 5%
    marketingCPA: number; // Cost Per Acquisition
}

export interface TaxConfig {
    ppnRate: number; // e.g., 0.11 for 11%
    pph21Rate: number; // e.g., 0.025 for 2.5%
}

export interface HomePageConfig {
    pinnedItemId: string | null;
    featureFlags: {
        aiAnomalyDetection: boolean;
        aiSymptomChecker: boolean;
        aiHealthCoach: boolean;
        aiInvestmentBot: boolean;
    };
    isIntegrityGuardianActive: boolean;
}

export type AssistantIntent = 'GREETING' | 'WALLET_INQUIRY' | 'MARKETPLACE_INQUIRY' | 'HEALTH_INQUIRY' | 'NEWS_INQUIRY' | 'GENERIC_QUERY' | 'UNSURE' | 'ERROR';

export interface AssistantLog {
    id: string;
    userId: string;
    query: string;
    timestamp: string;
    detectedIntent: AssistantIntent;
}

export interface EngagementAnalytics {
    forYouClicks: Record<string, number>;
    quickAccessClicks: Record<string, number>;
}

export interface AdminWallets {
    profit: number;
    tax: number;
    cash: number;
}

export interface Order {
    id: string;
    userId: string;
    items: {
        productId: string;
        productName: string;
        quantity: number;
        price: number;
    }[];
    total: number;
    timestamp: string;
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

export interface HealthDocument {
    id: string;
    userId: string;
    name: string;
    uploadDate: string;
    fileUrl: string; // Could be base64 data URL
}

export interface HealthChallenge {
    id: string;
    title: string;
    description: string;
    creator: {
        hrId: string;
        branch: string;
    };
    participants: {
        userId: string;
        progress: number;
    }[];
}

export interface InsuranceClaim {
    id: string;
    userId: string;
    userName: string;
    branch: string;
    type: 'Rawat Jalan' | 'Rawat Inap' | 'Kacamata';
    amount: number;
    submissionDate: string;
    status: 'Pending' | 'Approved' | 'Rejected';
    receiptUrl: string; // base64 data URL
}

export type ServiceLinkageMap = Record<string, string | null>;

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface AttendanceRecord {
    id: string;
    userId: string;
    userName: string;
    branch: string;
    date: string; // YYYY-MM-DD
    clockInTime?: string; // ISO String
    clockOutTime?: string; // ISO String
    clockInLocation?: Coordinates;
    clockOutLocation?: Coordinates;
    clockInPhotoUrl?: string; // base64 data url
    clockOutPhotoUrl?: string; // base64 data url
}

export type Toast = {
    id: number;
    message: string;
    type: 'success' | 'error' | 'info' | 'warning';
}

export type OpexRequestType = 'Bensin' | 'Token Listrik' | 'Beli Barang' | 'Fotocopy' | 'Parkir' | 'Tiket Pesawat/Kereta' | 'Booking Hotel' | 'Biaya Makan Perjalanan Dinas';
export type OpexRequestStatus = 'Pending HR Verification' | 'Pending Finance Approval' | 'Approved' | 'Rejected';

export interface OpexRequest {
    id: string;
    userId: string;
    userName: string;
    branch: string;
    type: OpexRequestType;
    amount: number;
    description: string;
    timestamp: string;
    status: OpexRequestStatus;
    proofLocation: Coordinates;
    proofPhotoUrl1: string; // object photo
    proofPhotoUrl2: string; // receipt photo
    hrApproverId?: string;
    hrApprovalTimestamp?: string;
    financeApproverId?: string;
    financeApprovalTimestamp?: string;
    rejectionReason?: string;
}

export type SystemIntegrityLogType = 'WALLET_SYNC' | 'CART_CLEANUP' | 'STOCK_RESET' | 'DISPUTE_ESCALATION' | 'AUTO_DISPUTE_RESOLUTION';

export interface SystemIntegrityLog {
    id: string;
    timestamp: string;
    type: SystemIntegrityLogType;
    message: string;
    details?: Record<string, any>;
}