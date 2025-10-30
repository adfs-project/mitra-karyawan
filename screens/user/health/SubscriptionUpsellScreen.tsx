import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../../../contexts/AppContext';
import { useHealth } from '../../../contexts/HealthContext';
import { ArrowLeftIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/solid';

const SubscriptionUpsellScreen: React.FC = () => {
    const navigate = useNavigate();
    const { showToast } = useApp();
    const { subscribeToHealthPlus } = useHealth();
    const [isSubscribing, setIsSubscribing] = useState(false);

    const handleSubscribe = async () => {
        setIsSubscribing(true);
        // In a real app, this would involve a payment flow.
        // Here, we just update the user's status.
        await new Promise(resolve => setTimeout(resolve, 1000));
        await subscribeToHealthPlus();
        setIsSubscribing(false);
        showToast("Selamat! Anda sekarang adalah anggota Health+.", "success");
        navigate('/health-plus', { replace: true });
    };

    const features = [
        "AI Health Coach untuk rencana makan & latihan personal",
        "Analisis mood dan saran dari AI",
        "Unggah rekam medis tanpa batas",
        "Akses ke fitur premium lainnya di masa depan",
    ];

    return (
        <div className="p-4">
             <div className="flex items-center mb-6">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
            </div>
            <div className="bg-surface max-w-lg mx-auto p-8 rounded-2xl border-2 border-primary shadow-2xl shadow-primary/20 text-center">
                <SparklesIcon className="h-16 w-16 text-primary mx-auto"/>
                <h1 className="text-3xl font-bold text-text-primary mt-4">Tingkatkan ke Health+</h1>
                <p className="text-text-secondary mt-2">Buka potensi penuh kesehatan Anda dengan fitur premium yang didukung AI.</p>
                
                <div className="text-left my-8 space-y-3">
                    {features.map((feature, i) => (
                        <div key={i} className="flex items-start">
                            <CheckCircleIcon className="h-5 w-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                            <span className="text-text-primary">{feature}</span>
                        </div>
                    ))}
                </div>

                <button 
                    onClick={handleSubscribe} 
                    disabled={isSubscribing} 
                    className="w-full btn-primary p-4 rounded-lg font-bold text-lg flex justify-center items-center"
                >
                    {isSubscribing ? (
                        <div className="w-7 h-7 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                        "Berlangganan Sekarang - Rp 50.000/bulan"
                    )}
                </button>
                <p className="text-xs text-text-secondary mt-3">Pembatalan kapan saja. Simulasi pembayaran.</p>
            </div>
        </div>
    );
};

export default SubscriptionUpsellScreen;