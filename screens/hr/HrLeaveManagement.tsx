import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import { useHR } from '../../hooks/useHR';

const HrLeaveManagement: React.FC = () => {
    const { user } = useAuth();
    const { leaveRequests, updateLeaveRequestStatus } = useHR();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const branchLeaveRequests = useMemo(() => {
        if (!user || user.role !== 'HR') return [];
        return leaveRequests.filter(req => req.branch === user.profile.branch);
    }, [leaveRequests, user]);

    const pendingRequests = branchLeaveRequests.filter(req => req.status === 'Pending');
    const historyRequests = branchLeaveRequests.filter(req => req.status !== 'Pending').sort((a,b) => b.id.localeCompare(a.id));

    const handleAction = async (id: string, status: 'Approved' | 'Rejected') => {
        setProcessingId(id);
        await updateLeaveRequestStatus(id, status);
        setProcessingId(null);
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Manajemen Cuti</h1>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Permintaan Cuti Menunggu Persetujuan</h2>
                <div className="overflow-x-auto">
                    {pendingRequests.length > 0 ? (
                         <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-surface-light">
                                <tr>
                                    <th className="px-6 py-3">Karyawan</th>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3">Alasan</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingRequests.map(req => (
                                    <tr key={req.id} className="border-b border-border-color">
                                        <td className="px-6 py-4 font-medium text-text-primary">{req.userName}</td>
                                        <td className="px-6 py-4">{req.startDate} s/d {req.endDate}</td>
                                        <td className="px-6 py-4 max-w-xs truncate">{req.reason}</td>
                                        <td className="px-6 py-4">
                                            {processingId === req.id ? (
                                                <div className="flex justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                                            ) : (
                                                <div className="flex justify-center space-x-2">
                                                    <button onClick={() => handleAction(req.id, 'Approved')} className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/40"><CheckCircleIcon className="h-5 w-5 text-green-400" /></button>
                                                    <button onClick={() => handleAction(req.id, 'Rejected')} className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40"><XCircleIcon className="h-5 w-5 text-red-400" /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center py-4">Tidak ada permintaan cuti yang menunggu.</p>
                    )}
                </div>
            </div>
             <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Riwayat Permintaan Cuti</h2>
                 <div className="overflow-x-auto max-h-96">
                     <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface-light sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Karyawan</th>
                                <th className="px-6 py-3">Tanggal</th>
                                <th className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyRequests.map(req => (
                                <tr key={req.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary">{req.userName}</td>
                                    <td className="px-6 py-4">{req.startDate} s/d {req.endDate}</td>
                                    <td className="px-6 py-4">
                                         <span className={`px-2 py-1 rounded-full text-xs font-semibold ${req.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{req.status}</span>
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

export default HrLeaveManagement;
