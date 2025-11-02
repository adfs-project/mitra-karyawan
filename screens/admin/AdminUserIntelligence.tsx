import React, { useState, useMemo } from 'react';
// FIX: Replaced useCore with useApp as it is the correct exported member from AppContext.
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { User, Role } from '../../types';
import WalletAdjustmentModal from '../../components/admin/financial/WalletAdjustmentModal';
import UserDetailsModal from '../../components/admin/user/UserDetailsModal';
import { XMarkIcon, CheckIcon, PlusIcon } from '@heroicons/react/24/solid';
import AddHrAccountModal from '../../components/admin/user/AddHrAccountModal';
import AddFinanceAccountModal from '../../components/admin/user/AddFinanceAccountModal';

const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean }> = ({ checked, onChange, disabled }) => {
    return (
        <label className={`relative inline-flex items-center cursor-pointer ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
            <input type="checkbox" checked={checked} onChange={(e) => !disabled && onChange(e.target.checked)} className="sr-only peer" disabled={disabled} />
            <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
        </label>
    );
};

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-lg shadow-lg w-full max-w-md border border-border-color">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <div className="text-text-secondary mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded btn-secondary">Confirm</button>
                </div>
            </div>
        </div>
    );
};

const AdminUserIntelligence: React.FC = () => {
    const { users, updateUserStatus } = useData();
    const { user: currentUser } = useAuth();
    const [statusModalOpen, setStatusModalOpen] = useState(false);
    const [walletModalOpen, setWalletModalOpen] = useState(false);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [isHrModalOpen, setIsHrModalOpen] = useState(false);
    const [isFinanceModalOpen, setIsFinanceModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [action, setAction] = useState<'activate' | 'deactivate' | null>(null);
    const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

    const handleToggleChange = (userToUpdate: User, newStatus: boolean) => {
        setSelectedUser(userToUpdate);
        setAction(newStatus ? 'activate' : 'deactivate');
        setStatusModalOpen(true);
    };

    const confirmStatusAction = async () => {
        if (selectedUser && action) {
            setUpdatingUserId(selectedUser.id);
            setStatusModalOpen(false);

            const result = await updateUserStatus(selectedUser.id, action === 'activate' ? 'active' : 'inactive');

            if (!result.success) {
                alert(`Failed to update status for ${selectedUser.profile.name}. Please try again.`);
            }

            setUpdatingUserId(null);
            setSelectedUser(null);
            setAction(null);
        } else {
            setStatusModalOpen(false);
            setSelectedUser(null);
            setAction(null);
        }
    };

    const handleManageWallet = (userToManage: User) => {
        setSelectedUser(userToManage);
        setWalletModalOpen(true);
    };
    
    const handleShowDetails = (userToShow: User) => {
        setSelectedUser(userToShow);
        setDetailsModalOpen(true);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">User Intelligence</h1>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => setIsHrModalOpen(true)}
                        className="btn-primary flex items-center px-4 py-2 rounded-lg font-bold"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add HR Account
                    </button>
                    <button 
                        onClick={() => setIsFinanceModalOpen(true)}
                        className="btn-secondary flex items-center px-4 py-2 rounded-lg font-bold"
                    >
                        <PlusIcon className="h-5 w-5 mr-2" />
                        Add Finance Account
                    </button>
                </div>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">User Management</h2>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-surface-light">
                            <tr>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">Role</th>
                                <th scope="col" className="px-6 py-3">Balance</th>
                                <th scope="col" className="px-6 py-3 text-center">Status (Active/Inactive)</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user.id} className="bg-surface border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">
                                        <div className="flex items-center">
                                            <img src={user.profile.photoUrl} alt={user.profile.name} className="w-10 h-10 rounded-full mr-3" />
                                            <div>
                                                <div>{user.profile.name}</div>
                                                <div className="text-xs text-text-secondary">{user.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{user.role}</td>
                                    <td className={`px-6 py-4 font-semibold ${user.wallet.isFrozen ? 'text-red-500' : ''}`}>
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user.wallet.balance)}
                                        {user.wallet.isFrozen && <span className="text-xs block"> (FROZEN)</span>}
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        <div className="flex justify-center items-center h-6">
                                            {updatingUserId === user.id ? (
                                                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                                            ) : (
                                                <Toggle
                                                    checked={user.status === 'active'}
                                                    onChange={(checked) => handleToggleChange(user, checked)}
                                                    disabled={user.id === currentUser?.id}
                                                />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 space-x-2">
                                        <button onClick={() => handleManageWallet(user)} className="font-medium text-primary hover:underline">Manage Wallet</button>
                                        <button onClick={() => handleShowDetails(user)} className="font-medium text-primary hover:underline">Details</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ConfirmationModal
                isOpen={statusModalOpen}
                onClose={() => setStatusModalOpen(false)}
                onConfirm={confirmStatusAction}
                title={`Confirm Account ${action === 'activate' ? 'Activation' : 'Deactivation'}`}
            >
                <p>Are you sure you want to <span className="font-bold">{action}</span> the account for <span className="font-bold">{selectedUser?.profile.name}</span>?</p>
                {action === 'deactivate' && <p className="mt-2 text-yellow-400">This will immediately log the user out and block their access to the application.</p>}
            </ConfirmationModal>

            <WalletAdjustmentModal 
                isOpen={walletModalOpen}
                onClose={() => setWalletModalOpen(false)}
                user={selectedUser}
            />
            <UserDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                user={selectedUser}
            />
            <AddHrAccountModal
                isOpen={isHrModalOpen}
                onClose={() => setIsHrModalOpen(false)}
            />
            <AddFinanceAccountModal
                isOpen={isFinanceModalOpen}
                onClose={() => setIsFinanceModalOpen(false)}
            />
        </div>
    );
};

export default AdminUserIntelligence;
