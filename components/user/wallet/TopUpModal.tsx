

import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

const amountSuggestions = [50000, 100000, 250000, 500000];
const paymentMethods = ['BCA Virtual Account', 'GoPay', 'OVO', 'Alfamart'];

const TopUpModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { addTransaction, addNotification } = useData();
    const [amount, setAmount] = useState(0);
    const [selectedMethod, setSelectedMethod] = useState(paymentMethods[0]);
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Input, 2: Result

    const handleTopUp = async () => {
        if (!user || amount < 10000) {
            alert("Minimum Top-Up adalah Rp 10.000.");
            return;
        }
        setIsLoading(true);
        // FIX: Added the 'status' property to the transaction object to match the 'Transaction' type expected by 'addTransaction'.
        const result = await addTransaction({
            userId: user.id,
            type: 'Top-Up',
            amount: amount,
            description: `Top-Up via ${selectedMethod}`,
            status: 'Completed',
        });
        
        if(result.success) {
            addNotification(user.id, `Top-Up sebesar ${new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(amount)} berhasil!`, 'success');
        }
        setIsLoading(false);
        setStep(2);
    };

    const handleClose = () => {
        setAmount(0);
        setSelectedMethod(paymentMethods[0]);
        setStep(1);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg shadow-lg w-full max-w-md border border-border-color relative">
                <button onClick={handleClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-surface-light">
                    <XMarkIcon className="h-6 w-6 text-text-secondary" />
                </button>

                <h2 className="text-xl font-bold text-primary mb-4">Top Up Saldo</h2>

                {step === 1 ? (
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-text-secondary">Jumlah Top Up</label>
                            <input
                                type="number"
                                value={amount || ''}
                                onChange={(e) => setAmount(Number(e.target.value))}
                                placeholder="min. Rp 10.000"
                                className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary text-lg"
                            />
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {amountSuggestions.map(suggestion => (
                                <button key={suggestion} onClick={() => setAmount(suggestion)} className="px-3 py-1 bg-surface-light border border-border-color rounded-full text-sm hover:bg-primary hover:text-black">
                                    {new Intl.NumberFormat('id-ID').format(suggestion)}
                                </button>
                            ))}
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text-secondary">Metode Pembayaran</label>
                            <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary">
                                {paymentMethods.map(method => <option key={method}>{method}</option>)}
                            </select>
                        </div>
                        <button onClick={handleTopUp} disabled={isLoading} className="w-full btn-primary p-3 rounded font-bold mt-2 flex items-center justify-center">
                           {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Lanjutkan Top Up'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-4">
                        <h3 className="text-lg font-bold">Permintaan Top Up Diproses</h3>
                        <p className="text-text-secondary mt-2">Anda akan menerima notifikasi saat Top-Up selesai. Silakan cek riwayat transaksi Anda.</p>
                        <button onClick={handleClose} className="mt-4 btn-primary px-6 py-2 rounded">Selesai</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TopUpModal;
