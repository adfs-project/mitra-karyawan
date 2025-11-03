import React from 'react';
import { User, Transaction, Order } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import { XMarkIcon, UserCircleIcon, WalletIcon, ShoppingCartIcon, TrophyIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from '@heroicons/react/24/solid';

const Stat: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-primary' }) => (
    <div>
        <p className="text-xs text-text-secondary uppercase tracking-wider">{label}</p>
        <p className={`text-lg font-bold ${color}`}>{value}</p>
    </div>
);

const getTransactionIcon = (type: Transaction['type']) => {
    return type === 'Top-Up' || type === 'Refund' || type === 'Reversal' || type === 'Dana Opex' || type === 'Insurance Claim'
        ? <ArrowUpCircleIcon className="h-6 w-6 text-green-400" />
        : <ArrowDownCircleIcon className="h-6 w-6 text-red-400" />;
};


const UserDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}> = ({ isOpen, onClose, user }) => {
    const { transactions, orders, products } = useData();

    if (!isOpen || !user) return null;

    const userTransactions = transactions.filter(tx => tx.userId === user.id).slice(0, 5);
    const userOrders = orders.filter(o => o.userId === user.id);
    const userProductsListed = products.filter(p => p.sellerId === user.id);
    
    const payLaterStatusMap = {
        not_applied: { text: "Not Applied", color: "text-text-secondary" },
        pending: { text: "Pending HR", color: "text-yellow-400" },
        'Pending Finance Approval': { text: "Pending Finance", color: "text-blue-400" },
        approved: { text: "Approved", color: "text-green-400" },
        rejected: { text: "Rejected", color: "text-red-400" },
    };
    const payLaterInfo = user.payLater ? payLaterStatusMap[user.payLater.status] : payLaterStatusMap['not_applied'];
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-4xl border border-border-color max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <h2 className="text-2xl font-bold flex items-center"><UserCircleIcon className="h-6 w-6 mr-2"/> User Details</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                
                <div className="overflow-y-auto">
                    {/* Header Info */}
                    <div className="flex items-center space-x-4 p-4 bg-surface-light rounded-lg">
                        <img src={user.profile.photoUrl} alt={user.profile.name} className="w-20 h-20 rounded-full" />
                        <div>
                            <h3 className="text-xl font-bold">{user.profile.name}</h3>
                            <p className="text-sm text-text-secondary">{user.email}</p>
                            <p className="text-xs text-text-secondary">{user.id}</p>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 my-4">
                        <Stat label="Role" value={user.role} />
                        <Stat label="Branch" value={user.profile.branch || 'N/A'} />
                        <Stat label="Status" value={user.status} color={user.status === 'active' ? 'text-green-400' : 'text-red-400'} />
                        <Stat label="PayLater" value={payLaterInfo.text} color={payLaterInfo.color} />
                    </div>

                    {/* Transaction History */}
                    <div className="my-4">
                        <h3 className="font-bold flex items-center mb-2"><WalletIcon className="h-5 w-5 mr-2"/> Recent Transactions</h3>
                        <div className="space-y-2">
                            {userTransactions.length > 0 ? userTransactions.map(tx => (
                                <div key={tx.id} className="flex items-center p-2 bg-surface-light rounded-lg">
                                    <div className="mr-3">{getTransactionIcon(tx.type)}</div>
                                    <div className="flex-grow">
                                        <p className="text-sm font-semibold">{tx.description}</p>
                                        <p className="text-xs text-text-secondary">{new Date(tx.timestamp).toLocaleString()}</p>
                                    </div>
                                    <p className={`font-bold text-sm ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}</p>
                                </div>
                            )) : <p className="text-sm text-text-secondary">No recent transactions.</p>}
                        </div>
                    </div>

                    {/* Marketplace Activity */}
                    <div className="my-4">
                        <h3 className="font-bold flex items-center mb-2"><ShoppingCartIcon className="h-5 w-5 mr-2"/> Marketplace Activity</h3>
                        <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold">Orders Placed</p>
                                <p>{userOrders.length} orders</p>
                            </div>
                            <div>
                                <p className="font-semibold">Products Listed</p>
                                <p>{userProductsListed.length} products</p>
                            </div>
                        </div>
                    </div>
                    {/* Loyalty Info */}
                    <div className="my-4">
                        <h3 className="font-bold flex items-center mb-2"><TrophyIcon className="h-5 w-5 mr-2"/> Loyalty &amp; Engagement</h3>
                         <div className="grid grid-cols-2 gap-4 text-sm">
                            <div>
                                <p className="font-semibold">Loyalty Points</p>
                                <p>{user.loyaltyPoints.toLocaleString('id-ID')}</p>
                            </div>
                            <div>
                                <p className="font-semibold">Achievements</p>
                                <p>{user.achievements.length > 0 ? user.achievements.join(', ') : 'None'}</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserDetailsModal;