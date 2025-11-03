import React from 'react';
import * as ErrorBoundaryModule from 'react-error-boundary';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const RecoveryUI: React.FC<ErrorBoundaryModule.FallbackProps> = ({ error }) => {
    
    const handleReturnToPreviousPage = () => {
        // A manual override to navigate back to the previous page.
        window.history.back();
    };


    return (
        <div className="flex items-center justify-center h-screen w-screen bg-background text-text-primary p-4">
            <div className="text-center bg-surface p-8 rounded-lg border border-red-500 max-w-2xl w-full">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-primary mb-2">Terjadi Kesalahan Aplikasi</h1>
                <p className="text-text-secondary mb-6">
                    Sistem mendeteksi adanya kesalahan. Silakan coba kembali ke halaman sebelumnya.
                </p>

                <div className="text-left my-6 bg-surface-light p-4 rounded-lg border border-border-color">
                    <h2 className="font-bold text-lg mb-2">Penjelasan Teknis</h2>
                    <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono">
                        {error.message}
                    </pre>
                </div>

                 <div className="mt-4">
                    <button
                        onClick={handleReturnToPreviousPage}
                        className="text-sm font-semibold text-primary hover:underline"
                    >
                        Kembali ke halaman sebelumnya
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RecoveryUI;