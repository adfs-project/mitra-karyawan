import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { Transaction } from '../../types';
import { 
    ArrowUpRightIcon, BoltIcon, BuildingLibraryIcon, PhoneIcon, ShoppingCartIcon, BanknotesIcon, TicketIcon, HeartIcon,
    ArrowUpCircleIcon, ArrowDownCircleIcon, MegaphoneIcon
} from '@heroicons/react/24/outline';
import PersonalizedGreeting from '../../components/user/PersonalizedGreeting';
import SmartAssistant from '../../components/user/SmartAssistant';
import ForYouWidget from '../../components/user/ForYouWidget';

const quickAccessItems = [
    { id: 'ppob', name: 'PPOB & Tagihan', icon: BoltIcon, path: '/under-construction' },
    { id: 'market', name: 'Marketplace', icon: ShoppingCartIcon, path: '/market' },
    { id: 'health', name: 'Layanan Kesehatan', icon: HeartIcon, path: '/health' },
    { id: 'gov', name: 'Layanan Pemerintah', icon: BuildingLibraryIcon, path: '/under-construction' },
    { id: 'lifestyle', name: 'Gaya Hidup', icon: TicketIcon, path: '/under-construction' },
    { id: 'pulsa', name: 'Pulsa & Data', icon: PhoneIcon, path: '/under-construction' },
    { id: 'cashout', name: 'Tarik Tunai', icon: BanknotesIcon, path: '/under-construction' },
    { id: 'daily', name: 'Belanja Harian', icon: ShoppingCartIcon, path: '/under-construction' },
];

const GlobalAnnouncement: React.FC<{ message: string }> = ({ message }) => (
    <div className="bg-secondary/20 border border-secondary text-secondary p-3 rounded-lg flex items-center space-x-3">
        <MegaphoneIcon className="h-6 w-6" />
        <p className="font-semibold text-sm">{message}</p>
    </div>
);


// Sub-component for Recent Transactions
const RecentTransactions: React.FC = () => {
    const { user } = useAuth();
    const { transactions } = useData();

    const recentTx = transactions
        .filter(tx => tx.userId === user?.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 3);
        
    const getTransactionIcon = (type: Transaction['type']) => {
        return type === 'Top-Up' || type === 'Refund' || type === 'Reversal'
            ? <ArrowUpCircleIcon className="h-8 w-8 text-green-400" />
            : <ArrowDownCircleIcon className="h-8 w-8 text-red-400" />;
    };
    
    if(recentTx.length === 0) return null;

    return (
        <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">Aktivitas Terkini</h2>
            <div className="space-y-3">
                {recentTx.map(tx => (
                    <div key={tx.id} className="bg-surface p-3 rounded-lg flex items-center space-x-4 border border-border-color">
                        <div>{getTransactionIcon(tx.type)}</div>
                        <div className="flex-grow">
                            <p className="font-semibold text-text-primary text-sm">{tx.description}</p>
                            <p className="text-xs text-text-secondary">{new Date(tx.timestamp).toLocaleDateString()}</p>
                        </div>
                        <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.amount)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

const HomeScreen: React.FC = () => {
    const { user } = useAuth();
    const { homePageConfig, logEngagementEvent } = useData();
    
    const orderedQuickAccessItems = [...quickAccessItems].sort((a, b) => {
        return homePageConfig.quickAccessOrder.indexOf(a.id) - homePageConfig.quickAccessOrder.indexOf(b.id);
    });

    return (
        <div className="p-4 space-y-8">
            {homePageConfig.globalAnnouncement?.active ? (
                <GlobalAnnouncement message={homePageConfig.globalAnnouncement.message} />
            ) : (
                <PersonalizedGreeting />
            )}
            
            <SmartAssistant />

            {/* Wallet Summary */}
            <div className="bg-surface p-6 rounded-lg shadow-lg border border-border-color flex justify-between items-center">
                <div>
                    <p className="text-text-secondary text-sm">Saldo Dompet</p>
                    <p className="text-3xl font-bold text-primary">
                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user?.wallet.balance || 0)}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <Link to="/wallet" className="flex items-center space-x-2 bg-primary/20 text-primary px-4 py-2 rounded-full text-sm font-semibold hover:bg-primary/30">
                        <span>Lihat Detail</span>
                        <ArrowUpRightIcon className="h-4 w-4" />
                    </Link>
                </div>
            </div>
            
            <ForYouWidget />
            <RecentTransactions />

            {/* Quick Access Grid */}
            <div>
                <h2 className="text-lg font-bold text-text-primary mb-4">Akses Cepat</h2>
                <div className="grid grid-cols-4 gap-4 text-center">
                    {orderedQuickAccessItems.map((item) => (
                        <Link 
                            to={item.path} 
                            key={item.id} 
                            onClick={() => logEngagementEvent('quickAccessClicks', item.id)}
                            className="flex flex-col items-center p-2 bg-surface rounded-lg hover:bg-surface-light transition-colors"
                        >
                            <div className="w-12 h-12 bg-surface-light rounded-full flex items-center justify-center mb-2 border border-border-color">
                                <item.icon className="h-6 w-6 text-secondary" />
                            </div>
                            <span className="text-xs text-text-secondary">{item.name}</span>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HomeScreen;