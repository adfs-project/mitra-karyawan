import React from 'react';
import { User, Transaction, Order } from '../../../types';
// FIX: Replaced useData with useCore as it is the correct exported member from DataContext.
import { useCore } from '../../../contexts/DataContext';
import { XMarkIcon, UserCircleIcon, WalletIcon, ShoppingCartIcon, TrophyIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from '@heroicons/react/24/solid';
// FIX: Import useMarketplace to get marketplace data.
import { useMarketplace } from '../../../contexts/MarketplaceContext';

const Stat: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-primary' }) => (
    <div>
        <p className="text-xs text-text-secondary uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
);

const getTransactionIcon = (type: Transaction['type']) => {
    return type === 'Top-Up' || type === 'Refund' || type === 'Reversal'
        ? <ArrowUpCircleIcon className="h-6 w-6 text-green-400" />
        : <ArrowDownCircleIcon className="h-6 w-6 text-red-400" />;
};


const UserDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}> = ({ isOpen, onClose, user }) => {
    // FIX: Get orders and products from useMarketplace hook.
    const { transactions } = useCore();
    const { orders, products } = useMarketplace();

    if (!isOpen || !user) return null;

    const userTransactions = transactions.filter(tx => tx.userId === user.id).slice(0, 5);
    const userOrders = orders.filter(o => o.userId === user.id);
    const userProductsListed = products.filter(p => p.sellerId === user.id);
    
    const payLaterStatusMap = {
        not_applied: { text: "Not Applied", color: "text-text-secondary" },
        pending: { text: "Pending", color: "text-yellow-400" },
        approved: { text: "Approved", color: "text-green-400" },
        rejected: { text: "Rejected", color: "text-red-400" },
    };
    const payLaterInfo = user.payLater ? payLaterStatusMap[user.payLater.status] : payLaterStatusMap['not_applied'];


    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-2xl border border-border-color max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4 pb-4 border-b border-border-color">
                    <div className="flex items-center space-x-4">
                        <img src={user.profile.photoUrl} alt={user.profile.name} className="w-16 h-16 rounded-full border-2 border-primary" />
                        <div>
                             <h2 className="text-2xl font-bold">{user.profile.name}</h2>
                             <p className="text-text-secondary">{user.email}</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light">
                        <XMarkIcon className="h-6 w-6 text-text-secondary" />
                    </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Left Column */}
                    <div className="space-y-4">
                        {/* Profile Info */}
                        <div className="p-4 bg-surface-light rounded-lg">
                             <h3 className="font-bold mb-2 flex items-center"><UserCircleIcon className="h-5 w-5 mr-2 text-primary"/> Profile Details</h3>
                             <div className="grid grid-cols-2 gap-2 text-sm">
                                 <Stat label="Phone" value={user.profile.phone} />
                                 <Stat label="Branch" value={user.profile.branch || 'N/A'} />
                                 <Stat label="Join Date" value={user.profile.joinDate ? new Date(user.profile.joinDate).toLocaleDateString() : 'N/A'} />
                                 <Stat label="Role" value={user.role} />
                             </div>
                        </div>

                         {/* Wallet Info */}
                        <div className="p-4 bg-surface-light rounded-lg">
                            <h3 className="font-bold mb-2 flex items-center"><WalletIcon className="h-5 w-5 mr-2 text-primary"/> Wallet & PayLater</h3>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <Stat label="Balance" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user.wallet.balance)} />
                                <Stat label="Wallet Status" value={user.wallet.isFrozen ? 'Frozen' : 'Active'} color={user.wallet.isFrozen ? 'text-red-500' : 'text-green-400'} />
                                <Stat label="PayLater Status" value={payLaterInfo.text} color={payLaterInfo.color} />
                                {user.payLater?.status === 'approved' && (
                                     <Stat label="PayLater Limit" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user.payLater.limit)} />
                                )}
                            </div>
                        </div>
                        
                         {/* Achievements */}
                        <div className="p-4 bg-surface-light rounded-lg">
                            <h3 className="font-bold mb-2 flex items-center"><TrophyIcon className="h-5 w-5 mr-2 text-primary"/> Achievements</h3>
                            {user.achievements.length > 0 ? (
                                <div className="flex flex-wrap gap-2">
                                    {user.achievements.map(ach => (
                                        <span key={ach} className="text-xs font-semibold bg-secondary/20 text-secondary px-2 py-1 rounded-full">{ach}</span>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-sm text-text-secondary">No achievements yet.</p>
                            )}
                        </div>
                    </div>

                    {/* Right Column */}
                     <div className="space-y-4">
                        <div className="p-4 bg-surface-light rounded-lg">
                             <h3 className="font-bold mb-2 flex items-center"><ShoppingCartIcon className="h-5 w-5 mr-2 text-primary"/> Marketplace Activity</h3>
                             <div className="grid grid-cols-2 gap-2 text-sm">
                                 <Stat label="Orders Placed" value={userOrders.length} />
                                 <Stat label="Products Listed" value={userProductsListed.length} />
                             </div>
                        </div>
                        <div className="p-4 bg-surface-light rounded-lg">
                             <h3 className="font-bold mb-2">Recent Transactions</h3>
                             <div className="space-y-2">
                                 {userTransactions.length > 0 ? userTransactions.map(tx => (
                                     <div key={tx.id} className="flex items-center text-sm">
                                         {getTransactionIcon(tx.type)}
                                         <div className="ml-2 flex-grow">
                                             <p className="text-text-primary truncate">{tx.description}</p>
                                             <p className="text-xs text-text-secondary">{new Date(tx.timestamp).toLocaleDateString()}</p>
                                         </div>
                                         <p className={`font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(tx.amount)}
                                         </p>
                                     </div>
                                 )) : <p className="text-sm text-text-secondary">No recent transactions.</p>}
                             </div>
                        </div>
                     </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;