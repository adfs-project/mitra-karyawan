import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { UserProfile } from '../../../types';

interface AddHrAccountModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const initialFormState = {
    name: '',
    email: '',
    phone: '',
    password: '',
    branch: '',
    isHeadOfBranch: false,
};

const AddHrAccountModal: React.FC<AddHrAccountModalProps> = ({ isOpen, onClose }) => {
    const { createHrAccountByAdmin } = useAuth();
    const { showToast } = useData();
    const [formData, setFormData] = useState(initialFormState);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (!formData.email || !formData.password || !formData.name || !formData.branch) {
            setError('Name, Email, Password, and Branch are required.');
            return;
        }

        setIsLoading(true);
        const { email, password, ...profileData } = formData;
        
        const result = await createHrAccountByAdmin({
            email,
            password,
            profile: profileData,
        });

        setIsLoading(false);

        if (result === 'success') {
            showToast(`HR account for ${formData.name} created successfully.`, 'success');
            setFormData(initialFormState);
            onClose();
        } else if (result === 'exists') {
            setError(`Email ${formData.email} is already registered.`);
            showToast(`Email ${formData.email} is already registered.`, 'error');
        } else if (result === 'unauthorized') {
            setError(`You are not authorized to perform this action.`);
            showToast(`Authorization failed.`, 'error');
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-primary">Add New HR Account</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light">
                        <XMarkIcon className="h-6 w-6" />
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                            <label className="text-sm font-bold text-text-secondary block mb-1">Initial Password</label>
                            <input type="password" name="password" value={formData.password} onChange={handleChange} required className="w-full p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text-secondary block mb-1">Branch</label>
                            <input type="text" name="branch" value={formData.branch} onChange={handleChange} required className="w-full p-2 bg-surface-light rounded border border-border-color" placeholder="e.g., Jakarta, Bandung" />
                        </div>
                        <div className="flex items-center justify-center">
                             <label className="flex items-center cursor-pointer">
                                <input type="checkbox" name="isHeadOfBranch" checked={formData.isHeadOfBranch} onChange={handleChange} className="form-checkbox h-5 w-5 text-primary bg-surface-light border-border-color rounded focus:ring-primary" />
                                <span className="ml-2 text-text-primary font-semibold">Set as Head of Branch</span>
                            </label>
                        </div>
                    </div>
                    
                    {error && <p className="text-red-500 text-sm text-center">{error}</p>}

                    <div className="flex justify-end space-x-4 pt-4 border-t border-border-color mt-6">
                        <button type="button" onClick={onClose} disabled={isLoading} className="px-6 py-2 rounded bg-surface-light">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-primary px-6 py-2 rounded font-bold w-36 flex justify-center">
                            {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Create Account'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddHrAccountModal;