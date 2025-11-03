import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import { CreditCardIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';

const HrPayLaterManagement: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users, approvePayLaterByHr, rejectPayLater } = useData();
    const [processingId, setProcessingId] = useState<string | null>(null);

    const pendingApplications = useMemo(() => 
        users.filter(u => u.profile.branch === hrUser?.profile.branch && u.payLater?.status === 'pending'), 
    [users, hrUser]);
    
    const historyApplications = useMemo(() => 
        users.filter(u => u.profile.branch === hrUser?.profile.branch && u.payLater && u.payLater.status !== 'pending' && u.payLater.status !== 'not_applied')
        .sort((a,b) => (a.profile.name > b.profile.name ? 1 : -1)), 
    [users, hrUser]);

    const handleApprove = async (userId: string) => {
        setProcessingId(userId);
        await approvePayLaterByHr(userId);
        setProcessingId(null);
    };

    const handleReject = async (userId: string) => {
        if (window.confirm("Are you sure you want to reject this application?")) {
            setProcessingId(userId);
            await rejectPayLater(userId);
            setProcessingId(null);
        }
    };

    const renderTable = (title: string, data: User[], isHistory = false) => (
        <div className="bg-surface p-4 rounded-lg border border-border-color">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className={`overflow-x-auto ${isHistory ? 'max-h-96' : ''}`}>
                {data.length > 0 ? (
                    <table className="w-full text-sm text-left">
                        <thead className="text-xs uppercase bg-surface-light sticky top-0">
                            <tr>
                                <th className="px-6 py-3">Karyawan</th>
                                <th className="px-6 py-3">Tanggal Bergabung</th>
                                <th className="px-6 py-3">Tipe Karyawan</th>
                                <th className="px-6 py-3 text-center">Status / Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(user => (
                                <tr key={user.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium">{user.profile.name}</td>
                                    <td className="px-6 py-4">{user.profile.joinDate ? new Date(user.profile.joinDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4">{user.profile.employeeType}</td>
                                    <td className="px-6 py-4">
                                        {isHistory ? (
                                            <div className="text-center">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${
                                                    user.payLater?.status === 'approved' ? 'bg-green-500/20 text-green-400' :
                                                    user.payLater?.status === 'rejected' ? 'bg-red-500/20 text-red-400' :
                                                    'bg-blue-500/20 text-blue-400'
                                                }`}>{user.payLater?.status}</span>
                                            </div>
                                        ) : (
                                            processingId === user.id ? (
                                                <div className="flex justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                                            ) : (
                                                <div className="flex justify-center space-x-2">
                                                    <button onClick={() => handleApprove(user.id)} title="Verify & Forward"><CheckCircleIcon className="h-6 w-6 text-green-500 hover:opacity-70"/></button>
                                                    <button onClick={() => handleReject(user.id)} title="Reject"><XCircleIcon className="h-6 w-6 text-red-500 hover:opacity-70"/></button>
                                                </div>
                                            )
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-center py-8 text-text-secondary">Tidak ada data.</p>}
            </div>
        </div>
    );

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary flex items-center">
                <CreditCardIcon className="h-8 w-8 mr-2" />
                Verifikasi PayLater
            </h1>
            <p className="text-text-secondary">Lakukan verifikasi awal pada pengajuan PayLater sebelum diteruskan ke departemen Keuangan.</p>

            {renderTable("Aplikasi Menunggu Verifikasi", pendingApplications)}
            {renderTable("Riwayat Aplikasi", historyApplications, true)}
        </div>
    );
};

export default HrPayLaterManagement;
