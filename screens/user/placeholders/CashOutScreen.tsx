import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, BanknotesIcon, CameraIcon, CheckCircleIcon, InformationCircleIcon, ClockIcon } from '@heroicons/react/24/solid';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';

// Komponen placeholder untuk mensimulasikan tampilan QR Code
const QrCodePlaceholder: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 256 256" className="w-full h-full rounded-lg bg-white p-2 border-4 border-surface-light">
        <rect width="256" height="256" fill="#fff"/>
        <path d="M128 128h32v32h-32zM96 128V96h32v32zm0 32h32v32H96zm-32-32H32V96h32zm0 32H32v32h32z" fill="#000"/>
        <path d="M32 32h64v64H32zm16 16v32h32V48z" fill="#000"/>
        <path d="M160 32h64v64h-64zm16 16v32h32V48z" fill="#000"/>
        <path d="M32 160h64v64H32zm16 16v32h32v-32z" fill="#000"/>
        <path d="M224 128h-32v32h-32v32h-32v32h32v-32h32v-32h32zM160 96h32v32h-32z" fill="#000"/>
    </svg>
);

const CashOutScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { showToast, addTransaction } = useData();

    type Step = 'amount' | 'method' | 'qr' | 'atmGuide' | 'atmCode' | 'scanQr' | 'confirm' | 'success';
    const [step, setStep] = useState<Step>('amount');
    const [amount, setAmount] = useState<number>(0);
    const [error, setError] = useState('');
    const [selectedMethod, setSelectedMethod] = useState<'ATM' | 'Alfamart' | 'Indomaret' | null>(null);
    const [qrData, setQrData] = useState<{ code: string; expires: number } | null>(null);
    const [atmCode, setAtmCode] = useState<string>('');
    const [timer, setTimer] = useState(300); // 5 minutes
    const [isProcessing, setIsProcessing] = useState(false);

    useEffect(() => {
        let interval: number;
        if ((step === 'qr' || step === 'atmCode') && timer > 0) {
            interval = window.setInterval(() => {
                setTimer(prev => prev - 1);
            }, 1000);
        } else if (timer === 0 && (step === 'qr' || step === 'atmCode')) {
            showToast('Kode telah kedaluwarsa.', 'warning');
            handleBackToStart();
        }
        return () => clearInterval(interval);
    }, [step, timer]);

    useEffect(() => {
        if (step === 'scanQr') {
            const scanTimeout = setTimeout(() => {
                // Simulate a successful scan
                setStep('confirm');
            }, 3000); // Simulate 3 seconds of scanning
            return () => clearTimeout(scanTimeout);
        }
    }, [step]);
    
    const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

    const handleNext = () => {
        setError('');
        if (amount < 50000) {
            setError('Jumlah penarikan minimum adalah Rp 50.000.');
            return;
        }
        if (amount > (user?.wallet.balance || 0)) {
            setError('Saldo tidak mencukupi.');
            return;
        }
        setStep('method');
    };
    
    const handleSelectMethod = (method: 'ATM' | 'Alfamart' | 'Indomaret') => {
        setSelectedMethod(method);
        setTimer(300);
        if (method === 'ATM') {
            setStep('atmGuide');
        } else {
            const code = `MKC${Date.now()}`;
            setQrData({ code, expires: Date.now() + 300000 });
            setStep('qr');
        }
    };
    
    const handleFinish = async () => {
        if (!user || !selectedMethod) return;
        setIsProcessing(true);
        const result = await addTransaction({
            userId: user.id,
            type: 'Transfer',
            amount: -amount,
            description: `Tarik tunai via ${selectedMethod}`,
            status: 'Completed',
        });
        
        if (result.success) {
            setStep('success');
        } else {
            showToast(`Gagal: ${result.message}`, 'error');
            setIsProcessing(false);
        }
    };
    
    const handleBack = () => {
        setError('');
        if (step === 'confirm') setStep('scanQr');
        else if (step === 'scanQr') setStep('atmCode');
        else if (step === 'atmCode') setStep('atmGuide');
        else if (step === 'qr' || step === 'atmGuide') setStep('method');
        else if (step === 'method') setStep('amount');
    };

    const handleBackToStart = () => {
        setStep('amount');
        setAmount(0);
        setSelectedMethod(null);
        setQrData(null);
        setAtmCode('');
        setError('');
        setIsProcessing(false);
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    const renderAmountStep = () => (
        <div className="space-y-4 animate-fade-in-up">
             <div className="text-center mb-4">
                <p className="text-sm text-text-secondary">Saldo Anda</p>
                <p className="text-2xl font-bold">{formatCurrency(user?.wallet.balance || 0)}</p>
            </div>
            <div>
                <label className="text-sm font-bold text-text-secondary">Jumlah Penarikan (IDR)</label>
                <input 
                    type="number"
                    value={amount || ''}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color text-lg" 
                    placeholder="Min. Rp 50.000" />
            </div>
             <div className="grid grid-cols-3 gap-2">
                {[50000, 100000, 200000].map(val => (
                     <button key={val} onClick={() => setAmount(val)} className="p-2 bg-surface-light border border-border-color rounded-lg text-sm hover:bg-border-color">
                        {new Intl.NumberFormat('id-ID').format(val)}
                    </button>
                ))}
            </div>
            {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
             <button onClick={handleNext} className="w-full p-3 font-bold rounded-lg btn-primary mt-4">
                Lanjutkan
            </button>
        </div>
    );
    
    const renderMethodStep = () => (
        <div className="space-y-4 animate-fade-in-up">
            <p className="text-center text-text-secondary">Jumlah Penarikan</p>
            <p className="text-center text-3xl font-bold mb-6">{formatCurrency(amount)}</p>
            <h3 className="font-bold text-center">Pilih Metode Penarikan</h3>
            <div className="space-y-3">
                 <button onClick={() => handleSelectMethod('ATM')} className="w-full flex items-center p-4 bg-surface-light rounded-lg border border-border-color hover:border-primary">
                    <BanknotesIcon className="h-8 w-8 text-primary mr-4"/>
                    <span className="font-semibold text-text-primary">Tarik Tunai di ATM</span>
                </button>
                 <button onClick={() => handleSelectMethod('Alfamart')} className="w-full flex items-center p-4 bg-surface-light rounded-lg border border-border-color hover:border-primary">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/9e/ALFAMART_LOGO_BARU.png" alt="Alfamart" className="h-8 w-16 object-contain mr-4"/>
                    <span className="font-semibold text-text-primary">Ambil di Alfamart</span>
                </button>
                <button onClick={() => handleSelectMethod('Indomaret')} className="w-full flex items-center p-4 bg-surface-light rounded-lg border border-border-color hover:border-primary">
                    <img src="https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Indomaret.png" alt="Indomaret" className="h-8 w-16 object-contain mr-4"/>
                    <span className="font-semibold text-text-primary">Ambil di Indomaret</span>
                </button>
            </div>
            <button onClick={handleBack} className="w-full p-2 mt-4 text-sm font-semibold text-text-secondary hover:underline">Kembali</button>
        </div>
    );

    const renderAtmGuideStep = () => (
        <div className="space-y-4 animate-fade-in-up">
            <h3 className="text-xl font-bold text-center flex items-center justify-center">
                <InformationCircleIcon className="h-6 w-6 mr-2 text-primary"/>
                Panduan untuk Tarik Tunai di ATM
            </h3>
            <div className="text-left text-sm text-text-primary bg-surface-light p-4 rounded-lg border border-border-color">
                <ol className="list-decimal list-inside space-y-3">
                    <li>
                        <strong>Dapatkan Kode Penarikan:</strong> Aplikasi akan menghasilkan kode numerik unik. Anda harus memasukkan kode ini di mesin ATM pada menu "Tarik Tunai Tanpa Kartu".
                    </li>
                    <li>
                        <strong>Pindai QR dari ATM:</strong> Setelah kode dimasukkan, mesin ATM akan menampilkan QR code. Anda akan memindai kode ini menggunakan kamera di aplikasi.
                    </li>
                    <li>
                        <strong>Konfirmasi Akhir:</strong> Aplikasi akan menampilkan detail transaksi untuk persetujuan akhir.
                    </li>
                    <li>
                        <strong>Ambil Uang:</strong> Setelah Anda menyetujui, transaksi akan diproses, dan ATM akan mengeluarkan uang tunai Anda.
                    </li>
                </ol>
            </div>
            <button 
                onClick={() => {
                    setAtmCode(Math.floor(100000 + Math.random() * 900000).toString());
                    setStep('atmCode');
                }} 
                className="w-full p-3 font-bold rounded-lg btn-primary mt-4"
            >
                Mengerti & Lanjutkan
            </button>
            <button onClick={handleBack} className="w-full p-2 mt-2 text-sm font-semibold text-text-secondary hover:underline">
                Pilih Metode Lain
            </button>
        </div>
    );

    const renderAtmCodeStep = () => (
        <div className="space-y-4 text-center animate-fade-in-up">
            <h3 className="text-lg font-bold">Langkah 1: Masukkan Kode di ATM</h3>
            <p className="text-text-secondary text-sm">Pilih menu "Tarik Tunai Tanpa Kartu" di mesin ATM dan masukkan kode di bawah ini.</p>
            <div className="bg-surface-light p-4 rounded-lg">
                <p className="text-sm text-text-secondary">Kode Penarikan</p>
                <p className="text-4xl font-bold tracking-[1rem] my-2">{atmCode}</p>
                <p className="text-sm text-text-secondary">Kode berlaku selama: <span className="font-bold text-secondary">{formatTime(timer)}</span></p>
            </div>
            <button onClick={() => setStep('scanQr')} className="w-full p-3 font-bold rounded-lg btn-primary mt-4">
                Saya Sudah Masukkan Kode, Lanjutkan
            </button>
            <button onClick={handleBack} className="w-full p-2 mt-2 text-sm font-semibold text-text-secondary hover:underline">Kembali ke Panduan</button>
        </div>
    );

    const renderQrScannerStep = () => (
        <div className="space-y-4 text-center animate-fade-in-up">
            <h3 className="text-lg font-bold">Langkah 2: Pindai Kode QR</h3>
            <p className="text-text-secondary text-sm">Arahkan kamera ke kode QR yang ditampilkan di layar ATM untuk verifikasi.</p>
            <div className="w-64 h-64 mx-auto my-2 p-4 bg-black rounded-lg relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-1 bg-primary animate-scan-y"></div>
                <CameraIcon className="w-24 h-24 text-surface-light opacity-20 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"/>
            </div>
            <p className="text-sm text-primary animate-pulse">Memindai...</p>
             <button onClick={handleBack} className="w-full p-2 mt-2 text-sm font-semibold text-text-secondary hover:underline">Kembali</button>
             <style>{`
                @keyframes scan-y {
                    0% { transform: translateY(0); }
                    100% { transform: translateY(250px); }
                }
                .animate-scan-y { animation: scan-y 2s infinite alternate ease-in-out; }
             `}</style>
        </div>
    );
    
    const renderConfirmStep = () => (
        <div className="space-y-4 text-center animate-fade-in-up">
            <h3 className="text-lg font-bold">Langkah 3: Konfirmasi Penarikan</h3>
            <div className="bg-surface-light p-4 rounded-lg text-left divide-y divide-border-color">
                <div className="py-2 flex justify-between"><span className="text-text-secondary">Jumlah</span><span className="font-bold">{formatCurrency(amount)}</span></div>
                <div className="py-2 flex justify-between"><span className="text-text-secondary">Metode</span><span className="font-bold">{selectedMethod}</span></div>
                <div className="py-2 flex justify-between"><span className="text-text-secondary">Lokasi</span><span className="font-bold">ATM Bersama (Simulasi)</span></div>
            </div>
             <button onClick={handleFinish} disabled={isProcessing} className="w-full p-3 font-bold rounded-lg btn-primary mt-4 flex justify-center">
                {isProcessing ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'KONFIRMASI PENARIKAN'}
            </button>
             <button onClick={handleBack} className="w-full p-2 mt-2 text-sm font-semibold text-text-secondary hover:underline">Batal</button>
        </div>
    );

    const renderSuccessStep = () => (
        <div className="space-y-6 text-center animate-fade-in-up py-8">
            <CheckCircleIcon className="w-24 h-24 text-green-400 mx-auto"/>
            <h3 className="text-2xl font-bold">Penarikan Berhasil!</h3>
            <div className="bg-surface-light p-4 rounded-lg text-left divide-y divide-border-color">
                <div className="py-2 flex justify-between text-sm"><span className="text-text-secondary">Jumlah</span><span className="font-bold">{formatCurrency(amount)}</span></div>
                <div className="py-2 flex justify-between text-sm"><span className="text-text-secondary">Metode</span><span className="font-bold">{selectedMethod}</span></div>
                <div className="py-2 flex justify-between text-sm"><span className="text-text-secondary">ID Transaksi</span><span className="font-mono text-xs">{qrData?.code || atmCode}</span></div>
            </div>
            <p className="text-text-secondary text-sm">
                {selectedMethod === 'ATM' ? 'Silakan ambil uang Anda dari mesin ATM.' : `Dana telah berhasil ditarik melalui ${selectedMethod}.`}
            </p>
            <button onClick={handleBackToStart} className="w-full p-3 font-bold rounded-lg btn-primary mt-4">
                Selesai
            </button>
        </div>
    );

    const renderQrStep = () => {
        const merchantLogo = selectedMethod === 'Alfamart' 
            ? "https://upload.wikimedia.org/wikipedia/commons/9/9e/ALFAMART_LOGO_BARU.png" 
            : "https://upload.wikimedia.org/wikipedia/commons/9/9d/Logo_Indomaret.png";
        
        return (
            <div className="space-y-4 text-center animate-fade-in-up">
                 <div className="bg-gradient-to-br from-surface to-surface-light rounded-xl p-4 shadow-2xl border border-primary/20">
                    <div className="flex justify-between items-center border-b border-border-color pb-3 mb-3">
                        <img src={merchantLogo} alt={selectedMethod || ''} className="h-6 object-contain"/>
                        <span className="text-sm font-bold text-primary">MK App</span>
                    </div>

                    <div className="text-center py-4">
                        <p className="text-sm text-text-secondary">Total Pembayaran</p>
                        <p className="text-4xl font-bold text-primary">{formatCurrency(amount)}</p>

                        <div className="w-56 h-56 mx-auto my-4">
                            <QrCodePlaceholder />
                        </div>

                        <p className="text-sm text-text-secondary">Tunjukkan kode ini pada kasir untuk menyelesaikan penarikan.</p>
                    </div>

                    <div className="border-t border-border-color pt-3 text-sm text-text-secondary">
                        <div className="flex justify-between items-center">
                            <span>ID Transaksi</span>
                            <span className="font-mono text-xs">{qrData?.code}</span>
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <span className="flex items-center"><ClockIcon className="h-4 w-4 mr-1"/> Kode berlaku hingga</span>
                            <span className="font-bold text-secondary">{formatTime(timer)}</span>
                        </div>
                    </div>
                </div>
                <button onClick={handleBack} className="w-full p-2 mt-2 text-sm font-semibold text-text-secondary hover:underline">Pilih Metode Lain</button>
            </div>
        );
    };

    const renderContent = () => {
        switch (step) {
            case 'amount': return renderAmountStep();
            case 'method': return renderMethodStep();
            case 'qr': return renderQrStep();
            case 'atmGuide': return renderAtmGuideStep();
            case 'atmCode': return renderAtmCodeStep();
            case 'scanQr': return renderQrScannerStep();
            case 'confirm': return renderConfirmStep();
            case 'success': return renderSuccessStep();
            default: return renderAmountStep();
        }
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
                {renderContent()}
            </div>
        </div>
    );
};

export default CashOutScreen;