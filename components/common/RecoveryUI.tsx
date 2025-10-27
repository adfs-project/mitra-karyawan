import React from 'react';
import { ExclamationTriangleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const RecoveryUI: React.FC = () => {
    
    const handleHardReset = () => {
        console.log("Performing hard reset...");
        try {
            // Clear all potential sources of client-side error
            Object.keys(localStorage).forEach(key => {
                if (key.startsWith('app_')) {
                    localStorage.removeItem(key);
                }
            });
            localStorage.removeItem('app_version'); // Also remove version lock
            sessionStorage.clear();

            // Force reload the page from the server
            window.location.reload();
        } catch (error) {
            console.error("Failed to perform hard reset:", error);
            alert("Could not perform reset. Please clear your browser cache manually and try again.");
        }
    };

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-background text-text-primary p-4">
            <div className="text-center bg-surface p-8 rounded-lg border border-red-500 max-w-lg">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-primary mb-2">Aplikasi Gagal Dimuat</h1>
                <p className="text-text-secondary mb-6">
                    Sepertinya terjadi kesalahan kritis yang berulang. Untuk memperbaiki ini, Anda dapat melakukan reset pada data aplikasi yang tersimpan di browser Anda.
                </p>
                <p className="text-sm text-yellow-400 mb-6">
                    <strong>Penting:</strong> Tindakan ini akan mengeluarkan Anda dari akun dan mereset pengaturan lokal. Anda perlu login kembali.
                </p>
                <button
                    onClick={handleHardReset}
                    className="btn-secondary px-6 py-3 rounded-lg font-bold flex items-center justify-center w-full"
                >
                    <ArrowPathIcon className="h-5 w-5 mr-2" />
                    Hard Reset Aplikasi
                </button>
            </div>
        </div>
    );
};

export default RecoveryUI;
