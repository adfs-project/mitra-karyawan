

import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import {
    User, Product, Article, Transaction, Notification, Doctor, Consultation,
    CartItem, Dispute, ApiIntegration, IntegrationStatus, ScalabilityService,
    ScalabilityServiceStatus, LeaveRequest, Budget, ScheduledPayment,
    MonetizationConfig, TaxConfig, HomePageConfig, AssistantLog, EngagementAnalytics,
    AdminWallets, PersonalizationRule, Order
} from '../types';
import {
    initialUsers, initialProducts, initialArticles, initialTransactions, initialNotifications,
    initialDoctors, initialConsultations, initialDisputes, initialApiIntegrations,
    initialScalabilityServices, initialLeaveRequests, initialMonetizationConfig,
    initialTaxConfig, initialHomePageConfig, initialAdminWallets, initialPersonalizationRules,
    initialOrders
} from '../data/mockData';
import { testApiConnection } from '../services/apiService';
import { useAuth } from './AuthContext';

// A helper function to get data from localStorage or return initial data
const useStickyState = <T,>(key: string, defaultValue: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [value, setValue] = useState<T>(() => {
        try {
            const stickyValue = window.localStorage.getItem(key);
            return stickyValue !== null ? JSON.parse(stickyValue) : defaultValue;
        } catch (error) {
            console.warn(`Error reading localStorage key “${key}”:`, error);
            return defaultValue;
        }
    });

    useEffect(() => {
        window.localStorage.setItem(key, JSON.stringify(value));
    }, [key, value]);

    return [value, setValue];
};


interface DataContextType {
    users: User[];
    products: Product[];
    articles: Article[];
    transactions: Transaction[];
    notifications: Notification[];
    doctors: Doctor[];
    consultations: Consultation[];
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

    // --- Methods ---
    addTransaction: (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>) => Promise<{ success: boolean; message: string }>;
    addNotification: (userId: string, message: string, type: Notification['type']) => void;
    markNotificationsAsRead: (userId: string) => void;
    updateUserStatus: (userId: string, status: 'active' | 'inactive') => Promise<{ success: boolean; message: string }>;
    
    // Cart
    addToCart: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    
    // Wishlist & Bookmarks
    toggleWishlist: (productId: string) => void;
    toggleArticleBookmark: (articleId: string) => void;
    
    // Article Interaction
    toggleArticleLike: (articleId: string) => void;
    addArticleComment: (articleId: string, comment: string) => void;
    toggleCommentLike: (articleId: string, commentTimestamp: string) => void;
    voteOnPoll: (articleId: string, optionIndex: number) => void;
    
    // Health
    bookConsultation: (doctorId: string, slotTime: string) => Promise<{ success: boolean; message: string; consultationId?: string }>;
    endConsultation: (consultationId: string, notes: string, prescription: string) => Promise<void>;
    
    // HR
    submitLeaveRequest: (req: { startDate: string, endDate: string, reason: string }) => Promise<void>;
    updateLeaveRequestStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;

    // Financial Planning
    addBudget: (budget: Omit<Budget, 'id'|'userId'|'spent'>) => Promise<void>;
    updateBudget: (budget: Budget) => Promise<void>;
    deleteBudget: (id: string) => Promise<void>;
    addScheduledPayment: (payment: Omit<ScheduledPayment, 'id'|'userId'>) => Promise<void>;
    updateScheduledPayment: (payment: ScheduledPayment) => Promise<void>;
    deleteScheduledPayment: (id: string) => Promise<void>;

    // PayLater
    applyForPayLater: () => Promise<void>;
    approvePayLater: (userId: string, limit: number) => Promise<void>;
    rejectPayLater: (userId: string) => Promise<void>;

    // Admin Methods
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

    // Engagement & Personalization
    logAssistantQuery: (query: string, detectedIntent: string) => void;
    logEngagementEvent: (type: 'forYouClicks' | 'quickAccessClicks', itemId: string) => void;
    addPersonalizationRule: (rule: Omit<PersonalizationRule, 'id'>) => void;
    updatePersonalizationRule: (rule: PersonalizationRule) => void;
    deletePersonalizationRule: (id: string) => void;

    // Marketplace
    addProduct: (product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateCurrentUser } = useAuth();
    
