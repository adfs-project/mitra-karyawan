import React from 'react';
import { ExclamationTriangleIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Role } from '../../types';

const NotFoundScreen: React.FC = () => {
    const { user } = useAuth();
    
    const getHomePath = () => {
        if (!user) return '/login';
        switch (user.role) {
            case Role.Admin: return '/admin/dashboard';
            case Role.HR: return '/hr-portal';
            case Role.Finance: return '/finance/dashboard';
            default: return '/home';
        }
    };

    return (
        <div className="space-y-8 flex flex-col items-center justify-center text-center h-full p-4">
            <ExclamationTriangleIcon className="h-24 w-24 text-border-color" />
            <h1 className="text-3xl font-bold text-primary">404 - Halaman Tidak Ditemukan</h1>
            <p className="text-text-secondary max-w-md">
                Maaf, halaman yang Anda cari tidak ada atau Anda tidak memiliki izin untuk mengaksesnya.
            </p>
            <Link
                to={getHomePath()}
                className="btn-secondary flex items-center px-6 py-2 rounded-lg font-bold"
            >
                <ArrowLeftIcon className="h-5 w-5 mr-2" />
                Kembali ke Halaman Utama
            </Link>
        </div>
    );
};

export default NotFoundScreen;