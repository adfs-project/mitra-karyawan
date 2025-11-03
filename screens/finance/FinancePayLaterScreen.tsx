import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import { CreditCardIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import SetPayLaterLimitModal from '../../components/finance/SetPayLaterLimitModal';

const FinancePayLaterScreen: React.FC = () => {
    const { users, rejectPayLater } = useData();
    const [isLimitModalOpen, setIsLimitModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // FIX: Changed filter from 'pending' to 'Pending Finance Approval' for the finance queue.
    const pendingApplications = useMemo(() => users.filter(u => u.payLater?.status === 'Pending Finance Approval'), [users]);
    const historyApplications = useMemo(() => users.filter(u => u.payLater?.status === 'approved' || u.payLater?.status === 'rejected').sort((a,b) => (a.profile.name > b.profile.name ? 1 : -1)), [users]);

    const handleOpenApproveModal = (user: User) => {
        setSelectedUser(user);
        setIsLimitModalOpen(true);
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
                                <th className="px-6 py-3">Cabang</th>
                                <th className="px-6 py-3">Tanggal Bergabung</th>
                                <th className="px-6 py-3 text-center">Status / Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.map(user => (
                                <tr key={user.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium">{user.profile.name}</td>
                                    <td className="px-6 py-4">{user.profile.branch}</td>
                                    <td className="px-6 py-4">{user.profile.joinDate ? new Date(user.profile.joinDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        {isHistory ? (
                                            <div className="text-center">
                                                <span className={`px-2 py-1 text-xs font-bold rounded-full ${user.payLater?.status === 'approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{user.payLater?.status}</span>
                                                {user.payLater?.status === 'approved' && <span className="block text-xs">Limit: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user.payLater.limit || 0)}</span>}
                                            </div>
                                        ) : (
                                            processingId === user.id ? (
                                                <div className="flex justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                                            ) : (
                                                <div className="flex justify-center space-x-2">
                                                    <button onClick={() => handleOpenApproveModal(user)} title="Approve"><CheckCircleIcon className="h-6 w-6 text-green-500 hover:opacity-70"/></button>
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
        <>
            <div className="space-y-6">
                <h1 className="text-3xl font-bold text-primary flex items-center">
                    <CreditCardIcon className="h-8 w-8 mr-2" />
                    Persetujuan PayLater
                </h1>
                <p className="text-text-secondary">Tinjau dan setujui aplikasi PayLater yang diajukan oleh karyawan.</p>

                {renderTable("Aplikasi Menunggu Persetujuan", pendingApplications)}
                {renderTable("Riwayat Aplikasi", historyApplications, true)}
            </div>
            <SetPayLaterLimitModal
                isOpen={isLimitModalOpen}
                onClose={() => setIsLimitModalOpen(false)}
                user={selectedUser}
            />
        </>
    );
};

export default FinancePayLaterScreen;