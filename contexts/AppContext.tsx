import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import {
    User, Product, Article, Transaction, Notification, Doctor, Consultation,
    CartItem, Dispute, ApiIntegration, ScalabilityService, LeaveRequest, Budget, ScheduledPayment,
    MonetizationConfig, TaxConfig, HomePageConfig, AssistantLog, EngagementAnalytics,
    AdminWallets, PersonalizationRule, Order, Eprescription, HealthDocument, HealthChallenge, InsuranceClaim, ServiceLinkageMap,
    IntegrationStatus, Toast, ToastType, Role, PollOption, ArticleComment, OpexRequest, AttendanceRecord
} from '../types';
import vaultService from '../services/vaultService';
import { useAuth } from './AuthContext';
import { testApiConnection } from '../services/apiService';

// This is the internal state shape, should match vaultService's data structure
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
    opexRequests: OpexRequest[];
};

// Define the shape of the context
export interface AppContextType extends AppData {
    toasts: Toast[];
    updateState: <K extends keyof AppData>(key: K, value: AppData[K]) => void;
    showToast: (message: string, type: ToastType) => void;
    removeToast: (id: number) => void;
    addNotification: (userId: string, message: string, type: Notification['type']) => void;
    markNotificationsAsRead: (userId: string) => void;
    addTransaction: (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>) => Promise<{ success: boolean; message: string; }>;
    reverseTransaction: (txId: string) => Promise<void>;
    updateUserStatus: (userId: string, status: 'active' | 'inactive') => Promise<{ success: boolean; message: string; }>;
    adjustUserWallet: (userId: string, amount: number, reason: string) => Promise<void>;
    freezeUserWallet: (userId: string, freeze: boolean) => Promise<void>;
    applyForPayLater: () => void;
    toggleArticleLike: (articleId: string) => void;
    toggleArticleBookmark: (articleId: string) => void;
    addArticleComment: (articleId: string, commentText: string) => void;
    toggleCommentLike: (articleId: string, commentTimestamp: string) => void;
    voteOnPoll: (articleId: string, optionIndex: number) => void;
    addArticle: (data: Omit<Article, 'id' | 'author' | 'timestamp' | 'likes' | 'comments' | 'pollOptions' | 'monetization'>) => void;
    updateArticle: (data: Article) => void;
    deleteArticle: (articleId: string) => void;
    resolveDispute: (disputeId: string, resolution: 'Refund Buyer' | 'Pay Seller') => Promise<void>;
    updateApiIntegration: (id: string, creds: ApiIntegration['credentials']) => Promise<{ success: boolean; message: string; }>;
    addBudget: (budget: Omit<Budget, 'id' | 'userId' | 'spent'>) => Promise<void>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (budgetId: string) => void;
    addScheduledPayment: (payment: Omit<ScheduledPayment, 'id' | 'userId'>) => Promise<void>;
    updateScheduledPayment: (payment: ScheduledPayment) => Promise<void>;
    deleteScheduledPayment: (paymentId: string) => void;
    updateMonetizationConfig: (config: MonetizationConfig) => void;
    updateTaxConfig: (config: TaxConfig) => void;
    updateHomePageConfig: (config: HomePageConfig) => void;
    logAssistantQuery: (query: string, detectedIntent: string) => void;
    logEngagementEvent: (type: 'forYouClicks' | 'quickAccessClicks', itemId: string) => void;
    transferProfitToCash: () => Promise<void>;
    recordTaxPayment: () => Promise<void>;
    recordOperationalExpense: (description: string, amount: number) => Promise<void>;
    addPersonalizationRule: (rule: Omit<PersonalizationRule, 'id'>) => void;
    updatePersonalizationRule: (rule: PersonalizationRule) => void;
    deletePersonalizationRule: (ruleId: string) => void;
    updateServiceLinkage: (featureId: string, apiId: string | null) => void;
    generatePayslipData: (userId: string) => any;
    approveOpexByFinance: (id: string) => Promise<void>;
    rejectOpexByFinance: (id: string, reason: string) => Promise<void>;
    addMultipleArticlesByAdmin: (articlesData: any[]) => Promise<{ success: number; failed: number; errors: string[] }>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateUser } = useAuth();
    const [state, setState] = useState<AppData>(() => vaultService.getSanitizedData() as AppData);
    const [toasts, setToasts] = useState<Toast[]>([]);

    const updateState = useCallback(<K extends keyof AppData>(key: K, value: AppData[K]) => {
        setState(prevState => ({ ...prevState, [key]: value }));
        vaultService.setData(key, value);
    }, []);

    const showToast = useCallback((message: string, type: ToastType) => {
        setToasts(prev => [...prev, { id: Date.now(), message, type }]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(t => t.id !== id));
    }, []);

    const addNotification = useCallback((userId: string, message: string, type: Notification['type']) => {
        const newNotification: Notification = { id: `notif-${Date.now()}`, userId, message, type, read: false, timestamp: new Date().toISOString() };
        updateState('notifications', [newNotification, ...state.notifications]);
    }, [state.notifications, updateState]);

    const markNotificationsAsRead = useCallback((userId: string) => {
        updateState('notifications', state.notifications.map(n => n.userId === userId ? { ...n, read: true } : n));
    }, [state.notifications, updateState]);

    const addTransaction = useCallback(async (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>): Promise<{ success: boolean; message: string; }> => {
        const fullUser = vaultService.findUserByEmail(state.users.find(u => u.id === txData.userId)!.email);
        if (!fullUser) return { success: false, message: 'User not found.' };

        if (fullUser.wallet.balance + txData.amount < 0) {
            return { success: false, message: 'Insufficient funds.' };
        }
        
        const newTransaction: Transaction = {
            ...txData,
            id: `tx-${Date.now()}-${Math.random()}`,
            timestamp: new Date().toISOString(),
            userName: fullUser.profile.name,
        };

        const updatedUser = { ...fullUser, wallet: { ...fullUser.wallet, balance: fullUser.wallet.balance + txData.amount } };
        vaultService.updateUser(updatedUser);

        updateState('transactions', [newTransaction, ...state.transactions]);
        updateState('users', state.users.map(u => u.id === txData.userId ? { ...u, wallet: { ...u.wallet, balance: u.wallet.balance + txData.amount } } : u));
        
        return { success: true, message: 'Transaction successful.' };
    }, [state.users, state.transactions, updateState]);

    const updateUserStatus = useCallback(async (userId: string, status: 'active' | 'inactive'): Promise<{ success: boolean; message: string; }> => {
        const userToUpdate = vaultService.findUserByEmail(state.users.find(u => u.id === userId)!.email);
        if (userToUpdate) {
            vaultService.updateUser({ ...userToUpdate, status, wallet: {...userToUpdate.wallet, isFrozen: status === 'inactive'} });
            updateState('users', state.users.map(u => u.id === userId ? { ...u, status, wallet: {...u.wallet, isFrozen: status === 'inactive'} } : u));
            return { success: true, message: 'Status updated' };
        }
        return { success: false, message: 'User not found' };
    }, [state.users, updateState]);

    const logAssistantQuery = useCallback((query: string, detectedIntent: string) => {
        if (!user) return;
        const newLog: AssistantLog = { id: `log-${Date.now()}`, userId: user.id, query, detectedIntent, timestamp: new Date().toISOString() };
        updateState('assistantLogs', [newLog, ...state.assistantLogs]);
    }, [user, state.assistantLogs, updateState]);

    const value: AppContextType = {
        ...state,
        toasts,
        updateState,
        showToast,
        removeToast,
        addNotification,
        markNotificationsAsRead,
        addTransaction,
        updateUserStatus,
        reverseTransaction: useCallback(async () => {}, []),
        adjustUserWallet: useCallback(async () => {}, []),
        freezeUserWallet: useCallback(async () => {}, []),
        applyForPayLater: useCallback(() => {}, []),
        toggleArticleLike: useCallback(() => {}, []),
        toggleArticleBookmark: useCallback(() => {}, []),
        addArticleComment: useCallback(() => {}, []),
        toggleCommentLike: useCallback(() => {}, []),
        voteOnPoll: useCallback(() => {}, []),
        addArticle: useCallback(() => {}, []),
        updateArticle: useCallback(() => {}, []),
        deleteArticle: useCallback(() => {}, []),
        resolveDispute: useCallback(async () => {}, []),
        updateApiIntegration: useCallback(async () => ({ success: false, message: '' }), []),
        addBudget: useCallback(async () => {}, []),
        updateBudget: useCallback(async () => {}, []),
        deleteBudget: useCallback(() => {}, []),
        addScheduledPayment: useCallback(async () => {}, []),
        updateScheduledPayment: useCallback(async () => {}, []),
        deleteScheduledPayment: useCallback(() => {}, []),
        updateMonetizationConfig: useCallback(() => {}, []),
        updateTaxConfig: useCallback(() => {}, []),
        updateHomePageConfig: useCallback(() => {}, []),
        logAssistantQuery,
        logEngagementEvent: useCallback(() => {}, []),
        transferProfitToCash: useCallback(async () => {}, []),
        recordTaxPayment: useCallback(async () => {}, []),
        recordOperationalExpense: useCallback(async () => {}, []),
        addPersonalizationRule: useCallback(() => {}, []),
        updatePersonalizationRule: useCallback(() => {}, []),
        deletePersonalizationRule: useCallback(() => {}, []),
        updateServiceLinkage: useCallback(() => {}, []),
        generatePayslipData: useCallback(() => ({}), []),
        approveOpexByFinance: useCallback(async () => {}, []),
        rejectOpexByFinance: useCallback(async () => {}, []),
        addMultipleArticlesByAdmin: useCallback(async () => ({ success: 0, failed: 0, errors: [] }), []),
    };

    return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
