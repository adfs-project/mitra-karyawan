import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { CreditCardIcon } from '@heroicons/react/24/solid';

const PayLaterStatusCard: React.FC = () => {
    const { user } = useAuth();
    const { applyForPayLater } = useData();
    const [isLoading, setIsLoading] = React.useState(false);

    const handleApply = async () => {
        setIsLoading(true);
        // Add a small delay for UX
        await new Promise(resolve => setTimeout(resolve, 500));
        applyForPayLater();
        setIsLoading(false);
    };

    const payLaterStatus = user?.payLater?.status || 'not_applied';
    const limit = user?.payLater?.limit || 0;
    const remainingLimit = user?.payLater?.remainingLimit || 0;
    const progress = limit > 0 ? (remainingLimit / limit) * 100 : 0;

    const renderContent = () => {
        switch (payLaterStatus) {
            case 'pending':
                return (
                    <div className="text-center">
                        <p className="font-semibold text-text-primary">Pengajuan Sedang Ditinjau</p>
                        <p className="text-sm text-text-secondary mt-1">Tim kami akan segera memverifikasi pengajuan Anda.</p>
                    </div>
                );
            case 'rejected':
                return (
                     <div className="text-center">
                        <p className="font-semibold text-red-400">Pengajuan Ditolak</p>
                        <p className="text-sm text-text-secondary mt-1">Maaf, pengajuan Anda belum dapat kami setujui saat ini.</p>
                         <button onClick={handleApply} disabled={isLoading} className="mt-4 btn-secondary text-sm px-4 py-2 rounded-lg font-bold">
                            {isLoading ? 'Mengajukan...' : 'Ajukan Kembali'}
                        </button>
                    </div>
                );
            case 'approved':
                return (
                    <div>
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-text-secondary">Sisa Limit</span>
                            <span className="text-sm text-text-secondary">Limit: {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(limit)}</span>
                        </div>
                        <p className="font-bold text-2xl text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(remainingLimit)}</p>
                        <div className="w-full bg-surface-light rounded-full h-2.5 mt-2">
                            <div className="bg-primary h-2.5 rounded-full" style={{ width: `${progress}%` }}></div>
                        </div>
                    </div>
                );
            case 'not_applied':
            default:
                return (
                    <div className="text-center">
                        <p className="font-semibold text-text-primary">Nikmati Belanja Sekarang, Bayar Nanti</p>
                        <button onClick={handleApply} disabled={isLoading} className="mt-4 btn-primary px-4 py-2 rounded-lg font-bold">
                            {isLoading ? 'Memproses...' : 'Aktifkan PayLater'}
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="bg-surface p-4 rounded-lg border border-border-color">
            <h3 className="text-lg font-bold text-text-primary mb-3 flex items-center">
                <CreditCardIcon className="h-5 w-5 mr-2 text-primary" />
                Mitra PayLater
            </h3>
            {renderContent()}
        </div>
    );
};

export default PayLaterStatusCard;