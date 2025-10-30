import React from 'react';
import { ExclamationTriangleIcon, ArrowLeftOnRectangleIcon } from '@heroicons/react/24/solid';

const RecoveryUI: React.FC = () => {
    
    const handleReturnToHome = () => {
        try {
            // Clear session storage to break the crash loop and log the user out.
            // This preserves the main application data in local storage.
            sessionStorage.clear();

            // Redirect to the root. The app will then show the login screen.
            window.location.href = '/';
        } catch (error) {
            console.error("Failed to clear session and redirect:", error);
            alert("Gagal kembali ke halaman utama. Harap bersihkan cache browser Anda secara manual dan coba lagi.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-background text-text-primary p-4">
            <div className="text-center bg-surface p-8 rounded-lg border border-red-500 max-w-lg">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-primary mb-2">Aplikasi Gagal Dimuat</h1>
                <p className="text-text-secondary mb-6">
                    Sepertinya terjadi kesalahan kritis yang berulang. Untuk melanjutkan, Anda dapat kembali ke halaman login.
                </p>
                <p className="text-sm text-yellow-400 mb-6">
                    <strong>Informasi:</strong> Tindakan ini akan membersihkan sesi Anda saat ini dan Anda perlu login kembali. Data utama Anda akan tetap aman.
                </p>
                <button
                    onClick={handleReturnToHome}
                    className="btn-secondary px-6 py-3 rounded-lg font-bold flex items-center justify-center w-full"
                >
                    <ArrowLeftOnRectangleIcon className="h-5 w-5 mr-2" />
                    Kembali ke Halaman Login
                </button>
            </div>
        </div>
    );
};

export default RecoveryUI;