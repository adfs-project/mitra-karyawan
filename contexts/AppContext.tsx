import React, { createContext, useState, useContext, ReactNode, useCallback, useEffect } from 'react';
import vaultService from '../services/vaultService';
import {
    User, Product, Article, Transaction, Notification, Doctor, Consultation,
    CartItem, Dispute, ApiIntegration, ScalabilityService, LeaveRequest, Budget, ScheduledPayment,
    MonetizationConfig, TaxConfig, HomePageConfig, AssistantLog, EngagementAnalytics,
    AdminWallets, PersonalizationRule, Order, Eprescription, HealthDocument, HealthChallenge, InsuranceClaim, ServiceLinkageMap, Toast, OpexRequest, IntegrationStatus, Role,
    AttendanceRecord, SystemIntegrityLog, SystemIntegrityLogType
} from '../types';
import { testApiConnection } from '../services/apiService';
import { provisionService } from '../services/orchestratorService';
import { useAuth } from './AuthContext';

// This is the shape of our global state
interface AppStateType {
    users: User[];
    products: Product[];
    articles: Article[];
    transactions: Transaction[];
    notifications: Notification[];
    toasts: Toast[];
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
    serviceLinkage: ServiceLinkageMap;
    isAiGuardrailDisabled: boolean;
    opexRequests: OpexRequest[];
    attendanceRecords: AttendanceRecord[];
    integrityLogs: SystemIntegrityLog[];
}

// This is the shape of our context, including state and update functions
interface AppContextType extends AppStateType {
    updateState: <K extends keyof AppStateType>(key: K, value: AppStateType[K]) => void;
    addTransaction: (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>) => Promise<{ success: boolean; message: string }>;
    addNotification: (userId: string, message: string, type: Notification['type']) => void;
    markNotificationsAsRead: (userId: string) => void;
    showToast: (message: string, type: Toast['type']) => void;
    removeToast: (id: number) => void;
    logAssistantQuery: (query: string, intent: AssistantLog['detectedIntent']) => void;
    logEngagementEvent: (type: keyof EngagementAnalytics, itemId: string) => void;
    resolveDispute: (disputeId: string, resolution: 'grant_refund' | 'side_with_seller', method?: 'Admin' | 'Guardian') => Promise<void>;
    // Admin specific actions
    updateUserStatus: (userId: string, status: 'active' | 'inactive') => Promise<{ success: boolean, message: string }>;
    adjustUserWallet: (userId: string, amount: number, reason: string) => Promise<void>;
    freezeUserWallet: (userId: string, freeze: boolean) => Promise<void>;
    updateApiIntegration: (id: string, creds: any) => Promise<{ success: boolean, message: string }>;
    provisionScalabilityService: (type: ScalabilityService['type']) => Promise<void>;
    addArticle: (data: any) => void;
    updateArticle: (data: Article) => void;
    deleteArticle: (id: string) => void;
    voteOnPoll: (articleId: string, optionIndex: number) => void;
    addArticleComment: (articleId: string, comment: string) => void;
    toggleCommentLike: (articleId: string, commentTimestamp: string) => void;
    toggleArticleLike: (articleId: string) => void;
    toggleArticleBookmark: (articleId: string) => void;
    updateMonetizationConfig: (config: MonetizationConfig) => void;
    updateTaxConfig: (config: TaxConfig) => void;
    updateHomePageConfig: (config: HomePageConfig) => void;
    addPersonalizationRule: (rule: Omit<PersonalizationRule, 'id'>) => void;
    updatePersonalizationRule: (rule: PersonalizationRule) => void;
    deletePersonalizationRule: (id: string) => void;
    transferProfitToCash: () => Promise<void>;
    recordTaxPayment: () => Promise<void>;
    recordOperationalExpense: (description: string, amount: number) => Promise<void>;
    updateServiceLinkage: (featureId: string, apiId: string | null) => void;
    addBudget: (budget: { category: Budget['category'], limit: number }) => Promise<void>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (id: string) => void;
    addScheduledPayment: (payment: Omit<ScheduledPayment, 'id'|'userId'>) => Promise<void>;
    updateScheduledPayment: (payment: ScheduledPayment) => Promise<void>;
    deleteScheduledPayment: (id: string) => void;
    applyForPayLater: () => void;
    generatePayslipData: (userId: string) => any;
    approveOpexByFinance: (id: string) => Promise<void>;
    rejectOpexByFinance: (id: string, reason: string) => Promise<void>;
    addMultipleArticlesByAdmin: (articlesData: any[]) => Promise<{ success: number; failed: number; errors: string[] }>;
    approvePayLater: (userId: string, limit: number) => Promise<void>;
    rejectPayLater: (userId: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, setState] = useState<AppStateType>(() => {
        const initialData = vaultService.getSanitizedData();
        return {
            ...initialData,
            integrityLogs: [], // Initialize logs in memory
        };
    });
    const { user, updateCurrentUser } = useAuth();

