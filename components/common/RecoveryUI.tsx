import React, { useState } from 'react';
import * as ErrorBoundaryModule from 'react-error-boundary';
import { ExclamationTriangleIcon, ArrowLeftOnRectangleIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { useApp } from '../../contexts/AppContext';

const RecoveryUI: React.FC<ErrorBoundaryModule.FallbackProps> = ({ error, resetErrorBoundary }) => {
    const { showToast } = useApp();
    const [userDescription, setUserDescription] = useState('');

    // AI Diagnostics are disabled per user request.
    
    const handleReturnToHome = () => {
        try {
            // The resetErrorBoundary function will try to re-render the component tree
            // from before the error occurred.
            resetErrorBoundary();
            showToast("Mencoba memulihkan aplikasi...", "info");
        } catch (err) {
            console.error("Failed to reset error boundary, forcing redirect:", err);
            // Fallback to hard refresh if reset fails
            sessionStorage.clear();
            window.location.href = '/';
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-background text-text-primary p-4">
            <div className="text-center bg-surface p-8 rounded-lg border border-red-500 max-w-2xl w-full">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-primary mb-2">Terjadi Kesalahan Aplikasi</h1>
                <p className="text-text-secondary mb-6">
                    Sistem kami telah mendeteksi adanya masalah. Mohon jelaskan apa yang Anda lakukan sebelum error terjadi untuk membantu kami memperbaikinya.
                </p>

                {/* AI Diagnostics section is disabled per user request */}

                <div className="text-left my-6">
                    <h2 className="font-bold text-lg flex items-center mb-2">
                        <PencilSquareIcon className="h-5 w-5 mr-2 text-text-secondary" />
                        Jelaskan Masalah Anda
                    </h2>
                    <textarea
                        value={userDescription}
                        onChange={(e) => setUserDescription(e.target.value)}
                        rows={3}
                        className="w-full bg-surface-light p-2 border border-border-color rounded-lg text-sm focus:ring-1 focus:ring-primary focus:outline-none"
                        placeholder="Contoh: Aplikasi error setelah saya menekan tombol 'Beli' di halaman marketplace..."
                    />
                </div>

                <div className="mt-4">
                    <button
                        onClick={handleReturnToHome}
                        className="btn-secondary px-6 py-3 rounded-lg font-bold flex items-center justify-center w-full"
                    >
                        <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                        Kembali & Coba Lagi
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecoveryUI;
