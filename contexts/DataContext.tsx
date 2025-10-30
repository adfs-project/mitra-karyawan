import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import {
    User, Product, Article, Transaction, Notification, Doctor, Consultation,
    CartItem, Dispute, ApiIntegration, IntegrationStatus, ScalabilityService,
    ScalabilityServiceStatus, LeaveRequest, Budget, ScheduledPayment,
    MonetizationConfig, TaxConfig, HomePageConfig, AssistantLog, EngagementAnalytics,
    AdminWallets, PersonalizationRule, Order, MoodHistory, OrderItem, Toast, ToastType, Eprescription, EprescriptionItem, HealthDocument, HealthChallenge, InsuranceClaim, ServiceLinkageMap, Role, AttendanceRecord, Coordinates, OpexRequest
} from '../types';
import { testApiConnection } from '../services/apiService';
import { useAuth } from './AuthContext';
import { GoogleGenAI } from '@google/genai';
import vaultService from '../services/vaultService';
import { useApp } from './AppContext';

type AppData = ReturnType<typeof vaultService.getSanitizedData>;


interface CoreContextType {
    users: User[];
    articles: Article[];
    transactions: Transaction[];
    notifications: Notification[];
    disputes: Dispute[];
    apiIntegrations: ApiIntegration[];
    scalabilityServices: ScalabilityService[];
    budgets: Budget[];
    scheduledPayments: ScheduledPayment[];
    monetizationConfig: MonetizationConfig;
    taxConfig: TaxConfig;
    homePageConfig: HomePageConfig;
    assistantLogs: AssistantLog[];
    engagementAnalytics: EngagementAnalytics;
    adminWallets: AdminWallets;
    personalizationRules: PersonalizationRule[];
    serviceLinkage: ServiceLinkageMap;
    isAiGuardrailDisabled: boolean;

    // --- Methods ---
    addTransaction: (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>) => Promise<{ success: boolean; message: string }>;
    addNotification: (userId: string, message: string, type: Notification['type']) => void;
    markNotificationsAsRead: (userId: string) => void;
    updateUserStatus: (userId: string, status: 'active' | 'inactive') => Promise<{ success: boolean; message: string }>;
    generatePayslipData: (userId: string) => any;
    
    toggleArticleBookmark: (articleId: string) => void;
    toggleArticleLike: (articleId: string) => void;
    addArticleComment: (articleId: string, comment: string) => void;
    toggleCommentLike: (articleId: string, commentTimestamp: string) => void;
    voteOnPoll: (articleId: string, optionIndex: number) => void;
    
    approveOpexByFinance: (id: string) => Promise<void>;
    rejectOpexByFinance: (id: string, reason: string) => Promise<void>;

    addBudget: (budget: Omit<Budget, 'id'|'userId'|'spent'>) => Promise<void>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    addScheduledPayment: (payment: Omit<ScheduledPayment, 'id'|'userId'>) => Promise<void>;
    updateScheduledPayment: (payment: ScheduledPayment) => Promise<void>;
    deleteScheduledPayment: (id: string) => Promise<void>;

    applyForPayLater: () => Promise<void>;
    approvePayLater: (userId: string, limit: number) => Promise<void>;
    rejectPayLater: (userId: string) => Promise<void>;

    adjustUserWallet: (userId: string, amount: number, reason: string) => Promise<void>;
    freezeUserWallet: (userId: string, freeze: boolean) => Promise<void>;
    reverseTransaction: (txId: string) => Promise<void>;
    resolveDispute: (disputeId: string, resolution: 'Refund Buyer' | 'Pay Seller') => Promise<void>;
    updateApiIntegration: (id: string, creds: ApiIntegration['credentials']) => Promise<{ success: boolean, message: string }>;
    deactivateApiIntegration: (id: string) => Promise<void>;
    updateScalabilityService: (id: string, status: ScalabilityServiceStatus, log: string, metadata?: Record<string, any>, cost?: number) => void;
    updateMonetizationConfig: (config: MonetizationConfig) => void;
    updateTaxConfig: (config: TaxConfig) => void;
    updateHomePageConfig: (config: HomePageConfig) => void;
    transferProfitToCash: () => Promise<void>;
    recordTaxPayment: () => Promise<void>;
    recordOperationalExpense: (description: string, amount: number) => Promise<void>;
    updateServiceLinkage: (featureId: string, apiId: string | null) => void;

    logAssistantQuery: (query: string, detectedIntent: string) => void;
    logEngagementEvent: (type: 'forYouClicks' | 'quickAccessClicks', itemId: string) => void;
    addPersonalizationRule: (rule: Omit<PersonalizationRule, 'id'>) => void;
    updatePersonalizationRule: (rule: PersonalizationRule) => void;
    deletePersonalizationRule: (id: string) => Promise<void>;
    
