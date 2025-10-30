import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CreditCardIcon, BuildingStorefrontIcon, QrCodeIcon } from '@heroicons/react/24/solid';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';

const withdrawalMethods = [
    { id: 'atm', name: 'ATM', icon: CreditCardIcon, description: 'Tarik tunai tanpa kartu di ATM bank mitra.' },
    { id: 'alfamart', name: 'Alfamart', icon: BuildingStorefrontIcon, description: 'Ambil uang tunai di kasir Alfamart terdekat.' },
    { id: 'indomart', name: 'Indomart', icon: BuildingStorefrontIcon, description: 'Ambil uang tunai di kasir Indomart terdekat.' },
];

const COUNTDOWN_SECONDS = 300; // 5 minutes

const CashOutScreen = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast } = useData();
    const [selectedMethod, setSelectedMethod] = useState('alfamart');
    const [amount, setAmount] = useState<number>(0);
    const [showCodeView, setShowCodeView] = useState(false);
    const [generatedCode, setGeneratedCode] = useState('');
    const [qrCodeUrl, setQrCodeUrl] = useState('');
    const [countdown, setCountdown] = useState(COUNTDOWN_SECONDS);
    
    // FIX: Ensured the timer logic is browser-compatible by using setInterval/clearInterval within useEffect,
    // avoiding Node.js-specific types like NodeJS.Timeout.
    useEffect(() => {
        if (showCodeView && countdown > 0) {
            const timer = setInterval(() => {
                setCountdown(prev => prev - 1);
            }, 1000);
            return () => clearInterval(timer);
        } else if (countdown === 0 && showCodeView) {
            setShowCodeView(false);
            showToast('Kode penarikan telah kedaluwarsa.', 'warning');
        }
    }, [showCodeView, countdown, showToast]);
    
    const handleGenerateCode = () => {
        if (amount < 50000) {
            showToast('Jumlah penarikan minimal adalah Rp 50.000.', 'warning');
            return;
        }
        if (user && user.wallet.balance < amount) {
            showToast('Saldo dompet tidak mencukupi.', 'error');
            return;
        }

        const code = `TK${Math.floor(10000000 + Math.random() * 90000000)}`;
        setGeneratedCode(code);

        const qrData = JSON.stringify({
            type: 'CASH_OUT',
            code: code,
            amount: amount,
            method: selectedMethod,
            user: user?.id
        });
        setQrCodeUrl(`https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${encodeURIComponent(qrData)}`);
        
        setCountdown(COUNTDOWN_SECONDS);
        setShowCodeView(true);
    };
    
    const handleDone = () => {
        setShowCodeView(false);
        setAmount(0);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Tarik Tunai</h1>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                {!showCodeView ? (
                    <>
                        <p className="text-text-secondary mb-4">Pilih metode dan jumlah penarikan tunai saldo dompet Anda.</p>
                        <div className="space-y-3 mb-6">
                            <label className="text-sm font-bold text-text-secondary">Pilih Lokasi Penarikan</label>
                            {withdrawalMethods.map(method => (
                                <button
                                    key={method.id}
                                    onClick={() => setSelectedMethod(method.id)}
                                    className={`w-full flex items-center p-4 rounded-lg border-2 transition-colors
                                        ${selectedMethod === method.id ? 'border-primary bg-primary/10' : 'border-border-color bg-surface-light hover:border-gray-600'}
                                    `}
                                >
                                    <method.icon className={`h-8 w-8 mr-4 ${selectedMethod === method.id ? 'text-primary' : 'text-secondary'}`} />
                                    <div>
                                        <p className="font-bold text-left text-text-primary">{method.name}</p>
                                        <p className="text-xs text-left text-text-secondary">{method.description}</p>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="space-y-4 text-left">
                            <div>
                                <label className="text-sm font-bold text-text-secondary">Jumlah Tarik Tunai</label>
                                <input 
                                    type="number" 
                                    value={amount || ''}
                                    onChange={(e) => setAmount(Number(e.target.value))}
                                    className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color focus:ring-2 focus:ring-primary focus:outline-none" 
                                    placeholder="min. Rp 50.000" 
                                    step="10000"
                                />
                            </div>
                            <button onClick={handleGenerateCode} className="w-full p-3 btn-primary font-bold rounded-lg">
                                Dapatkan Kode Penarikan
                            </button>
                        </div>
                    </>
                ) : (
                    <div className="text-center animate-fade-in">
                        <h2 className="text-lg font-bold">Tunjukkan Kode ke Kasir/ATM</h2>
                        <p className="text-text-secondary text-sm mb-4">Berlaku di: <span className="font-bold">{withdrawalMethods.find(m => m.id === selectedMethod)?.name}</span></p>
                        
                        <div className="bg-white p-4 rounded-lg inline-block border-4 border-primary">
                            <img src={qrCodeUrl} alt="Kode QR Penarikan Tunai" />
                        </div>

                        <div className="mt-4">
                            <p className="text-sm text-text-secondary">Atau gunakan kode berikut:</p>
                            <p className="text-3xl font-bold tracking-widest bg-surface-light py-2 px-4 rounded-lg my-2 inline-block border border-border-color">{generatedCode}</p>
                        </div>

                        <div className="mt-4">
                             <p className="text-sm text-text-secondary">Jumlah Penarikan:</p>
                             <p className="font-bold text-2xl text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)}</p>
                        </div>

                        <div className="mt-4 bg-red-500/10 border border-red-500 text-red-400 p-2 rounded-lg">
                            <p className="text-sm font-bold">Kode akan kedaluwarsa dalam:</p>
                            <p className="text-2xl font-mono font-bold">{formatTime(countdown)}</p>
                        </div>
                        
                        <button onClick={handleDone} className="w-full mt-6 p-3 bg-surface-light font-bold rounded-lg border border-border-color hover:bg-border-color">
                            Selesai
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CashOutScreen;