    // --- State Management ---
    const [users, setUsers] = useStickyState<User[]>('app_all_users', initialUsers);
    const [products, setProducts] = useStickyState<Product[]>('app_products', initialProducts);
    const [articles, setArticles] = useStickyState<Article[]>('app_articles', initialArticles);
    const [transactions, setTransactions] = useStickyState<Transaction[]>('app_transactions', initialTransactions);
    const [notifications, setNotifications] = useStickyState<Notification[]>('app_notifications', initialNotifications);
    const [doctors, setDoctors] = useStickyState<Doctor[]>('app_doctors', initialDoctors);
    const [consultations, setConsultations] = useStickyState<Consultation[]>('app_consultations', initialConsultations);
    const [cart, setCart] = useStickyState<CartItem[]>('app_cart', []);
    const [disputes, setDisputes] = useStickyState<Dispute[]>('app_disputes', initialDisputes);
    const [apiIntegrations, setApiIntegrations] = useStickyState<ApiIntegration[]>('app_api_integrations', initialApiIntegrations);
    const [scalabilityServices, setScalabilityServices] = useStickyState<ScalabilityService[]>('app_scalability_services', initialScalabilityServices);
    const [leaveRequests, setLeaveRequests] = useStickyState<LeaveRequest[]>('app_leave_requests', initialLeaveRequests);
    const [budgets, setBudgets] = useStickyState<Budget[]>('app_budgets', []);
    const [scheduledPayments, setScheduledPayments] = useStickyState<ScheduledPayment[]>('app_scheduled_payments', []);
    const [monetizationConfig, setMonetizationConfig] = useStickyState<MonetizationConfig>('app_monetization_config', initialMonetizationConfig);
    const [taxConfig, setTaxConfig] = useStickyState<TaxConfig>('app_tax_config', initialTaxConfig);
    const [homePageConfig, setHomePageConfig] = useStickyState<HomePageConfig>('app_homepage_config', initialHomePageConfig);
    const [assistantLogs, setAssistantLogs] = useStickyState<AssistantLog[]>('app_assistant_logs', []);
    const [engagementAnalytics, setEngagementAnalytics] = useStickyState<EngagementAnalytics>('app_engagement_analytics', { forYouClicks: {}, quickAccessClicks: {} });
    const [adminWallets, setAdminWallets] = useStickyState<AdminWallets>('app_admin_wallets', initialAdminWallets);
    const [orders, setOrders] = useStickyState<Order[]>('app_orders', initialOrders);
    const [personalizationRules, setPersonalizationRules] = useStickyState<PersonalizationRule[]>('app_personalization_rules', initialPersonalizationRules);

    const addNotification = useCallback((userId: string, message: string, type: Notification['type']) => {
        const newNotif: Notification = {
            id: `notif-${Date.now()}`,
            userId, message, type, read: false,
            timestamp: new Date().toISOString()
        };
        setNotifications(prev => [...prev, newNotif]);
    }, [setNotifications]);
    
