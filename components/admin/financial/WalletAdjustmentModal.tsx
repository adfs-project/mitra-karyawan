import React, { useState } from 'react';
import { User } from '../../../types';
// FIX: Replaced useCore with useApp as it is the correct exported member from AppContext.
import { useApp } from '../../../contexts/AppContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

const WalletAdjustmentModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User | null;
}> = ({ isOpen, onClose, user }) => {
    const { adjustUserWallet, freezeUserWallet } = useApp();
    const [amount, setAmount] = useState(0);
    const [reason, setReason] = useState('');
    const [isFrozen, setIsFrozen] = useState(user?.wallet.isFrozen || false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    React.useEffect(() => {
        if (user) {
            setIsFrozen(user.wallet.isFrozen);
        }
    }, [user]);

    const handleAdjust = async () => {
        if (!user || amount === 0 || !reason) {
            setError('Amount and reason are required for adjustment.');
            return;
        }
        setError('');
        setIsLoading(true);
        await adjustUserWallet(user.id, amount, reason);
        setIsLoading(false);
        setAmount(0);
        setReason('');
        onClose();
    };

    const handleToggleFreeze = async () => {
        if (!user) return;
        setError('');
        setIsLoading(true);
        await freezeUserWallet(user.id, !isFrozen);
        setIsLoading(false);
        onClose();
    };

    if (!isOpen || !user) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-md border border-border-color">
                <h2 className="text-xl font-bold mb-1">Manage Wallet</h2>
                <p className="text-text-secondary mb-4 text-sm">For: {user.profile.name}</p>

                <div className="space-y-4">
                    {/* Wallet Adjustment */}
                    <div className="p-4 bg-surface-light rounded-lg">
                        <h3 className="font-bold mb-2">Manual Adjustment (Credit/Debit)</h3>
                        <div className="grid grid-cols-2 gap-2">
                             <input type="number" placeholder="Amount" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} className="p-2 bg-surface rounded border border-border-color col-span-2"/>
                        </div>
                        <input type="text" placeholder="Reason (e.g., Bonus, Correction)" value={reason} onChange={e => setReason(e.target.value)} className="w-full mt-2 p-2 bg-surface rounded border border-border-color"/>
                        <button onClick={handleAdjust} disabled={isLoading} className="w-full mt-2 btn-primary p-2 rounded text-sm font-bold">Apply Adjustment</button>
                    </div>

                    {/* Freeze Wallet */}
                    <div className="p-4 bg-surface-light rounded-lg">
                        <h3 className="font-bold mb-2">Wallet Status</h3>
                        <div className="flex items-center justify-between">
                            <span className={`font-semibold ${isFrozen ? 'text-red-500' : 'text-green-500'}`}>
                                {isFrozen ? 'Frozen' : 'Active'}
                            </span>
                            <button onClick={handleToggleFreeze} disabled={isLoading} className={`px-4 py-2 rounded text-sm font-bold ${isFrozen ? 'btn-primary' : 'btn-secondary'}`}>
                                {isFrozen ? 'Unfreeze' : 'Freeze'} Wallet
                            </button>
                        </div>
                    </div>
                </div>
                
                {error && <p className="text-red-500 text-sm mt-4">{error}</p>}

                <div className="flex justify-end mt-6">
                    <button onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color">Close</button>
                </div>
            </div>
        </div>
    );
};

export default WalletAdjustmentModal;