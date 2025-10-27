
import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';

const HrOnboarding: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users, updateUserStatus } = useData();

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
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Manajemen Karyawan - Onboarding & Offboarding</h1>
            <p className="text-text-secondary">Lihat daftar karyawan di cabang Anda dan kelola status mereka.</p>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface-light">
                            <tr>
                                <th className="px-6 py-3">Nama Karyawan</th>
                                <th className="px-6 py-3">Email</th>
                                <th className="px-6 py-3">Tanggal Bergabung</th>
                                <th className="px-6 py-3">Gaji Pokok</th>
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
                                    <td className="px-6 py-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(emp.profile.salary || 0)}</td>
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
    );
};

export default HrOnboarding;
