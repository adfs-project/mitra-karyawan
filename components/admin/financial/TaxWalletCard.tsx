import React, { useMemo, useState } from 'react';
// FIX: Replaced useData with useCore as it is the correct exported member from DataContext.
import { useCore } from '../../../contexts/DataContext';
import { DocumentTextIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const TaxWalletCard: React.FC = () => {
    const { adminWallets, transactions, recordTaxPayment } = useCore();
    const [isLoading, setIsLoading] = useState(false);

    const taxSources = useMemo(() => {
        const taxTransactions = transactions.filter(tx => tx.type === 'Tax');
        const ppn = taxTransactions.filter(tx => tx.description.includes('PPN')).reduce((sum, tx) => sum + tx.amount, 0);
        const pph21 = taxTransactions.filter(tx => tx.description.includes('PPh 21')).reduce((sum, tx) => sum + tx.amount, 0);
        return { ppn, pph21, total: ppn + pph21 };
    }, [transactions]);
    
    const handleRecordPayment = async () => {
        if(window.confirm(`Are you sure you want to record a tax payment of ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adminWallets.tax)}? This will deduct from cash and reset the tax wallet.`)) {
            setIsLoading(true);
            await recordTaxPayment();
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface p-4 rounded-lg border border-border-color flex flex-col justify-between">
            <div>
                <h3 className="font-bold text-lg flex items-center mb-2">
                    <DocumentTextIcon className="h-6 w-6 mr-2 text-secondary" />
                    Tax Wallet
                </h3>
                <p className="text-3xl font-bold text-secondary">
                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adminWallets.tax)}
                </p>

                {/* Tax Breakdown */}
                <div className="mt-4">
                    <p className="text-xs font-semibold text-text-secondary">Tax Collected Breakdown</p>
                    <div className="w-full bg-surface-light rounded-full h-4 mt-1 flex overflow-hidden">
                        <div className="bg-secondary/80 h-4" style={{ width: `${(taxSources.ppn / taxSources.total) * 100}%` }} title={`PPN: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(taxSources.ppn)}`}></div>
                        <div className="bg-secondary/40 h-4" style={{ width: `${(taxSources.pph21 / taxSources.total) * 100}%` }} title={`PPh 21: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(taxSources.pph21)}`}></div>
                    </div>
                    <div className="flex justify-between text-xs mt-1">
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-secondary/80 mr-1"></div>PPN</span>
                        <span className="flex items-center"><div className="w-2 h-2 rounded-full bg-secondary/40 mr-1"></div>PPh 21</span>
                    </div>
                </div>
            </div>

            <button onClick={handleRecordPayment} disabled={isLoading || adminWallets.tax <= 0} className="w-full mt-4 btn-secondary text-sm py-2 rounded flex items-center justify-center disabled:bg-gray-600 disabled:cursor-not-allowed">
                 {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 
                (<> <CheckCircleIcon className="h-4 w-4 mr-2" /> Record Tax Payment</>)}
            </button>
        </div>
    );
};

export default TaxWalletCard;