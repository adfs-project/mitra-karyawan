import React, { useMemo, useState } from 'react';
import { GiftIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { InsuranceClaim } from '../../types';

const HrBenefitManagement: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { insuranceClaims, approveInsuranceClaim, rejectInsuranceClaim } = useData();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const branchClaims = useMemo(() => {
        if (!hrUser) return [];
        return insuranceClaims.filter(c => c.branch === hrUser.profile.branch);
    }, [insuranceClaims, hrUser]);

    const pendingClaims = branchClaims.filter(c => c.status === 'Pending');
    const historyClaims = branchClaims.filter(c => c.status !== 'Pending');

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setProcessingId(id);
        if (action === 'approve') {
            await approveInsuranceClaim(id);
        } else {
            await rejectInsuranceClaim(id);
        }
        setProcessingId(null);
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary flex items-center">
                <GiftIcon className="h-8 w-8 mr-2" />
                Benefit & Claim Management
            </h1>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Pending Insurance Claims</h2>
                <div className="overflow-x-auto">
                    {pendingClaims.length > 0 ? (
                        <table className="w-full text-sm">
                            <thead className="text-xs uppercase bg-surface-light text-left">
                                <tr>
                                    <th className="px-6 py-3">Employee</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Date</th>
                                    <th className="px-6 py-3">Receipt</th>
                                    <th className="px-6 py-3 text-center">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingClaims.map(claim => (
                                    <tr key={claim.id} className="border-b border-border-color">
                                        <td className="px-6 py-4 font-medium">{claim.userName}</td>
                                        <td className="px-6 py-4">{claim.type}</td>
                                        <td className="px-6 py-4 font-semibold">{new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(claim.amount)}</td>
                                        <td className="px-6 py-4">{new Date(claim.submissionDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4"><a href={claim.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">View</a></td>
                                        <td className="px-6 py-4">
                                            {processingId === claim.id ? (
                                                <div className="flex justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                                            ) : (
                                                <div className="flex justify-center space-x-2">
                                                    <button onClick={() => handleAction(claim.id, 'approve')} title="Approve"><CheckCircleIcon className="h-6 w-6 text-green-500 hover:opacity-70"/></button>
                                                    <button onClick={() => handleAction(claim.id, 'reject')} title="Reject"><XCircleIcon className="h-6 w-6 text-red-500 hover:opacity-70"/></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="text-center py-8 text-text-secondary">No pending claims.</p>}
                </div>
            </div>

             <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Claim History</h2>
                 <div className="overflow-x-auto max-h-72">
                     <table className="w-full text-sm">
                            <thead className="text-xs uppercase bg-surface-light text-left sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Employee</th>
                                    <th className="px-6 py-3">Type</th>
                                    <th className="px-6 py-3">Amount</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyClaims.map(claim => (
                                     <tr key={claim.id} className="border-b border-border-color">
                                        <td className="px-6 py-4 font-medium">{claim.userName}</td>
                                        <td className="px-6 py-4">{claim.type}</td>
                                        <td className="px-6 py-4 font-semibold">{new Intl.NumberFormat('id-ID', {style:'currency', currency:'IDR'}).format(claim.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-bold rounded-full ${claim.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{claim.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                 </div>
            </div>
        </div>
    );
};

export default HrBenefitManagement;