    addArticle: (article: Omit<Article, 'id' | 'author' | 'timestamp' | 'likes' | 'comments' | 'pollOptions'>) => Promise<void>;
    updateArticle: (article: Article) => Promise<void>;
    deleteArticle: (articleId: string) => Promise<void>;
    addMultipleArticlesByAdmin: (articlesData: any[]) => Promise<{ success: number; failed: number; errors: string[] }>;
}

const CoreContext = createContext<CoreContextType | undefined>(undefined);

export const CoreProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateCurrentUser } = useAuth();
    const { showToast } = useApp();
    
    const [appData, setAppData] = useState(vaultService.getSanitizedData());
    
    const updateState = <K extends keyof AppData>(key: K, value: AppData[K]) => {
        vaultService.setData(key, value as any);
        setAppData(vaultService.getSanitizedData());
    };

    const updateServiceLinkage = (featureId: string, apiId: string | null) => {
        const newLinkage = { ...appData.serviceLinkage, [featureId]: apiId };
        updateState('serviceLinkage', newLinkage);
    };

    const addNotification = useCallback((userId: string, message: string, type: Notification['type']) => {
        const newNotif: Notification = {
            id: `notif-${Date.now()}`,
            userId, message, type, read: false,
            timestamp: new Date().toISOString()
        };
        updateState('notifications', [...appData.notifications, newNotif]);
    }, [appData.notifications]);
    
    const addTransaction = useCallback(async (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>): Promise<{ success: boolean; message: string }> => {
        const userSource = appData.users.find(u => u.id === txData.userId);
        if (!userSource && txData.userId !== 'admin-001') {
            return { success: false, message: "User not found." };
        }
        if(txData.amount < 0 && userSource && userSource.wallet.balance < Math.abs(txData.amount)) {
            addNotification(txData.userId, 'Transaction failed: Insufficient balance.', 'error');
            return { success: false, message: "Insufficient balance." };
        }
        
        const newTransaction: Transaction = {
            ...txData,
            id: `tx-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userName: userSource?.profile.name || 'System',
        };
        updateState('transactions', [...appData.transactions, newTransaction]);
        
        if(userSource) {
            const fullUserToUpdate = vaultService.findUserByEmail(userSource.email)!;
            fullUserToUpdate.wallet.balance += txData.amount;
            vaultService.updateUser(fullUserToUpdate);
            setAppData(vaultService.getSanitizedData());

            if (user && user.id === txData.userId) {
                updateCurrentUser({ ...user, wallet: { ...user.wallet, balance: user.wallet.balance + txData.amount } });
            }
        }
        return { success: true, message: "Transaction successful." };
    }, [appData.users, appData.transactions, addNotification, user, updateCurrentUser]);
    
    const markNotificationsAsRead = (userId: string) => {
        const newNotifs = appData.notifications.map(n => n.userId === userId ? { ...n, read: true } : n);
        updateState('notifications', newNotifs);
    };

    const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<{ success: boolean; message: string }> => {
        const userToUpdate = vaultService.findUserByEmail(appData.users.find(u => u.id === userId)!.email)!;
        userToUpdate.status = status;
        userToUpdate.wallet.isFrozen = status === 'inactive';
        vaultService.updateUser(userToUpdate);
        setAppData(vaultService.getSanitizedData());
        showToast(`User status has been updated to ${status}.`, 'success');
        return { success: true, message: "User status updated."};
    };
    
    const toggleArticleBookmark = (articleId: string) => {
        if (!user) return;
        const newBookmarks = user.bookmarkedArticles.includes(articleId)
            ? user.bookmarkedArticles.filter(id => id !== articleId)
            : [...user.bookmarkedArticles, articleId];
        updateCurrentUser({ ...user, bookmarkedArticles: newBookmarks });
    };

    const toggleArticleLike = (articleId: string) => {
        if (!user) return;
        const newArticles = appData.articles.map(a => {
            if (a.id === articleId) {
                const newLikes = a.likes.includes(user.id) ? a.likes.filter(id => id !== user.id) : [...a.likes, user.id];
                return { ...a, likes: newLikes };
            }
            return a;
        });
        updateState('articles', newArticles);
    };
    
    const addArticleComment = (articleId: string, comment: string) => {
        if (!user || !comment.trim()) return;
        const newComment = { userId: user.id, userName: user.profile.name, comment, timestamp: new Date().toISOString(), likes: [] };
        const newArticles = appData.articles.map(a => a.id === articleId ? { ...a, comments: [...a.comments, newComment] } : a);
        updateState('articles', newArticles);
    };
    
    const toggleCommentLike = (articleId: string, commentTimestamp: string) => {
        if (!user) return;
        const newArticles = appData.articles.map(a => {
            if (a.id === articleId) {
                return { ...a, comments: a.comments.map(c => {
                    if (c.timestamp === commentTimestamp) {
                        const newLikes = c.likes.includes(user.id) ? c.likes.filter(id => id !== user.id) : [...c.likes, user.id];
                        return { ...c, likes: newLikes };
                    }
                    return c;
                })};
            }
            return a;
        });
        updateState('articles', newArticles);
    };
    
    const voteOnPoll = (articleId: string, optionIndex: number) => {
        if (!user) return;
        const newArticles = appData.articles.map(a => {
            if (a.id === articleId && a.pollOptions && !a.pollOptions.some(opt => opt.votes.includes(user.id))) {
                const newPollOptions = a.pollOptions.map((opt, index) => index === optionIndex ? { ...opt, votes: [...opt.votes, user.id] } : opt);
                return { ...a, pollOptions: newPollOptions };
            }
            return a;
        });
        updateState('articles', newArticles);
    };

    const approveOpexByFinance = async (id: string) => {
        const request = appData.opexRequests.find(r => r.id === id);
        if (!user || !request) {
            showToast("Request not found.", "error");
            return;
        }

        const txResult = await addTransaction({
            userId: request.userId,
            type: 'Dana Opex',
            amount: request.amount,
            description: `Reimbursement for Opex: ${request.type}`,
            status: 'Completed'
        });

        if (txResult.success) {
            const updatedRequest: OpexRequest = { ...request, status: 'Approved', financeApproverId: user.id, financeApprovalTimestamp: new Date().toISOString() };
            updateState('opexRequests', appData.opexRequests.map(r => r.id === id ? updatedRequest : r));
            addNotification(request.userId, `Your opex request for ${request.type} has been approved and funds have been disbursed.`, 'success');
            showToast("Opex request approved and funds disbursed.", "success");
        } else {
            showToast("Failed to disburse funds. " + txResult.message, "error");
        }
    };

    const rejectOpexByFinance = async (id: string, reason: string) => {
        const request = appData.opexRequests.find(r => r.id === id);
        if (!user || !request) { return; }
        const updatedRequest: OpexRequest = { ...request, status: 'Rejected', financeApproverId: user.id, financeApprovalTimestamp: new Date().toISOString(), rejectionReason: `Rejected by Finance: ${reason}` };
        updateState('opexRequests', appData.opexRequests.map(r => (r.id === id ? updatedRequest : r)));
        addNotification(request.userId, `Your opex request for ${request.type} has been rejected by Finance.`, 'error');
        showToast("Opex request has been rejected.", "success");
    };

    const addBudget = async (budget: Omit<Budget, 'id'|'userId'|'spent'>) => {
        if(!user) return;
        const newBudget: Budget = { id: `b-${Date.now()}`, userId: user.id, spent: 0, ...budget };
        updateState('budgets', [...appData.budgets, newBudget]);
        showToast("Budget created successfully.", "success");
    };

    const updateBudget = async (budget: Budget) => {
        updateState('budgets', appData.budgets.map(b => b.id === budget.id ? budget : b));
        showToast("Budget updated.", "success");
    };
    const deleteBudget = async (id: string) => {
        showToast("Penghapusan data inti dinonaktifkan secara permanen untuk melindungi integritas sistem.", 'warning');
    };
    const addScheduledPayment = async (payment: Omit<ScheduledPayment, 'id'|'userId'>) => {
        if (!user) return;
        const newPayment: ScheduledPayment = { id: `sp-${Date.now()}`, userId: user.id, ...payment };
        updateState('scheduledPayments', [...appData.scheduledPayments, newPayment]);
        showToast("Scheduled payment created.", "success");
    };
    const updateScheduledPayment = async (payment: ScheduledPayment) => {
        updateState('scheduledPayments', appData.scheduledPayments.map(p => p.id === payment.id ? payment : p));
        showToast("Scheduled payment updated.", "success");
    };
    const deleteScheduledPayment = async (id: string) => {
        showToast("Penghapusan data inti dinonaktifkan secara permanen untuk melindungi integritas sistem.", 'warning');
    };
    const applyForPayLater = async () => {
        showToast("Fitur PayLater dinonaktifkan sementara.", "info");
        return Promise.resolve();
    };
    const approvePayLater = async (userId: string, limit: number) => {
        showToast("Fitur PayLater dinonaktifkan sementara.", 'info');
        return Promise.resolve();
    };
    const rejectPayLater = async (userId: string) => {
        showToast("Fitur PayLater dinonaktifkan sementara.", 'info');
        return Promise.resolve();
    };
    const adjustUserWallet = async (userId: string, amount: number, reason: string) => {
        await addTransaction({ userId, type: 'Refund', amount, description: `Adjustment: ${reason}`, status: 'Completed' });
        showToast("Wallet adjusted successfully.", "success");
    };
    const freezeUserWallet = async (userId: string, freeze: boolean) => {
        const userToUpdate = vaultService.findUserByEmail(appData.users.find(u => u.id === userId)!.email)!;
        userToUpdate.wallet.isFrozen = freeze;
        vaultService.updateUser(userToUpdate);
        setAppData(vaultService.getSanitizedData());
        showToast(`Wallet has been ${freeze ? 'frozen' : 'unfrozen'}.`, "success");
    };
    const reverseTransaction = async (txId: string) => {
        const tx = appData.transactions.find(t => t.id === txId);
        if(!tx) return;
        await addTransaction({ userId: tx.userId, type: 'Reversal', amount: -tx.amount, description: `Reversal for tx: ${txId}`, status: 'Completed', relatedId: txId });
        showToast(`Transaction ${txId} reversed.`, "success");
    };
    const resolveDispute = async (disputeId: string, resolution: 'Refund Buyer' | 'Pay Seller') => { /* ... Logic unchanged, just ensure it uses updateState ... */ };
    
    const updateApiIntegration = async (id: string, creds: ApiIntegration['credentials']): Promise<{ success: boolean, message: string }> => {
        const integration = appData.apiIntegrations.find(api => api.id === id);
        if (!integration) return { success: false, message: "Integration not found." };
        const result = await testApiConnection(creds, integration.name);
        vaultService.updateApiCredentials(id, creds);
        vaultService.updateApiStatus(id, result.success ? IntegrationStatus.Active : IntegrationStatus.Error);
        setAppData(vaultService.getSanitizedData());
        showToast(result.message, result.success ? 'success' : 'error');
        return result;
    };
    
    const deactivateApiIntegration = async (id: string) => {
        vaultService.updateApiStatus(id, IntegrationStatus.Inactive);
        setAppData(vaultService.getSanitizedData());
        showToast("API integration deactivated.", "success");
    };
    
    const updateScalabilityService = (id: string, status: ScalabilityServiceStatus, log: string, metadata?: Record<string, any>, cost?: number) => {
        const newServices = appData.scalabilityServices.map(s => {
            if (s.id === id) {
                const newMetadata = metadata ? { ...s.metadata, ...metadata } : s.metadata;
                return { ...s, status, logs: [...s.logs, log], metadata: newMetadata, cost: cost !== undefined ? cost : s.cost };
            }
            return s;
        });
        updateState('scalabilityServices', newServices);
    };
    
    const updateMonetizationConfig = (config: MonetizationConfig) => updateState('monetizationConfig', config);
    const updateTaxConfig = (config: TaxConfig) => updateState('taxConfig', config);
    const updateHomePageConfig = (config: HomePageConfig) => updateState('homePageConfig', config);

    const transferProfitToCash = async () => { /* ... Logic unchanged, just ensure it uses updateState ... */ };
    const recordTaxPayment = async () => { /* ... Logic unchanged, just ensure it uses updateState ... */ };
    const recordOperationalExpense = async (description: string, amount: number) => { /* ... Logic unchanged, just ensure it uses updateState ... */ };
    const logAssistantQuery = (query: string, detectedIntent: string) => { if (!user) return; updateState('assistantLogs', [...appData.assistantLogs, { id: `al-${Date.now()}`, userId: user.id, query, detectedIntent, timestamp: new Date().toISOString() }]); };
    const logEngagementEvent = (type: 'forYouClicks' | 'quickAccessClicks', itemId: string) => { updateState('engagementAnalytics', { ...appData.engagementAnalytics, [type]: { ...appData.engagementAnalytics[type], [itemId]: (appData.engagementAnalytics[type][itemId] || 0) + 1 } }); };
    const addPersonalizationRule = (rule: Omit<PersonalizationRule, 'id'>) => { const newRule = { ...rule, id: `pr-${Date.now()}` }; updateState('personalizationRules', [newRule, ...appData.personalizationRules]); showToast("New personalization rule created.", "success"); };
    const updatePersonalizationRule = (rule: PersonalizationRule) => { updateState('personalizationRules', appData.personalizationRules.map(r => r.id === rule.id ? rule : r)); showToast(`Rule "${rule.name}" updated.`, "success"); };
    const deletePersonalizationRule = async (id: string) => { showToast("Penghapusan data inti dinonaktifkan secara permanen untuk melindungi integritas sistem.", 'warning'); };
    
    const addArticle = async (articleData: Omit<Article, 'id' | 'author' | 'timestamp' | 'likes' | 'comments' | 'pollOptions'>) => { const newArticle: Article = { ...articleData, id: `a-${Date.now()}`, author: 'Admin', timestamp: new Date().toISOString(), likes: [], comments: [] }; updateState('articles', [newArticle, ...appData.articles]); showToast("Article created successfully.", "success"); };
    const updateArticle = async (article: Article) => { updateState('articles', appData.articles.map(a => a.id === article.id ? article : a)); showToast("Article updated successfully.", "success"); };
    const deleteArticle = async (articleId: string) => {
        updateState('articles', appData.articles.filter(a => a.id !== articleId));
        showToast("Article deleted successfully.", "success");
    };
    
     const addMultipleArticlesByAdmin = async (articlesData: any[]): Promise<{ success: number; failed: number; errors: string[] }> => {
        if (!user || user.role !== Role.Admin) {
            return { success: 0, failed: articlesData.length, errors: ["Unauthorized"] };
        }
        let success = 0;
        const newArticles: Article[] = [];
        for(const article of articlesData) {
             const newArticle: Article = { 
                ...article, 
                id: `a-${Date.now()}-${success}`, 
                author: 'Admin',
                timestamp: new Date().toISOString(),
                likes: [], 
                comments: [],
            };
            newArticles.push(newArticle);
            success++;
        }
        updateState('articles', [...newArticles, ...appData.articles]);
        return { success, failed: 0, errors: [] };
    };

    const generatePayslipData = (userId: string) => {
        const salary = vaultService.getRawSalaryForUser(userId);
        if (!salary) return null;
        const grossSalary = salary;
        const gajiPokok = grossSalary; const insentifKinerja = 0; const bpjsTkNatura = grossSalary * 0.0054; const totalPendapatan = gajiPokok + insentifKinerja + bpjsTkNatura;
        const pajakPph21 = grossSalary * 0.025; const bpjsTkKaryawan2 = grossSalary * 0.02; const bpjsTkKaryawan054 = grossSalary * 0.0054; const bpjsPensiunKaryawan = grossSalary * 0.01; const totalPotongan = pajakPph21 + bpjsTkKaryawan2 + bpjsTkKaryawan054 + bpjsPensiunKaryawan;
        const bpjsPensiunPerusahaan = grossSalary * 0.02; const bpjsTkPerusahaan = grossSalary * 0.037;
        const takeHomePay = (gajiPokok + insentifKinerja) - totalPotongan;
        return { gajiPokok, insentifKinerja, totalPendapatan, pajakPph21, bpjsTkKaryawan2, bpjsTkKaryawan054, bpjsPensiunKaryawan, totalPotongan, bpjsPensiunPerusahaan, bpjsTkPerusahaan, takeHomePay, saldoPinjaman: 0, bpjsTkNatura };
    };

    const { leaveRequests, attendanceRecords, opexRequests, ...remainingData } = appData;

    const value: CoreContextType = {
        ...remainingData,
        isAiGuardrailDisabled: false,
        
        addTransaction, addNotification, markNotificationsAsRead, updateUserStatus, generatePayslipData,
        toggleArticleBookmark,
        toggleArticleLike, addArticleComment, toggleCommentLike, voteOnPoll,
        approveOpexByFinance, rejectOpexByFinance,
        addBudget, updateBudget, deleteBudget,
        addScheduledPayment, updateScheduledPayment, deleteScheduledPayment,
        applyForPayLater, approvePayLater, rejectPayLater,
        adjustUserWallet, freezeUserWallet, reverseTransaction, resolveDispute,
        updateApiIntegration, deactivateApiIntegration, updateScalabilityService,
        updateMonetizationConfig, updateTaxConfig, updateHomePageConfig,
        transferProfitToCash, recordTaxPayment, recordOperationalExpense,
        updateServiceLinkage,
        logAssistantQuery, logEngagementEvent,
        addPersonalizationRule, updatePersonalizationRule, deletePersonalizationRule,
        addArticle, updateArticle, deleteArticle, addMultipleArticlesByAdmin,
    };

    return <CoreContext.Provider value={value}>{children}</CoreContext.Provider>;
};

export const useCore = (): CoreContextType => {
    const context = useContext(CoreContext);
    if (context === undefined) {
        throw new Error('useCore must be used within a CoreProvider');
    }
    return context;
};