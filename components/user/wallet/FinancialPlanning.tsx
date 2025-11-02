import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
// FIX: Replaced useCore with useApp as DataContext is deprecated.
import { useData } from '../../../contexts/DataContext';
import { Budget, ScheduledPayment } from '../../../types';
import { PlusIcon, BanknotesIcon, CalendarDaysIcon, PencilIcon, LockClosedIcon } from '@heroicons/react/24/solid';
import BudgetModal from './BudgetModal';
import ScheduledPaymentModal from './ScheduledPaymentModal';

const BudgetCard: React.FC<{ budget: Budget; onEdit: () => void; onDelete: () => void; }> = ({ budget, onEdit, onDelete }) => {
    const progress = (budget.spent / budget.limit) * 100;
    const isOverBudget = progress > 100;

    return (
        <div className="bg-surface-light p-4 rounded-lg">
            <div className="flex justify-between items-start mb-2">
                <div>
                    <span className="font-bold text-text-primary">{budget.category}</span>
                    <span className={`block text-sm font-semibold ${isOverBudget ? 'text-red-400' : 'text-text-secondary'}`}>
                        {isOverBudget ? 'Melebihi Batas!' : `${Math.floor(progress)}%`}
                    </span>
                </div>
                <div className="flex space-x-1">
                     <button onClick={onEdit} className="p-1 text-text-secondary hover:text-primary"><PencilIcon className="h-4 w-4" /></button>
                     <span 
                        onClick={onDelete} 
                        className="p-1 text-gray-500 cursor-pointer"
                        title="Penghapusan dinonaktifkan secara permanen oleh sistem."
                     >
                        <LockClosedIcon className="h-4 w-4" />
                    </span>
                </div>
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

const ScheduledPaymentCard: React.FC<{ payment: ScheduledPayment; onEdit: () => void; onDelete: () => void; }> = ({ payment, onEdit, onDelete }) => {
    return (
        <div className="bg-surface-light p-4 rounded-lg flex items-center justify-between">
            <div>
                <p className="font-semibold text-text-primary">{payment.description}</p>
                <p className="text-sm text-secondary font-bold">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payment.amount)}
                </p>
            </div>
            <div className="text-right">
                <div className="flex items-center">
                    <div>
                        <p className="text-xs text-text-secondary">Jatuh Tempo Berikutnya</p>
                        <p className="font-semibold text-text-primary">{new Date(payment.nextDueDate).toLocaleDateString()}</p>
                    </div>
                    <div className="flex flex-col ml-2">
                        <button onClick={onEdit} className="p-1 text-text-secondary hover:text-primary"><PencilIcon className="h-4 w-4" /></button>
                        <span 
                            onClick={onDelete} 
                            className="p-1 text-gray-500 cursor-pointer"
                            title="Penghapusan dinonaktifkan secara permanen oleh sistem."
                        >
                            <LockClosedIcon className="h-4 w-4" />
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
};

const FinancialPlanning: React.FC = () => {
    const { user } = useAuth();
    const { budgets, scheduledPayments, deleteBudget, deleteScheduledPayment } = useData();

    const [isBudgetModalOpen, setBudgetModalOpen] = useState(false);
    const [isPaymentModalOpen, setPaymentModalOpen] = useState(false);
    const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
    const [editingPayment, setEditingPayment] = useState<ScheduledPayment | null>(null);

    const userBudgets = budgets.filter(b => b.userId === user!.id);
    const userPayments = scheduledPayments.filter(p => p.userId === user!.id);
    
    const handleOpenBudgetModal = (budget: Budget | null = null) => {
        setEditingBudget(budget);
        setBudgetModalOpen(true);
    };

    const handleOpenPaymentModal = (payment: ScheduledPayment | null = null) => {
        setEditingPayment(payment);
        setPaymentModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="bg-surface p-4 rounded-lg">
                 <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <BanknotesIcon className="h-5 w-5 mr-2 text-primary" />
                        Anggaran Bulanan
                    </h3>
                    <button onClick={() => handleOpenBudgetModal()} className="flex items-center text-sm font-semibold text-primary"><PlusIcon className="h-4 w-4 mr-1" /> Atur Baru</button>
                 </div>
                 <div className="space-y-3">
                     {userBudgets.length > 0 ? userBudgets.map(budget => 
                        <BudgetCard 
                            key={budget.id} 
                            budget={budget} 
                            onEdit={() => handleOpenBudgetModal(budget)}
                            onDelete={() => deleteBudget(budget.id)}
                        />) : <p className="text-sm text-center text-text-secondary py-4">Belum ada anggaran yang diatur.</p>}
                 </div>
            </div>

            <div className="bg-surface p-4 rounded-lg">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold flex items-center">
                        <CalendarDaysIcon className="h-5 w-5 mr-2 text-primary" />
                        Pembayaran Terjadwal
                    </h3>
                    <button onClick={() => handleOpenPaymentModal()} className="flex items-center text-sm font-semibold text-primary"><PlusIcon className="h-4 w-4 mr-1" /> Atur Baru</button>
                 </div>
                  <div className="space-y-3">
                     {userPayments.length > 0 ? userPayments.map(payment => 
                        <ScheduledPaymentCard 
                            key={payment.id} 
                            payment={payment} 
                            onEdit={() => handleOpenPaymentModal(payment)}
                            onDelete={() => deleteScheduledPayment(payment.id)}
                        />) : <p className="text-sm text-center text-text-secondary py-4">Belum ada pembayaran terjadwal.</p>}
                 </div>
            </div>

            <BudgetModal 
                isOpen={isBudgetModalOpen}
                onClose={() => setBudgetModalOpen(false)}
                budget={editingBudget}
            />
            <ScheduledPaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setPaymentModalOpen(false)}
                payment={editingPayment}
            />
        </div>
    );
};

export default FinancialPlanning;
