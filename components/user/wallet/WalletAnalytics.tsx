import React, { useMemo, useState } from 'react';
import { Transaction } from '../../../types';
import { ChartBarIcon, ShoppingCartIcon, BoltIcon, ArrowsRightLeftIcon } from '@heroicons/react/24/solid';

const DonutChart: React.FC<{ income: number; outcome: number }> = ({ income, outcome }) => {
    const [hovered, setHovered] = useState<'income' | 'outcome' | null>(null);

    const data = {
        income: { value: income, color: 'var(--color-primary)' },
        outcome: { value: outcome, color: 'var(--color-secondary)' },
    };

    const total = data.income.value + data.outcome.value;
    if (total === 0) {
        return (
            <div className="flex justify-center items-center h-56">
                <p className="text-text-secondary">Belum ada data transaksi.</p>
            </div>
        );
    }
    
    const incomePercent = (data.income.value / total) * 100;
    const outcomePercent = (data.outcome.value / total) * 100;

    const size = 200;
    const strokeWidth = 20;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const outcomeStrokeDashoffset = circumference * (1 - outcomePercent / 100);
    const incomeStrokeDashoffset = circumference * (1 - incomePercent / 100);

    const getCenterText = () => {
        if (hovered === 'income') {
            return {
                label: 'Pemasukan',
                value: data.income.value,
                color: 'text-primary'
            };
        }
        if (hovered === 'outcome') {
            return {
                label: 'Pengeluaran',
                value: data.outcome.value,
                color: 'text-secondary'
            };
        }
        const savings = data.income.value - data.outcome.value;
        return {
            label: savings >= 0 ? 'Sisa Dana' : 'Defisit',
            value: savings,
            color: savings >= 0 ? 'text-primary' : 'text-red-500'
        };
    };

    const centerText = getCenterText();
    
    return (
        <div className="flex flex-col items-center">
            <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                <g transform={`rotate(-90 ${size / 2} ${size / 2})`}>
                    {/* Background Circle */}
                    <circle
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke="var(--color-surface-light)"
                        strokeWidth={strokeWidth}
                    />
                    {/* Outcome Segment */}
                    <circle
                        onMouseEnter={() => setHovered('outcome')}
                        onMouseLeave={() => setHovered(null)}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={data.outcome.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={outcomeStrokeDashoffset}
                        strokeLinecap="round"
                        className="transition-all duration-300 ease-in-out"
                        style={{ transform: hovered === 'outcome' ? 'scale(1.05)' : 'scale(1)', transformOrigin: 'center' }}
                    />
                    {/* Income Segment */}
                    <circle
                         onMouseEnter={() => setHovered('income')}
                        onMouseLeave={() => setHovered(null)}
                        cx={size / 2}
                        cy={size / 2}
                        r={radius}
                        fill="transparent"
                        stroke={data.income.color}
                        strokeWidth={strokeWidth}
                        strokeDasharray={circumference}
                        strokeDashoffset={incomeStrokeDashoffset}
                        strokeLinecap="round"
                        transform={`rotate(${outcomePercent * 3.6} ${size/2} ${size/2})`}
                        className="transition-all duration-300 ease-in-out"
                        style={{ transform: `rotate(${outcomePercent * 3.6}deg) ${hovered === 'income' ? 'scale(1.05)' : 'scale(1)'}`, transformOrigin: 'center' }}

                    />
                </g>
                 <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="transition-opacity duration-300">
                    <tspan x="50%" dy="-0.5em" className="text-xs font-semibold text-text-secondary">{centerText.label}</tspan>
                    <tspan x="50%" dy="1.2em" className={`text-xl font-bold ${centerText.color}`}>
                       {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(centerText.value)}
                    </tspan>
                </text>
            </svg>
            <div className="flex space-x-6 mt-4">
                <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-primary mr-2"></div>
                    <span className="text-sm font-semibold">Pemasukan</span>
                </div>
                 <div className="flex items-center">
                    <div className="w-3 h-3 rounded-full bg-secondary mr-2"></div>
                    <span className="text-sm font-semibold">Pengeluaran</span>
                </div>
            </div>
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

    return (
        <div className="space-y-6">
            <div className="bg-surface p-4 rounded-lg">
                <h3 className="text-lg font-bold flex items-center mb-4">
                    <ChartBarIcon className="h-5 w-5 mr-2 text-primary" />
                    Pemasukan vs Pengeluaran (30 Hari Terakhir)
                </h3>
                <DonutChart income={analyticsData.income} outcome={analyticsData.outcome} />
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