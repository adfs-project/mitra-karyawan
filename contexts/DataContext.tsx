import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { 
    User, Transaction, Product, Order, Article, Doctor, Notification, ApiIntegration, IntegrationStatus, ScalabilityService, Budget, ScheduledPayment, Review, CartItem, Consultation, HealthChallenge, MoodEntry, HomePageConfig, AssistantLog, EngagementAnalytics, Dispute,
    PersonalizationRule, PersonalizationCondition, Role, LeaveRequest
} from '../types';
import { 
    initialUsers, initialTransactions, initialProducts, initialOrders, initialArticles, initialDoctors, initialApiIntegrations, initialScalabilityServices, initialPersonalizationRules, initialLeaveRequests
} from '../data/mockData';
import { useAuth } from './AuthContext';
import { testApiConnection } from '../services/apiService';

interface DataContextType {
    users: User[];
    transactions: Transaction[];
    products: Product[];
    orders: Order[];
    disputes: Dispute[];
    articles: Article[];
    doctors: Doctor[];
    consultations: Consultation[];
    healthChallenges: HealthChallenge[];
    notifications: Notification[];
    apiIntegrations: ApiIntegration[];
    scalabilityServices: ScalabilityService[];
    budgets: Budget[];
    scheduledPayments: ScheduledPayment[];
    cart: CartItem[];
    homePageConfig: HomePageConfig;
    assistantLogs: AssistantLog[];
    engagementAnalytics: EngagementAnalytics;
    personalizationRules: PersonalizationRule[];
    leaveRequests: LeaveRequest[];
    
    adminWallets: { profit: number; tax: number, cash: number };
    monetizationConfig: { marketplaceCommission: number; marketingCPA: number };
    taxConfig: { ppnRate: number; pph21Rate: number };
    
    // Actions
    addTransaction: (tx: Omit<Transaction, 'id' | 'timestamp' | 'userName'>) => Promise<{success: boolean, finalStatus: 'Completed' | 'Failed'}>;
    updateUserStatus: (userId: string, status: 'active' | 'inactive') => Promise<{ success: boolean }>;
    addNotification: (userId: string, message: string, type: Notification['type']) => void;
    markNotificationsAsRead: (userId: string) => void;
    updateApiIntegration: (id: string, credentials: ApiIntegration['credentials']) => Promise<{ success: boolean; message: string; }>;
    deactivateApiIntegration: (id: string) => Promise<{ success: boolean; }>;
    // FIX: Add optional metadata parameter to fix type errors in AdminScalability.tsx.
    updateScalabilityService: (id: string, status: ScalabilityService['status'], newLog?: string, metadata?: ScalabilityService['metadata'], cost?: number) => void;
    addArticle: (article: Omit<Article, 'id' | 'timestamp' | 'likes' | 'comments' | 'author'>) => Promise<{ success: boolean; data?: Article; }>;
    editArticle: (article: Article) => Promise<{ success: boolean; data?: Article; }>;
    toggleArticleAdMonetization: (articleId: string) => Promise<{ success: boolean }>;
    addProduct: (product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'>) => Promise<{ success: boolean; data?: Product; }>;
    editProduct: (product: Product) => Promise<{ success: boolean; data?: Product; }>;
    deleteProduct: (productId: string) => Promise<{ success: boolean; }>;
    purchaseProduct: (userId: string, product: Product, quantity: number) => Promise<{ success: boolean; message: string; }>;
    toggleWishlist: (productId: string) => void;
    addToCart: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    updateCartQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    addReview: (productId: string, rating: number, comment: string) => Promise<{success: boolean}>;
    toggleArticleLike: (articleId: string) => void;
    addArticleComment: (articleId: string, commentText: string) => void;
    toggleArticleBookmark: (articleId: string) => void;
    voteOnPoll: (articleId: string, optionIndex: number) => void;
    toggleCommentLike: (articleId: string, commentTimestamp: string) => void;
    
    // Health Actions
    addDoctor: (doctor: Omit<Doctor, 'id'>) => Promise<{success: boolean}>;
    updateDoctor: (doctor: Doctor) => Promise<{success: boolean}>;
    bookConsultation: (doctorId: string, slotTime: string) => Promise<{success: boolean, consultationId?: string, message: string}>;
    addConsultationMessage: (consultationId: string, message: string, sender: 'user' | 'doctor') => void;
    completeConsultation: (consultationId: string, prescription: Consultation['prescription']) => void;

    // Admin Control Actions
    addPersonalizationRule: (rule: Omit<PersonalizationRule, 'id'>) => void;
    updatePersonalizationRule: (rule: PersonalizationRule) => void;
    deletePersonalizationRule: (ruleId: string) => void;

    logAssistantQuery: (query: string, detectedIntent: string) => void;
    logEngagementEvent: (type: keyof EngagementAnalytics, id: string) => void;
    adjustUserWallet: (userId: string, amount: number, reason: string) => Promise<{ success: boolean }>;
    freezeUserWallet: (userId: string, freeze: boolean) => Promise<{ success: boolean }>;
    reverseTransaction: (transactionId: string) => Promise<{ success: boolean }>;

    // HR Actions
    createEmployee: (userData: Omit<User, 'id' | 'role' | 'status' | 'wallet' | 'achievements' | 'loyaltyPoints' | 'wishlist' | 'bookmarkedArticles' | 'healthData' | 'password'> & {password: string}) => Promise<{ success: boolean; message: string }>;
    updateLeaveRequestStatus: (requestId: string, status: 'Approved' | 'Rejected') => Promise<{ success: boolean }>;
    submitLeaveRequest: (requestData: Omit<LeaveRequest, 'id' | 'status' | 'branch' | 'userName' | 'userId'>) => Promise<{ success: boolean }>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// A simple hook to persist and retrieve state from localStorage
const usePersistentState = <T,>(key: string, initialState: T): [T, React.Dispatch<React.SetStateAction<T>>] => {
    const [state, setState] = useState<T>(() => {
        try {
            const storedItem = localStorage.getItem(key);
            return storedItem ? JSON.parse(storedItem) : initialState;
        } catch (error) {
            console.error(`Error reading localStorage key "${key}":`, error);
            return initialState;
        }
    });

    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error(`Error setting localStorage key "${key}":`, error);
        }
    }, [key, state]);

    return [state, setState];
};


