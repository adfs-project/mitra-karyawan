
export enum Role {
    Admin = 'Admin',
    HR = 'HR',
    User = 'User',
    Finance = 'Finance',
}

export enum IntegrationStatus {
    Active = 'Active',
    Inactive = 'Inactive',
    Error = 'Error',
}

export enum ScalabilityServiceStatus {
    Active = 'ACTIVE',
    Inactive = 'INACTIVE',
    Provisioning = 'PROVISIONING',
    AwaitingConfig = 'AWAITING_CONFIG',
    Scaling = 'SCALING',
    Migrating = 'MIGRATING',
    Error = 'ERROR',
}

export type Achievement = 'First Purchase' | 'Punctual Payer' | 'Top Spender';

export interface MoodHistory {
    date: string;
    mood: 'Sangat Sedih' | 'Sedih' | 'Biasa' | 'Senang' | 'Sangat Senang';
}

export interface Coordinates {
    latitude: number;
    longitude: number;
}

export interface UserProfile {
    name: string;
    phone: string;
    photoUrl: string;
    branch?: string;
    joinDate?: string;
    salary?: number;
    isHeadOfBranch?: boolean;
    employmentStatus?: 'Private Employee' | 'Civil Servant' | 'State-Owned Enterprise' | 'Freelance';
    companyName?: string;
    employeeType?: 'Contract' | 'Permanent';
    placeOfBirth?: string;
    dateOfBirth?: string;
}

export interface User {
    id: string;
    email: string;
    password: string; // This will be redacted in sanitized data
    profile: UserProfile;
    role: Role;
    status: 'active' | 'inactive';
    wallet: {
        balance: number;
        isFrozen: boolean;
    };
    achievements: Achievement[];
    loyaltyPoints: number;
    wishlist: string[];
    bookmarkedArticles: string[];
    healthData: {
        moodHistory: MoodHistory[];
        activeChallenges: string[];
    };
    payLater?: {
        status: 'not_applied' | 'pending' | 'approved' | 'rejected';
        limit: number;
    };
    isPremium?: boolean;
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
    author: string;
    timestamp: string;
    category: string;
    status: 'Published' | 'Draft';
    type: 'standard' | 'poll' | 'qa' | 'Banner';
    imageUrl?: string;
    youtubeId?: string;
    likes: string[];
    comments: ArticleComment[];
    pollOptions?: PollOption[];
    monetization?: {
        enabled: boolean;
        revenueGenerated: number;
    }
}

export interface Transaction {
    id: string;
    userId: string;
    userName: string;
    type: 'Top-Up' | 'Transfer' | 'Marketplace' | 'PPOB' | 'Refund' | 'Reversal' | 'Commission' | 'Tax' | 'Teleconsultation' | 'Internal Transfer' | 'Operational Expense' | 'Insurance Claim' | 'Obat & Resep' | 'Dana Opex';
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
    type: 'info' | 'success' | 'warning' | 'error';
    read: boolean;
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
    eprescriptionId?: string;
}

export interface CartItem {
    productId: string;
    quantity: number;
}

export interface OrderItem {
    productId: string;
    productName: string;
    quantity: number;
    price: number;
}
export interface Order {
    id: string;
    userId: string;
    items: OrderItem[];
    total: number;
    timestamp: string;
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
    name: string;
    type: 'load_balancer' | 'cdn' | 'redis' | 'rabbitmq' | 'read_replicas' | 'db_sharding';
    description: string;
    status: ScalabilityServiceStatus;
    logs: string[];
    cost: number;
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

export type OpexRequestType = 'Bensin' | 'Token Listrik' | 'Beli Barang' | 'Fotocopy' | 'Parkir';
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
    proofPhotoUrl1: string;
    proofPhotoUrl2: string;
    proofLocation: Coordinates;
    hrApproverId?: string;
    hrApprovalTimestamp?: string;
    financeApproverId?: string;
    financeApprovalTimestamp?: string;
    rejectionReason?: string;
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
        aiInvestmentBot: boolean;
    };
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

export interface AdminWallets {
    profit: number;
    tax: number;
    cash: number;
}

export type ConditionField = 'profile.branch' | 'role' | 'transactionCount';
export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than';
export interface PersonalizationCondition {
    field: ConditionField;
    operator: ConditionOperator;
    value: string | number;
}
export type ActionType = 'PIN_ITEM' | 'SHOW_ANNOUNCEMENT';
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
    fileUrl: string; // Could be a base64 string or a URL to a storage service
}

export interface HealthChallenge {
    id: string;
    title: string;
    description: string;
    creator: 'System' | { hrId: string; branch: string };
    participants: { userId: string; progress: number }[];
}

export interface InsuranceClaim {
    id: string;
    userId: string;
    userName: string;
    branch: string;
    submissionDate: string;
    type: 'Rawat Jalan' | 'Rawat Inap' | 'Kacamata';
    amount: number;
    receiptUrl: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export type ServiceLinkageMap = Record<string, string | null>;

export interface AttendanceRecord {
    id: string;
    userId: string;
    userName: string;
    branch: string;
    date: string;
    clockInTime?: string;
    clockOutTime?: string;
    clockInLocation?: Coordinates;
    clockOutLocation?: Coordinates;
    clockInPhotoUrl?: string;
    clockOutPhotoUrl?: string;
}

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}
