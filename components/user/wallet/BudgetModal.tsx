import React, { useState, useEffect } from 'react';
// FIX: Replaced useCore with useApp as it is the correct exported member from AppContext.
import { useApp } from '../../../contexts/AppContext';
import { Budget } from '../../../types';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface BudgetModalProps {
    isOpen: boolean;
    onClose: () => void;
    budget: Budget | null;
}

const BudgetModal: React.FC<BudgetModalProps> = ({ isOpen, onClose, budget }) => {
    const { addBudget, updateBudget } = useApp();
    const [category, setCategory] = useState<'Marketplace' | 'PPOB' | 'Umum'>('Umum');
    const [limit, setLimit] = useState(0);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (budget) {
            setCategory(budget.category);
            setLimit(budget.limit);
        } else {
            setCategory('Umum');
            setLimit(0);
        }
    }, [budget, isOpen]);

    const handleSave = async () => {
        if (limit <= 0) {
            alert("Limit harus lebih besar dari 0.");
            return;
        }
        setIsLoading(true);
        if (budget) {
            await updateBudget({ ...budget, category, limit });
        } else {
            await addBudget({ category, limit });
        }
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-sm border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{budget ? 'Edit Anggaran' : 'Anggaran Baru'}</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Kategori</label>
                        <select value={category} onChange={(e) => setCategory(e.target.value as any)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color">
                            <option value="Marketplace">Marketplace</option>
                            <option value="PPOB">PPOB</option>
                            <option value="Umum">Umum</option>
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Batas Anggaran (IDR)</label>
                        <input type="number" value={limit || ''} onChange={(e) => setLimit(Number(e.target.value))} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Batal</button>
                    <button onClick={handleSave} disabled={isLoading} className="btn-primary px-4 py-2 rounded w-24 flex justify-center">
                        {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default BudgetModal;