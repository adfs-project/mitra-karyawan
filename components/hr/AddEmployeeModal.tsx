import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { UserProfile } from '../../types';

interface AddEmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialFormState = {
    name: '',
    email: '',
    phone: '',
    password: '',
    placeOfBirth: '',
    dateOfBirth: '',
    salary: 0,
    employmentStatus: 'Private Employee' as UserProfile['employmentStatus'],
    companyName: 'Mitra Karyawan',
    joinDate: '',
    employeeType: 'Contract' as UserProfile['employeeType'],
};

const AddEmployeeModal: React.FC<AddEmployeeModalProps> = ({ isOpen, onClose }) => {
    const { createEmployee } = useAuth();
    const { showToast } = useData();
    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'salary' ? Number(value) : value }));
    };

    const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, employeeType: e.target.value as UserProfile['employeeType'] }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!formData.email || !formData.password || !formData.name) {
            setError('Nama Lengkap, Email, dan Password harus diisi.');
            return;
        }

        setIsLoading(true);
        const { email, password, ...profileData } = formData;
        
        const result = await createEmployee({
            email,
            password,
            profile: profileData,
        });

        setIsLoading(false);

        if (result === 'success') {
            showToast(`Akun untuk ${formData.name} berhasil dibuat.`, 'success');
            setFormData(initialFormState);
            onClose();
        } else if (result === 'exists') {
            setError(`Email ${formData.email} sudah terdaftar.`);
            showToast(`Email ${formData.email} sudah terdaftar.`, 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-3xl border border-border-color max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Create an Account</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Personal Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                        <div>
                            <label className="text-sm font-bold text-text-secondary block mb-1">Full Name</label>
                            <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text-secondary block mb-1">Email Address</label>
                            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text-secondary block mb-1">Phone Number</label>
                            <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text-secondary block mb-1">Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                         <div>
                            <label className="text-sm font-bold text-text-secondary block mb-1">Place of Birth</label>
                            <input type="text" name="placeOfBirth" value={formData.placeOfBirth} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text-secondary block mb-1">Date of Birth</label>
                            <input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                    </div>
                    
                    {/* Employment Info */}
                    <div>
                        <h3 className="text-lg font-bold text-text-primary mt-4 mb-2 border-t border-border-color pt-4">Employment Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                             <div>
                                <label className="text-sm font-bold text-text-secondary block mb-1">Monthly Salary (IDR)</label>
                                <input type="number" name="salary" value={formData.salary || ''} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-secondary block mb-1">Employment Status</label>
                                <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color">
                                    <option>Private Employee</option>
                                    <option>Civil Servant</option>
                                    <option>State-Owned Enterprise</option>
                                    <option>Freelance</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-secondary block mb-1">Company Name</label>
                                <input type="text" name="companyName" value={formData.companyName} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-secondary block mb-1">Employment Start Date</label>
                                <input type="date" name="joinDate" value={formData.joinDate} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-secondary block mb-1">Employee Type</label>
                                <div className="flex items-center space-x-4 mt-2">
                                    <label className="flex items-center cursor-pointer">
                                        <input type="radio" name="employeeType" value="Contract" checked={formData.employeeType === 'Contract'} onChange={handleRadioChange} className="form-radio h-4 w-4 text-primary bg-surface-light border-border-color focus:ring-primary" />
                                        <span className="ml-2 text-text-primary">Contract</span>
                                    </label>
                                     <label className="flex items-center cursor-pointer">
                                        <input type="radio" name="employeeType" value="Permanent" checked={formData.employeeType === 'Permanent'} onChange={handleRadioChange} className="form-radio h-4 w-4 text-primary bg-surface-light border-border-color focus:ring-primary" />
                                        <span className="ml-2 text-text-primary">Permanent</span>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="flex justify-end space-x-4 pt-4 border-t border-border-color">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-6 py-2 rounded bg-surface-light">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-primary px-6 py-2 rounded font-bold w-36 flex justify-center">
                            {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Register'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddEmployeeModal;