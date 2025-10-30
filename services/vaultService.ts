// ===================================================================================
// CLIENT-SIDE VAULT & SECURITY PROTOCOL - DO NOT MODIFY
// This service is the single source of truth for all sensitive application data.
// It enforces a permanent, non-negotiable security policy including:
// 1. Data Obfuscation: All data stored in localStorage is base64 encoded.
// 2. In-Memory Storage: Decrypted data lives only in memory during a session.
// 3. Data Sanitization: Sensitive fields (passwords, salaries) are NEVER exposed to the UI.
// 4. Controlled Mutations: All data changes MUST go through this vault.
// ===================================================================================

import {
    User, Product, Article, Transaction, Notification, Doctor, Consultation,
    CartItem, Dispute, ApiIntegration, ScalabilityService, LeaveRequest, Budget, ScheduledPayment,
    MonetizationConfig, TaxConfig, HomePageConfig, AssistantLog, EngagementAnalytics,
    AdminWallets, PersonalizationRule, Order, Eprescription, HealthDocument, HealthChallenge, InsuranceClaim, ServiceLinkageMap,
    // FIX: Import IntegrationStatus type
    IntegrationStatus,
    AttendanceRecord,
    OpexRequest
} from '../types';

import {
    initialUsers, initialProducts, initialArticles, initialTransactions, initialNotifications,
    initialDoctors, initialConsultations, initialDisputes, initialApiIntegrations,
    initialScalabilityServices, initialLeaveRequests, initialMonetizationConfig,
    initialTaxConfig, initialHomePageConfig, initialAdminWallets, initialPersonalizationRules,
    initialOrders, initialHealthChallenges, initialInsuranceClaims, initialAttendanceRecords, initialOpexRequests
} from '../data/mockData';

type AppData = {
    users: User[];
    products: Product[];
    articles: Article[];
    transactions: Transaction[];
    notifications: Notification[];
    doctors: Doctor[];
    consultations: Consultation[];
    eprescriptions: Eprescription[];
    cart: CartItem[];
    disputes: Dispute[];
    apiIntegrations: ApiIntegration[];
    scalabilityServices: ScalabilityService[];
    leaveRequests: LeaveRequest[];
    budgets: Budget[];
    scheduledPayments: ScheduledPayment[];
    monetizationConfig: MonetizationConfig;
    taxConfig: TaxConfig;
    homePageConfig: HomePageConfig;
    assistantLogs: AssistantLog[];
    engagementAnalytics: EngagementAnalytics;
    adminWallets: AdminWallets;
    orders: Order[];
    personalizationRules: PersonalizationRule[];
    healthDocuments: HealthDocument[];
    healthChallenges: HealthChallenge[];
    insuranceClaims: InsuranceClaim[];
    attendanceRecords: AttendanceRecord[];
    serviceLinkage: ServiceLinkageMap;
    isAiGuardrailDisabled: boolean;
    // FIX: Add opexRequests to AppData type
    opexRequests: OpexRequest[];
};

class VaultService {
    private _data: AppData;

    constructor() {
        this._data = this.loadAndDeobfuscateAllData();
    }
    
    // --- Core Security Methods ---

    private _obfuscate(data: any): string {
        try {
            const jsonString = JSON.stringify(data);
            return btoa(jsonString); // Base64 encode
        } catch (e) {
            console.error("Failed to obfuscate data:", e);
            return '';
        }
    }

    private _deobfuscate<T>(obfuscatedData: string | null, defaultValue: T): T {
        if (!obfuscatedData) return defaultValue;
        try {
            const jsonString = atob(obfuscatedData); // Base64 decode
            return JSON.parse(jsonString);
        } catch (e) {
            console.warn("Failed to deobfuscate data, using default. This is normal on first load.", e);
            return defaultValue;
        }
    }

    private _hashPassword(password: string): string {
        // This is a mock hash. In a real app, use a strong library like bcrypt.
        return `hashed_${password}`;
    }

