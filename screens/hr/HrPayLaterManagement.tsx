import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import { CheckIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ApprovePayLaterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (limit: number) => void;
    user: User | null;
}> = ({ isOpen, onClose, onConfirm, user }) => {
    const [limit, setLimit] = useState(2000000);
    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-lg w-full max-w-sm border border-border-color">
                <h2 className="text-xl font-bold mb-2">Approve PayLater</h2>
                <p className="text-sm text-text-secondary mb-4">Set credit limit for {user.profile.name}.</p>
                <div>
                    <label className="text-xs font-bold text-text-secondary">Credit Limit (IDR)</label>
                    <input
                        type="number"
                        value={limit}
                        onChange={(e) => setLimit(Number(e.target.value))}
                        className="w-full p-2 bg-surface-light rounded border border-border-color mt-1"
                    />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Cancel</button>
                    <button onClick={() => onConfirm(limit)} className="btn-primary px-4 py-2 rounded">Approve</button>
                </div>
            </div>
        </div>
    );
};


const HrPayLaterManagement: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users, approvePayLater, rejectPayLater } = useData();
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [approveModalOpen, setApproveModalOpen] = useState(false);
    
    const pendingPayLaterApps = useMemo(() => {
        if (!hrUser || hrUser.role !== 'HR') return [];
        return users.filter(u => u.profile.branch === hrUser.profile.branch && u.payLater?.status === 'pending');
    }, [users, hrUser]);

    const handleOpenApproveModal = (user: User) => {
        setSelectedUser(user);
        setApproveModalOpen(true);
    };

    const handleConfirmApproval = async (limit: number) => {
        if (selectedUser) {
            await approvePayLater(selectedUser.id, limit);
        }
        setApproveModalOpen(false);
        setSelectedUser(null);
    };

    const handleReject = async (user: User) => {
        if (window.confirm(`Are you sure you want to reject PayLater application for ${user.profile.name}?`)) {
            await rejectPayLater(user.id);
        }
    };


    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Manajemen PayLater</h1>
             <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Pengajuan PayLater Menunggu Persetujuan</h2>
                {pendingPayLaterApps.length > 0 ? (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-surface-light">
                            <tr>
                                <th scope="col" className="px-6 py-3">Karyawan</th>
                                <th scope="col" className="px-6 py-3">Gaji</th>
                                <th scope="col" className="px-6 py-3">Tanggal Bergabung</th>
                                <th scope="col" className="px-6 py-3 text-center">Aksi</th>
                            </tr>
                        </thead>
                         <tbody>
                            {pendingPayLaterApps.map(user => (
                                <tr key={user.id} className="bg-surface border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary">{user.profile.name}</td>
                                    <td className="px-6 py-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user.profile.salary || 0)}</td>
                                    <td className="px-6 py-4">{user.profile.joinDate ? new Date(user.profile.joinDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4 text-center space-x-2">
                                        <button onClick={() => handleOpenApproveModal(user)} className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/30" title="Approve">
                                            <CheckIcon className="h-5 w-5 text-green-400"/>
                                        </button>
                                        <button onClick={() => handleReject(user)} className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/30" title="Reject">
                                            <XMarkIcon className="h-5 w-5 text-red-400"/>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                ) : (
                    <p className="text-center text-text-secondary py-4">Tidak ada pengajuan PayLater yang menunggu.</p>
                )}
            </div>
            
            <ApprovePayLaterModal
                isOpen={approveModalOpen}
                onClose={() => setApproveModalOpen(false)}
                onConfirm={handleConfirmApproval}
                user={selectedUser}
            />
        </div>
    );
};

export default HrPayLaterManagement;