import React, { useMemo, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';

const getSimulatedPrice = (drugName: string) => {
    // Simple hash function for pseudo-random but consistent pricing
    let hash = 0;
    for (let i = 0; i < drugName.length; i++) {
        const char = drugName.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash |= 0; // Convert to 32bit integer
    }
    return (Math.abs(hash) % 150000) + 25000; // Price between 25,000 and 175,000
};

const PharmacyCheckoutScreen: React.FC = () => {
    const { eprescriptionId } = useParams<{ eprescriptionId: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { eprescriptions, redeemEprescription, showToast } = useData();
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    const prescription = useMemo(() => {
        return eprescriptions.find(e => e.id === eprescriptionId);
    }, [eprescriptions, eprescriptionId]);

    const drugPrices = useMemo(() => {
        const prices: Record<string, number> = {};
        if (prescription) {
            prescription.items.forEach(item => {
                prices[item.drugName] = getSimulatedPrice(item.drugName);
            });
        }
        return prices;
    }, [prescription]);

    const subtotal = useMemo(() => {
        if (!prescription) return 0;
        return prescription.items.reduce((sum, item) => sum + (drugPrices[item.drugName] || 0), 0);
    }, [prescription, drugPrices]);
    
    const adminFee = 2500;
    const total = subtotal + adminFee;

    const handleCheckout = async () => {
        if (!user || total <= 0 || !prescription) return;

        setIsCheckingOut(true);
        const result = await redeemEprescription(prescription.id);

        if (result.success) {
            showToast(result.message, "success");
            navigate('/prescriptions');
        } else {
             showToast(`Checkout failed: ${result.message}`, "error");
        }
        setIsCheckingOut(false);
    };
    
    if (!prescription) {
        return <div className="p-4 text-center">Resep tidak ditemukan.</div>;
    }
    
    if (prescription.status === 'Redeemed') {
         return (
            <div className="p-4 text-center">
                <h1 className="text-xl font-bold">Resep Sudah Ditebus</h1>
                <p className="text-text-secondary mt-2">Resep ini sudah tidak berlaku lagi.</p>
                 <button onClick={() => navigate(-1)} className="mt-4 btn-primary px-4 py-2 rounded">Kembali</button>
            </div>
         );
    }

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary flex items-center">
                    <ShoppingCartIcon className="h-6 w-6 mr-2"/>
                    Tebus Resep Online
                </h1>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <p className="text-xs text-text-secondary">Resep dari: <span className="font-bold">{prescription.doctorName}</span></p>
                <p className="font-bold text-text-primary">Diterbitkan: {new Date(prescription.issueDate).toLocaleDateString()}</p>
                <div className="mt-4 space-y-2 border-t border-border-color pt-4">
                    {prescription.items.map((item, i) => (
                        <div key={i} className="flex justify-between items-start text-sm">
                           <div>
                                <p className="font-semibold text-text-primary">{item.drugName}</p>
                                <p className="text-xs text-text-secondary">{item.dosage} - {item.instructions}</p>
                           </div>
                           <p className="font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(drugPrices[item.drugName] || 0)}</p>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color space-y-2">
                <h2 className="text-lg font-bold">Ringkasan Pembayaran</h2>
                <div className="flex justify-between text-text-secondary text-sm">
                    <p>Subtotal Obat</p>
                    <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(subtotal)}</p>
                </div>
                 <div className="flex justify-between text-text-secondary text-sm">
                    <p>Biaya Admin & Pengiriman</p>
                    <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adminFee)}</p>
                </div>
                <div className="flex justify-between font-bold text-text-primary text-lg border-t border-border-color pt-2 mt-2">
                    <p>Total</p>
                    <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(total)}</p>
                </div>
                <button onClick={handleCheckout} disabled={isCheckingOut} className="w-full btn-primary p-3 rounded-lg font-bold mt-2 flex justify-center items-center">
                    {isCheckingOut ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : `Bayar & Tebus`}
                </button>
            </div>
        </div>
    );
};

export default PharmacyCheckoutScreen;