import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Transaction } from '../../types';
import { BanknotesIcon, ArrowTrendingUpIcon, ShieldCheckIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import AnomalyDetectionWidget from '../../components/admin/financial/AnomalyDetectionWidget';
import ReportGenerator from '../../components/admin/financial/ReportGenerator';
import AIForecasting from '../../components/admin/financial/AIForecasting';

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

type Tab = 'Overview' | 'Risk Management' | 'Business Intelligence';

const AdminFinancialHub: React.FC = () => {
    const { transactions, adminWallets, reverseTransaction } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState<Tab>('Overview');
    const [reversingTxId, setReversingTxId] = useState<string | null>(null);

    const gmv = useMemo(() => transactions
        .filter(tx => tx.type === 'Marketplace' || tx.type === 'Teleconsultation' || tx.type === 'PPOB')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0), [transactions]);
    
    const handleReverse = async (txId: string) => {
        if (window.confirm("Are you sure you want to reverse this transaction? This will create a new transaction to refund the user.")) {
            setReversingTxId(txId);
            await reverseTransaction(txId);
            setReversingTxId(null);
        }
    };

    const filteredTransactions = transactions.filter(tx => 
        tx.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    const renderContent = () => {
        switch (activeTab) {
            case 'Risk Management':
                return (
                    <div className="space-y-6">
                        <AnomalyDetectionWidget />
                        <div className="bg-surface p-6 rounded-lg border border-border-color">
                            <h2 className="text-xl font-bold mb-4">Dispute Resolution Center</h2>
                            <p className="text-text-secondary">This feature is under construction. It will allow admins to mediate transaction disputes between users.</p>
                        </div>
                    </div>
                );
            case 'Business Intelligence':
                return (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <ReportGenerator />
                        <AIForecasting />
                    </div>
                );
            case 'Overview':
            default:
                return (
                    <div className="bg-surface p-6 rounded-lg border border-border-color">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-xl font-bold">Transaction Explorer</h2>
                            <input 
                                type="text"
                                placeholder="Search by user, description, ID..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-1/3 p-2 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary"
                            />
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs text-text-secondary uppercase bg-surface-light">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Timestamp</th>
                                        <th scope="col" className="px-6 py-3">User</th>
                                        <th scope="col" className="px-6 py-3">Type</th>
                                        <th scope="col" className="px-6 py-3">Amount</th>
                                        <th scope="col" className="px-6 py-3">Description</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTransactions.map(tx => (
                                        <tr key={tx.id} className="bg-surface border-b border-border-color">
                                            <td className="px-6 py-4">{new Date(tx.timestamp).toLocaleString()}</td>
                                            <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{tx.userName}</td>
                                            <td className="px-6 py-4">{tx.type}</td>
                                            <td className={`px-6 py-4 font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
                                            </td>
                                            <td className="px-6 py-4">{tx.description}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.status === 'Completed' ? 'bg-green-500/20 text-green-400' : tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{tx.status}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                {tx.status === 'Completed' && tx.type !== 'Reversal' && tx.type !== 'Refund' && (
                                                     <button 
                                                        onClick={() => handleReverse(tx.id)} 
                                                        disabled={reversingTxId === tx.id}
                                                        className="font-medium text-secondary hover:underline disabled:text-gray-500 disabled:cursor-not-allowed w-20 text-center">
                                                        {reversingTxId === tx.id ? (
                                                            <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin mx-auto"></div>
                                                        ) : 'Reverse'}
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredTransactions.length === 0 && <p className="text-center py-4">No transactions found.</p>}
                        </div>
                    </div>
                );
        }
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Financial Command Center</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total GMV" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(gmv)} icon={ArrowTrendingUpIcon} />
                <StatCard title="Platform Profit" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adminWallets.profit)} icon={BanknotesIcon} />
                <StatCard title="Platform Tax" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adminWallets.tax)} icon={DocumentTextIcon} />
                <StatCard title="Platform Cash" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adminWallets.cash)} icon={ShieldCheckIcon} />
            </div>

            <div className="flex border-b border-border-color">
                {(['Overview', 'Risk Management', 'Business Intelligence'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            <div>{renderContent()}</div>
        </div>
    );
};

export default AdminFinancialHub;