import React, { useMemo } from 'react';
import { Transaction } from '../../../types';
import { ChartBarIcon, ShoppingCartIcon, BoltIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';

const Bar: React.FC<{ value: number; maxValue: number; color: string; label: string }> = ({ value, maxValue, color, label }) => {
    const height = maxValue > 0 ? (value / maxValue) * 100 : 0;
    return (
        <div className="flex flex-col items-center flex-grow">
            <div className="w-full h-40 bg-surface-light rounded-t-md flex items-end">
                <div 
                    className="w-full rounded-t-md" 
                    style={{ height: `${height}%`, backgroundColor: color, transition: 'height 0.5s ease-out' }}
                ></div>
            </div>
            <span className="text-xs text-text-secondary mt-2">{label}</span>
            <span className="text-sm font-bold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value)}</span>
        </div>
    );
};

const CategorySpend: React.FC<{ icon: React.ElementType; category: string; amount: number; color: string }> = ({ icon: Icon, category, amount, color }) => {
    return (
        <div className="flex items-center p-3 bg-surface-light rounded-lg">
            <div className={`p-2 rounded-full mr-3`} style={{backgroundColor: `${color}20`}}>
                 <Icon className="h-5 w-5" style={{ color }} />
            </div>
            <div className="flex-grow">
                <p className="text-sm text-text-secondary">{category}</p>
                <p className="font-bold text-text-primary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)}
                </p>
            </div>
        </div>
    );
}

const WalletAnalytics: React.FC<{ transactions: Transaction[] }> = ({ transactions }) => {

    const analyticsData = useMemo(() => {
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const recentTransactions = transactions.filter(tx => new Date(tx.timestamp) > thirtyDaysAgo);

        const income = recentTransactions.filter(tx => tx.amount > 0).reduce((sum, tx) => sum + tx.amount, 0);
        const outcome = recentTransactions.filter(tx => tx.amount < 0).reduce((sum, tx) => sum + Math.abs(tx.amount), 0);
        
        const categorySpending = {
            Marketplace: recentTransactions.filter(tx => tx.type === 'Marketplace').reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
            PPOB: recentTransactions.filter(tx => tx.type === 'PPOB').reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
            Transfer: recentTransactions.filter(tx => tx.type === 'Transfer').reduce((sum, tx) => sum + Math.abs(tx.amount), 0),
        };

        return { income, outcome, categorySpending };
    }, [transactions]);

    const maxChartValue = Math.max(analyticsData.income, analyticsData.outcome, 1);

    return (
        <div className="space-y-6">
            <div className="bg-surface p-4 rounded-lg">
                <h3 className="text-lg font-bold flex items-center mb-4">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-primary" />
                    Pemasukan vs Pengeluaran (30 Hari Terakhir)
                </h3>
                <div className="flex justify-around items-end space-x-4">
                    <Bar value={analyticsData.income} maxValue={maxChartValue} color="var(--color-primary)" label="Pemasukan" />
                    <Bar value={analyticsData.outcome} maxValue={maxChartValue} color="var(--color-secondary)" label="Pengeluaran" />
                </div>
            </div>

            <div className="bg-surface p-4 rounded-lg">
                <h3 className="text-lg font-bold mb-4">Rincian Pengeluaran</h3>
                <div className="space-y-3">
                    <CategorySpend icon={ShoppingCartIcon} category="Marketplace" amount={analyticsData.categorySpending.Marketplace} color="#39FF14" />
                    <CategorySpend icon={BoltIcon} category="PPOB & Tagihan" amount={analyticsData.categorySpending.PPOB} color="#FF5F1F" />
                    <CategorySpend icon={ArrowsRightLeftIcon} category="Transfer" amount={analyticsData.categorySpending.Transfer} color="#00A9FF" />
                </div>
            </div>
        </div>
    );
};

export default WalletAnalytics;