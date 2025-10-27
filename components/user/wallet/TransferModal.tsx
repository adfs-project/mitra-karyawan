
import React, { useState } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { XMarkIcon } from '@heroicons/react/24/solid';

const TransferModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { user } = useAuth();
    const { addTransaction, users, addNotification } = useData();
    const [amount, setAmount] = useState(0);
    const [recipientEmail, setRecipientEmail] = useState('');
    const [note, setNote] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [step, setStep] = useState(1); // 1: Input, 2: Result
    const [result, setResult] = useState<{success: boolean, message: string} | null>(null);

    const handleTransfer = async () => {
        if (!user) return;

        if (amount <= 0 || !recipientEmail) {
            setResult({ success: false, message: "Email penerima dan jumlah harus diisi." });
            setStep(2);
            return;
        }
        if (user.wallet.balance < amount) {
            setResult({ success: false, message: "Saldo tidak cukup." });
            setStep(2);
            return;
        }
        const recipient = users.find(u => u.email.toLowerCase() === recipientEmail.toLowerCase());
        if (!recipient) {
            setResult({ success: false, message: "Penerima tidak ditemukan." });
            setStep(2);
            return;
        }
        if (recipient.id === user.id) {
             setResult({ success: false, message: "Tidak dapat mentransfer ke diri sendiri." });
             setStep(2);
             return;
        }

        setIsLoading(true);

        // Perform transaction for sender
        await addTransaction({
            userId: user.id,
            type: 'Transfer',
            amount: -amount,
            description: `Transfer ke ${recipient.profile.name}. Catatan: ${note || '-'}`,
            status: 'Completed',
        });

        // Perform transaction for recipient
        await addTransaction({
            userId: recipient.id,
            type: 'Transfer',
            amount: amount,
            description: `Transfer dari ${user.profile.name}. Catatan: ${note || '-'}`,
            status: 'Completed',
        });
        
        addNotification(recipient.id, `Anda menerima transfer sebesar ${new Intl.NumberFormat('id-ID', {style: 'currency', currency: 'IDR'}).format(amount)} dari ${user.profile.name}.`, 'success');
        
        setResult({ success: true, message: "Transfer berhasil!" });
        setIsLoading(false);
        setStep(2);
    };

    const handleClose = () => {
        setAmount(0);
        setRecipientEmail('');
        setNote('');
        setStep(1);
        setResult(null);
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
                        <input
                            type="email"
                            value={recipientEmail}
                            onChange={(e) => setRecipientEmail(e.target.value)}
                            placeholder="Email Penerima"
                            className="w-full p-3 bg-surface-light rounded border border-border-color"
                        />
                         <input
                            type="number"
                            value={amount || ''}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder="Jumlah Transfer"
                            className="w-full p-3 bg-surface-light rounded border border-border-color"
                        />
                         <input
                            type="text"
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            placeholder="Catatan (Opsional)"
                            className="w-full p-3 bg-surface-light rounded border border-border-color"
                        />
                        <button onClick={handleTransfer} disabled={isLoading} className="w-full btn-primary p-3 rounded font-bold mt-2 flex items-center justify-center">
                           {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Kirim'}
                        </button>
                    </div>
                ) : (
                    <div className="text-center p-4">
                        <h3 className={`text-lg font-bold ${result?.success ? 'text-green-400' : 'text-red-400'}`}>{result?.message}</h3>
                        <button onClick={handleClose} className="mt-4 btn-primary px-6 py-2 rounded">Selesai</button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default TransferModal;
