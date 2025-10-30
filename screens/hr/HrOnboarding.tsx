import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
// FIX: Replaced useData with useCore as it is the correct exported member from DataContext.
import { useCore } from '../../contexts/DataContext';
import { User } from '../../types';
import { PlusIcon, ArrowUpTrayIcon } from '@heroicons/react/24/solid';
import AddEmployeeModal from '../../components/hr/AddEmployeeModal';
import BulkUploadModal from '../../components/hr/BulkUploadModal';

const HrOnboarding: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users, updateUserStatus } = useCore();
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);


    const branchEmployees = useMemo(() => {
        if (!hrUser || hrUser.role !== 'HR') return [];
        return users.filter(u => u.profile.branch === hrUser.profile.branch && u.role === 'User')
            .sort((a, b) => new Date(b.profile.joinDate || 0).getTime() - new Date(a.profile.joinDate || 0).getTime());
    }, [users, hrUser]);

    const handleOffboard = (employee: User) => {
        if (window.confirm(`Are you sure you want to offboard (deactivate) ${employee.profile.name}? This action cannot be undone easily.`)) {
            updateUserStatus(employee.id, 'inactive');
        }
    };

    return (
        <>
            <div className="p-4 space-y-6">
                <div className="flex justify-between items-center">
                    <h1 className="text-3xl font-bold text-primary">Manajemen Karyawan - Onboarding & Offboarding</h1>
                    <div className="flex space-x-2">
                        <button 
                            onClick={() => setIsBulkUploadModalOpen(true)}
                            className="btn-secondary flex items-center px-4 py-2 rounded-lg font-bold"
                        >
                            <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                            Unggah Massal
                        </button>
                        <button 
                            onClick={() => setIsAddModalOpen(true)}
                            className="btn-primary flex items-center px-4 py-2 rounded-lg font-bold"
                        >
                            <PlusIcon className="h-5 w-5 mr-2" />
                            Tambah Karyawan Baru
                        </button>
                    </div>
                </div>
                <p className="text-text-secondary">Lihat daftar karyawan di cabang Anda dan kelola status mereka.</p>

                <div className="bg-surface p-4 rounded-lg border border-border-color">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-surface-light">
                                <tr>
                                    <th className="px-6 py-3">Nama Karyawan</th>
                                    <th className="px-6 py-3">Email</th>
                                    <th className="px-6 py-3">Tanggal Bergabung</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {branchEmployees.map(emp => (
                                    <tr key={emp.id} className="border-b border-border-color">
                                        <td className="px-6 py-4 font-medium text-text-primary">{emp.profile.name}</td>
                                        <td className="px-6 py-4">{emp.email}</td>
                                        <td className="px-6 py-4">{emp.profile.joinDate ? new Date(emp.profile.joinDate).toLocaleDateString() : 'N/A'}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${emp.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                {emp.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            {emp.status === 'active' && (
                                                <button onClick={() => handleOffboard(emp)} className="font-medium text-secondary hover:underline">
                                                    Offboard
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <AddEmployeeModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <BulkUploadModal isOpen={isBulkUploadModalOpen} onClose={() => setIsBulkUploadModalOpen(false)} />
        </>
    );
};

export default HrOnboarding;