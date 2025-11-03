import React from 'react';
import { ArrowDownTrayIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface InstallBannerProps {
    onInstall: () => void;
    onDismiss: () => void;
}

const InstallBanner: React.FC<InstallBannerProps> = ({ onInstall, onDismiss }) => {
    return (
        <div className="fixed bottom-16 left-0 right-0 z-40 p-4 animate-fade-in-up md:bottom-4">
            <div className="max-w-md mx-auto bg-surface-light rounded-lg shadow-2xl p-4 border border-border-color flex items-center justify-between">
                <div className="flex items-center">
                    <img src="/vite.svg" alt="App Logo" className="h-10 w-10 mr-3" />
                    <div>
                        <p className="font-bold text-text-primary">Install Mitra Karyawan</p>
                        <p className="text-xs text-text-secondary">Tambah ke layar utama untuk pengalaman terbaik.</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <button
                        onClick={onInstall}
                        className="btn-primary flex items-center px-3 py-2 rounded-lg text-sm font-bold"
                    >
                        <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                        Install
                    </button>
                    <button
                        onClick={onDismiss}
                        className="p-2 rounded-full hover:bg-surface"
                        aria-label="Dismiss install prompt"
                    >
                        <XMarkIcon className="h-5 w-5 text-text-secondary" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default InstallBanner;