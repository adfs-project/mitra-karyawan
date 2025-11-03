import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Doctor, useData } from '@mk/shared';
import { XMarkIcon } from '@heroicons/react/24/solid';

const BookingModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    doctor: Doctor | null;
    slotTime: string | null;
}> = ({ isOpen, onClose, doctor, slotTime }) => {
    const { bookConsultation } = useData();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean; message: string; consultationId?: string } | null>(null);

    const handleConfirmBooking = async () => {
        if (!doctor || !slotTime) return;
        setIsLoading(true);
        const res = await bookConsultation(doctor.id, slotTime);
        setResult(res);
        setIsLoading(false);
    };

    const handleClose = () => {
        setResult(null);
        onClose();
    };

    const goToConsultation = () => {
        if(result?.consultationId) {
            navigate(`/consultation/${result.consultationId}`);
        }
    };

    if (!isOpen || !doctor || !slotTime) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg shadow-lg w-full max-w-sm border border-border-color relative">
                <button onClick={handleClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-surface-light">
                    <XMarkIcon className="h-6 w-6 text-text-secondary" />
                </button>
                <h2 className="text-xl font-bold text-primary mb-4">Konfirmasi Jadwal</h2>

                {result ? (
                    <div className={`text-center p-4 rounded-lg ${result.success ? 'bg-green-500/10' : 'bg-red-500/10'}`}>
                        <h3 className={`font-bold text-lg ${result.success ? 'text-green-400' : 'text-red-400'}`}>
                            {result.success ? 'Booking Berhasil!' : 'Booking Gagal!'}
                        </h3>
                        <p className="text-text-secondary mt-1">{result.message}</p>
                        <div className="mt-4 flex space-x-2 justify-center">
                            <button onClick={handleClose} className="px-4 py-2 rounded bg-surface-light">Tutup</button>
                            {result.success && (
                                <button onClick={goToConsultation} className="btn-primary px-4 py-2 rounded">
                                    Mulai Konsultasi
                                </button>
                            )}
                        </div>
                    </div>
                ) : (
                    <div>
                        <p className="text-text-secondary text-sm">Anda akan membuat janji temu dengan:</p>
                        <p className="font-bold text-lg text-text-primary">{doctor.name}</p>
                        <p className="text-text-secondary text-sm">Pada pukul <span className="font-bold text-primary">{slotTime}</span></p>
                        <p className="text-text-secondary text-sm mt-4">Biaya sebesar <span className="font-bold text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(doctor.consultationFee)}</span> akan dipotong dari saldo Anda.</p>
                        <div className="flex justify-end space-x-3 mt-6">
                            <button onClick={handleClose} disabled={isLoading} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color">Batal</button>
                            <button onClick={handleConfirmBooking} disabled={isLoading} className="btn-primary px-6 py-2 rounded w-40 flex items-center justify-center">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Konfirmasi & Bayar'
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BookingModal;