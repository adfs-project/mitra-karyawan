// This file contains all the core type definitions for the application.

export enum Role {
    User = 'User',
    Admin = 'Admin',
    HR = 'HR',
}

export interface UserProfile {
    name: string;
    phone: string;
    photoUrl: string;
    branch?: string; // For HR and User roles
    joinDate?: string;
    salary?: number;
    // New fields for employee creation form
    placeOfBirth?: string;
    dateOfBirth?: string;
    companyName?: string;
    employmentStatus?: 'Private Employee' | 'Civil Servant' | 'State-Owned Enterprise' | 'Freelance';
    employeeType?: 'Contract' | 'Permanent';
}

export interface Wallet {
    balance: number;
    isFrozen: boolean;
}

export type Achievement = 'First Purchase' | 'Punctual Payer' | 'Top Spender';

export interface MoodHistory {
    date: string;
    mood: 'Sangat Sedih' | 'Sedih' | 'Biasa' | 'Senang' | 'Sangat Senang';
}

export interface HealthData {
    moodHistory: MoodHistory[];
    activeChallenges: string[];
}

export interface PayLaterStatus {
    status: 'not_applied' | 'pending' | 'approved' | 'rejected';
    limit: number;
    used: number;
}

export interface User {
    id: string;
    email: string;
    password: string;
    profile: UserProfile;
    role: Role;
    status: 'active' | 'inactive';
    wallet: Wallet;
    achievements: Achievement[];
    loyaltyPoints: number;
    wishlist: string[];
    bookmarkedArticles: string[];
    healthData: HealthData;
    payLater?: PayLaterStatus;
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

export interface ArticleMonetization {
    enabled: boolean;
    revenueGenerated: number;
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
    monetization?: ArticleMonetization;
}

export interface Transaction {
    id: string;
    userId: string;
    userName: string;
    type: 'Top-Up' | 'Transfer' | 'Marketplace' | 'PPOB' | 'Refund' | 'Reversal' | 'Commission' | 'Internal Transfer' | 'Operational Expense' | 'Teleconsultation' | 'Tax' | 'Insurance Claim' | 'Obat & Resep';
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
    type: 'success' | 'error' | 'warning' | 'info';
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
    status: 'Scheduled' | 'Completed';
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
        apiKey?: string;
        clientId?: string;
        secretKey?: string;
    };
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
    ppnRate: number; // VAT
    pph21Rate: number; // Income Tax
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
    cash: number; // Operational cash
}

export type ConditionField = 'profile.branch' | 'role' | 'transactionCount';
export type ConditionOperator = 'equals' | 'not_equals' | 'greater_than' | 'less_than';

export interface PersonalizationCondition {
    field: ConditionField;
    operator: ConditionOperator;
    value: string | number;
}

export type ActionType = 'PIN_ITEM' | 'SHOW_ANNOUNCEMENT';

export interface PersonalizationAction {
    type: ActionType;
    payload: {
        itemId?: string;
        message?: string;
    };
}

export interface PersonalizationRule {
    id: string;
    name: string;
    conditions: PersonalizationCondition[];
    action: PersonalizationAction;
    isActive: boolean;
}

export interface HealthDocument {
    id: string;
    userId: string;
    name: string;
    uploadDate: string;
    fileUrl: string; // Base64 or cloud URL
}

export interface HealthChallengeParticipant {
    userId: string;
    progress: number;
}

export interface HealthChallenge {
    id: string;
    title: string;
    description: string;
    creator: { hrId: string; branch: string } | 'System';
    participants: HealthChallengeParticipant[];
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
    receiptUrl: string;
}

export interface ServiceLinkageMap {
    [featureId: string]: string | null; // e.g., { 'ppob-listrik': 'api-bca-01' }
}

export interface Toast {
    id: number;
    message: string;
    type: ToastType;
}

export type ToastType = 'success' | 'error' | 'info' | 'warning';

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
    clockInLocation?: Coordinates;
    clockInPhotoUrl?: string;
    clockOutTime?: string; // ISO String
    clockOutLocation?: Coordinates;
    clockOutPhotoUrl?: string;
}

export interface ChatMessage {
    sender: 'user' | 'ai';
    text: string;
}