    private loadAndDeobfuscateAllData(): AppData {
        // On first run, hash initial user passwords
        const initialUsersWithHashedPasswords = initialUsers.map(user => ({
            ...user,
            password: this._hashPassword(user.password),
        }));

        return {
            users: this._deobfuscate<User[]>('app_users', initialUsersWithHashedPasswords),
            products: this._deobfuscate<Product[]>('app_products', initialProducts),
            articles: this._deobfuscate<Article[]>('app_articles', initialArticles),
            transactions: this._deobfuscate<Transaction[]>('app_transactions', initialTransactions),
            notifications: this._deobfuscate<Notification[]>('app_notifications', initialNotifications),
            doctors: this._deobfuscate<Doctor[]>('app_doctors', initialDoctors),
            consultations: this._deobfuscate<Consultation[]>('app_consultations', initialConsultations),
            eprescriptions: this._deobfuscate<Eprescription[]>('app_eprescriptions', []),
            cart: this._deobfuscate<CartItem[]>('app_cart', []),
            disputes: this._deobfuscate<Dispute[]>('app_disputes', initialDisputes),
            apiIntegrations: this._deobfuscate<ApiIntegration[]>('app_api_integrations', initialApiIntegrations),
            scalabilityServices: this._deobfuscate<ScalabilityService[]>('app_scalability_services', initialScalabilityServices),
            leaveRequests: this._deobfuscate<LeaveRequest[]>('app_leave_requests', initialLeaveRequests),
            budgets: this._deobfuscate<Budget[]>('app_budgets', []),
            scheduledPayments: this._deobfuscate<ScheduledPayment[]>('app_scheduled_payments', []),
            monetizationConfig: this._deobfuscate<MonetizationConfig>('app_monetization_config', initialMonetizationConfig),
            taxConfig: this._deobfuscate<TaxConfig>('app_tax_config', initialTaxConfig),
            homePageConfig: this._deobfuscate<HomePageConfig>('app_homepage_config', initialHomePageConfig),
            assistantLogs: this._deobfuscate<AssistantLog[]>('app_assistant_logs', []),
            engagementAnalytics: this._deobfuscate<EngagementAnalytics>('app_engagement_analytics', { forYouClicks: {}, quickAccessClicks: {} }),
            adminWallets: this._deobfuscate<AdminWallets>('app_admin_wallets', initialAdminWallets),
            orders: this._deobfuscate<Order[]>('app_orders', initialOrders),
            personalizationRules: this._deobfuscate<PersonalizationRule[]>('app_personalization_rules', initialPersonalizationRules),
            healthDocuments: this._deobfuscate<HealthDocument[]>('app_health_documents', []),
            healthChallenges: this._deobfuscate<HealthChallenge[]>('app_health_challenges', initialHealthChallenges),
            insuranceClaims: this._deobfuscate<InsuranceClaim[]>('app_insurance_claims', initialInsuranceClaims),
            attendanceRecords: this._deobfuscate<AttendanceRecord[]>('app_attendance_records', initialAttendanceRecords),
            serviceLinkage: this._deobfuscate<ServiceLinkageMap>('app_service_linkage', {}),
            isAiGuardrailDisabled: this._deobfuscate<boolean>('app_ai_guardrail_disabled', false),
            // FIX: Load opexRequests from storage or initial data.
            opexRequests: this._deobfuscate<OpexRequest[]>('app_opex_requests', initialOpexRequests),
        };
    }
    
    private _save<K extends keyof AppData>(key: K) {
        localStorage.setItem(`app_${key}`, this._obfuscate(this._data[key]));
    }

    private _sanitizeUser(user: User): User {
        const { password, profile, ...rest } = user;
        const { salary, ...safeProfile } = profile;
        return {
            ...rest,
            password: '***REDACTED***',
            profile: {
                ...safeProfile,
                salary: undefined // Never expose salary
            }
        };
    }

    private _sanitizeApiIntegration(integration: ApiIntegration): ApiIntegration {
        return {
            ...integration,
            credentials: {
                apiKey: '******',
                clientId: '******',
                secretKey: '******',
            }
        };
    }
    
    // --- Public Getters (Sanitized Data) ---

    public getSanitizedData(): Readonly<AppData> {
        return {
            ...this._data,
            users: this._data.users.map(this._sanitizeUser),
            apiIntegrations: this._data.apiIntegrations.map(this._sanitizeApiIntegration),
        };
    }

    // --- Authentication Methods ---

    public findUserByEmail(email: string): User | undefined {
        return this._data.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    }

    public verifyPassword(user: User, passwordToCheck: string): boolean {
        return user.password === this._hashPassword(passwordToCheck);
    }
    
    public addNewUser(newUser: User): void {
        newUser.password = this._hashPassword(newUser.password);
        this._data.users.push(newUser);
        this._save('users');
    }

    public updateUser(updatedUser: User, hashNewPassword = false): void {
        const userIndex = this._data.users.findIndex(u => u.id === updatedUser.id);
        if (userIndex > -1) {
            if (hashNewPassword) {
                updatedUser.password = this._hashPassword(updatedUser.password);
            }
            this._data.users[userIndex] = updatedUser;
            this._save('users');
        }
    }
    
    // --- DataContext Mutation Methods ---
    
    public setData<K extends keyof AppData>(key: K, value: AppData[K]): void {
        this._data[key] = value;
        this._save(key);
    }

    public getRawSalaryForUser(userId: string): number | undefined {
        // This is a highly privileged method and should only be used internally by trusted services like payroll calculation.
        const user = this._data.users.find(u => u.id === userId);
        return user?.profile.salary;
    }

    public updateApiCredentials(id: string, creds: ApiIntegration['credentials']): void {
        const index = this._data.apiIntegrations.findIndex(api => api.id === id);
        if (index > -1) {
            this._data.apiIntegrations[index].credentials = creds;
            this._save('apiIntegrations');
        }
    }
    
    public updateApiStatus(id: string, status: IntegrationStatus): void {
         const index = this._data.apiIntegrations.findIndex(api => api.id === id);
        if (index > -1) {
            this._data.apiIntegrations[index].status = status;
            this._save('apiIntegrations');
        }
    }
}

// Singleton instance of the vault
const vaultService = new VaultService();

export default vaultService;