    const updateState = useCallback(<K extends keyof AppStateType>(key: K, value: AppStateType[K]) => {
        if (key === 'integrityLogs') {
             setState(prevState => ({ ...prevState, [key]: value }));
        } else {
            vaultService.setData(key, value);
            setState(prevState => ({ ...prevState, [key]: value }));
        }
    }, []);

    const showToast = useCallback((message: string, type: Toast['type']) => {
        const newToast: Toast = { id: Date.now(), message, type };
        setState(s => ({ ...s, toasts: [...s.toasts, newToast] }));
    }, []);

    const removeToast = useCallback((id: number) => {
        setState(s => ({ ...s, toasts: s.toasts.filter(t => t.id !== id) }));
    }, []);

    const addTransaction = useCallback(async (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>): Promise<{ success: boolean; message: string }> => {
        const fullUser = vaultService.findUserByEmail(state.users.find(u => u.id === txData.userId)!.email);
        if (!fullUser) return { success: false, message: 'User not found.' };

        if (fullUser.wallet.isFrozen) {
            return { success: false, message: 'User wallet is frozen.' };
        }

        if (fullUser.wallet.balance + txData.amount < 0) {
            return { success: false, message: 'Insufficient balance.' };
        }
        
        const newBalance = fullUser.wallet.balance + txData.amount;
        vaultService.updateUser({ ...fullUser, wallet: { ...fullUser.wallet, balance: newBalance } });
        
        const newTransaction: Transaction = {
            ...txData,
            id: `tx-${Date.now()}`,
            timestamp: new Date().toISOString(),
            userName: fullUser.profile.name,
        };
        updateState('transactions', [newTransaction, ...state.transactions]);
        
        setState(s => ({ ...s, users: s.users.map(u => u.id === txData.userId ? { ...u, wallet: { ...u.wallet, balance: newBalance } } : u) }));
        
        return { success: true, message: 'Transaction successful.' };
    }, [state.transactions, state.users, updateState]);

    const addNotification = useCallback((userId: string, message: string, type: Notification['type']) => {
        const newNotif: Notification = { id: `notif-${Date.now()}`, userId, message, type, read: false, timestamp: new Date().toISOString() };
        updateState('notifications', [newNotif, ...state.notifications]);
    }, [state.notifications, updateState]);

    const resolveDispute = useCallback(async (disputeId: string, resolution: 'grant_refund' | 'side_with_seller', method: 'Admin' | 'Guardian' = 'Admin') => {
        const dispute = state.disputes.find(d => d.id === disputeId);
        if (!dispute || dispute.status !== 'Open') return;

        const order = state.orders.find(o => o.id === dispute.orderId);
        if (!order) return;
        
        const sellerId = state.products.find(p => p.id === order.items[0].productId)?.sellerId;
        if (!sellerId) return;

        if (resolution === 'grant_refund') {
            await addTransaction({
                userId: dispute.userId,
                type: 'Refund',
                amount: order.total,
                description: `Refund for order ${order.id} (Dispute Resolved)`,
                status: 'Completed',
                relatedId: order.id,
            });
            await addTransaction({
                userId: sellerId,
                type: 'Reversal',
                amount: -order.total,
                description: `Reversal for order ${order.id} (Dispute Resolved)`,
                status: 'Completed',
                relatedId: order.id,
            });
            addNotification(dispute.userId, `Your dispute for order ${order.id} has been resolved in your favor.`, 'success');
            addNotification(sellerId, `Dispute for order ${order.id} was resolved in the buyer's favor.`, 'warning');
        } else {
             addNotification(dispute.userId, `Your dispute for order ${order.id} has been resolved in the seller's favor.`, 'info');
             addNotification(sellerId, `Dispute for order ${order.id} was resolved in your favor.`, 'success');
        }

        const updatedDispute: Dispute = { ...dispute, status: 'Resolved', resolutionMethod: method };
        updateState('disputes', state.disputes.map(d => d.id === disputeId ? updatedDispute : d));
    }, [state.disputes, state.orders, state.products, updateState, addTransaction, addNotification]);

