import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

const TransferModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { addTransaction, addNotification } = useData();
    const [amount, setAmount] = useState(0);
    const [recipient, setRecipient] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [error, setError] = useState('');


    const handleTransfer = async () => {
        if (!user) return;
        
        setError('');
        if (amount <= 0 || !recipient) {
            setError("Mohon isi semua field.");
            return;
        }
        if (user.wallet.balance < amount) {
            setError("Saldo tidak cukup.");
            return;
        }
        
        setIsLoading(true);
        // FIX: Added the 'status' property to the transaction object to match the 'Transaction' type expected by 'addTransaction'.
        const result = await addTransaction({
            userId: user.id,
            type: 'Transfer',
            amount: -amount,
            description: `Transfer ke ${recipient}`,
            status: 'Pending',
        });
        
        if(result.success) {
            addNotification(user.id, `Transfer sebesar ${new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(amount)} berhasil!`, 'success');
        }
        setIsLoading(false);
        setStep(2);
    };

    const handleClose = () => {
        setAmount(0);
        setRecipient('');
        setStep(1);
        setError('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg shadow-lg w-full max-w-md border border-border-color relative">
                <button onClick={handleClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-surface-light">
                    <XMarkIcon className="h-6 w-6 text-text-secondary" />
                </button>

                <h2 className="text-xl font-bold text-primary mb-4">Transfer Dana</h2>

                {step === 1 ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-text-secondary">Nomor Tujuan (HP/ID)</label>
                            <input
                                type="text"
                                value={recipient}
                                onChange={(e) => setRecipient(e.target.value)}
                                placeholder="0812..."
                                className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                            />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text-secondary">Jumlah Transfer</label>
                            <input
                                type="number"
                                value={amount || ''}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="Rp 0"
                                className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button onClick={handleTransfer} disabled={isLoading} className="w-full btn-primary p-3 rounded font-bold mt-2 flex items-center justify-center">
                           {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Kirim Sekarang'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-4">
                        <h3 className="text-lg font-bold">Permintaan Transfer Diproses</h3>
                        <p className="text-text-secondary mt-2">Anda akan menerima notifikasi saat transfer selesai. Silakan cek riwayat transaksi Anda.</p>
                        <button onClick={handleClose} className="mt-4 btn-primary px-6 py-2 rounded">Selesai</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferModal;
