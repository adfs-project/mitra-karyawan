import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import {
    User, Product, Article, Transaction, Notification, Doctor, Consultation,
    CartItem, Dispute, ApiIntegration, IntegrationStatus, ScalabilityService,
    ScalabilityServiceStatus, LeaveRequest, Budget, ScheduledPayment,
    MonetizationConfig, TaxConfig, HomePageConfig, AssistantLog, EngagementAnalytics,
    AdminWallets, PersonalizationRule, Order, OpexRequest, Role, Toast, ToastType
} from '../types';
import { testApiConnection } from '../services/apiService';
import { useAuth } from './AuthContext';
import vaultService from '../services/vaultService';
import { HealthProvider } from './HealthContext';

type AppData = ReturnType<typeof vaultService.getSanitizedData>;

export type UpdateStateFunc = <K extends keyof AppData>(key: K, value: AppData[K]) => void;

// Gabungan dari semua tipe data dan fungsi yang dibutuhkan secara global
export interface AppContextType extends AppData {
    toasts: Toast[];
    showToast: (message: string, type: ToastType) => void;
    removeToast: (id: number) => void;
    updateState: UpdateStateFunc;
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

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateCurrentUser } = useAuth();
    const [appData, setAppData] = useState(vaultService.getSanitizedData());
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const newToast: Toast = { id: Date.now(), message, type };
        setToasts(prev => [...prev, newToast]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    const updateState: UpdateStateFunc = useCallback((key, value) => {
        vaultService.setData(key, value as any);
        setAppData(vaultService.getSanitizedData());
    }, []);
    
    const addNotification = useCallback((userId: string, message: string, type: Notification['type']) => {
        const newNotif: Notification = {
            id: `notif-${Date.now()}`, userId, message, type, read: false, timestamp: new Date().toISOString()
        };
        updateState('notifications', [...appData.notifications, newNotif]);
    }, [appData.notifications, updateState]);

    const addTransaction = useCallback(async (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>): Promise<{ success: boolean; message: string }> => {
        const currentData = vaultService.getSanitizedData();
        const userSource = currentData.users.find(u => u.id === txData.userId);

        if (!userSource && txData.userId !== 'admin-001') return { success: false, message: "User not found." };
        if(txData.amount < 0 && userSource && userSource.wallet.balance < Math.abs(txData.amount)) {
            addNotification(txData.userId, 'Transaction failed: Insufficient balance.', 'error');
            return { success: false, message: "Insufficient balance." };
        }
        
        const newTransaction: Transaction = {
            ...txData, id: `tx-${Date.now()}`, timestamp: new Date().toISOString(), userName: userSource?.profile.name || 'System',
        };
        updateState('transactions', [...currentData.transactions, newTransaction]);
        
        if(userSource) {
            const fullUserToUpdate = vaultService.findUserByEmail(userSource.email)!;
            fullUserToUpdate.wallet.balance += txData.amount;
            vaultService.updateUser(fullUserToUpdate);
            setAppData(vaultService.getSanitizedData());
            if (user && user.id === txData.userId) {
                updateCurrentUser({ ...user, wallet: { ...user.wallet, balance: fullUserToUpdate.wallet.balance } });
            }
        }
        return { success: true, message: "Transaction successful." };
    }, [user, updateCurrentUser, addNotification, updateState]);
    
    const markNotificationsAsRead = useCallback((userId: string) => updateState('notifications', appData.notifications.map(n => n.userId === userId ? { ...n, read: true } : n)), [appData.notifications, updateState]);
    const updateUserStatus = useCallback(async (userId: string, status: 'active' | 'inactive'): Promise<{ success: boolean; message: string }> => {
        const userToUpdate = vaultService.findUserByEmail(appData.users.find(u => u.id === userId)!.email)!;
        userToUpdate.status = status; userToUpdate.wallet.isFrozen = status === 'inactive';
        vaultService.updateUser(userToUpdate);
        setAppData(vaultService.getSanitizedData());
        showToast(`User status has been updated to ${status}.`, 'success');
        return { success: true, message: "User status updated."};
    }, [appData.users, showToast]);
    
    const toggleArticleBookmark = useCallback((articleId: string) => { if (!user) return; const newBookmarks = user.bookmarkedArticles.includes(articleId) ? user.bookmarkedArticles.filter(id => id !== articleId) : [...user.bookmarkedArticles, articleId]; updateCurrentUser({ ...user, bookmarkedArticles: newBookmarks }); }, [user, updateCurrentUser]);
    const toggleArticleLike = useCallback((articleId: string) => { if (!user) return; updateState('articles', appData.articles.map(a => a.id === articleId ? { ...a, likes: a.likes.includes(user.id) ? a.likes.filter(id => id !== user.id) : [...a.likes, user.id] } : a)); }, [user, appData.articles, updateState]);
    const addArticleComment = useCallback((articleId: string, comment: string) => { if (!user || !comment.trim()) return; const newComment = { userId: user.id, userName: user.profile.name, comment, timestamp: new Date().toISOString(), likes: [] }; updateState('articles', appData.articles.map(a => a.id === articleId ? { ...a, comments: [...a.comments, newComment] } : a)); }, [user, appData.articles, updateState]);
    const toggleCommentLike = useCallback((articleId: string, commentTimestamp: string) => { if (!user) return; updateState('articles', appData.articles.map(a => a.id === articleId ? { ...a, comments: a.comments.map(c => c.timestamp === commentTimestamp ? { ...c, likes: c.likes.includes(user.id) ? c.likes.filter(id => id !== user.id) : [...c.likes, user.id] } : c)} : a)); }, [user, appData.articles, updateState]);
    const voteOnPoll = useCallback((articleId: string, optionIndex: number) => { if (!user) return; updateState('articles', appData.articles.map(a => (a.id === articleId && a.pollOptions && !a.pollOptions.some(opt => opt.votes.includes(user.id))) ? { ...a, pollOptions: a.pollOptions.map((opt, index) => index === optionIndex ? { ...opt, votes: [...opt.votes, user.id] } : opt) } : a)); }, [user, appData.articles, updateState]);

    const approveOpexByFinance = useCallback(async (id: string) => { const request = appData.opexRequests.find(r => r.id === id); if (!user || !request) return; const txResult = await addTransaction({ userId: request.userId, type: 'Dana Opex', amount: request.amount, description: `Reimbursement for Opex: ${request.type}`, status: 'Completed' }); if (txResult.success) { const updatedRequest: OpexRequest = { ...request, status: 'Approved', financeApproverId: user.id, financeApprovalTimestamp: new Date().toISOString() }; updateState('opexRequests', appData.opexRequests.map(r => r.id === id ? updatedRequest : r)); addNotification(request.userId, `Your opex request for ${request.type} has been approved.`, 'success'); showToast("Opex request approved.", "success"); } else { showToast("Failed to disburse funds.", "error"); } }, [appData.opexRequests, user, addTransaction, updateState, addNotification, showToast]);
    const rejectOpexByFinance = useCallback(async (id: string, reason: string) => { const request = appData.opexRequests.find(r => r.id === id); if (!user || !request) return; const updatedRequest: OpexRequest = { ...request, status: 'Rejected', financeApproverId: user.id, financeApprovalTimestamp: new Date().toISOString(), rejectionReason: `Rejected by Finance: ${reason}` }; updateState('opexRequests', appData.opexRequests.map(r => (r.id === id ? updatedRequest : r))); addNotification(request.userId, `Your opex request for ${request.type} has been rejected.`, 'error'); showToast("Opex request rejected.", "success"); }, [appData.opexRequests, user, updateState, addNotification, showToast]);
    
    const addBudget = useCallback(async (budget: Omit<Budget, 'id'|'userId'|'spent'>) => { if(!user) return; updateState('budgets', [...appData.budgets, { id: `b-${Date.now()}`, userId: user.id, spent: 0, ...budget }]); showToast("Budget created.", "success"); }, [user, appData.budgets, updateState, showToast]);
    const updateBudget = useCallback(async (budget: Budget) => { updateState('budgets', appData.budgets.map(b => b.id === budget.id ? budget : b)); showToast("Budget updated.", "success"); }, [appData.budgets, updateState, showToast]);
    const deleteBudget = useCallback(async (id: string) => { showToast("Core data deletion is permanently disabled.", 'warning'); }, [showToast]);
    const addScheduledPayment = useCallback(async (payment: Omit<ScheduledPayment, 'id'|'userId'>) => { if (!user) return; updateState('scheduledPayments', [...appData.scheduledPayments, { id: `sp-${Date.now()}`, userId: user.id, ...payment }]); showToast("Scheduled payment created.", "success"); }, [user, appData.scheduledPayments, updateState, showToast]);
    const updateScheduledPayment = useCallback(async (payment: ScheduledPayment) => { updateState('scheduledPayments', appData.scheduledPayments.map(p => p.id === payment.id ? payment : p)); showToast("Scheduled payment updated.", "success"); }, [appData.scheduledPayments, updateState, showToast]);
    const deleteScheduledPayment = useCallback(async (id: string) => { showToast("Core data deletion is permanently disabled.", 'warning'); }, [showToast]);
    
    const applyForPayLater = useCallback(async () => { showToast("PayLater feature is temporarily disabled.", "info"); }, [showToast]);
    const approvePayLater = useCallback(async (userId: string, limit: number) => { showToast("PayLater feature is temporarily disabled.", 'info'); }, [showToast]);
    const rejectPayLater = useCallback(async (userId: string) => { showToast("PayLater feature is temporarily disabled.", 'info'); }, [showToast]);
    
    const adjustUserWallet = useCallback(async (userId: string, amount: number, reason: string) => { await addTransaction({ userId, type: 'Refund', amount, description: `Adjustment: ${reason}`, status: 'Completed' }); showToast("Wallet adjusted.", "success"); }, [addTransaction, showToast]);
    const freezeUserWallet = useCallback(async (userId: string, freeze: boolean) => { const userToUpdate = vaultService.findUserByEmail(appData.users.find(u => u.id === userId)!.email)!; userToUpdate.wallet.isFrozen = freeze; vaultService.updateUser(userToUpdate); setAppData(vaultService.getSanitizedData()); showToast(`Wallet has been ${freeze ? 'frozen' : 'unfrozen'}.`, "success"); }, [appData.users, showToast]);
    const reverseTransaction = useCallback(async (txId: string) => { const tx = appData.transactions.find(t => t.id === txId); if(!tx) return; await addTransaction({ userId: tx.userId, type: 'Reversal', amount: -tx.amount, description: `Reversal for tx: ${txId}`, status: 'Completed', relatedId: txId }); showToast(`Transaction ${txId} reversed.`, "success"); }, [appData.transactions, addTransaction, showToast]);
    const resolveDispute = useCallback(async (disputeId: string, resolution: 'Refund Buyer' | 'Pay Seller') => { /* ... Logic ... */ }, []);
    
    const updateApiIntegration = useCallback(async (id: string, creds: ApiIntegration['credentials']): Promise<{ success: boolean, message: string }> => { const integration = appData.apiIntegrations.find(api => api.id === id); if (!integration) return { success: false, message: "Integration not found." }; const result = await testApiConnection(creds, integration.name); vaultService.updateApiCredentials(id, creds); vaultService.updateApiStatus(id, result.success ? IntegrationStatus.Active : IntegrationStatus.Error); setAppData(vaultService.getSanitizedData()); showToast(result.message, result.success ? 'success' : 'error'); return result; }, [appData.apiIntegrations, showToast]);
    const deactivateApiIntegration = useCallback(async (id: string) => { vaultService.updateApiStatus(id, IntegrationStatus.Inactive); setAppData(vaultService.getSanitizedData()); showToast("API integration deactivated.", "success"); }, [showToast]);
    const updateScalabilityService = useCallback((id: string, status: ScalabilityServiceStatus, log: string, metadata?: Record<string, any>, cost?: number) => { updateState('scalabilityServices', appData.scalabilityServices.map(s => s.id === id ? { ...s, status, logs: [...s.logs, log], metadata: metadata ? { ...s.metadata, ...metadata } : s.metadata, cost: cost !== undefined ? cost : s.cost } : s)); }, [appData.scalabilityServices, updateState]);
    
    const updateMonetizationConfig = useCallback((config: MonetizationConfig) => updateState('monetizationConfig', config), [updateState]);
    const updateTaxConfig = useCallback((config: TaxConfig) => updateState('taxConfig', config), [updateState]);
    const updateHomePageConfig = useCallback((config: HomePageConfig) => updateState('homePageConfig', config), [updateState]);
    
    const transferProfitToCash = useCallback(async () => { /* ... Logic ... */ }, []);
    const recordTaxPayment = useCallback(async () => { /* ... Logic ... */ }, []);
    const recordOperationalExpense = useCallback(async (description: string, amount: number) => { /* ... Logic ... */ }, []);
    const updateServiceLinkage = useCallback((featureId: string, apiId: string | null) => { updateState('serviceLinkage', { ...appData.serviceLinkage, [featureId]: apiId }); }, [appData.serviceLinkage, updateState]);

    const logAssistantQuery = useCallback((query: string, detectedIntent: string) => { if (!user) return; updateState('assistantLogs', [...appData.assistantLogs, { id: `al-${Date.now()}`, userId: user.id, query, detectedIntent, timestamp: new Date().toISOString() }]); }, [user, appData.assistantLogs, updateState]);
    const logEngagementEvent = useCallback((type: 'forYouClicks' | 'quickAccessClicks', itemId: string) => { updateState('engagementAnalytics', { ...appData.engagementAnalytics, [type]: { ...appData.engagementAnalytics[type], [itemId]: (appData.engagementAnalytics[type][itemId] || 0) + 1 } }); }, [appData.engagementAnalytics, updateState]);
    
    const addPersonalizationRule = useCallback((rule: Omit<PersonalizationRule, 'id'>) => { updateState('personalizationRules', [{ ...rule, id: `pr-${Date.now()}` }, ...appData.personalizationRules]); showToast("New rule created.", "success"); }, [appData.personalizationRules, updateState, showToast]);
    const updatePersonalizationRule = useCallback((rule: PersonalizationRule) => { updateState('personalizationRules', appData.personalizationRules.map(r => r.id === rule.id ? rule : r)); showToast(`Rule "${rule.name}" updated.`, "success"); }, [appData.personalizationRules, updateState, showToast]);
    const deletePersonalizationRule = useCallback(async (id: string) => { showToast("Core data deletion is permanently disabled.", 'warning'); }, [showToast]);
    
    const addArticle = useCallback(async (articleData: Omit<Article, 'id' | 'author' | 'timestamp' | 'likes' | 'comments' | 'pollOptions'>) => { updateState('articles', [{ ...articleData, id: `a-${Date.now()}`, author: 'Admin', timestamp: new Date().toISOString(), likes: [], comments: [] }, ...appData.articles]); showToast("Article created.", "success"); }, [appData.articles, updateState, showToast]);
    const updateArticle = useCallback(async (article: Article) => { updateState('articles', appData.articles.map(a => a.id === article.id ? article : a)); showToast("Article updated.", "success"); }, [appData.articles, updateState, showToast]);
    const deleteArticle = useCallback(async (articleId: string) => { updateState('articles', appData.articles.filter(a => a.id !== articleId)); showToast("Article deleted.", "success"); }, [appData.articles, updateState, showToast]);
    const addMultipleArticlesByAdmin = useCallback(async (articlesData: any[]): Promise<{ success: number; failed: number; errors: string[] }> => { if (!user || user.role !== Role.Admin) { return { success: 0, failed: articlesData.length, errors: ["Unauthorized"] }; } let success = 0; const newArticles: Article[] = []; for(const article of articlesData) { newArticles.push({ ...article, id: `a-${Date.now()}-${success}`, author: 'Admin', timestamp: new Date().toISOString(), likes: [], comments: [] }); success++; } updateState('articles', [...newArticles, ...appData.articles]); return { success, failed: 0, errors: [] }; }, [user, appData.articles, updateState]);

    const generatePayslipData = useCallback((userId: string) => { const salary = vaultService.getRawSalaryForUser(userId); if (!salary) return null; const grossSalary = salary; const gajiPokok = grossSalary; const insentifKinerja = 0; const bpjsTkNatura = grossSalary * 0.0054; const totalPendapatan = gajiPokok + insentifKinerja + bpjsTkNatura; const pajakPph21 = grossSalary * 0.025; const bpjsTkKaryawan2 = grossSalary * 0.02; const bpjsTkKaryawan054 = grossSalary * 0.0054; const bpjsPensiunKaryawan = grossSalary * 0.01; const totalPotongan = pajakPph21 + bpjsTkKaryawan2 + bpjsTkKaryawan054 + bpjsPensiunKaryawan; const bpjsPensiunPerusahaan = grossSalary * 0.02; const bpjsTkPerusahaan = grossSalary * 0.037; const takeHomePay = (gajiPokok + insentifKinerja) - totalPotongan; return { gajiPokok, insentifKinerja, totalPendapatan, pajakPph21, bpjsTkKaryawan2, bpjsTkKaryawan054, bpjsPensiunKaryawan, totalPotongan, bpjsPensiunPerusahaan, bpjsTkPerusahaan, takeHomePay, saldoPinjaman: 0, bpjsTkNatura }; }, []);

    const value: AppContextType = {
        ...appData,
        toasts,
        showToast,
        removeToast,
        updateState,
        addTransaction, addNotification, markNotificationsAsRead, updateUserStatus, generatePayslipData,
        toggleArticleBookmark, toggleArticleLike, addArticleComment, toggleCommentLike, voteOnPoll,
        approveOpexByFinance, rejectOpexByFinance,
        addBudget, updateBudget, deleteBudget, addScheduledPayment, updateScheduledPayment, deleteScheduledPayment,
        applyForPayLater, approvePayLater, rejectPayLater,
        adjustUserWallet, freezeUserWallet, reverseTransaction, resolveDispute,
        updateApiIntegration, deactivateApiIntegration, updateScalabilityService,
        updateMonetizationConfig, updateTaxConfig, updateHomePageConfig,
        transferProfitToCash, recordTaxPayment, recordOperationalExpense,
        updateServiceLinkage, logAssistantQuery, logEngagementEvent,
        addPersonalizationRule, updatePersonalizationRule, deletePersonalizationRule,
        addArticle, updateArticle, deleteArticle, addMultipleArticlesByAdmin,
    };

    return (
        <AppContext.Provider value={value}>
            <HealthProvider>
                {children}
            </HealthProvider>
        </AppContext.Provider>
    );
};

export const useApp = (): AppContextType => {
    const context = useContext(AppContext);
    if (context === undefined) {
        throw new Error('useApp must be used within an AppProvider');
    }
    return context;
};