export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateCurrentUser } = useAuth();
    
    const [users, setUsers] = usePersistentState<User[]>('app_users', initialUsers);
    const [transactions, setTransactions] = usePersistentState<Transaction[]>('app_transactions', initialTransactions);
    const [products, setProducts] = usePersistentState<Product[]>('app_products', initialProducts);
    const [orders, setOrders] = usePersistentState<Order[]>('app_orders', initialOrders);
    const [disputes, setDisputes] = usePersistentState<Dispute[]>('app_disputes', []);
    const [articles, setArticles] = usePersistentState<Article[]>('app_articles', [
        {
            id: 'promo-001',
            title: 'Diskon Akhir Pekan! Semua Produk Marketplace 20% OFF',
            summary: 'Jangan lewatkan diskon besar-besaran akhir pekan ini untuk semua produk di Marketplace Karyawan. Belanja sekarang!',
            content: 'Dalam rangka merayakan semangat kebersamaan, kami mengadakan promo spesial akhir pekan. Dapatkan diskon 20% untuk semua item yang tersedia di marketplace. Ini adalah kesempatan terbaik untuk mendapatkan barang yang Anda inginkan dengan harga lebih murah. Promo berlaku dari hari Jumat hingga Minggu. Syarat dan ketentuan berlaku.',
            imageUrl: 'https://picsum.photos/seed/promo1/800/400',
            category: 'Banner',
            author: 'Admin',
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            status: 'Published',
            likes: [],
            comments: [],
            type: 'standard',
        },
        {
            id: 'video-001',
            title: 'Video Rapat Bulanan: Q3 Company All-Hands',
            summary: 'Tonton kembali rekaman lengkap sesi rapat bulanan Q3 yang membahas pencapaian dan rencana ke depan.',
            content: 'Bagi yang tidak bisa hadir atau ingin meninjau kembali, kami telah menyediakan rekaman lengkap dari sesi Company All-Hands Q3. Sesi ini mencakup presentasi dari para pemimpin departemen mengenai pencapaian kuartal terakhir dan strategi menarik untuk kuartal mendatang. Pastikan Anda tidak ketinggalan informasi penting ini.',
            imageUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
            category: 'Video Feature',
            author: 'Manajemen',
            timestamp: new Date(Date.now() - 96400000).toISOString(),
            status: 'Published',
            likes: [],
            comments: [],
            type: 'standard',
            youtubeId: 'dQw4w9WgXcQ'
        },
        {
            id: 'health-001',
            title: 'Pentingnya Menjaga Kesehatan Mental di Tempat Kerja',
            summary: 'Kesehatan mental sama pentingnya dengan kesehatan fisik. Pelajari cara mengelola stres dan menjaga keseimbangan kerja-hidup.',
            content: 'Di tengah tuntutan pekerjaan yang tinggi, menjaga kesehatan mental adalah kunci untuk tetap produktif dan bahagia. Beberapa tips yang bisa dicoba antara lain adalah dengan mengambil istirahat sejenak, berkomunikasi dengan rekan kerja, dan tidak ragu untuk meminta bantuan profesional jika diperlukan. Perusahaan mendukung penuh kesejahteraan karyawan.',
            imageUrl: 'https://picsum.photos/seed/health1/800/400',
            category: 'Kesehatan',
            author: 'Tim HR',
            timestamp: new Date(Date.now() - 172800000).toISOString(),
            status: 'Published',
            likes: ['user-001'],
            comments: [],
            type: 'standard',
        },
        {
            id: 'poll-001',
            title: 'Polling: Menu Kantin Favorit untuk Bulan Depan',
            summary: 'Bantu kami menentukan menu spesial di kantin untuk bulan depan! Suara Anda sangat berarti.',
            content: 'Kami ingin mendengar pendapat Anda! Untuk meningkatkan kenyamanan bersama, kami mengadakan polling untuk menu spesial di kantin bulan depan. Pilihlah opsi yang paling Anda inginkan.',
            imageUrl: 'https://picsum.photos/seed/poll1/800/400',
            category: 'Perusahaan',
            author: 'Admin',
            timestamp: new Date(Date.now() - 259200000).toISOString(),
            status: 'Published',
            likes: [],
            comments: [],
            type: 'poll',
            pollOptions: [
                { text: 'Nasi Goreng Spesial', votes: ['user-001'] },
                { text: 'Ayam Geprek Sambal Matah', votes: [] },
                { text: 'Soto Ayam Lamongan', votes: [] },
            ],
        },
         {
            id: 'qa-001',
            title: 'Sesi T&J: Rencana Ekspansi Perusahaan 2025',
            summary: 'Punya pertanyaan seputar rencana ekspansi perusahaan? Tanyakan langsung di sini dan berikan suara pada pertanyaan lain yang Anda anggap penting!',
            content: 'Transparansi adalah kunci. Kami membuka sesi tanya jawab mengenai rencana ekspansi perusahaan di tahun 2025. Silakan ajukan pertanyaan Anda di kolom komentar. Anda juga bisa memberikan "like" pada pertanyaan dari rekan lain agar pertanyaan tersebut mendapat prioritas untuk dijawab.',
            imageUrl: 'https://picsum.photos/seed/qa1/800/400',
            category: 'Perusahaan',
            author: 'Manajemen',
            timestamp: new Date().toISOString(),
            status: 'Published',
            likes: [],
            comments: [
                { userId: 'user-001', userName: 'Budi Karyawan', comment: 'Apakah akan ada pembukaan kantor cabang di luar Jawa?', timestamp: new Date().toISOString(), likes: [] }
            ],
            type: 'qa',
        },
        ...initialArticles
    ]);
    const [doctors, setDoctors] = usePersistentState<Doctor[]>('app_doctors', initialDoctors);
    const [consultations, setConsultations] = usePersistentState<Consultation[]>('app_consultations', []);
    const [healthChallenges, setHealthChallenges] = usePersistentState<HealthChallenge[]>('app_health_challenges', []);
    const [notifications, setNotifications] = usePersistentState<Notification[]>('app_notifications', []);
    const [apiIntegrations, setApiIntegrations] = usePersistentState<ApiIntegration[]>('app_api_integrations', initialApiIntegrations);
    const [scalabilityServices, setScalabilityServices] = usePersistentState<ScalabilityService[]>('app_scalability', initialScalabilityServices);
    const [adminWallets, setAdminWallets] = usePersistentState<{ profit: number; tax: number, cash: number }>('app_admin_wallets', { profit: 0, tax: 0, cash: 1000000000 });
    const [monetizationConfig, setMonetizationConfig] = usePersistentState<{ marketplaceCommission: number; marketingCPA: number }>('app_monetization', { marketplaceCommission: 0.05, marketingCPA: 5000 });
    const [taxConfig, setTaxConfig] = usePersistentState<{ ppnRate: number; pph21Rate: number }>('app_tax_config', { ppnRate: 0.11, pph21Rate: 0.025 });
    const [budgets, setBudgets] = usePersistentState<Budget[]>('app_budgets', []);
    const [scheduledPayments, setScheduledPayments] = usePersistentState<ScheduledPayment[]>('app_scheduled_payments', []);
    const [cart, setCart] = usePersistentState<CartItem[]>('app_cart', []);
    const [leaveRequests, setLeaveRequests] = usePersistentState<LeaveRequest[]>('app_leave_requests', initialLeaveRequests);
    
    // --- START: Personalization Engine ---
    const [baseHomePageConfig, setBaseHomePageConfig] = usePersistentState<HomePageConfig>('app_home_config', {
        pinnedItemId: null,
        quickAccessOrder: ['ppob', 'market', 'health', 'gov', 'lifestyle', 'pulsa', 'cashout', 'daily'],
        globalAnnouncement: { message: 'Selamat datang di versi baru Mitra Karyawan!', active: false },
    });
    const [personalizationRules, setPersonalizationRules] = usePersistentState<PersonalizationRule[]>('app_personalization_rules', initialPersonalizationRules);
    const [personalizedHomePageConfig, setPersonalizedHomePageConfig] = useState<HomePageConfig>(baseHomePageConfig);

    useEffect(() => {
        if (!user) {
            setPersonalizedHomePageConfig(baseHomePageConfig);
            return;
        }

        const evaluateCondition = (user: User, userTxCount: number, condition: PersonalizationCondition): boolean => {
            let userValue: any;
            if (condition.field === 'transactionCount') {
                userValue = userTxCount;
            } else if (condition.field === 'profile.branch') {
                userValue = user.profile.branch;
            } else {
                userValue = user[condition.field as keyof User];
            }

            switch (condition.operator) {
                case 'equals': return userValue == condition.value;
                case 'not_equals': return userValue != condition.value;
                case 'greater_than': return userValue > condition.value;
                case 'less_than': return userValue < condition.value;
                default: return false;
            }
        };

        const userTxCount = transactions.filter(tx => tx.userId === user.id).length;
        let newConfig = { ...baseHomePageConfig };

        for (const rule of personalizationRules) {
            if (rule.isActive) {
                const allConditionsMet = rule.conditions.every(cond => evaluateCondition(user, userTxCount, cond));
                if (allConditionsMet) {
                    if (rule.action.type === 'PIN_ITEM' && rule.action.payload.itemId) {
                        newConfig.pinnedItemId = rule.action.payload.itemId;
                    } else if (rule.action.type === 'SHOW_ANNOUNCEMENT' && rule.action.payload.message) {
                        newConfig.globalAnnouncement = {
                            message: rule.action.payload.message,
                            active: true,
                        };
                    }
                }
            }
        }
        setPersonalizedHomePageConfig(newConfig);
    }, [user, baseHomePageConfig, personalizationRules, transactions]);
    // --- END: Personalization Engine ---


    const [assistantLogs, setAssistantLogs] = usePersistentState<AssistantLog[]>('app_assistant_logs', []);
    const [engagementAnalytics, setEngagementAnalytics] = usePersistentState<EngagementAnalytics>('app_engagement_analytics', {
        forYouClicks: {},
        quickAccessClicks: {},
    });

    const addTransaction = async (txData: Omit<Transaction, 'id' | 'timestamp' | 'userName'>): Promise<{success: boolean, finalStatus: 'Completed' | 'Failed'}> => {
        return new Promise(resolve => {
            const transactionUser = users.find(u => u.id === txData.userId);
            if (!transactionUser) {
                resolve({success: false, finalStatus: 'Failed'});
                return;
            }
            if(transactionUser.wallet.isFrozen){
                addNotification(txData.userId, `Transaction failed: Wallet is frozen.`, 'error');
                resolve({success: false, finalStatus: 'Failed'});
                return;
            }

            const pendingTx: Transaction = {
                ...txData,
                id: `tx-${Date.now()}-${Math.random()}`,
                timestamp: new Date().toISOString(),
                userName: transactionUser.profile.name,
                status: 'Pending',
            };
            setTransactions(prev => [...prev, pendingTx]);
            
            // FIX: Corrected a critical bug where the wallet object was being improperly nested during state updates.
            // This prevented user balances from being read correctly after the first transaction.
            setUsers(currentUsers => currentUsers.map(u => 
                u.id === txData.userId ? { ...u, wallet: { ...u.wallet, balance: u.wallet.balance + txData.amount } } : u
            ));
            
            setTimeout(() => {
                const isSuccess = Math.random() > 0.1;

                if (isSuccess) {
                    setTransactions(prev => prev.map(t => t.id === pendingTx.id ? { ...t, status: 'Completed' } : t));
                    resolve({success: true, finalStatus: 'Completed'});
                } else {
                    setTransactions(prev => prev.map(t => t.id === pendingTx.id ? { ...t, status: 'Failed' } : t));

                    const reversalTx: Transaction = {
                        id: `tx-${Date.now()}-reversal`,
                        userId: txData.userId,
                        userName: transactionUser.profile.name,
                        type: 'Reversal',
                        amount: -txData.amount,
                        status: 'Completed',
                        description: `Reversal for failed transaction: ${txData.description}`,
                        timestamp: new Date().toISOString(),
                        relatedId: pendingTx.id,
                    };
                    setTransactions(prev => [...prev, reversalTx]);

                    setUsers(currentUsers => currentUsers.map(u => 
                        u.id === txData.userId ? { ...u, wallet: { ...u.wallet, balance: u.wallet.balance - txData.amount } } : u
                    ));
                    
                    addNotification(txData.userId, `Transaction failed and was reversed: ${txData.description}`, 'error');
                    resolve({success: false, finalStatus: 'Failed'});
                }

            }, 2000); // Simulate processing time
        });
    };
    
    const updateUserStatus = async (userId: string, status: 'active' | 'inactive'): Promise<{ success: boolean }> => {
        await new Promise(resolve => setTimeout(resolve, 1500));
        if (Math.random() < 0.1) {
            console.error("Simulated API Error: Failed to update user status.");
            return { success: false };
        }
    
        setUsers(prev => prev.map(u => u.id === userId ? { ...u, status } : u));
        return { success: true };
    };

    const addNotification = (userId: string, message: string, type: Notification['type']) => {
        const newNotif: Notification = {
            id: `notif-${Date.now()}`,
            userId,
            message,
            type,
            read: false,
            timestamp: new Date().toISOString(),
        };
        setNotifications(prev => [newNotif, ...prev]);
    };

    const markNotificationsAsRead = (userId: string) => {
        setNotifications(prev => prev.map(n => n.userId === userId ? { ...n, read: true } : n));
    };
    
    const updateApiIntegration = async (id: string, credentials: ApiIntegration['credentials']): Promise<{ success: boolean; message: string; }> => {
        const result = await testApiConnection(credentials);

        if (result.success) {
            setApiIntegrations(prev => prev.map(api =>
                api.id === id ? { ...api, status: IntegrationStatus.Active, credentials } : api
            ));
        } else {
            // Deactivate on failed test if it was previously active, to be safe.
             setApiIntegrations(prev => prev.map(api =>
                api.id === id ? { ...api, status: IntegrationStatus.Inactive } : api
            ));
        }
        return result;
    };

    const deactivateApiIntegration = async (id: string): Promise<{ success: boolean; }> => {
        await new Promise(resolve => setTimeout(resolve, 500));
        setApiIntegrations(prev => prev.map(api =>
            api.id === id ? { ...api, status: IntegrationStatus.Inactive } : api
        ));
        return { success: true };
    };


    const updateScalabilityService = (id: string, status: ScalabilityService['status'], newLog?: string, metadata?: ScalabilityService['metadata'], cost?: number) => {
        setScalabilityServices(prev => prev.map(service => {
            if (service.id === id) {
                const newLogs = newLog ? [...service.logs, `${new Date().toLocaleTimeString()}: ${newLog}`] : service.logs;
                const newMetadata = metadata ? { ...service.metadata, ...metadata } : service.metadata;
                const newCost = cost !== undefined ? cost : service.cost;
                return { ...service, status, logs: newLogs, metadata: newMetadata, cost: newCost };
            }
            return service;
        }));
    };

    const addArticle = async (articleData: Omit<Article, 'id' | 'timestamp' | 'likes' | 'comments' | 'author'>): Promise<{ success: boolean; data?: Article; }> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (Math.random() < 0.1) return { success: false };

        const newArticle: Article = {
            ...articleData,
            status: articleData.status || 'Draft',
            id: `art-${Date.now()}`,
            timestamp: new Date().toISOString(),
            author: user?.profile.name || 'Admin',
            likes: [],
            comments: []
        };
        setArticles(prev => [newArticle, ...prev]);
        return { success: true, data: newArticle };
    };

    const editArticle = async (updatedArticle: Article): Promise<{ success: boolean; data?: Article; }> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (Math.random() < 0.1) return { success: false };
        setArticles(prev => prev.map(art => art.id === updatedArticle.id ? updatedArticle : art));
        return { success: true, data: updatedArticle };
    };
    
    const toggleArticleAdMonetization = async (articleId: string): Promise<{ success: boolean }> => {
        await new Promise(resolve => setTimeout(resolve, 750)); // Simulate network call
        setArticles(prev => prev.map(art => {
            if (art.id === articleId) {
                const currentMonetization = art.monetization || { enabled: false, revenueGenerated: 0 };
                const newEnabledState = !currentMonetization.enabled;
                return {
                    ...art,
                    monetization: {
                        enabled: newEnabledState,
                        revenueGenerated: newEnabledState ? Math.floor(Math.random() * 50000) + 1000 : 0
                    }
                };
            }
            return art;
        }));
        return { success: true };
    };

    const addProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'>): Promise<{ success: boolean; data?: Product; }> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!user || Math.random() < 0.1) return { success: false };
        
        const newProduct: Product = {
            ...productData,
            id: `prod-${Date.now()}`,
            sellerId: user.id,
            sellerName: user.profile.name,
            reviews: [],
            rating: 0,
            reviewCount: 0,
        };
        setProducts(prev => [newProduct, ...prev]);
        return { success: true, data: newProduct };
    };

    const editProduct = async (updatedProduct: Product): Promise<{ success: boolean; data?: Product; }> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        if (!user || (updatedProduct.sellerId !== user.id && user.role !== 'Admin')) {
            addNotification(user!.id, 'You do not have permission to edit this product.', 'error');
            return { success: false };
        }
        if (Math.random() < 0.1) return { success: false };
        setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
        return { success: true, data: updatedProduct };
    };

    const deleteProduct = async (productId: string): Promise<{ success: boolean; }> => {
        await new Promise(resolve => setTimeout(resolve, 1000));
        const productToDelete = products.find(p => p.id === productId);
        if (!user || !productToDelete || (productToDelete.sellerId !== user.id && user.role !== 'Admin')) {
            addNotification(user!.id, 'You do not have permission to delete this product.', 'error');
            return { success: false };
        }
        if (Math.random() < 0.1) return { success: false };
        setProducts(prev => prev.filter(p => p.id !== productId));
        return { success: true };
    };
    
    const purchaseProduct = async (userId: string, product: Product, quantity: number): Promise<{ success: boolean; message: string; }> => {
        await new Promise(resolve => setTimeout(resolve, 2500)); // Simulate payment gateway
        
        const buyer = users.find(u => u.id === userId);
        const productInDb = products.find(p => p.id === product.id);

        if (!buyer || !productInDb) return { success: false, message: "User or product not found." };

        const totalPrice = product.price * quantity;
        
        if (buyer.wallet.isFrozen) return { success: false, message: "Your wallet is frozen. Contact support." };
        if (buyer.wallet.balance < totalPrice) return { success: false, message: "Saldo tidak cukup." };
        if (productInDb.stock < quantity) return { success: false, message: "Stok produk tidak mencukupi." };
        if (Math.random() < 0.1) return { success: false, message: "Gateway pembayaran gagal. Coba lagi." };
        
        // All checks passed, process the transaction
        const updatedBuyer: User = { ...buyer, wallet: { ...buyer.wallet, balance: buyer.wallet.balance - totalPrice } };
        const updatedProduct: Product = { ...productInDb, stock: productInDb.stock - quantity };

        const purchaseTransaction: Transaction = {
            id: `tx-${Date.now()}`,
            userId: buyer.id,
            userName: buyer.profile.name,
            type: 'Marketplace',
            amount: -totalPrice,
            status: 'Completed',
            description: `Beli ${quantity}x ${product.name}`,
            timestamp: new Date().toISOString(),
            relatedId: product.id,
        };

        // --- START: Achievement & Loyalty Logic ---
        const buyerMarketplaceTransactions = transactions.filter(tx => tx.userId === buyer.id && tx.type === 'Marketplace');
        let newAchievements = [...(buyer.achievements || [])];
        let newPoints = buyer.loyaltyPoints || 0;

        if (buyerMarketplaceTransactions.length === 0 && !newAchievements.includes('First Purchase')) {
            newAchievements.push('First Purchase');
            newPoints += 100;
            addNotification(buyer.id, `Pencapaian Terbuka: Pembeli Pertama! +100 Poin`, 'success');
        }
        newPoints += Math.round(totalPrice / 1000);

        const finalBuyer: User = {
            ...updatedBuyer,
            achievements: newAchievements,
            loyaltyPoints: newPoints,
        };
        // --- END: Achievement & Loyalty Logic ---

        setUsers(prev => prev.map(u => u.id === buyer.id ? finalBuyer : u));
        setProducts(prev => prev.map(p => p.id === product.id ? updatedProduct : p));
        setTransactions(prev => [purchaseTransaction, ...prev]);
        
        if (user?.id === buyer.id) {
            updateCurrentUser(finalBuyer);
        }

        addNotification(buyer.id, `Pembelian ${product.name} berhasil!`, 'success');

        return { success: true, message: "Pembelian berhasil!" };
    };

    const toggleWishlist = (productId: string) => {
        if (!user) return;
        const isInWishlist = user.wishlist.includes(productId);
        const updatedWishlist = isInWishlist
            ? user.wishlist.filter(id => id !== productId)
            : [...user.wishlist, productId];
        
        const updatedUser = { ...user, wishlist: updatedWishlist };
        updateCurrentUser(updatedUser);
    };

    const addToCart = (productId: string, quantity: number) => {
        setCart(prevCart => {
            const existingItem = prevCart.find(item => item.productId === productId);
            if (existingItem) {
                return prevCart.map(item =>
                    item.productId === productId ? { ...item, quantity: item.quantity + quantity } : item
                );
            }
            return [...prevCart, { productId, quantity }];
        });
        addNotification(user!.id, 'Produk ditambahkan ke keranjang!', 'info');
    };

    const removeFromCart = (productId: string) => {
        setCart(prevCart => prevCart.filter(item => item.productId !== productId));
    };

    const updateCartQuantity = (productId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(productId);
        } else {
            setCart(prevCart => prevCart.map(item =>
                item.productId === productId ? { ...item, quantity } : item
            ));
        }
    };
    
    const clearCart = () => setCart([]);

    const addReview = async (productId: string, rating: number, comment: string): Promise<{success: boolean}> => {
        await new Promise(r => setTimeout(r, 500));
        if (!user) return {success: false};

        setProducts(prev => prev.map(p => {
            if (p.id === productId) {
                const newReview: Review = {
                    id: `rev-${Date.now()}`,
                    productId,
                    userId: user.id,
                    userName: user.profile.name,
                    rating,
                    comment,
                    timestamp: new Date().toISOString(),
                };
                const updatedReviews = [...p.reviews, newReview];
                const newTotalRating = updatedReviews.reduce((sum, r) => sum + r.rating, 0);
                const newAverageRating = newTotalRating / updatedReviews.length;
                return {
                    ...p,
                    reviews: updatedReviews,
                    rating: newAverageRating,
                    reviewCount: updatedReviews.length,
                }
            }
            return p;
        }));
        return {success: true};
    };

    // --- NEWS INTERACTIONS ---
    const toggleArticleLike = (articleId: string) => {
        if (!user) return;
        setArticles(prev => prev.map(article => {
            if (article.id === articleId) {
                const isLiked = article.likes.includes(user.id);
                const newLikes = isLiked
                    ? article.likes.filter(id => id !== user.id)
                    : [...article.likes, user.id];
                return { ...article, likes: newLikes };
            }
            return article;
        }));
    };

    const addArticleComment = (articleId: string, commentText: string) => {
        if (!user || !commentText.trim()) return;
        setArticles(prev => prev.map(article => {
            if (article.id === articleId) {
                const newComment = {
                    userId: user.id,
                    userName: user.profile.name,
                    comment: commentText,
                    timestamp: new Date().toISOString(),
                    likes: [],
                };
                return { ...article, comments: [...article.comments, newComment] };
            }
            return article;
        }));
    };

    const toggleArticleBookmark = (articleId: string) => {
        if (!user) return;
        const isBookmarked = user.bookmarkedArticles.includes(articleId);
        const newBookmarks = isBookmarked
            ? user.bookmarkedArticles.filter(id => id !== articleId)
            : [...user.bookmarkedArticles, articleId];
        updateCurrentUser({ ...user, bookmarkedArticles: newBookmarks });
    };
    
    const voteOnPoll = (articleId: string, optionIndex: number) => {
        if (!user) return;
        setArticles(prev => prev.map(article => {
            if (article.id === articleId && article.type === 'poll' && article.pollOptions) {
                // User can only vote once per poll
                const alreadyVoted = article.pollOptions.some(opt => opt.votes.includes(user.id));
                if (alreadyVoted) return article;

                const newPollOptions = article.pollOptions.map((option, index) => {
                    if (index === optionIndex) {
                        return { ...option, votes: [...option.votes, user.id] };
                    }
                    return option;
                });
                return { ...article, pollOptions: newPollOptions };
            }
            return article;
        }));
    };

    const toggleCommentLike = (articleId: string, commentTimestamp: string) => {
        if (!user) return;
        setArticles(prev => prev.map(article => {
            if (article.id === articleId) {
                const newComments = article.comments.map(comment => {
                    if (comment.timestamp === commentTimestamp) {
                        const isLiked = comment.likes.includes(user.id);
                        const newLikes = isLiked
                            ? comment.likes.filter(id => id !== user.id)
                            : [...comment.likes, user.id];
                        return { ...comment, likes: newLikes };
                    }
                    return comment;
                });
                return { ...article, comments: newComments };
            }
            return article;
        }));
    };

    // --- HEALTH ACTIONS ---
    const addDoctor = async (doctorData: Omit<Doctor, 'id'>): Promise<{success: boolean}> => {
        const newDoctor: Doctor = {
            id: `doc-${Date.now()}`,
            ...doctorData,
        };
        setDoctors(prev => [newDoctor, ...prev]);
        return { success: true };
    };

    const updateDoctor = async (updatedDoctor: Doctor): Promise<{success: boolean}> => {
        setDoctors(prev => prev.map(d => d.id === updatedDoctor.id ? updatedDoctor : d));
        return { success: true };
    };

    const bookConsultation = async (doctorId: string, slotTime: string): Promise<{success: boolean, consultationId?: string, message: string}> => {
        if (!user) return { success: false, message: "User not logged in." };
        const doctor = doctors.find(d => d.id === doctorId);
        if (!doctor) return { success: false, message: "Doctor not found." };
        if (user.wallet.balance < doctor.consultationFee) {
            return { success: false, message: "Saldo tidak cukup." };
        }
        if (user.wallet.isFrozen) {
             return { success: false, message: "Your wallet is frozen. Contact support." };
        }

        const txResult = await addTransaction({
            userId: user.id,
            type: 'Teleconsultation',
            amount: -doctor.consultationFee,
            description: `Biaya konsultasi dengan ${doctor.name}`,
            relatedId: doctor.id,
            status: 'Pending'
        });

        if (!txResult.success) {
            return { success: false, message: "Pembayaran gagal. Silakan coba lagi." };
        }

        const newConsultation: Consultation = {
            id: `cons-${Date.now()}`,
            userId: user.id,
            userName: user.profile.name,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            scheduledTime: slotTime,
            status: 'Scheduled',
            chatHistory: [{
                sender: 'doctor',
                message: `Halo ${user.profile.name}, saya ${doctor.name}. Silakan ceritakan keluhan Anda.`,
                timestamp: new Date().toISOString()
            }],
        };
        
        setConsultations(prev => [newConsultation, ...prev]);
        setDoctors(prev => prev.map(d => d.id === doctorId ? { ...d, availableSlots: d.availableSlots.map(s => s.time === slotTime ? {...s, isBooked: true} : s) } : d));

        return { success: true, consultationId: newConsultation.id, message: "Booking berhasil!" };
    };
    
    const addConsultationMessage = (consultationId: string, message: string, sender: 'user' | 'doctor') => {
        setConsultations(prev => prev.map(c => {
            if (c.id === consultationId) {
                const newMessage = { sender, message, timestamp: new Date().toISOString() };
                return { ...c, chatHistory: [...c.chatHistory, newMessage] };
            }
            return c;
        }));
    };
    
    const completeConsultation = (consultationId: string, prescription: Consultation['prescription']) => {
        setConsultations(prev => prev.map(c => c.id === consultationId ? { ...c, status: 'Completed', prescription } : c));
    };

    // --- ADMIN FINANCIAL ACTIONS ---
    const adjustUserWallet = async (userId: string, amount: number, reason: string): Promise<{ success: boolean }> => {
        setUsers(prevUsers => prevUsers.map(u => 
            u.id === userId ? { ...u, wallet: { ...u.wallet, balance: u.wallet.balance + amount } } : u
        ));
        await addTransaction({
            userId: userId,
            type: 'Adjustment',
            amount: amount,
            description: `Admin Adjustment: ${reason}`,
            status: 'Completed',
        });
        addNotification(userId, `Your wallet has been adjusted by an admin. Amount: ${amount}. Reason: ${reason}.`, 'info');
        return { success: true };
    };
    
    const freezeUserWallet = async (userId: string, freeze: boolean): Promise<{ success: boolean }> => {
         setUsers(prevUsers => prevUsers.map(u => 
            u.id === userId ? { ...u, wallet: { ...u.wallet, isFrozen: freeze } } : u
        ));
        addNotification(userId, `Your wallet has been ${freeze ? 'FROZEN' : 'UNFROZEN'} by an administrator.`, freeze ? 'warning' : 'success');
        return { success: true };
    };

    const reverseTransaction = async (transactionId: string): Promise<{ success: boolean }> => {
        const originalTx = transactions.find(t => t.id === transactionId);
        if (!originalTx || originalTx.type === 'Reversal' || originalTx.type === 'Refund') {
            return { success: false };
        }
        
        const reversalAmount = -originalTx.amount;
        
        await addTransaction({
            userId: originalTx.userId,
            type: 'Reversal',
            amount: reversalAmount,
            description: `Reversal for transaction ID: ${originalTx.id}`,
            relatedId: originalTx.id,
            status: 'Completed',
        });
        
        addNotification(originalTx.userId, `A transaction for ${originalTx.description} has been reversed by an admin.`, 'info');
        
        return { success: true };
    };


    // --- ADMIN CONTROL ACTIONS ---
    const addPersonalizationRule = (rule: Omit<PersonalizationRule, 'id'>) => {
        const newRule: PersonalizationRule = { ...rule, id: `rule-${Date.now()}` };
        setPersonalizationRules(prev => [newRule, ...prev]);
    };

    const updatePersonalizationRule = (updatedRule: PersonalizationRule) => {
        setPersonalizationRules(prev => prev.map(r => r.id === updatedRule.id ? updatedRule : r));
    };

    const deletePersonalizationRule = (ruleId: string) => {
        setPersonalizationRules(prev => prev.filter(r => r.id !== ruleId));
    };


    const logAssistantQuery = (query: string, detectedIntent: string) => {
        if (!user) return;
        const newLog: AssistantLog = {
            id: `log-${Date.now()}`,
            query,
            detectedIntent,
            timestamp: new Date().toISOString(),
            userId: user.id,
        };
        setAssistantLogs(prev => [newLog, ...prev]);
    };

    const logEngagementEvent = (type: keyof EngagementAnalytics, id: string) => {
        setEngagementAnalytics(prev => {
            const newAnalytics = { ...prev };
            const currentClicks = newAnalytics[type][id] || 0;
            newAnalytics[type][id] = currentClicks + 1;
            return newAnalytics;
        });
    };

    // --- HR ACTIONS ---
    const createEmployee = async (userData: Omit<User, 'id' | 'role' | 'status' | 'wallet' | 'achievements' | 'loyaltyPoints' | 'wishlist' | 'bookmarkedArticles' | 'healthData' | 'password'> & {password: string}): Promise<{ success: boolean; message: string }> => {
        if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return { success: false, message: 'Email already exists.' };
        }
        const newUser: User = {
            ...userData,
            id: `user-${Date.now()}`,
            role: Role.User,
            status: 'active',
            wallet: { balance: 0, isFrozen: false },
            achievements: [],
            loyaltyPoints: 0,
            wishlist: [],
            bookmarkedArticles: [],
            healthData: {
                moodHistory: [],
                activeChallenges: []
            }
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        return { success: true, message: 'Employee created successfully.' };
    };

    const updateLeaveRequestStatus = async (requestId: string, status: 'Approved' | 'Rejected'): Promise<{ success: boolean }> => {
        let targetUser: User | undefined;
        setLeaveRequests(prev => prev.map(req => {
            if (req.id === requestId) {
                targetUser = users.find(u => u.id === req.userId);
                return { ...req, status };
            }
            return req;
        }));
        if (targetUser) {
            addNotification(targetUser.id, `Permohonan cuti Anda telah ${status === 'Approved' ? 'disetujui' : 'ditolak'}.`, status === 'Approved' ? 'success' : 'error');
        }
        return { success: true };
    };

    const submitLeaveRequest = async (requestData: Omit<LeaveRequest, 'id' | 'status' | 'branch' | 'userName' | 'userId'>): Promise<{ success: boolean }> => {
        if (!user) return { success: false };
        const newRequest: LeaveRequest = {
            ...requestData,
            id: `leave-${Date.now()}`,
            userId: user.id,
            status: 'Pending',
            branch: user.profile.branch || 'UNKNOWN',
            userName: user.profile.name,
        };
        setLeaveRequests(prev => [newRequest, ...prev]);
        addNotification(user.id, 'Permohonan cuti berhasil diajukan.', 'success');
        return { success: true };
    };


    const value = {
        users, transactions, products, orders, articles, doctors, notifications, apiIntegrations, scalabilityServices,
        consultations, healthChallenges, disputes,
        budgets, scheduledPayments, cart, leaveRequests,
        homePageConfig: personalizedHomePageConfig, 
        assistantLogs, engagementAnalytics, personalizationRules,
        adminWallets, monetizationConfig, taxConfig,
        addTransaction, updateUserStatus, addNotification, markNotificationsAsRead, updateApiIntegration, deactivateApiIntegration, updateScalabilityService,
        addArticle, editArticle, toggleArticleAdMonetization, addProduct, editProduct, deleteProduct, purchaseProduct,
        toggleWishlist, addToCart, removeFromCart, updateCartQuantity, clearCart, addReview,
        toggleArticleLike, addArticleComment, toggleArticleBookmark, voteOnPoll, toggleCommentLike,
        addDoctor, updateDoctor, bookConsultation, addConsultationMessage, completeConsultation,
        addPersonalizationRule, updatePersonalizationRule, deletePersonalizationRule,
        logAssistantQuery, logEngagementEvent,
        adjustUserWallet, freezeUserWallet, reverseTransaction,
        createEmployee, updateLeaveRequestStatus, submitLeaveRequest
    };

    return (
        <DataContext.Provider value={value}>
            {children}
        </DataContext.Provider>
    );
};

export const useData = (): DataContextType => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};