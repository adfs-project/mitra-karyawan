import React, { useState } from 'react';
import { User } from '../../types';
import { XMarkIcon } from '@heroicons/react/24/solid';
import { useData } from '../../contexts/DataContext';

interface SetPayLaterLimitModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}

const SetPayLaterLimitModal: React.FC<SetPayLaterLimitModalProps> = ({ isOpen, onClose, user }) => {
    const { approvePayLater } = useData();
    const [limit, setLimit] = useState<number>(0);
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen || !user) return null;

    const handleSave = async () => {
        if (limit <= 0) {
            alert("Limit must be a positive number.");
            return;
        }
        setIsLoading(true);
        await approvePayLater(user.id, limit);
        setIsLoading(false);
        setLimit(0);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-sm border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Set PayLater Limit</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                 <p className="text-sm text-text-secondary mb-4">Setujui aplikasi untuk <span className="font-bold">{user.profile.name}</span> dan tetapkan batas kredit.</p>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Batas Kredit (IDR)</label>
                        <input 
                            type="number" 
                            value={limit || ''} 
                            onChange={(e) => setLimit(Number(e.target.value))} 
                            className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" 
                            placeholder="e.g., 5000000"
                        />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Batal</button>
                    <button onClick={handleSave} disabled={isLoading} className="btn-primary px-4 py-2 rounded w-32 flex justify-center">
                        {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Setujui & Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SetPayLaterLimitModal;