    const addTransaction = useCallback(async (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>): Promise<{ success: boolean; message: string }> => {
        return new Promise(resolve => {
            setTimeout(() => { // Simulate network delay
                const userSource = users.find(u => u.id === txData.userId);
                if (!userSource) {
                    resolve({ success: false, message: "User not found." });
                    return;
                }

                if(txData.amount < 0 && userSource.wallet.balance < Math.abs(txData.amount)) {
                    addNotification(txData.userId, 'Transaction failed: Insufficient balance.', 'error');
                    resolve({ success: false, message: "Insufficient balance." });
                    return;
                }
                
                const newTransaction: Transaction = {
                    ...txData,
                    id: `tx-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    userName: userSource.profile.name,
                };

                setTransactions(prev => [...prev, newTransaction]);
                
                // Update user wallet
                setUsers(prevUsers => prevUsers.map(u => 
                    u.id === txData.userId ? { ...u, wallet: { ...u.wallet, balance: u.wallet.balance + txData.amount }} : u
                ));

                // If it's the current user, update their context
                if (user && user.id === txData.userId) {
                    updateCurrentUser({ ...user, wallet: { ...user.wallet, balance: user.wallet.balance + txData.amount } });
                }
                
                resolve({ success: true, message: "Transaction successful." });
            }, 500);
        });
    }, [users, setTransactions, setUsers, addNotification, user, updateCurrentUser]);
    
    const markNotificationsAsRead = (userId: string) => {
        setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
    };

    const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<{ success: boolean; message: string }> => {
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status, wallet: {...u.wallet, isFrozen: status === 'inactive' } } : u));
        return { success: true, message: "User status updated."};
    };

    const addToCart = (productId: string, quantity: number) => {
        setCart(prev => {
            const existingItem = prev.find(item => item.productId === productId);
            if (existingItem) {
                return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { productId, quantity }];
        });
        addNotification(user!.id, "Item added to cart", "success");
    };

    const removeFromCart = (productId: string) => {
        setCart(prev => prev.filter(item => item.productId !== productId));
    };
    
    const updateCartQuantity = (productId: string, quantity: number) => {
        if (quantity < 1) {
            removeFromCart(productId);
            return;
        }
        setCart(prev => prev.map(item => item.productId === productId ? { ...item, quantity } : item));
    };

    const clearCart = () => setCart([]);
    
    const toggleWishlist = (productId: string) => {
        if (!user) return;
        const newWishlist = user.wishlist.includes(productId)
            ? user.wishlist.filter(id => id !== productId)
            : [...user.wishlist, productId];
        updateCurrentUser({ ...user, wishlist: newWishlist });
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
        setArticles(prev => prev.map(a => {
            if (a.id === articleId) {
                const newLikes = a.likes.includes(user.id) ? a.likes.filter(id => id !== user.id) : [...a.likes, user.id];
                return { ...a, likes: newLikes };
            }
            return a;
        }));
    };
    
    const addArticleComment = (articleId: string, comment: string) => {
        if (!user || !comment.trim()) return;
        const newComment = {
            userId: user.id,
            userName: user.profile.name,
            comment,
            timestamp: new Date().toISOString(),
            likes: [],
        };
        setArticles(prev => prev.map(a => a.id === articleId ? { ...a, comments: [...a.comments, newComment] } : a));
    };
    
    const toggleCommentLike = (articleId: string, commentTimestamp: string) => {
        if (!user) return;
        setArticles(prev => prev.map(a => {
            if (a.id === articleId) {
                return {
                    ...a,
                    comments: a.comments.map(c => {
                        if (c.timestamp === commentTimestamp) {
                            const newLikes = c.likes.includes(user.id) ? c.likes.filter(id => id !== user.id) : [...c.likes, user.id];
                            return { ...c, likes: newLikes };
                        }
                        return c;
                    })
                };
            }
            return a;
        }));
    };
    
    const voteOnPoll = (articleId: string, optionIndex: number) => {
        if (!user) return;
        setArticles(prev => prev.map(a => {
            if (a.id === articleId && a.pollOptions && !a.pollOptions.some(opt => opt.votes.includes(user.id))) {
                const newPollOptions = a.pollOptions.map((opt, index) => {
                    if (index === optionIndex) {
                        return { ...opt, votes: [...opt.votes, user.id] };
                    }
                    return opt;
                });
                return { ...a, pollOptions: newPollOptions };
            }
            return a;
        }));
    };

    const bookConsultation = async (doctorId: string, slotTime: string): Promise<{ success: boolean; message: string; consultationId?: string }> => {
        const doctor = doctors.find(d => d.id === doctorId);
        if (!user || !doctor) return { success: false, message: 'Doctor not found.' };
        if (user.wallet.balance < doctor.consultationFee) return { success: false, message: 'Insufficient balance.' };
        
        const txResult = await addTransaction({ userId: user.id, type: 'Teleconsultation', amount: -doctor.consultationFee, description: `Consultation with ${doctor.name}`, status: 'Completed' });
        if (!txResult.success) return { success: false, message: 'Payment failed.' };

        const newConsultation: Consultation = {
            id: `consult-${Date.now()}`,
            userId: user.id,
            userName: user.profile.name,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            scheduledTime: new Date().toISOString(), // Simplified for now
            status: 'Scheduled',
        };
        setConsultations(prev => [...prev, newConsultation]);
        setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, availableSlots: d.availableSlots.map(s => s.time === slotTime ? {...s, isBooked: true} : s)} : d));

        addNotification(user.id, `Booking with ${doctor.name} confirmed.`, 'success');
        return { success: true, message: 'Booking confirmed!', consultationId: newConsultation.id };
    };
    
    const endConsultation = async (consultationId: string, notes: string, prescription: string) => {
        setConsultations(prev => prev.map(c => 
            c.id === consultationId 
            ? { ...c, status: 'Completed', notes, prescription } 
            : c
        ));
    };

    const submitLeaveRequest = async (req: { startDate: string, endDate: string, reason: string }) => {
        if (!user) return;
        const newReq: LeaveRequest = {
            id: `lr-${Date.now()}`,
            userId: user.id,
            userName: user.profile.name,
            branch: user.profile.branch || 'N/A',
            status: 'Pending',
            ...req,
        };
        setLeaveRequests(prev => [...prev, newReq]);
        addNotification(user.id, 'Leave request submitted.', 'success');
        // Notify HR
        const hrUser = users.find(u => u.role === 'HR' && u.profile.branch === user.profile.branch);
        if(hrUser) {
            addNotification(hrUser.id, `${user.profile.name} submitted a leave request.`, 'info');
        }
    };
    
    const updateLeaveRequestStatus = async (id: string, status: 'Approved' | 'Rejected') => {
        const request = leaveRequests.find(r => r.id === id);
        if(!request) return;
        setLeaveRequests(prev => prev.map(r => r.id === id ? { ...r, status } : r));
        addNotification(request.userId, `Your leave request for ${request.startDate} has been ${status}.`, status === 'Approved' ? 'success' : 'error');
    };

    const addBudget = async (budget: Omit<Budget, 'id'|'userId'|'spent'>) => {
        if(!user) return;
        const newBudget: Budget = {
            id: `b-${Date.now()}`,
            userId: user.id,
            spent: 0,
            ...budget,
        };
        setBudgets(prev => [...prev, newBudget]);
    };

    const updateBudget = async (budget: Budget) => {
        setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
    };

    const deleteBudget = async (id: string) => {
        setBudgets(prev => prev.filter(b => b.id !== id));
    };

    const addScheduledPayment = async (payment: Omit<ScheduledPayment, 'id'|'userId'>) => {
        if (!user) return;
        const newPayment: ScheduledPayment = {
            id: `sp-${Date.now()}`,
            userId: user.id,
            ...payment,
        };
        setScheduledPayments(prev => [...prev, newPayment]);
    };

    const updateScheduledPayment = async (payment: ScheduledPayment) => {
        setScheduledPayments(prev => prev.map(p => p.id === payment.id ? payment : p));
    };

    const deleteScheduledPayment = async (id: string) => {
        setScheduledPayments(prev => prev.filter(p => p.id !== id));
    };
    
    const applyForPayLater = async () => {
        if (!user) return;
        updateCurrentUser({ ...user, payLater: { status: 'pending', limit: 0, used: 0 }});
        addNotification('admin-001', `${user.profile.name} has applied for PayLater.`, 'info');
    };

    const approvePayLater = async (userId: string, limit: number) => {
        setUsers(prev => prev.map(u => u.id === userId ? {...u, payLater: { status: 'approved', limit, used: 0 }} : u));
        addNotification(userId, `Congratulations! Your PayLater application has been approved with a limit of ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(limit)}.`, 'success');
    };

    const rejectPayLater = async (userId: string) => {
        setUsers(prev => prev.map(u => u.id === userId ? {...u, payLater: { status: 'rejected', limit: 0, used: 0 }} : u));
        addNotification(userId, `We regret to inform you that your PayLater application has been rejected at this time.`, 'error');
    };

    const adjustUserWallet = async (userId: string, amount: number, reason: string) => {
        await addTransaction({ userId, type: 'Refund', amount, description: `Adjustment: ${reason}`, status: 'Completed' });
    };

    const freezeUserWallet = async (userId: string, freeze: boolean) => {
        setUsers(prev => prev.map(u => u.id === userId ? {...u, wallet: {...u.wallet, isFrozen: freeze }} : u));
    };

    const reverseTransaction = async (txId: string) => {
        const tx = transactions.find(t => t.id === txId);
        if(!tx) return;
        await addTransaction({ userId: tx.userId, type: 'Reversal', amount: -tx.amount, description: `Reversal for tx: ${txId}`, status: 'Completed', relatedId: txId });
    };

    const resolveDispute = async (disputeId: string, resolution: 'Refund Buyer' | 'Pay Seller') => {
        // ... logic to resolve dispute
    };
    
    const updateApiIntegration = async (id: string, creds: ApiIntegration['credentials']): Promise<{ success: boolean, message: string }> => {
        const result = await testApiConnection(creds);
        setApiIntegrations(prev => prev.map(api => api.id === id ? {...api, credentials: creds, status: result.success ? IntegrationStatus.Active : IntegrationStatus.Error } : api));
        return result;
    };
    
    const deactivateApiIntegration = async (id: string) => {
        setApiIntegrations(prev => prev.map(api => api.id === id ? {...api, status: IntegrationStatus.Inactive } : api));
    };
    
    const updateScalabilityService = (id: string, status: ScalabilityServiceStatus, log: string, metadata?: Record<string, any>, cost?: number) => {
        setScalabilityServices(prev => prev.map(s => {
            if (s.id === id) {
                const newMetadata = metadata ? { ...s.metadata, ...metadata } : s.metadata;
                return { ...s, status, logs: [...s.logs, log], metadata: newMetadata, cost: cost !== undefined ? cost : s.cost };
            }
            return s;
        }));
    };
    
    const updateMonetizationConfig = (config: MonetizationConfig) => setMonetizationConfig(config);
    const updateTaxConfig = (config: TaxConfig) => setTaxConfig(config);
    const updateHomePageConfig = (config: HomePageConfig) => setHomePageConfig(config);

    const logAssistantQuery = (query: string, detectedIntent: string) => {
        if (!user) return;
        const log: AssistantLog = { id: `al-${Date.now()}`, userId: user.id, query, detectedIntent, timestamp: new Date().toISOString() };
        setAssistantLogs(prev => [...prev, log]);
    };

    const logEngagementEvent = (type: 'forYouClicks' | 'quickAccessClicks', itemId: string) => {
        setEngagementAnalytics(prev => ({
            ...prev,
            [type]: { ...prev[type], [itemId]: (prev[type][itemId] || 0) + 1 }
        }));
    };
    
    const addPersonalizationRule = (rule: Omit<PersonalizationRule, 'id'>) => {
        const newRule = { ...rule, id: `pr-${Date.now()}` };
        setPersonalizationRules(prev => [newRule, ...prev]);
    };
    
    const updatePersonalizationRule = (rule: PersonalizationRule) => {
        setPersonalizationRules(prev => prev.map(r => r.id === rule.id ? rule : r));
    };
    
    const deletePersonalizationRule = (id: string) => {
        setPersonalizationRules(prev => prev.filter(r => r.id !== id));
    };

    const addProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'>) => {
        if (!user) return;
        const newProduct: Product = {
            ...productData,
            id: `p-${Date.now()}`,
            sellerId: user.id,
            sellerName: user.profile.name,
            reviews: [],
            rating: 0,
            reviewCount: 0,
        };
        setProducts(prev => [newProduct, ...prev]);
    };

    const updateProduct = async (product: Product) => {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
    };

    const deleteProduct = async (productId: string) => {
        setProducts(prev => prev.filter(p => p.id !== productId));
    };

    const value: DataContextType = {
        users, products, articles, transactions, notifications, doctors, consultations,
        cart, disputes, apiIntegrations, scalabilityServices, leaveRequests, budgets,
        scheduledPayments, monetizationConfig, taxConfig, homePageConfig, assistantLogs,
        engagementAnalytics, adminWallets, personalizationRules,
        orders,
        
        addTransaction, addNotification, markNotificationsAsRead, updateUserStatus,
        addToCart, removeFromCart, updateCartQuantity, clearCart,
        toggleWishlist, toggleArticleBookmark,
        toggleArticleLike, addArticleComment, toggleCommentLike, voteOnPoll,
        bookConsultation, endConsultation,
        submitLeaveRequest, updateLeaveRequestStatus,
        addBudget, updateBudget, deleteBudget,
        addScheduledPayment, updateScheduledPayment, deleteScheduledPayment,
        applyForPayLater, approvePayLater, rejectPayLater,
        adjustUserWallet, freezeUserWallet, reverseTransaction, resolveDispute,
        updateApiIntegration, deactivateApiIntegration, updateScalabilityService,
        updateMonetizationConfig, updateTaxConfig, updateHomePageConfig,
        logAssistantQuery, logEngagementEvent,
        addPersonalizationRule, updatePersonalizationRule, deletePersonalizationRule,
        addProduct, updateProduct, deleteProduct
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};