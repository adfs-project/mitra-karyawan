import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { Budget, ScheduledPayment } from '../../../types';
import { PlusIcon, BanknotesIcon, CalendarDaysIcon } from '@heroicons/react/24/solid';

const BudgetCard: React.FC<{ budget: Budget }> = ({ budget }) => {
    const progress = (budget.spent / budget.limit) * 100;
    const isOverBudget = progress > 100;

    return (
        <div className="bg-surface-light p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
                <span className="font-bold text-text-primary">{budget.category}</span>
                <span className={`text-sm font-semibold ${isOverBudget ? 'text-red-400' : 'text-text-secondary'}`}>
                    {isOverBudget ? 'Melebihi Batas!' : `${Math.floor(progress)}%`}
                </span>
            </div>
            <div className="w-full bg-surface rounded-full h-2.5">
                <div 
                    className={`h-2.5 rounded-full ${isOverBudget ? 'bg-red-500' : 'bg-primary'}`} 
                    style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
            </div>
            <div className="text-xs text-text-secondary mt-2 flex justify-between">
                <span>Terpakai: {new Intl.NumberFormat('id-ID').format(budget.spent)}</span>
                <span>Batas: {new Intl.NumberFormat('id-ID').format(budget.limit)}</span>
            </div>
        </div>
    );
};

const ScheduledPaymentCard: React.FC<{ payment: ScheduledPayment }> = ({ payment }) => {
    return (
        <div className="bg-surface-light p-4 rounded-lg flex items-center justify-between">
            <div>
                <p className="font-semibold text-text-primary">{payment.description}</p>
                <p className="text-sm text-secondary font-bold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payment.amount)}
                </p>
            </div>
            <div className="text-right">
                <p className="text-xs text-text-secondary">Jatuh Tempo Berikutnya</p>
                <p className="font-semibold text-text-primary">{new Date(payment.nextDueDate).toLocaleDateString()}</p>
            </div>
        </div>
    );
};

const FinancialPlanning: React.FC = () => {
    const { user } = useAuth();
    // In a real app, this would come from `useData`
    const budgets: Budget[] = [
        { id: '1', userId: user!.id, category: 'Marketplace', limit: 1000000, spent: 450000 },
        { id: '2', userId: user!.id, category: 'PPOB', limit: 500000, spent: 550000 },
    ];
    const scheduledPayments: ScheduledPayment[] = [
         { id: '1', userId: user!.id, description: 'Bayar Tagihan Listrik', amount: -250000, recurrence: 'monthly', nextDueDate: '2024-08-25T00:00:00Z' },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-surface p-4 rounded-lg">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <BanknotesIcon className="h-5 w-5 mr-2 text-primary" />
                        Anggaran Bulanan
                    </h3>
                    <button className="flex items-center text-sm font-semibold text-primary"><PlusIcon className="h-4 w-4 mr-1" /> Atur Baru</button>
                 </div>
                 <div className="space-y-3">
                     {budgets.map(budget => <BudgetCard key={budget.id} budget={budget} />)}
                 </div>
            </div>

            <div className="bg-surface p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary" />
                        Pembayaran Terjadwal
                    </h3>
                    <button className="flex items-center text-sm font-semibold text-primary"><PlusIcon className="h-4 w-4 mr-1" /> Atur Baru</button>
                 </div>
                  <div className="space-y-3">
                     {scheduledPayments.map(payment => <ScheduledPaymentCard key={payment.id} payment={payment} />)}
                 </div>
            </div>
        </div>
    );
};

export default FinancialPlanning;
