import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User, Role } from '../../types';
import { PlusIcon, XMarkIcon } from '@heroicons/react/24/solid';

const AddEmployeeModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    branch: string;
}> = ({ isOpen, onClose, branch }) => {
    const { createEmployee } = useData();
    const [formData, setFormData] = useState({
        name: '', email: '', phone: '', salary: 5000000, joinDate: new Date().toISOString().split('T')[0], password: 'password123'
    });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'salary' ? Number(value) : value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        const result = await createEmployee({
            email: formData.email,
            password: formData.password,
            profile: {
                name: formData.name,
                phone: formData.phone,
                photoUrl: `https://i.pravatar.cc/150?u=${formData.email}`,
                branch,
                salary: formData.salary,
                joinDate: formData.joinDate,
            },
        });

        if (result.success) {
            onClose();
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Tambah Karyawan Baru</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <input type="text" name="name" placeholder="Nama Lengkap" onChange={handleChange} required className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    <input type="email" name="email" placeholder="Email" onChange={handleChange} required className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    <input type="tel" name="phone" placeholder="Nomor Telepon" onChange={handleChange} required className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    <div>
                        <label className="text-sm text-text-secondary">Gaji Pokok (IDR)</label>
                        <input type="number" name="salary" value={formData.salary} onChange={handleChange} required className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                     <div>
                        <label className="text-sm text-text-secondary">Tanggal Bergabung</label>
                        <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} required className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Batal</button>
                        <button type="submit" disabled={isLoading} className="btn-primary px-4 py-2 rounded w-28 flex justify-center">{isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Simpan'}</button>
                    </div>
                </form>
            </div>
        </div>
    );
};


const HrOnboarding: React.FC = () => {
    const { user } = useAuth();
    const { users, updateUserStatus } = useData();
    const [isModalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const branchEmployees = useMemo(() => {
        if (!user || user.role !== 'HR') return [];
        return users
            .filter(u => u.profile.branch === user.profile.branch && u.role === 'User')
            .filter(u => u.profile.name.toLowerCase().includes(searchTerm.toLowerCase()) || u.email.toLowerCase().includes(searchTerm.toLowerCase()))
            .sort((a,b) => new Date(b.profile.joinDate || 0).getTime() - new Date(a.profile.joinDate || 0).getTime());
    }, [users, user, searchTerm]);

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Onboarding & Offboarding</h1>
                <button onClick={() => setModalOpen(true)} className="btn-primary flex items-center px-4 py-2 rounded-lg">
                    <PlusIcon className="h-5 w-5 mr-2" /> Tambah Karyawan
                </button>
            </div>
            
            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <input type="text" placeholder="Cari karyawan..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full p-2 bg-surface-light rounded-lg border border-border-color" />
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <div className="overflow-x-auto">
                     <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface-light">
                            <tr>
                                <th className="px-6 py-3">Nama</th>
                                <th className="px-6 py-3">Tanggal Bergabung</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {branchEmployees.map(employee => (
                                <tr key={employee.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary">{employee.profile.name}</td>
                                    <td className="px-6 py-4">{employee.profile.joinDate ? new Date(employee.profile.joinDate).toLocaleDateString() : 'N/A'}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${employee.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{employee.status}</span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <button onClick={() => updateUserStatus(employee.id, employee.status === 'active' ? 'inactive' : 'active')} className={`text-xs font-bold py-1 px-3 rounded ${employee.status === 'active' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-400'}`}>
                                            {employee.status === 'active' ? 'Nonaktifkan' : 'Aktifkan'}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <AddEmployeeModal isOpen={isModalOpen} onClose={() => setModalOpen(false)} branch={user?.profile.branch || ''} />
        </div>
    );
};

export default HrOnboarding;
