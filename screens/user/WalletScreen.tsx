import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { SparklesIcon } from '@heroicons/react/24/solid';
// FIX: Import ArrowDownCircleIcon from heroicons and remove dummy component.
import { FunnelIcon, ArrowUpCircleIcon, ArrowsRightLeftIcon, ArrowDownCircleIcon } from '@heroicons/react/24/outline';
import { Transaction } from '../../types';

import WalletAnalytics from '../../components/user/wallet/WalletAnalytics';
import FinancialPlanning from '../../components/user/wallet/FinancialPlanning';
import TopUpModal from '../../components/user/wallet/TopUpModal';
import TransferModal from '../../components/user/wallet/TransferModal';
import FinancialAdvisorModal from '../../components/user/wallet/FinancialAdvisorModal';
import PayLaterStatusCard from '../../components/user/wallet/PayLaterStatusCard';


type Tab = 'Analitik' | 'Perencanaan' | 'Riwayat';
type TransactionType = Transaction['type'] | 'All';

const getTransactionIcon = (type: Transaction['type']) => {
    switch (type) {
        case 'Top-Up':
        case 'Refund':
        case 'Reversal':
        case 'Dana Opex':
            return <ArrowUpCircleIcon className="h-8 w-8 text-green-400" />;
        default:
             return <ArrowDownCircleIcon className="h-8 w-8 text-red-400" />;
    }
};


const WalletScreen: React.FC = () => {
    const { user } = useAuth();
    const { transactions } = useApp();
    
    const [activeTab, setActiveTab] = useState<Tab>('Analitik');
    const [filterType, setFilterType] = useState<TransactionType>('All');
    
    const [isTopUpModalOpen, setTopUpModalOpen] = useState(false);
    const [isTransferModalOpen, setTransferModalOpen] = useState(false);
    const [isAdvisorModalOpen, setAdvisorModalOpen] = useState(false);

    const userTransactions = useMemo(() => transactions
        .filter(tx => tx.userId === user?.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()), [transactions, user?.id]);
        
    const filteredTransactions = useMemo(() => {
        if (filterType === 'All') {
            return userTransactions;
        }
        return userTransactions.filter(tx => tx.type === filterType);
    }, [userTransactions, filterType]);

    const renderContent = () => {
        switch (activeTab) {
            case 'Analitik':
                return <WalletAnalytics transactions={userTransactions} />;
            case 'Perencanaan':
                return <FinancialPlanning />;
            case 'Riwayat':
                return (
                    <div className="space-y-3">
                        {filteredTransactions.length > 0 ? filteredTransactions.map(tx => (
                            <div key={tx.id} className="bg-surface p-4 rounded-lg flex items-center space-x-4">
                                <div>{getTransactionIcon(tx.type)}</div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-text-primary">{tx.description}</p>
                                    <p className="text-xs text-text-secondary">{new Date(tx.timestamp).toLocaleString()}</p>
                                </div>
                                <div className={`font-bold text-right`}>
                                    <p className={`${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}</p>
                                     <span className={`text-xs font-normal ${tx.status === 'Completed' ? 'text-green-500' : tx.status === 'Pending' ? 'text-yellow-500' : 'text-red-500'}`}>
                                        {tx.status}
                                     </span>
                                </div>
                            </div>
                        )) : (
                            <p className="text-center text-text-secondary py-4">Belum ada transaksi.</p>
                        )}
                    </div>
                );
        }
    };
    
    const transactionTypes: TransactionType[] = ['All', 'Top-Up', 'Transfer', 'Marketplace', 'PPOB', 'Refund'];

    return (
        <div className="p-4 space-y-6">
            <div className="bg-surface p-6 rounded-lg shadow-lg border border-border-color text-center">
                 <p className="text-text-secondary text-sm">Saldo Saat Ini</p>
                 <p className="text-4xl font-bold text-primary my-2">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user?.wallet.balance || 0)}
                </p>
            </div>

            <PayLaterStatusCard />

            <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setTopUpModalOpen(true)} className="flex items-center justify-center space-x-2 p-3 bg-surface rounded-lg hover:bg-surface-light transition-colors font-semibold">
                    <ArrowUpCircleIcon className="h-6 w-6 text-primary" />
                    <span>Top Up</span>
                </button>
                 <button onClick={() => setTransferModalOpen(true)} className="flex items-center justify-center space-x-2 p-3 bg-surface rounded-lg hover:bg-surface-light transition-colors font-semibold">
                    <ArrowsRightLeftIcon className="h-6 w-6 text-primary" />
                    <span>Transfer</span>
                </button>
            </div>
            
             <button onClick={() => setAdvisorModalOpen(true)} className="w-full btn-secondary p-3 rounded-lg flex items-center justify-center font-bold space-x-2">
                <SparklesIcon className="h-6 w-6" />
                <span>Tanya Analis Keuangan AI</span>
             </button>

            <div>
                <div className="flex border-b border-border-color">
                    {(['Analitik', 'Perencanaan', 'Riwayat'] as Tab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                            {tab}
                        </button>
                    ))}
                </div>
                
                {activeTab === 'Riwayat' && (
                    <div className="py-2">
                        <div className="relative">
                            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-secondary" />
                            <select value={filterType} onChange={(e) => setFilterType(e.target.value as TransactionType)} className="w-full bg-surface border border-border-color rounded-md py-2 pl-9 pr-4 focus:outline-none focus:ring-1 focus:ring-primary appearance-none text-sm">
                                {transactionTypes.map(type => <option key={type} value={type}>{type}</option>)}
                            </select>
                        </div>
                    </div>
                )}
                
                <div className="mt-4">{renderContent()}</div>
            </div>
            
            <TopUpModal isOpen={isTopUpModalOpen} onClose={() => setTopUpModalOpen(false)} />
            <TransferModal isOpen={isTransferModalOpen} onClose={() => setTransferModalOpen(false)} />
            <FinancialAdvisorModal isOpen={isAdvisorModalOpen} onClose={() => setAdvisorModalOpen(false)} userTransactions={userTransactions} />
        </div>
    );
};

export default WalletScreen;