import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback } from 'react';
import {
    User, Product, Article, Transaction, Notification, Doctor, Consultation,
    CartItem, Dispute, ApiIntegration, IntegrationStatus, ScalabilityService,
    ScalabilityServiceStatus, LeaveRequest, Budget, ScheduledPayment,
    MonetizationConfig, TaxConfig, HomePageConfig, AssistantLog, EngagementAnalytics,
    AdminWallets, PersonalizationRule, Order, MoodHistory, OrderItem, Toast, ToastType, Eprescription, EprescriptionItem, HealthDocument, HealthChallenge, InsuranceClaim
} from '../types';
import {
    initialUsers, initialProducts, initialArticles, initialTransactions, initialNotifications,
    initialDoctors, initialConsultations, initialDisputes, initialApiIntegrations,
    initialScalabilityServices, initialLeaveRequests, initialMonetizationConfig,
    initialTaxConfig, initialHomePageConfig, initialAdminWallets, initialPersonalizationRules,
    initialOrders, initialHealthChallenges
} from '../data/mockData';
import { testApiConnection } from '../services/apiService';
import { useAuth } from './AuthContext';
import { GoogleGenAI } from '@google/genai';

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
    isAiGuardrailDisabled: boolean;
    isDeletionLocked: boolean;
    toasts: Toast[];

    // --- Methods ---
    showToast: (message: string, type: ToastType) => void;
    removeToast: (id: number) => void;
    toggleAiGuardrail: (isDisabled: boolean) => void;
    toggleDeletionLock: (isLocked: boolean) => void;
    addTransaction: (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>) => Promise<{ success: boolean; message: string }>;
    addNotification: (userId: string, message: string, type: Notification['type']) => void;
    markNotificationsAsRead: (userId: string) => void;
    updateUserStatus: (userId: string, status: 'active' | 'inactive') => Promise<{ success: boolean; message: string }>;
    
    // Cart
    addToCart: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    checkoutCart: () => Promise<{ success: boolean; message: string; }>;
    
    // Wishlist & Bookmarks
    toggleWishlist: (productId: string) => void;
    toggleArticleBookmark: (articleId: string) => void;
    
    // Article Interaction
    toggleArticleLike: (articleId: string) => void;
    addArticleComment: (articleId: string, comment: string) => void;
    toggleCommentLike: (articleId: string, commentTimestamp: string) => void;
    voteOnPoll: (articleId: string, optionIndex: number) => void;
    
    // Health
    addMoodEntry: (mood: MoodHistory['mood']) => void;
    bookConsultation: (doctorId: string, slotTime: string) => Promise<{ success: boolean; message: string; consultationId?: string }>;
    endConsultation: (consultationId: string, notes: string, prescriptionItems: EprescriptionItem[]) => Promise<void>;
    addHealthDocument: (doc: Omit<HealthDocument, 'id' | 'userId' | 'uploadDate'>) => Promise<void>;
    deleteHealthDocument: (docId: string) => Promise<void>;
    joinHealthChallenge: (challengeId: string) => Promise<void>;
    submitInsuranceClaim: (claim: Omit<InsuranceClaim, 'id' | 'userId' | 'userName' | 'branch' | 'submissionDate' | 'status'>) => Promise<void>;
    subscribeToHealthPlus: () => Promise<void>;
    redeemPrescription: (eprescriptionId: string, totalCost: number) => Promise<{ success: boolean; message: string; }>;
    
    // HR
    submitLeaveRequest: (req: { startDate: string, endDate: string, reason: string }) => Promise<void>;
    updateLeaveRequestStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
    getBranchMoodAnalytics: (branch: string) => Promise<{ summary: string; data: { mood: string; count: number }[] }>;
    createHealthChallenge: (challenge: Omit<HealthChallenge, 'id' | 'creator' | 'participants'>) => Promise<void>;

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
    transferProfitToCash: () => Promise<void>;
    recordTaxPayment: () => Promise<void>;
    recordOperationalExpense: (description: string, amount: number) => Promise<void>;

    // Engagement & Personalization
    logAssistantQuery: (query: string, detectedIntent: string) => void;
    logEngagementEvent: (type: 'forYouClicks' | 'quickAccessClicks', itemId: string) => void;
    addPersonalizationRule: (rule: Omit<PersonalizationRule, 'id'>) => void;
    updatePersonalizationRule: (rule: PersonalizationRule) => void;
    deletePersonalizationRule: (id: string) => Promise<void>;

    // Marketplace
    addProduct: (product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'>) => Promise<void>;
    updateProduct: (product: Product) => Promise<void>;
    deleteProduct: (productId: string) => Promise<void>;
    
    // Admin Content
    addArticle: (article: Omit<Article, 'id' | 'author' | 'timestamp' | 'likes' | 'comments' | 'pollOptions'>) => Promise<void>;
    updateArticle: (article: Article) => Promise<void>;
    deleteArticle: (articleId: string) => Promise<void>;
    addDoctor: (doctor: Omit<Doctor, 'id' | 'availableSlots'>) => Promise<void>;
    updateDoctor: (doctor: Doctor) => Promise<void>;
    deleteDoctor: (doctorId: string) => Promise<void>;
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
    const [eprescriptions, setEprescriptions] = useStickyState<Eprescription[]>('app_eprescriptions', []);
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
    const [healthDocuments, setHealthDocuments] = useStickyState<HealthDocument[]>('app_health_documents', []);
    const [healthChallenges, setHealthChallenges] = useStickyState<HealthChallenge[]>('app_health_challenges', initialHealthChallenges);
    const [insuranceClaims, setInsuranceClaims] = useStickyState<InsuranceClaim[]>('app_insurance_claims', []);
    
    // --- Toast Notification State ---
    const [toasts, setToasts] = useState<Toast[]>([]);

    const showToast = useCallback((message: string, type: ToastType) => {
        const newToast: Toast = {
            id: Date.now(),
            message,
            type,
        };
        setToasts(prev => [...prev, newToast]);
    }, []);

    const removeToast = useCallback((id: number) => {
        setToasts(prev => prev.filter(toast => toast.id !== id));
    }, []);

    // --- System Controls State ---
    const [isAiGuardrailDisabled, setIsAiGuardrailDisabled] = useStickyState<boolean>('app_ai_guardrail_disabled', false);
    const [isDeletionLocked, setIsDeletionLocked] = useStickyState<boolean>('app_deletion_lock', true);
    
    const toggleAiGuardrail = (isDisabled: boolean) => setIsAiGuardrailDisabled(isDisabled);
    const toggleDeletionLock = (isLocked: boolean) => {
        // This is intentionally locked from the UI in AdminSystemControlsScreen
        // But we keep the function for potential future use or debugging.
        if (process.env.NODE_ENV === 'development') {
            setIsDeletionLocked(isLocked);
        } else {
            console.warn("Deletion lock cannot be changed in production mode.");
        }
    };

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
                if (!userSource && txData.userId !== 'admin-001') { // Allow system transactions
                    resolve({ success: false, message: "User not found." });
                    return;
                }

                if(txData.amount < 0 && userSource && userSource.wallet.balance < Math.abs(txData.amount)) {
                    addNotification(txData.userId, 'Transaction failed: Insufficient balance.', 'error');
                    resolve({ success: false, message: "Insufficient balance." });
                    return;
                }
                
                const newTransaction: Transaction = {
                    ...txData,
                    id: `tx-${Date.now()}`,
                    timestamp: new Date().toISOString(),
                    userName: userSource?.profile.name || 'System',
                };

                setTransactions(prev => [...prev, newTransaction]);
                
                // Update user wallet if it's not a system-only transaction
                if(userSource) {
                    setUsers(prevUsers => prevUsers.map(u => 
                        u.id === txData.userId ? { ...u, wallet: { ...u.wallet, balance: u.wallet.balance + txData.amount }} : u
                    ));

                    // If it's the current user, update their context
                    if (user && user.id === txData.userId) {
                        updateCurrentUser({ ...user, wallet: { ...user.wallet, balance: user.wallet.balance + txData.amount } });
                    }
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
        showToast(`User status has been updated to ${status}.`, 'success');
        return { success: true, message: "User status updated."};
    };

    const addToCart = (productId: string, quantity: number) => {
        // Defensive check
        const product = products.find(p => p.id === productId);
        if (!product || product.stock <= 0) {
            showToast("Product is out of stock.", "error");
            return;
        }

        setCart(prev => {
            const existingItem = prev.find(item => item.productId === productId);
            if (existingItem) {
                return prev.map(item => item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item);
            }
            return [...prev, { productId, quantity }];
        });
        showToast("Item added to cart", "success");
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

    const checkoutCart = async (): Promise<{ success: boolean; message: string; }> => {
        if (!user || cart.length === 0) {
            return { success: false, message: "Your cart is empty." };
        }
    
        try {
            const idempotencyKey = `checkout-${user.id}-${Date.now()}`;
            const processed = sessionStorage.getItem(idempotencyKey);
            if (processed) {
                // This prevents duplicate checkouts from rapid clicks
                return { success: false, message: "Checkout is already being processed." };
            }
            sessionStorage.setItem(idempotencyKey, 'true');

            const cartDetails = cart.map(item => {
                const product = products.find(p => p.id === item.productId);
                if (!product) throw new Error(`Product with ID ${item.productId} not found.`);
                return { ...item, product };
            });
    
            const subtotal = cartDetails.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
            
            const totalPPN = subtotal * taxConfig.ppnRate;
            const totalPayable = subtotal + totalPPN;
            
            const buyer = users.find(u => u.id === user.id);
            if (!buyer || buyer.wallet.balance < totalPayable) {
                throw new Error("Insufficient balance (including VAT).");
            }
    
            const newTransactions: Transaction[] = [];
            let totalCommission = 0;
            const sellerPayouts: Record<string, { totalSale: number, sellerName: string }> = {};
            const productUpdates: Record<string, number> = {};
    
            for (const item of cartDetails) {
                const product = item.product;
                if (product.stock < item.quantity) {
                    throw new Error(`Insufficient stock for ${product.name}.`);
                }
                productUpdates[product.id] = product.stock - item.quantity;
    
                const saleAmount = product.price * item.quantity;
                if (!sellerPayouts[product.sellerId]) {
                    sellerPayouts[product.sellerId] = { totalSale: 0, sellerName: product.sellerName };
                }
                sellerPayouts[product.sellerId].totalSale += saleAmount;
            }
    
            const newOrderId = `order-${Date.now()}`;
    
            newTransactions.push({
                id: `tx-${Date.now()}-buyer`, userId: user.id, userName: user.profile.name, type: 'Marketplace',
                amount: -totalPayable, description: `Purchase of ${cartDetails.length} items (inc. VAT). Order: ${newOrderId}`,
                timestamp: new Date().toISOString(), status: 'Completed'
            });
    
            newTransactions.push({
                id: `tx-${Date.now()}-tax`, userId: 'admin-001', userName: 'System', type: 'Tax',
                amount: totalPPN, description: `PPN ${taxConfig.ppnRate * 100}% on purchase. Order: ${newOrderId}`,
                timestamp: new Date().toISOString(), status: 'Completed', relatedId: newOrderId
            });
    
            Object.entries(sellerPayouts).forEach(([sellerId, { totalSale, sellerName }]) => {
                const commission = totalSale * monetizationConfig.marketplaceCommission;
                const earning = totalSale - commission;
                totalCommission += commission;
    
                newTransactions.push({
                    id: `tx-${Date.now()}-seller-${sellerId}`, userId: sellerId, userName: sellerName, type: 'Marketplace',
                    amount: earning, description: `Sale earnings. Order: ${newOrderId}`, timestamp: new Date().toISOString(), status: 'Completed'
                });
    
                newTransactions.push({
                    id: `tx-${Date.now()}-commission-${sellerId}`, userId: 'admin-001', userName: 'System', type: 'Commission',
                    amount: commission, description: `Commission from ${sellerName} (Order ${newOrderId})`,
                    timestamp: new Date().toISOString(), status: 'Completed', relatedId: newOrderId,
                });
    
                addNotification(sellerId, `Your product was sold! You received ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(earning)}`, 'success');
            });
    
            const newOrder: Order = {
                id: newOrderId, userId: user.id, items: cart.map(({ productId, quantity }) => ({ productId, quantity })),
                total: subtotal, status: 'Processing', timestamp: new Date().toISOString(),
            };
    
            setUsers(prevUsers => prevUsers.map(u => {
                if (u.id === user.id) return { ...u, wallet: { ...u.wallet, balance: u.wallet.balance - totalPayable } };
                if (sellerPayouts[u.id]) {
                    const { totalSale } = sellerPayouts[u.id];
                    const earning = totalSale - (totalSale * monetizationConfig.marketplaceCommission);
                    return { ...u, wallet: { ...u.wallet, balance: u.wallet.balance + earning } };
                }
                return u;
            }));
    
            setProducts(prevProducts => prevProducts.map(p => productUpdates[p.id] !== undefined ? { ...p, stock: productUpdates[p.id] } : p));
            setAdminWallets(prev => ({ ...prev, profit: prev.profit + totalCommission, tax: prev.tax + totalPPN }));
            setTransactions(prev => [...prev, ...newTransactions]);
            setOrders(prev => [...prev, newOrder]);
            updateCurrentUser({ ...user, wallet: { ...user.wallet, balance: user.wallet.balance - totalPayable } });
            setCart([]);
            
            setTimeout(() => sessionStorage.removeItem(idempotencyKey), 5000); // Clear key after some time
    
            return { success: true, message: "Checkout successful!" };
        } catch (error) {
            console.error("Checkout failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            showToast(`Checkout failed: ${errorMessage}`, 'error');
            return { success: false, message: errorMessage };
        }
    };
    
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

    const addMoodEntry = (mood: MoodHistory['mood']) => {
        if (!user) return;
        const newEntry: MoodHistory = {
            date: new Date().toISOString().split('T')[0],
            mood: mood,
        };
        const updatedUser = {
            ...user,
            healthData: {
                ...user.healthData,
                moodHistory: [...user.healthData.moodHistory.filter(h => h.date !== newEntry.date), newEntry],
            },
        };
        updateCurrentUser(updatedUser);
        showToast(`Mood for today recorded: ${mood}`, 'success');
    };

    const bookConsultation = async (doctorId: string, slotTime: string): Promise<{ success: boolean; message: string; consultationId?: string }> => {
        const doctor = doctors.find(d => d.id === doctorId);
        if (!user || !doctor) return { success: false, message: 'Doctor not found.' };
        if (user.wallet.balance < doctor.consultationFee) return { success: false, message: 'Insufficient balance.' };
        
        const txResult = await addTransaction({ userId: user.id, type: 'Teleconsultation', amount: -doctor.consultationFee, description: `Consultation with ${doctor.name}`, status: 'Completed' });
        if (!txResult.success) return { success: false, message: 'Payment failed.' };

        // --- TAX CALCULATION (PPh 21) ---
        const pph21Amount = doctor.consultationFee * taxConfig.pph21Rate;
        const doctorEarning = doctor.consultationFee - pph21Amount;
        
        setAdminWallets(prev => ({ ...prev, tax: prev.tax + pph21Amount }));
        await addTransaction({
            userId: 'admin-001', // System transaction
            type: 'Tax',
            amount: pph21Amount,
            description: `Potongan PPh 21 ${taxConfig.pph21Rate * 100}% untuk ${doctor.name}`,
            status: 'Completed'
        });
        // --- END TAX CALCULATION ---

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
    
    const endConsultation = async (consultationId: string, notes: string, prescriptionItems: EprescriptionItem[]) => {
        const consultation = consultations.find(c => c.id === consultationId);
        if (!consultation) return;

        let eprescriptionId: string | undefined = undefined;
        let prescriptionText = "Tidak ada resep.";

        if (prescriptionItems && prescriptionItems.length > 0 && prescriptionItems.some(p => p.drugName)) {
            const newEprescription: Eprescription = {
                id: `epres-${Date.now()}`,
                consultationId,
                patientId: consultation.userId,
                doctorId: consultation.doctorId,
                doctorName: consultation.doctorName,
                issueDate: new Date().toISOString(),
                items: prescriptionItems,
                status: 'New'
            };
            setEprescriptions(prev => [...prev, newEprescription]);
            eprescriptionId = newEprescription.id;
            prescriptionText = prescriptionItems.map(p => `${p.drugName} (${p.dosage})`).join(', ');
        } else if (typeof prescriptionItems === 'string') { // Handle legacy string
            prescriptionText = prescriptionItems;
        }


        setConsultations(prev => prev.map(c => 
            c.id === consultationId 
            ? { ...c, status: 'Completed', notes, eprescriptionId, prescription: prescriptionText } 
            : c
        ));
    };

    const subscribeToHealthPlus = async () => {
        if (!user) return;
        const updatedUser = { ...user, isPremium: true };
        updateCurrentUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === user.id ? updatedUser : u));
    };

    const redeemPrescription = async (eprescriptionId: string, totalCost: number): Promise<{ success: boolean; message: string; }> => {
        const prescription = eprescriptions.find(e => e.id === eprescriptionId);
        if (!user || !prescription) {
            return { success: false, message: "Resep tidak ditemukan." };
        }
        if (user.wallet.balance < totalCost) {
            return { success: false, message: "Saldo tidak cukup." };
        }

        const txResult = await addTransaction({
            userId: user.id,
            type: 'Obat & Resep',
            amount: -totalCost,
            description: `Pembelian obat dari resep #${eprescriptionId.slice(-6)}`,
            status: 'Completed',
        });

        if (txResult.success) {
            setEprescriptions(prev => prev.map(e => e.id === eprescriptionId ? { ...e, status: 'Redeemed' } : e));
            // Simulate payment to pharmacy and commission
            const commission = totalCost * 0.03; // 3% commission for platform
            setAdminWallets(prev => ({ ...prev, profit: prev.profit + commission }));
            return { success: true, message: "Pembayaran berhasil!" };
        } else {
            return { success: false, message: "Gagal memproses pembayaran." };
        }
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
        showToast('Leave request submitted.', 'success');
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

    const getBranchMoodAnalytics = async (branch: string): Promise<{ summary: string; data: { mood: string; count: number }[] }> => {
        const branchUsers = users.filter(u => u.profile.branch === branch && u.role === 'User');
        const moodData: { [key: string]: number } = {};
        let totalEntries = 0;
    
        branchUsers.forEach(user => {
            user.healthData.moodHistory.forEach(entry => {
                moodData[entry.mood] = (moodData[entry.mood] || 0) + 1;
                totalEntries++;
            });
        });
    
        if (totalEntries === 0) {
            return { summary: "No mood data available for this branch yet.", data: [] };
        }
    
        const aggregatedData = Object.entries(moodData).map(([mood, count]) => ({ mood, count }));
    
        const prompt = `You are an expert HR analyst. Based on the following aggregated and anonymous employee mood data for a company branch, provide a one-sentence summary of the general morale. Be concise and professional. Respond in Indonesian. Data: ${JSON.stringify(aggregatedData)}. Total entries: ${totalEntries}.`;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return { summary: response.text, data: aggregatedData };
        } catch (error) {
            console.error("AI mood analysis failed:", error);
            showToast("Failed to get AI-powered mood summary.", "error");
            return { summary: "Could not analyze mood data at this time.", data: aggregatedData };
        }
    };
    
    const addHealthDocument = async (doc: Omit<HealthDocument, 'id' | 'userId' | 'uploadDate'>) => {
        if (!user) return;
        const newDoc: HealthDocument = {
            ...doc,
            id: `doc-${Date.now()}`,
            userId: user.id,
            uploadDate: new Date().toISOString(),
        };
        setHealthDocuments(prev => [newDoc, ...prev]);
        showToast("Document uploaded successfully.", "success");
    };

    const deleteHealthDocument = async (docId: string) => {
        setHealthDocuments(prev => prev.filter(doc => doc.id !== docId));
        showToast("Document deleted.", "success");
    };
    
    const createHealthChallenge = async (challenge: Omit<HealthChallenge, 'id' | 'creator' | 'participants'>) => {
        if (!user || user.role !== 'HR') return;
        const newChallenge: HealthChallenge = {
            ...challenge,
            id: `hc-${Date.now()}`,
            creator: { hrId: user.id, branch: user.profile.branch || 'N/A' },
            participants: [],
        };
        setHealthChallenges(prev => [newChallenge, ...prev]);
        showToast("New wellness challenge created!", "success");
    };

    const joinHealthChallenge = async (challengeId: string) => {
        if (!user) return;
        setHealthChallenges(prev => prev.map(c => {
            if (c.id === challengeId && !c.participants.some(p => p.userId === user.id)) {
                return { ...c, participants: [...c.participants, { userId: user.id, progress: 0 }] };
            }
            return c;
        }));
        showToast("You have joined the challenge!", "success");
    };
    
    const submitInsuranceClaim = async (claimData: Omit<InsuranceClaim, 'id' | 'userId' | 'userName' | 'branch' | 'submissionDate' | 'status'>) => {
        if (!user) return;
        const newClaim: InsuranceClaim = {
            ...claimData,
            id: `ic-${Date.now()}`,
            userId: user.id,
            userName: user.profile.name,
            branch: user.profile.branch || 'N/A',
            submissionDate: new Date().toISOString(),
            status: 'Pending',
        };
        setInsuranceClaims(prev => [newClaim, ...prev]);
        showToast("Insurance claim submitted.", "success");

        const hrUser = users.find(u => u.role === 'HR' && u.profile.branch === user.profile.branch);
        if (hrUser) {
            addNotification(hrUser.id, `${user.profile.name} has submitted a new insurance claim.`, 'info');
        }
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
        showToast("Budget created successfully.", "success");
    };

    const updateBudget = async (budget: Budget) => {
        setBudgets(prev => prev.map(b => b.id === budget.id ? budget : b));
        showToast("Budget updated.", "success");
    };

    // Note: User-specific data deletion is allowed and not part of the system lock.
    const deleteBudget = async (id: string) => {
        setBudgets(prev => prev.filter(b => b.id !== id));
        showToast("Budget deleted.", "success");
    };

    const addScheduledPayment = async (payment: Omit<ScheduledPayment, 'id'|'userId'>) => {
        if (!user) return;
        const newPayment: ScheduledPayment = {
            id: `sp-${Date.now()}`,
            userId: user.id,
            ...payment,
        };
        setScheduledPayments(prev => [...prev, newPayment]);
         showToast("Scheduled payment created.", "success");
    };

    const updateScheduledPayment = async (payment: ScheduledPayment) => {
        setScheduledPayments(prev => prev.map(p => p.id === payment.id ? payment : p));
        showToast("Scheduled payment updated.", "success");
    };

    // Note: User-specific data deletion is allowed and not part of the system lock.
    const deleteScheduledPayment = async (id: string) => {
        setScheduledPayments(prev => prev.filter(p => p.id !== id));
        showToast("Scheduled payment deleted.", "success");
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
        showToast("Wallet adjusted successfully.", "success");
    };

    const freezeUserWallet = async (userId: string, freeze: boolean) => {
        setUsers(prev => prev.map(u => u.id === userId ? {...u, wallet: {...u.wallet, isFrozen: freeze }} : u));
        showToast(`Wallet has been ${freeze ? 'frozen' : 'unfrozen'}.`, "success");
    };

    const reverseTransaction = async (txId: string) => {
        const tx = transactions.find(t => t.id === txId);
        if(!tx) return;
        await addTransaction({ userId: tx.userId, type: 'Reversal', amount: -tx.amount, description: `Reversal for tx: ${txId}`, status: 'Completed', relatedId: txId });
        showToast(`Transaction ${txId} reversed.`, "success");
    };

    const resolveDispute = async (disputeId: string, resolution: 'Refund Buyer' | 'Pay Seller') => {
        const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);
        const dispute = disputes.find(d => d.id === disputeId);
        if (!dispute) {
            showToast("Dispute not found.", "error");
            return;
        }
    
        try {
            if (resolution === 'Pay Seller') {
                setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'Resolved', resolution: 'Dispute closed in favor of seller.' } : d));
                addNotification(dispute.buyerId, `Your dispute for order ${dispute.orderId} has been resolved. The payment has been released to the seller.`, 'info');
                addNotification(dispute.sellerId, `The dispute for order ${dispute.orderId} has been resolved in your favor.`, 'success');
                showToast("Dispute resolved in favor of seller.", "success");
                return;
            }
    
            if (resolution === 'Refund Buyer') {
                 // --- ATOMIC TRANSACTION LOGIC ---
                const order = orders.find(o => o.id === dispute.orderId);
                if (!order) throw new Error("Order not found for this dispute.");
                if (!disputes.some(d => d.id === disputeId && d.status === 'Open')) throw new Error("Dispute is already resolved.");

                // Pre-calculate all changes
                const subtotal = order.total;
                const ppn = subtotal * taxConfig.ppnRate;
                const totalRefundAmount = subtotal + ppn;
                const commission = subtotal * monetizationConfig.marketplaceCommission;
                const sellerEarning = subtotal - commission;
                
                // All calculations are done. Now, execute state changes.
                // If any of these failed in a real DB, the whole transaction would be rolled back.
                
                await addTransaction({ userId: dispute.buyerId, type: 'Refund', amount: totalRefundAmount, description: `Full refund for disputed order ${dispute.orderId}`, status: 'Completed' });
                await addTransaction({ userId: dispute.sellerId, type: 'Reversal', amount: -sellerEarning, description: `Reversal of earnings for refunded order ${dispute.orderId}`, status: 'Completed' });
                setAdminWallets(prev => ({ ...prev, profit: prev.profit - commission, tax: prev.tax - ppn }));
                await addTransaction({ userId: 'admin-001', type: 'Reversal', amount: -commission, description: `Commission reversal for order ${order.id}`, status: 'Completed' });
                await addTransaction({ userId: 'admin-001', type: 'Reversal', amount: -ppn, description: `PPN reversal for order ${order.id}`, status: 'Completed' });
                setDisputes(prev => prev.map(d => d.id === disputeId ? { ...d, status: 'Resolved', resolution: `Full refund of ${formatCurrency(totalRefundAmount)} issued to buyer.` } : d));
                
                addNotification(dispute.buyerId, `Your dispute for order ${dispute.orderId} has been resolved. You have been refunded ${formatCurrency(totalRefundAmount)}.`, 'success');
                addNotification(dispute.sellerId, `The dispute for order ${dispute.orderId} was resolved for the buyer. The amount of ${formatCurrency(sellerEarning)} has been debited from your wallet.`, 'warning');
                showToast("Dispute resolved with a refund to the buyer.", "success");
            }
        } catch (error) {
            console.error("Dispute resolution failed:", error);
            const errorMessage = error instanceof Error ? error.message : "An unexpected error occurred.";
            showToast(`Failed to resolve dispute: ${errorMessage}`, 'error');
        }
    };
    
    const updateApiIntegration = async (id: string, creds: ApiIntegration['credentials']): Promise<{ success: boolean, message: string }> => {
        const result = await testApiConnection(creds);
        setApiIntegrations(prev => prev.map(api => api.id === id ? {...api, credentials: creds, status: result.success ? IntegrationStatus.Active : IntegrationStatus.Error } : api));
        showToast(result.message, result.success ? 'success' : 'error');
        return result;
    };
    
    const deactivateApiIntegration = async (id: string) => {
        setApiIntegrations(prev => prev.map(api => api.id === id ? {...api, status: IntegrationStatus.Inactive } : api));
        showToast("API integration deactivated.", "success");
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

    const transferProfitToCash = async () => {
        const profitAmount = adminWallets.profit;
        if (profitAmount <= 0) return;
        setAdminWallets(prev => ({ ...prev, cash: prev.cash + profitAmount, profit: 0 }));
        await addTransaction({
            userId: 'admin-001', type: 'Internal Transfer',
            amount: profitAmount, description: 'Profit transferred to cash', status: 'Completed'
        });
        showToast("Profit transferred to cash wallet.", "success");
    };
    
    const recordTaxPayment = async () => {
        const taxAmount = adminWallets.tax;
        if (taxAmount <= 0) return;
        setAdminWallets(prev => ({ ...prev, cash: prev.cash - taxAmount, tax: 0 }));
        await addTransaction({
            userId: 'admin-001', type: 'Operational Expense',
            amount: -taxAmount, description: 'Tax payment to government', status: 'Completed'
        });
        showToast("Tax payment recorded.", "success");
    };
    
    const recordOperationalExpense = async (description: string, amount: number) => {
        if (amount <= 0 || !description) return;
        setAdminWallets(prev => ({...prev, cash: prev.cash - amount}));
        await addTransaction({
            userId: 'admin-001', type: 'Operational Expense',
            amount: -amount, description: `OpEx: ${description}`, status: 'Completed'
        });
        showToast("Operational expense recorded.", "success");
    };

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
        showToast("New personalization rule created.", "success");
    };
    
    const updatePersonalizationRule = (rule: PersonalizationRule) => {
        setPersonalizationRules(prev => prev.map(r => r.id === rule.id ? rule : r));
        showToast(`Rule "${rule.name}" updated.`, "success");
    };
    
    const deletePersonalizationRule = async (id: string) => {
        if (isDeletionLocked) {
            showToast("Deletion is locked by system controls.", 'warning');
            return;
        }
        setPersonalizationRules(prev => prev.filter(r => r.id !== id));
        showToast("Personalization rule deleted. (Deletion was unlocked)", "success");
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
        showToast("Product listed successfully!", "success");
    };

    const updateProduct = async (product: Product) => {
        setProducts(prev => prev.map(p => p.id === product.id ? product : p));
        showToast("Product updated successfully!", "success");
    };

    const deleteProduct = async (productId: string) => {
        if (isDeletionLocked) {
            showToast("Deletion is locked by system controls.", 'warning');
            return;
        }
        setProducts(prev => prev.filter(p => p.id !== productId));
        showToast("Product deleted successfully. (Deletion was unlocked)", "success");
    };

    // Admin Content Management
    const addArticle = async (articleData: Omit<Article, 'id' | 'author' | 'timestamp' | 'likes' | 'comments' | 'pollOptions'>) => {
        const newArticle: Article = {
            ...articleData,
            id: `a-${Date.now()}`,
            author: 'Admin',
            timestamp: new Date().toISOString(),
            likes: [],
            comments: [],
        };
        setArticles(prev => [newArticle, ...prev]);
        showToast("Article created successfully.", "success");
    };
    const updateArticle = async (article: Article) => {
        setArticles(prev => prev.map(a => a.id === article.id ? article : a));
        showToast("Article updated successfully.", "success");
    }
    const deleteArticle = async (articleId: string) => {
        if (isDeletionLocked) {
            showToast("Deletion is locked by system controls.", 'warning');
            return;
        }
        setArticles(prev => prev.filter(a => a.id !== articleId));
        showToast("Article deleted successfully. (Deletion was unlocked)", "success");
    };
    
    const addDoctor = async (doctorData: Omit<Doctor, 'id' | 'availableSlots'>) => {
        const newDoctor: Doctor = {
            ...doctorData,
            id: `doc-${Date.now()}`,
            availableSlots: [
                { time: '09:00', isBooked: false }, { time: '10:00', isBooked: false }, { time: '11:00', isBooked: false },
                { time: '13:00', isBooked: false }, { time: '14:00', isBooked: false }, { time: '15:00', isBooked: false },
            ]
        };
        setDoctors(prev => [newDoctor, ...prev]);
        showToast("New health provider added.", "success");
    };
    const updateDoctor = async (doctor: Doctor) => {
        setDoctors(prev => prev.map(d => d.id === doctor.id ? doctor : d));
        showToast("Health provider updated.", "success");
    };
    const deleteDoctor = async (doctorId: string) => {
        if (isDeletionLocked) {
            showToast("Deletion is locked by system controls.", 'warning');
            return;
        }
        setDoctors(prev => prev.filter(d => d.id !== doctorId));
        showToast("Doctor deleted successfully. (Deletion was unlocked)", "success");
    };


    const value: DataContextType = {
        users, products, articles, transactions, notifications, doctors, consultations, eprescriptions,
        cart, disputes, apiIntegrations, scalabilityServices, leaveRequests, budgets,
        scheduledPayments, monetizationConfig, taxConfig, homePageConfig, assistantLogs,
        engagementAnalytics, adminWallets, personalizationRules,
        orders, healthDocuments, healthChallenges, insuranceClaims,
        isAiGuardrailDisabled, toasts, isDeletionLocked,
        
        showToast, removeToast,
        toggleAiGuardrail, toggleDeletionLock,
        addTransaction, addNotification, markNotificationsAsRead, updateUserStatus,
        addToCart, removeFromCart, updateCartQuantity, clearCart, checkoutCart,
        toggleWishlist, toggleArticleBookmark,
        toggleArticleLike, addArticleComment, toggleCommentLike, voteOnPoll,
        addMoodEntry, bookConsultation, endConsultation,
        addHealthDocument, deleteHealthDocument, joinHealthChallenge, submitInsuranceClaim,
        subscribeToHealthPlus, redeemPrescription,
        submitLeaveRequest, updateLeaveRequestStatus, getBranchMoodAnalytics, createHealthChallenge,
        addBudget, updateBudget, deleteBudget,
        addScheduledPayment, updateScheduledPayment, deleteScheduledPayment,
        applyForPayLater, approvePayLater, rejectPayLater,
        adjustUserWallet, freezeUserWallet, reverseTransaction, resolveDispute,
        updateApiIntegration, deactivateApiIntegration, updateScalabilityService,
        updateMonetizationConfig, updateTaxConfig, updateHomePageConfig,
        transferProfitToCash, recordTaxPayment, recordOperationalExpense,
        logAssistantQuery, logEngagementEvent,
        addPersonalizationRule, updatePersonalizationRule, deletePersonalizationRule,
        addProduct, updateProduct, deleteProduct,
        addArticle, updateArticle, deleteArticle,
        addDoctor, updateDoctor, deleteDoctor,
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