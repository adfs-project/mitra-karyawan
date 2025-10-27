import React, { useState } from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

const steps = [
    {
        target: '/home',
        title: 'Selamat Datang!',
        content: 'Ini adalah halaman utama Anda. Di sini Anda dapat melihat ringkasan saldo dan mengakses semua fitur dengan cepat.',
        position: 'center',
    },
    {
        target: '/wallet',
        title: 'Dompet Digital Anda',
        content: 'Kelola keuangan Anda di sini. Lakukan Top-Up, transfer dana, dan lihat riwayat transaksi Anda.',
        position: 'bottom',
    },
    {
        target: '/market',
        title: 'Marketplace Karyawan',
        content: 'Jelajahi marketplace untuk membeli atau menjual barang dengan rekan kerja Anda.',
        position: 'bottom',
    },
    {
        target: '/account',
        title: 'Akun Saya',
        content: 'Atur profil, lihat wishlist, dan kelola preferensi aplikasi Anda di halaman ini.',
        position: 'bottom',
    },
];

const OnboardingTour: React.FC<{ onComplete: () => void }> = ({ onComplete }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const step = steps[currentStep];

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete();
        }
    };

    const handleSkip = () => {
        onComplete();
    };

    const getPositionClass = () => {
        switch (step.position) {
            case 'bottom':
                return 'bottom-20 left-4 right-4';
            case 'center':
                return 'top-1/2 left-4 right-4 -translate-y-1/2';
            default:
                return 'top-20 left-4 right-4';
        }
    };
    
    // Simple navigation simulation for tour
    React.useEffect(() => {
        if (window.location.hash !== `#${step.target}`) {
            window.location.hash = step.target;
        }
    }, [currentStep]);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 transition-opacity duration-300">
            <div className={`absolute p-6 bg-surface rounded-lg shadow-2xl border-2 border-primary animate-fade-in-up ${getPositionClass()}`}>
                <button onClick={handleSkip} className="absolute top-2 right-2 p-1 text-text-secondary hover:text-white">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <h3 className="text-xl font-bold text-primary mb-2">{step.title}</h3>
                <p className="text-text-primary mb-4">{step.content}</p>
                <div className="flex justify-between items-center">
                    <span className="text-sm text-text-secondary">{currentStep + 1} / {steps.length}</span>
                    <button onClick={handleNext} className="btn-primary px-4 py-2 rounded text-sm">
                        {currentStep < steps.length - 1 ? 'Lanjut' : 'Selesai'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default OnboardingTour;
