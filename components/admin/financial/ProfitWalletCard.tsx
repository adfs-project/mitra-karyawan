import React, { useMemo, useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import { BanknotesIcon, ArrowUpRightIcon } from '@heroicons/react/24/solid';

const ProfitWalletCard: React.FC = () => {
    const { adminWallets, transactions, transferProfitToCash } = useData();
    const [isLoading, setIsLoading] = useState(false);

    const profitSources = useMemo(() => {
        const commissions = transactions
            .filter(tx => tx.type === 'Commission')
            .reduce((sum, tx) => sum + tx.amount, 0);
        return [{ name: 'Marketplace Commission', value: commissions }];
    }, [transactions]);
    
    const totalProfitSource = profitSources.reduce((sum, s) => sum + s.value, 0);

    const trendData = useMemo(() => {
        const last7Days = Array.from({ length: 7 }, (_, i) => {
            const d = new Date();
            d.setDate(d.getDate() - i);
            return d.toISOString().split('T')[0];
        }).reverse();

        return last7Days.map(date => {
            const dailyProfit = transactions
                .filter(tx => tx.type === 'Commission' && tx.timestamp.startsWith(date))
                .reduce((sum, tx) => sum + tx.amount, 0);
            return dailyProfit;
        });
    }, [transactions]);
    
    const maxTrendValue = Math.max(...trendData, 1);

    const handleTransfer = async () => {
        setIsLoading(true);
        await transferProfitToCash();
        setIsLoading(false);
    };

    return (
        <div className="bg-surface p-4 rounded-lg border border-border-color flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-lg flex items-center mb-2">
                    <BanknotesIcon className="h-6 w-6 mr-2 text-primary" />
                    Profit Wallet
                </h3>
                <p className="text-3xl font-bold text-primary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adminWallets.profit)}
                </p>

                {/* Trend Chart */}
                <div className="mt-4">
                    <p className="text-xs font-semibold text-text-secondary">Profit Trend (Last 7 Days)</p>
                    <div className="h-16 w-full flex items-end space-x-1 mt-1">
                        {trendData.map((value, i) => (
                            <div key={i} className="flex-1 bg-primary/20 rounded-t" style={{ height: `${(value / maxTrendValue) * 100}%` }}></div>
                        ))}
                    </div>
                </div>

                {/* Sources Chart */}
                <div className="mt-4">
                    <p className="text-xs font-semibold text-text-secondary">Profit Sources</p>
                    <div className="w-full bg-surface-light rounded-full h-4 mt-1 flex overflow-hidden">
                        {profitSources.map(source => (
                            <div key={source.name} className="bg-primary h-4" style={{ width: `${(source.value / totalProfitSource) * 100}%` }} title={`${source.name}: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(source.value)}`}></div>
                        ))}
                    </div>
                </div>
            </div>

            <button onClick={handleTransfer} disabled={isLoading || adminWallets.profit <= 0} className="w-full mt-4 btn-primary text-sm py-2 rounded flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed">
                {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 
                (<> <ArrowUpRightIcon className="h-4 w-4 mr-2" /> Transfer to Cash</>)}
            </button>
        </div>
    );
};

export default ProfitWalletCard;