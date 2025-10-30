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
    const payLater