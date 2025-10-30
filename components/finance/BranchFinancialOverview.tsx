import React, { useMemo } from 'react';
// FIX: Replaced useData with useCore as useData is not an exported member.
import { useCore } from '../../contexts/DataContext';
import { BanknotesIcon, ClockIcon, UsersIcon, ArrowUpCircleIcon } from '@heroicons/react/24/solid';
import { Transaction } from '../../types';
// FIX: Import useHR hook to access HR-related data like opexRequests.
import { useHR } from '../../contexts/HRContext';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-surface p-6 rounded-lg border border-border-color">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary/20 text-primary mr-4">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
        </div>
    </div>
);

const getTransactionIcon = (type: Transaction['type']) => {
    return <ArrowUpCircleIcon className="h-6 w-6 text-green-400" />;
};

const BranchFinancialOverview: React.FC<{ branch: string }> = ({ branch }) => {
    // FIX: Get transactions and users from useCore.
    const { transactions, users } = useCore();
    // FIX: Get opexRequests from useHR.
    const { opexRequests } = useHR();

    const branchData = useMemo(() => {
        const branchUsers = users.filter(u => u.profile.branch === branch);
        const branchUserIds = new Set(branchUsers.map(u => u.id));

        const totalApprovedOpex = opexRequests
            .filter(r => r.branch === branch && r.status === 'Approved')
            .reduce((sum, r) => sum + r.amount, 0);

        const pendingOpexCount = opexRequests.filter(r => r.branch === branch && r.status === 'Pending Finance Approval').length;

        const branchTransactions = transactions
            .filter(tx => branchUserIds.has(tx.userId) && tx.type === 'Dana Opex')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 10);

        const employeeCount = branchUsers.filter(u => u.role === 'User').length;

        return { totalApprovedOpex, pendingOpexCount, branchTransactions, employeeCount };

    }, [branch, opexRequests, transactions, users]);

    return (
        <div className="space-y-6">
             <h1 className="text-3xl font-bold text-primary">Command Center: {branch}</h1>
             <p className="text-text-secondary">Ringkasan aktivitas keuangan untuk cabang Anda.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Opex Disetujui" 
                    value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(branchData.totalApprovedOpex)} 
                    icon={BanknotesIcon} 
                />
                <StatCard 
                    title="Opex Menunggu Persetujuan" 
                    value={branchData.pendingOpexCount} 
                    icon={ClockIcon} 
                />
                <StatCard 
                    title="Jumlah Karyawan" 
                    value={branchData.employeeCount} 
                    icon={UsersIcon} 
                />
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Riwayat Pencairan Dana Opex Terbaru</h2>
                {branchData.branchTransactions.length > 0 ? (
                    <div className="space-y-3">
                        {branchData.branchTransactions.map(tx => (
                            <div key={tx.id} className="bg-surface-light p-3 rounded-lg flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    {getTransactionIcon(tx.type)}
                                    <div>
                                        <p className="font-semibold text-text-primary">{tx.description}</p>
                                        <p className="text-xs text-text-secondary">Untuk: {tx.userName} | {new Date(tx.timestamp).toLocaleString()}</p>
                                    </div>
                                </div>
                                <p className="font-bold text-green-400">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-text-secondary py-8">Belum ada riwayat pencairan dana opex untuk cabang ini.</p>
                )}
            </div>
        </div>
    );
};

export default BranchFinancialOverview;