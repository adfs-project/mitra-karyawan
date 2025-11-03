import React, { useState, useEffect } from 'react';
import { useData, ScheduledPayment } from '@mk/shared';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface ScheduledPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    payment: ScheduledPayment | null;
}

const ScheduledPaymentModal: React.FC<ScheduledPaymentModalProps> = ({ isOpen, onClose, payment }) => {
    const { addScheduledPayment, updateScheduledPayment } = useData();
    const [description, setDescription] = useState('');
    const [amount, setAmount] = useState(0);
    const [recurrence, setRecurrence] = useState<'monthly' | 'weekly'>('monthly');
    const [nextDueDate, setNextDueDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (payment) {
            setDescription(payment.description);
            setAmount(payment.amount);
            setRecurrence(payment.recurrence);
            setNextDueDate(payment.nextDueDate.split('T')[0]);
        } else {
            setDescription('');
            setAmount(0);
            setRecurrence('monthly');
            setNextDueDate('');
        }
    }, [payment, isOpen]);

    const handleSave = async () => {
        if (!description || amount === 0 || !nextDueDate) {
            alert("Harap isi semua kolom.");
            return;
        }
        setIsLoading(true);
        const paymentData = { description, amount, recurrence, nextDueDate: new Date(nextDueDate).toISOString() };

        if (payment) {
            await updateScheduledPayment({ ...payment, ...paymentData });
        } else {
            await addScheduledPayment(paymentData);
        }
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-md border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">{payment ? 'Edit Pembayaran' : 'Pembayaran Baru'}</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                    <input type="text" placeholder="Deskripsi (e.g., Tagihan Listrik)" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    <input type="number" placeholder="Jumlah (e.g., -250000)" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    <select value={recurrence} onChange={(e) => setRecurrence(e.target.value as any)} className="w-full p-2 bg-surface-light rounded border border-border-color">
                        <option value="monthly">Bulanan</option>
                        <option value="weekly">Mingguan</option>
                    </select>
                    <div>
                        <label className="text-sm text-text-secondary">Tanggal Jatuh Tempo Berikutnya</label>
                        <input type="date" value={nextDueDate} onChange={(e) => setNextDueDate(e.target.value)} className="w-full p-2 bg-surface-light rounded border border-border-color" />
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

export default ScheduledPaymentModal;