    useEffect(() => {
        const guardianInterval = setInterval(() => {
            if (!state.homePageConfig.isIntegrityGuardianActive) return;

            const addIntegrityLog = (type: SystemIntegrityLogType, message: string, details?: Record<string, any>) => {
                const newLog: SystemIntegrityLog = { id: `log-${Date.now()}`, timestamp: new Date().toISOString(), type, message, details };
                updateState('integrityLogs', [newLog, ...state.integrityLogs]);
            };

            // --- Dispute Management Logic ---
            const openDisputes = state.disputes.filter(d => d.status === 'Open');
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

            openDisputes.forEach(dispute => {
                const order = state.orders.find(o => o.id === dispute.orderId);
                if (!order) return;

                // Auto-resolve low-value disputes
                if (order.total < 50000) {
                    resolveDispute(dispute.id, 'grant_refund', 'Guardian');
                    const message = `Auto-resolved low-value dispute for order ${order.id}.`;
                    addIntegrityLog('AUTO_DISPUTE_RESOLUTION', message, { orderId: order.id, amount: order.total });
                    addNotification('admin-001', message, 'success');
                    return;
                }

                // Escalate old disputes
                if (dispute.timestamp < sevenDaysAgo) {
                    const message = `Dispute for order ${order.id} is over 7 days old and requires attention.`;
                    addIntegrityLog('DISPUTE_ESCALATION', message, { orderId: order.id });
                    addNotification('admin-001', message, 'warning');
                }
            });

        }, 30000); // Run every 30 seconds

        return () => clearInterval(guardianInterval);
    }, [state.homePageConfig.isIntegrityGuardianActive, state.disputes, state.orders, updateState, addNotification, resolveDispute]);

    const logAssistantQuery = useCallback((query: string, detectedIntent: AssistantLog['detectedIntent']) => {
        if (!user) return;
        const newLog: AssistantLog = { id: `asl-${Date.now()}`, userId: user.id, query, detectedIntent, timestamp: new Date().toISOString() };
        updateState('assistantLogs', [newLog, ...state.assistantLogs]);
    }, [user, state.assistantLogs, updateState]);

    const logEngagementEvent = useCallback((type: keyof EngagementAnalytics, itemId: string) => {
        const newAnalytics = { ...state.engagementAnalytics };
        newAnalytics[type][itemId] = (newAnalytics[type][itemId] || 0) + 1;
        updateState('engagementAnalytics', newAnalytics);
    }, [state.engagementAnalytics, updateState]);

    const toggleArticleLike = useCallback((articleId: string) => {
        if (!user) return;
        const article = state.articles.find(a => a.id === articleId);
        if (!article) return;
        const isLiked = article.likes.includes(user.id);
        const newLikes = isLiked ? article.likes.filter(id => id !== user.id) : [...article.likes, user.id];
        updateState('articles', state.articles.map(a => a.id === articleId ? { ...a, likes: newLikes } : a));
    }, [user, state.articles, updateState]);

