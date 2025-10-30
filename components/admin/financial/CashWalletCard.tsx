import React, { useMemo, useState } from 'react';
// FIX: Replaced useCore with useApp as it is the correct exported member from AppContext.
import { useApp } from '../../../contexts/AppContext';
import { ShieldCheckIcon, PlusIcon, ArrowUpCircleIcon, ArrowDownCircleIcon } from '@heroicons/react/24/solid';
import ExpenseModal from './ExpenseModal';
import { Transaction } from '../../../types';

const CashWalletCard: React.FC = () => {
    const { adminWallets, transactions, recordOperationalExpense } = useApp();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const cashFlowHistory = useMemo(() => {
        return transactions
            .filter(tx => tx.userId === 'admin-001' && (tx.type === 'Internal Transfer' || tx.type === 'Operational Expense'))
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 4);
    }, [transactions]);
    
    const handleSaveExpense = async (description: string, amount: number) => {
        await recordOperationalExpense(description, amount);
        setIsModalOpen(false);
    }

    return (
        <div className="bg-surface p-4 rounded-lg border border-border-color flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-lg flex items-center mb-2">
                    <ShieldCheckIcon className="h-6 w-6 mr-2 text-blue-400" />
                    Cash Wallet
                </h3>
                <p className="text-3xl font-bold text-blue-400">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adminWallets.cash)}
                </p>

                <div className="mt-4">
                    <p className="text-xs font-semibold text-text-secondary">Recent Cash Flow</p>
                    <div className="space-y-2 mt-1">
                        {cashFlowHistory.length > 0 ? cashFlowHistory.map(tx => (
                            <div key={tx.id} className="flex items-center text-xs">
                                {tx.amount > 0 ? <ArrowUpCircleIcon className="h-4 w-4 text-green-400 mr-2" /> : <ArrowDownCircleIcon className="h-4 w-4 text-red-400 mr-2" />}
                                <span className="flex-grow truncate">{tx.description}</span>
                                <span className={`font-semibold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>{new Intl.NumberFormat('id-ID').format(tx.amount)}</span>
                            </div>
                        )) : <p className="text-xs text-text-secondary text-center">No operational transactions.</p>}
                    </div>
                </div>
            </div>

            <button onClick={() => setIsModalOpen(true)} className="w-full mt-4 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 text-sm font-bold py-2 rounded flex items-center justify-center">
                <PlusIcon className="h-4 w-4 mr-2" /> Record Operational Expense
            </button>
            
            <ExpenseModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveExpense}
            />
        </div>
    );
};

export default CashWalletCard;