import React, { useMemo, useState } from 'react';
import ProfitWalletCard from '../../components/admin/financial/ProfitWalletCard';
import TaxWalletCard from '../../components/admin/financial/TaxWalletCard';
import CashWalletCard from '../../components/admin/financial/CashWalletCard';
import AnomalyDetectionWidget from '../../components/admin/financial/AnomalyDetectionWidget';
import ReportGenerator from '../../components/admin/financial/ReportGenerator';
import SankeyDiagram from '../../components/admin/financial/SankeyDiagram';
import AIForecasting from '../../components/admin/financial/AIForecasting';
import { useApp } from '../../contexts/AppContext';
import { ShieldExclamationIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { Dispute } from '../../types';

const DisputeManagementWidget: React.FC = () => {
    const { disputes, resolveDispute } = useApp();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const openDisputes = useMemo(() => disputes.filter(d => d.status === 'Open'), [disputes]);
    const resolvedDisputes = useMemo(() => disputes.filter(d => d.status !== 'Open').sort((a,b) => b.id.localeCompare(a.id)), [disputes]);
    
    const handleResolve = async (disputeId: string, resolution: 'grant_refund' | 'side_with_seller') => {
        setProcessingId(disputeId);
        await resolveDispute(disputeId, resolution, 'Admin');
        setProcessingId(null);
    }

    const renderTable = (title: string, data: Dispute[]) => (
        <div>
            <h3 className="text-lg font-bold mb-2">{title}</h3>
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                    <thead className="text-xs uppercase bg-surface-light">
                        <tr>
                            <th className="px-4 py-2">Order ID</th>
                            <th className="px-4 py-2">User</th>
                            <th className="px-4 py-2">Reason</th>
                            <th className="px-4 py-2">Date</th>
                            <th className="px-4 py-2 text-center">Action / Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.map(d => (
                            <tr key={d.id} className="border-b border-border-color">
                                <td className="px-4 py-2 font-mono text-xs">{d.orderId}</td>
                                <td className="px-4 py-2">{d.userId}</td>
                                <td className="px-4 py-2 truncate max-w-xs">{d.reason}</td>
                                <td className="px-4 py-2">{new Date(d.timestamp).toLocaleDateString()}</td>
                                <td className="px-4 py-2">
                                    {d.status === 'Open' ? (
                                        processingId === d.id ? (
                                             <div className="flex justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                                        ) : (
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => handleResolve(d.id, 'grant_refund')} className="p-1 rounded-full bg-green-500/20 hover:bg-green-500/40" title="Refund Buyer"><CheckCircleIcon className="h-5 w-5 text-green-400" /></button>
                                                <button onClick={() => handleResolve(d.id, 'side_with_seller')} className="p-1 rounded-full bg-red-500/20 hover:bg-red-500/40" title="Side with Seller"><XCircleIcon className="h-5 w-5 text-red-400" /></button>
                                            </div>
                                        )
                                    ) : (
                                        <div className="text-center">
                                            <span className="font-bold text-xs">{d.status}</span>
                                            <span className={`block text-[10px] ${d.resolutionMethod === 'Guardian' ? 'text-purple-400' : 'text-text-secondary'}`}>by {d.resolutionMethod}</span>
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                 {data.length === 0 && <p className="text-center text-xs text-text-secondary py-4">No disputes in this category.</p>}
            </div>
        </div>
    );

    return (
        <div className="bg-surface p-6 rounded-lg border border-border-color">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <ShieldExclamationIcon className="h-5 w-5 mr-2" /> Dispute Management
            </h2>
            <div className="space-y-6">
                {renderTable("Open Disputes", openDisputes)}
                <div className="max-h-60 overflow-y-auto">
                    {renderTable("Resolved Disputes History", resolvedDisputes)}
                </div>
            </div>
        </div>
    );
};


const AdminFinancialHub: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Financial Hub</h1>
            <p className="text-text-secondary">Overview of platform finances, revenue streams, and tax collection.</p>

            {/* Wallet Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <ProfitWalletCard />
                <TaxWalletCard />
                <CashWalletCard />
            </div>

            {/* AI Widgets & Disputes */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnomalyDetectionWidget />
                <AIForecasting />
                <div className="lg:col-span-2">
                    <DisputeManagementWidget />
                </div>
            </div>

            {/* Sankey Diagram */}
            <SankeyDiagram />

            {/* Report Generator */}
            <ReportGenerator />
        </div>
    );
};

export default AdminFinancialHub;