    const toggleArticleBookmark = useCallback((articleId: string) => {
        if (!user) return;
        const isBookmarked = user.bookmarkedArticles.includes(articleId);
        const newBookmarks = isBookmarked ? user.bookmarkedArticles.filter(id => id !== articleId) : [...user.bookmarkedArticles, articleId];
        updateCurrentUser({ ...user, bookmarkedArticles: newBookmarks });
    }, [user, updateCurrentUser]);

    return (
        <AppContext.Provider value={{
            ...state,
            updateState,
            addTransaction,
            addNotification,
            showToast,
            removeToast,
            resolveDispute,
            logAssistantQuery,
            logEngagementEvent,
            toggleArticleLike,
            toggleArticleBookmark,
            markNotificationsAsRead: (userId: string) => {
                const newNotifications = state.notifications.map(n => n.userId === userId ? { ...n, read: true } : n);
                updateState('notifications', newNotifications);
            },
            updateUserStatus: async (userId, status) => {
                const userToUpdate = vaultService.findUserByEmail(state.users.find(u=>u.id === userId)!.email);
                if (userToUpdate) {
                    vaultService.updateUser({ ...userToUpdate, status });
                    updateState('users', state.users.map(u => u.id === userId ? { ...u, status } : u));
                    return { success: true, message: 'Status updated.' };
                }
                return { success: false, message: 'User not found.' };
            },
            adjustUserWallet: async (userId, amount, reason) => {
                await addTransaction({ userId, amount, description: `Admin adjustment: ${reason}`, type: 'Reversal', status: 'Completed' });
                showToast(`Wallet for user ${userId} adjusted by ${amount}.`, 'success');
            },
            freezeUserWallet: async (userId, freeze) => {
                const userToUpdate = vaultService.findUserByEmail(state.users.find(u=>u.id === userId)!.email);
                 if (userToUpdate) {
                    vaultService.updateUser({ ...userToUpdate, wallet: { ...userToUpdate.wallet, isFrozen: freeze } });
                    updateState('users', state.users.map(u => u.id === userId ? { ...u, wallet: {...u.wallet, isFrozen: freeze} } : u));
                    showToast(`Wallet for user ${userId} has been ${freeze ? 'frozen' : 'unfrozen'}.`, 'success');
                }
            },
            updateApiIntegration: async (id, creds) => {
                const integration = state.apiIntegrations.find(api => api.id === id);
                if(!integration) return { success: false, message: "Integration not found." };
                const result = await testApiConnection(creds, integration.name);
                if(result.success) {
                    vaultService.updateApiCredentials(id, creds);
                    vaultService.updateApiStatus(id, IntegrationStatus.Active);
                    updateState('apiIntegrations', state.apiIntegrations.map(api => api.id === id ? {...api, status: IntegrationStatus.Active} : api));
                }
                return result;
            },
            provisionScalabilityService: async () => {},
            addArticle: (data) => {
                const newArticle: Article = { ...data, id: `art-${Date.now()}`, author: 'Admin', timestamp: new Date().toISOString(), likes: [], comments: [] };
                updateState('articles', [newArticle, ...state.articles]);
            },
            updateArticle: (data) => updateState('articles', state.articles.map(a => a.id === data.id ? data : a)),
            deleteArticle: (id) => showToast("Deletion is disabled.", 'warning'),
            voteOnPoll: (articleId, optionIndex) => {
                 if (!user) return;
                 updateState('articles', state.articles.map(a => {
                    if (a.id === articleId && a.pollOptions) {
                        return {
                            ...a,
                            pollOptions: a.pollOptions.map((opt, i) => {
                                const newVotes = opt.votes.filter(v => v !== user.id);
                                if (i === optionIndex) newVotes.push(user.id);
                                return { ...opt, votes: newVotes };
                            })
                        };
                    }
                    return a;
                }));
            },
            addArticleComment: (articleId, comment) => {
                if (!user) return;
                const newComment = { userId: user.id, userName: user.profile.name, comment, timestamp: new Date().toISOString(), likes: [] };
                updateState('articles', state.articles.map(a => a.id === articleId ? { ...a, comments: [...a.comments, newComment] } : a));
            },
            toggleCommentLike: (articleId, commentTimestamp) => {
                 if (!user) return;
                 updateState('articles', state.articles.map(a => {
                    if (a.id === articleId) {
                        return { ...a, comments: a.comments.map(c => {
                            if (c.timestamp === commentTimestamp) {
                                const isLiked = c.likes.includes(user.id);
                                const newLikes = isLiked ? c.likes.filter(id => id !== user.id) : [...c.likes, user.id];
                                return { ...c, likes: newLikes };
                            }
                            return c;
                        })};
                    }
                    return a;
                }));
            },
            updateMonetizationConfig: (config) => updateState('monetizationConfig', config),
            updateTaxConfig: (config) => updateState('taxConfig', config),
            updateHomePageConfig: (config) => updateState('homePageConfig', config),
            addPersonalizationRule: (rule) => updateState('personalizationRules', [{ ...rule, id: `pr-${Date.now()}` }, ...state.personalizationRules]),
            updatePersonalizationRule: (rule) => updateState('personalizationRules', state.personalizationRules.map(r => r.id === rule.id ? rule : r)),
            deletePersonalizationRule: () => showToast("Deletion is disabled.", 'warning'),
            transferProfitToCash: async () => {
                const amount = state.adminWallets.profit;
                if (amount <= 0) return;
                await addTransaction({ userId: 'admin-001', amount, description: 'Profit transfer to cash', type: 'Internal Transfer', status: 'Completed' });
                updateState('adminWallets', { ...state.adminWallets, profit: 0, cash: state.adminWallets.cash + amount });
                showToast('Profit transferred to cash wallet.', 'success');
            },
            recordTaxPayment: async () => {
                const amount = state.adminWallets.tax;
                if (amount <= 0) return;
                await addTransaction({ userId: 'admin-001', amount: -amount, description: 'Tax payment to government', type: 'Operational Expense', status: 'Completed' });
                updateState('adminWallets', { ...state.adminWallets, tax: 0, cash: state.adminWallets.cash - amount });
                showToast('Tax payment recorded.', 'success');
            },
            recordOperationalExpense: async (description, amount) => {
                await addTransaction({ userId: 'admin-001', amount: -amount, description, type: 'Operational Expense', status: 'Completed' });
                updateState('adminWallets', { ...state.adminWallets, cash: state.adminWallets.cash - amount });
            },
            updateServiceLinkage: (featureId, apiId) => updateState('serviceLinkage', { ...state.serviceLinkage, [featureId]: apiId }),
            addBudget: async (budget) => {
                if (!user) return;
                const newBudget: Budget = { ...budget, id: `b-${Date.now()}`, userId: user.id, spent: 0 };
                updateState('budgets', [...state.budgets, newBudget]);
            },
            updateBudget: async (budget) => updateState('budgets', state.budgets.map(b => b.id === budget.id ? budget : b)),
            deleteBudget: () => showToast("Deletion is disabled.", 'warning'),
            addScheduledPayment: async (payment) => {
                if (!user) return;
                const newPayment: ScheduledPayment = { ...payment, id: `sp-${Date.now()}`, userId: user.id };
                updateState('scheduledPayments', [...state.scheduledPayments, newPayment]);
            },
            updateScheduledPayment: async (payment) => updateState('scheduledPayments', state.scheduledPayments.map(p => p.id === payment.id ? payment : p)),
            deleteScheduledPayment: () => showToast("Deletion is disabled.", 'warning'),
            applyForPayLater: () => {
                if (!user) return;
                // Allow re-application if not applied or rejected
                if (user.payLater?.status === 'pending' || user.payLater?.status === 'approved') {
                    showToast(`Anda sudah memiliki status PayLater: ${user.payLater.status}.`, 'info');
                    return;
                }

                const fullUser = vaultService.findUserByEmail(user.email);
                if(fullUser) {
                    const updatedUser = { ...fullUser, payLater: { status: 'pending' as const } };
                    vaultService.updateUser(updatedUser);
                     updateCurrentUser({ ...user, payLater: { status: 'pending' } });
                    showToast('Pengajuan PayLater berhasil dikirim.', 'success');
                }
            },
            generatePayslipData: (userId: string) => {
                const salary = vaultService.getRawSalaryForUser(userId) || 0;
                const insentifKinerja = salary * 0.1; // 10%
                const bpjsTkNatura = salary * 0.0054;
                const totalPendapatan = salary + insentifKinerja + bpjsTkNatura;
                
                const pajakPph21 = totalPendapatan * 0.025;
                const bpjsTkKaryawan2 = salary * 0.02;
                const bpjsTkKaryawan054 = salary * 0.0054;
                const bpjsPensiunKaryawan = salary * 0.01;
                const totalPotongan = pajakPph21 + bpjsTkKaryawan2 + bpjsTkKaryawan054 + bpjsPensiunKaryawan;
                
                const bpjsPensiunPerusahaan = salary * 0.02;
                const bpjsTkPerusahaan = salary * 0.037;
                
                const takeHomePay = totalPendapatan - totalPotongan;
                
                return {
                    gajiPokok: salary, insentifKinerja, bpjsTkNatura, totalPendapatan,
                    pajakPph21, bpjsTkKaryawan2, bpjsTkKaryawan054, bpjsPensiunKaryawan, totalPotongan,
                    bpjsPensiunPerusahaan, bpjsTkPerusahaan, saldoPinjaman: 0, takeHomePay
                };
            },
            approveOpexByFinance: async (id: string) => {
                const req = state.opexRequests.find(r => r.id === id);
                if(req && user){
                    await addTransaction({userId: req.userId, amount: req.amount, description: `Pencairan Opex: ${req.type}`, type: 'Dana Opex', status: 'Completed', relatedId: id});
                    updateState('opexRequests', state.opexRequests.map(r => r.id === id ? {...r, status: 'Approved', financeApproverId: user.id, financeApprovalTimestamp: new Date().toISOString()} : r));
                    addNotification(req.userId, `Pengajuan dana opex Anda untuk ${req.type} telah disetujui dan dicairkan.`, 'success');
                }
            },
            rejectOpexByFinance: async(id, reason) => {
                if(user) {
                    updateState('opexRequests', state.opexRequests.map(r => r.id === id ? {...r, status: 'Rejected', financeApproverId: user.id, financeApprovalTimestamp: new Date().toISOString(), rejectionReason: `Rejected by Finance: ${reason}`} : r));
                }
            },
            addMultipleArticlesByAdmin: async (articlesData: any[]) => {
                const newArticles = articlesData.map((data, i) => ({
                     ...data,
                    id: `art-${Date.now()}-${i}`,
                    author: 'Admin',
                    timestamp: new Date().toISOString(),
                    likes: [],
                    comments: [],
                }));
                updateState('articles', [...newArticles, ...state.articles]);
                return { success: newArticles.length, failed: 0, errors: [] };
            },
            approvePayLater: async (userId, limit) => {
                const fullUser = vaultService.findUserByEmail(state.users.find(u => u.id === userId)!.email);
                if (fullUser) {
                    const payLater = { status: 'approved' as const, limit, remainingLimit: limit };
                    const updatedUser = { ...fullUser, payLater };
                    vaultService.updateUser(updatedUser);
                    updateState('users', state.users.map(u => u.id === userId ? { ...u, payLater } : u));
                    addNotification(userId, `Selamat! Aplikasi PayLater Anda disetujui dengan limit Rp ${limit.toLocaleString('id-ID')}.`, 'success');
                    showToast('PayLater application approved.', 'success');
                }
            },
            rejectPayLater: async (userId) => {
                const fullUser = vaultService.findUserByEmail(state.users.find(u => u.id === userId)!.email);
                if (fullUser) {
                    const payLater = { status: 'rejected' as const };
                    const updatedUser = { ...fullUser, payLater };
                    vaultService.updateUser(updatedUser);
                    updateState('users', state.users.map(u => u.id === userId ? { ...u, payLater } : u));
                    addNotification(userId, `Maaf, aplikasi PayLater Anda ditolak.`, 'error');
                    showToast('PayLater application rejected.', 'success');
                }
            },
        }}>
            {children}
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