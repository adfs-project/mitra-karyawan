import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHealth } from '../../../contexts/HealthContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
// FIX: Replaced useData with useApp since it's only used for showToast.
import { useApp } from '../../../contexts/AppContext';

const SIMULATED_PRICE_PER_ITEM = 50000;

const PharmacyCheckoutScreen: React.FC = () => {
    const { eprescriptionId } = useParams<{ eprescriptionId: string }>();
    const navigate = useNavigate();
    const { eprescriptions, redeemPrescription } = useHealth();
    const { showToast } = useApp();
    const { user } = useAuth();
    const [isProcessing, setIsProcessing] = useState(false);

    const prescription = useMemo(() => {
        return eprescriptions.find(e => e.id === eprescriptionId);
    }, [eprescriptions, eprescriptionId]);

    const totalCost = useMemo(() => {
        if (!prescription) return 0;
        return prescription.items.length * SIMULATED_PRICE_PER_ITEM;
    }, [prescription]);

    const handlePayment = async () => {
        if (!prescription || !user) return;
        setIsProcessing(true);
        const result = await redeemPrescription(prescription.id, totalCost);
        if (result.success) {
            showToast(result.message, 'success');
            navigate('/prescriptions', { replace: true });
        } else {
            showToast(result.message, 'error');
        }
        setIsProcessing(false);
    };

    if (!prescription) {
        return <div className="p-4 text-center">Resep tidak ditemukan.</div>;
    }
    
    if (prescription.status === 'Redeemed') {
        return (
            <div className="p-4 text-center">
                <h1 className="text-xl font-bold">Resep ini sudah ditebus.</h1>
                <button onClick={() => navigate('/prescriptions')} className="mt-4 btn-primary px-4 py-2 rounded-lg">Kembali</button>
            </div>
        );
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Checkout Obat</h1>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-lg font-bold mb-2">Detail Resep</h2>
                <p className="text-xs text-text-secondary">Dokter: {prescription.doctorName}</p>
                <p className="text-xs text-text-secondary mb-4">Tanggal: {new Date(prescription.issueDate).toLocaleDateString()}</p>
                <div className="space-y-2 border-t border-border-color pt-2">
                    {prescription.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                            <div>
                                <p className="font-semibold text-text-primary">{item.drugName}</p>
                                <p className="text-xs text-text-secondary">{item.dosage} - {item.instructions}</p>
                            </div>
                            <p className="font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(SIMULATED_PRICE_PER_ITEM)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-lg font-bold mb-2">Ringkasan Pembayaran</h2>
                <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                        <p className="text-text-secondary">Subtotal Obat</p>
                        <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalCost)}</p>
                    </div>
                    <div className="flex justify-between">
                        <p className="text-text-secondary">Saldo Dompet Anda</p>
                        <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user?.wallet.balance || 0)}</p>
                    </div>
                    <div className="flex justify-between font-bold text-lg pt-2 border-t border-border-color mt-2">
                        <p>Total Bayar</p>
                        <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalCost)}</p>
                    </div>
                </div>
                 <button onClick={handlePayment} disabled={isProcessing} className="w-full mt-4 btn-primary p-3 rounded-lg font-bold flex justify-center items-center">
                    {isProcessing ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : `Bayar & Kirim`}
                </button>
            </div>
        </div>
    );
};

export default PharmacyCheckoutScreen;