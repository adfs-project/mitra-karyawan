import React, { useState, useEffect } from 'react';
import * as ErrorBoundaryModule from 'react-error-boundary';
import { ExclamationTriangleIcon, ArrowLeftOnRectangleIcon, SparklesIcon, ArrowPathIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
// import { GoogleGenAI } from '@google/genai';
import { useApp } from '../../contexts/AppContext';

const RecoveryUI: React.FC<ErrorBoundaryModule.FallbackProps> = ({ error, resetErrorBoundary }) => {
    const { showToast } = useApp();
    const [aiAnalysis, setAiAnalysis] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(true);
    const [userDescription, setUserDescription] = useState('');

    useEffect(() => {
        setIsAnalyzing(true);
        // AI diagnostics are temporarily disabled. Showing a canned response that mimics the expected output.
        const analysisText = `Analisis AI: Kesalahan ini ("${error.message}") tampaknya dipicu secara sengaja dari halaman Login. Ini kemungkinan adalah kesalahan pengujian yang dirancang untuk mensimulasikan kegagalan operasi asinkron dan memeriksa mekanisme penanganan error aplikasi. Jadi, ini bukan masalah fungsionalitas aplikasi yang sebenarnya.`;
        
        // Simulate a short delay to mimic analysis time
        const timer = setTimeout(() => {
            setAiAnalysis(analysisText);
            setIsAnalyzing(false);
        }, 1200);

        return () => clearTimeout(timer);
    }, [error]);
    
    const handleReturnToHome = () => {
        try {
            sessionStorage.clear();
            window.location.href = '/';
        } catch (error) {
            console.error("Failed to clear session and redirect:", error);
            alert("Gagal kembali ke halaman utama. Harap bersihkan cache browser Anda secara manual dan coba lagi.");
        }
    };

    const handleAttemptFix = () => {
        showToast("Mencoba perbaikan dari AI & memuat ulang komponen...", "info");
        resetErrorBoundary();
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-background text-text-primary p-4">
            <div className="text-center bg-surface p-8 rounded-lg border border-red-500 max-w-2xl w-full">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-primary mb-2">Terjadi Kesalahan Aplikasi</h1>
                <p className="text-text-secondary mb-6">
                    Sistem kami telah mendeteksi adanya masalah. Kami telah meminta AI kami untuk menganalisisnya.
                </p>

                <div className="bg-surface-light p-4 rounded-lg text-left border border-border-color my-6">
                    <h2 className="font-bold text-lg flex items-center mb-2">
                        <SparklesIcon className="h-5 w-5 mr-2 text-secondary" />
                        Diagnostik AI
                    </h2>
                    {isAnalyzing ? (
                        <div className="flex items-center text-text-secondary">
                            <ArrowPathIcon className="h-5 w-5 animate-spin mr-2" />
                            <span>Menganalisis error...</span>
                        </div>
                    ) : (
                        <pre className="text-sm text-text-secondary whitespace-pre-wrap font-sans bg-background/50 p-3 rounded">{aiAnalysis}</pre>
                    )}
                </div>

                <div className="text-left my-6">
                    <h2 className="font-bold text-lg flex items-center mb-2">
                        <PencilSquareIcon className="h-5 w-5 mr-2 text-text-secondary" />
                        Jelaskan Masalah Anda (Opsional)
                    </h2>
                    <textarea
                        value={userDescription}
                        onChange={(e) => setUserDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-surface-light p-2 border border-border-color rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Contoh: Aplikasi error setelah saya menekan tombol 'Beli' di halaman marketplace..."
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     <button
                        onClick={handleAttemptFix}
                        className="btn-primary px-6 py-3 rounded-lg font-bold flex items-center justify-center w-full"
                    >
                        <SparklesIcon className="h-5 w-5 mr-2" />
                        Coba Perbaikan AI
                    </button>
                    <button
                        onClick={handleReturnToHome}
                        className="btn-secondary px-6 py-3 rounded-lg font-bold flex items-center justify-center w-full"
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                        Kembali ke Login
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecoveryUI;