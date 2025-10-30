import React, { useMemo } from 'react';
// FIX: Replaced useData with useCore as it is the correct exported member from DataContext.
import { useCore } from '../../../contexts/DataContext';
import { ArrowLongRightIcon, UserGroupIcon, BuildingStorefrontIcon, BanknotesIcon, DocumentTextIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

const Node: React.FC<{ title: string; value: number; icon: React.ElementType; color: string; }> = ({ title, value, icon: Icon, color }) => (
    <div className="bg-surface p-3 rounded-lg border border-border-color w-48 text-center">
        <Icon className={`h-6 w-6 mx-auto ${color}`} />
        <p className="text-sm font-bold mt-1">{title}</p>
        <p className={`text-lg font-bold ${color}`}>{formatCurrency(value)}</p>
    </div>
);

const Connector: React.FC<{ height?: string }> = ({ height = 'h-12' }) => (
    <div className={`flex items-center justify-center w-24 ${height}`}>
        <ArrowLongRightIcon className="h-6 w-6 text-text-secondary" />
    </div>
);

const SankeyDiagram: React.FC = () => {
    const { transactions } = useCore();

    const data = useMemo(() => {
        const totalTopUps = transactions.filter(t => t.type === 'Top-Up').reduce((s, t) => s + t.amount, 0);
        
        const marketplaceSales = transactions.filter(t => t.type === 'Marketplace' && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        const ppnFromSales = transactions.filter(t => t.type === 'Tax' && t.description.includes('PPN')).reduce((s, t) => s + t.amount, 0);
        const commissions = transactions.filter(t => t.type === 'Commission').reduce((s, t) => s + t.amount, 0);
        const sellerPayouts = marketplaceSales - ppnFromSales - commissions;

        const consultationFees = transactions.filter(t => t.type === 'Teleconsultation' && t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
        const pph21FromFees = transactions.filter(t => t.type === 'Tax' && t.description.includes('PPh 21')).reduce((s, t) => s + t.amount, 0);
        const doctorPayouts = consultationFees - pph21FromFees;

        return { totalTopUps, sellerPayouts, commissions, ppnFromSales, doctorPayouts, pph21FromFees };
    }, [transactions]);

    return (
        <div className="bg-surface p-6 rounded-lg border border-border-color">
            <h2 className="text-xl font-bold mb-6">Visualisasi Aliran Dana Platform (Simulasi)</h2>
            <div className="flex flex-col items-center space-y-4 md:space-y-0 md:flex-row md:justify-center md:items-start md:space-x-4">
                {/* Column 1: Source */}
                <div className="flex flex-col items-center space-y-4">
                    <h3 className="font-bold text-text-secondary">SUMBER DANA</h3>
                    <Node title="User Top-ups" value={data.totalTopUps} icon={UserGroupIcon} color="text-green-400" />
                </div>

                <Connector height="h-32" />

                {/* Column 2: Distribution */}
                <div className="flex flex-col items-center space-y-4">
                    <h3 className="font-bold text-text-secondary">DISTRIBUSI</h3>
                    <Node title="Seller Payouts" value={data.sellerPayouts} icon={BuildingStorefrontIcon} color="text-text-primary" />
                    <Node title="Doctor Payouts" value={data.doctorPayouts} icon={UserGroupIcon} color="text-text-primary" />
                </div>
                
                <Connector height="h-32" />

                {/* Column 3: Platform Earnings */}
                <div className="flex flex-col items-center space-y-4">
                    <h3 className="font-bold text-text-secondary">PLATFORM</h3>
                    <Node title="Platform Profit" value={data.commissions} icon={BanknotesIcon} color="text-primary" />
                    <Node title="Platform Tax" value={data.ppnFromSales + data.pph21FromFees} icon={DocumentTextIcon} color="text-secondary" />
                </div>
                
                <Connector height="h-32" />
                
                {/* Column 4: Final Destination */}
                <div className="flex flex-col items-center space-y-4">
                     <h3 className="font-bold text-text-secondary">AKHIR</h3>
                    <Node title="Platform Cash" value={data.commissions} icon={ShieldCheckIcon} color="text-blue-400" />
                    <Node title="Paid to Gov't" value={data.ppnFromSales + data.pph21FromFees} icon={ShieldCheckIcon} color="text-blue-400" />
                </div>
            </div>
            <p className="text-center text-xs text-text-secondary mt-6">*Diagram ini adalah representasi yang disederhanakan untuk tujuan demonstrasi.</p>
        </div>
    );
};

export default SankeyDiagram;