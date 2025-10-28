import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ExpenseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (description: string, amount: number) => Promise<void>;
}

const ExpenseModal: React.FC<ExpenseModalProps> = ({ isOpen, onClose, onSave }) => {
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        if (!description || amount <= 0) {
            alert("Description and a positive amount are required.");
            return;
        }
        setIsLoading(true);
        await onSave(description, amount);
        setIsLoading(false);
        setDescription('');
        setAmount(0);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-sm border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Record Operational Expense</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Description</label>
                        <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g., Server Costs, Marketing" className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Amount (IDR)</label>
                        <input type="number" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Cancel</button>
                    <button onClick={handleSave} disabled={isLoading} className="btn-primary px-4 py-2 rounded w-24 flex justify-center">
                        {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Save'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExpenseModal;