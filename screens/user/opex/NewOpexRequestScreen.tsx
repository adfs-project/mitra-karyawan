import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../packages/shared/contexts/DataContext';
import { ArrowLeftIcon, CameraIcon } from '@heroicons/react/24/solid';
import { OpexRequestType, Coordinates } from '../../../packages/shared/types';
import AttendanceCameraModal from '../../../components/user/AttendanceCameraModal';

const opexTypes: OpexRequestType[] = ['Bensin', 'Token Listrik', 'Beli Barang', 'Fotocopy', 'Parkir', 'Tiket Pesawat/Kereta', 'Booking Hotel', 'Biaya Makan Perjalanan Dinas'];

const NewOpexRequestScreen: React.FC = () => {
    const navigate = useNavigate();
    const { showToast, submitOpexRequest } = useData();

    const [type, setType] = useState<OpexRequestType>('Bensin');
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState('');
    const [proofPhotoUrl1, setProofPhotoUrl1] = useState<string | null>(null);
    const [proofPhotoUrl2, setProofPhotoUrl2] = useState<string | null>(null);

    const [isCameraOpen, setIsCameraOpen] = useState(false);
    const [cameraTarget, setCameraTarget] = useState<'photo1' | 'photo2' | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const isMealAllowance = type === 'Biaya Makan Perjalanan Dinas';

    const openCamera = (target: 'photo1' | 'photo2') => {
        setCameraTarget(target);
        setIsCameraOpen(true);
    };

    const handleCapture = (photoUrl: string) => {
        if (cameraTarget === 'photo1') {
            setProofPhotoUrl1(photoUrl);
        } else if (cameraTarget === 'photo2') {
            setProofPhotoUrl2(photoUrl);
        }
        setIsCameraOpen(false);
        setCameraTarget(null);
    };

    const handleSubmit = () => {
        if (!isMealAllowance && (amount <= 0 || !proofPhotoUrl1 || !proofPhotoUrl2)) {
            showToast('Harap isi semua kolom dan unggah kedua bukti foto.', 'warning');
            return;
        }
        if (!description.trim()) {
            showToast('Deskripsi harus diisi.', 'warning');
            return;
        }

        setIsSubmitting(true);

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                const { latitude, longitude } = position.coords;
                const proofLocation: Coordinates = { latitude, longitude };
                
                await submitOpexRequest({
                    type,
                    amount: isMealAllowance ? 0 : amount,
                    description,
                    proofLocation,
                    proofPhotoUrl1: proofPhotoUrl1 || '',
                    proofPhotoUrl2: proofPhotoUrl2 || '',
                });
                
                setIsSubmitting(false);
                navigate('/opex');
            },
            (error) => {
                console.error("Geolocation error:", error);
                showToast(`Gagal mendapatkan lokasi: ${error.message}`, 'error');
                setIsSubmitting(false);
            },
            { enableHighAccuracy: true, maximumAge: 0 }
        );
    };

    return (
        <>
            <div className="p-4 space-y-6">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                        <ArrowLeftIcon className="h-6 w-6"/>
                    </button>
                    <h1 className="text-2xl font-bold text-primary">Pengajuan Dana Opex Baru</h1>
                </div>

                <div className="bg-surface p-6 rounded-lg border border-border-color space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Jenis Pengajuan</label>
                        <select value={type} onChange={e => setType(e.target.value as OpexRequestType)} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color">
                            {opexTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>

                    {!isMealAllowance && (
                        <div>
                            <label className="text-sm font-bold text-text-secondary">Jumlah (IDR)</label>
                            <input type="number" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color" />
                        </div>
                    )}

                    <div>
                        <label className="text-sm font-bold text-text-secondary">Deskripsi</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color" placeholder="Jelaskan tujuan pengeluaran..."></textarea>
                    </div>

                    {!isMealAllowance && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-sm font-bold text-text-secondary">Foto Objek/Barang</label>
                                <button onClick={() => openCamera('photo1')} className="mt-1 w-full p-3 bg-surface-light rounded border border-border-color flex items-center justify-center text-sm">
                                    <CameraIcon className="h-5 w-5 mr-2"/> {proofPhotoUrl1 ? "Ganti Foto" : "Ambil Foto"}
                                </button>
                                {proofPhotoUrl1 && <img src={proofPhotoUrl1} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded"/>}
                            </div>
                            <div>
                                <label className="text-sm font-bold text-text-secondary">Foto Nota/Struk</label>
                                <button onClick={() => openCamera('photo2')} className="mt-1 w-full p-3 bg-surface-light rounded border border-border-color flex items-center justify-center text-sm">
                                     <CameraIcon className="h-5 w-5 mr-2"/> {proofPhotoUrl2 ? "Ganti Foto" : "Ambil Foto"}
                                </button>
                                {proofPhotoUrl2 && <img src={proofPhotoUrl2} alt="Preview" className="mt-2 h-24 w-24 object-cover rounded"/>}
                            </div>
                        </div>
                    )}
                    
                    <button onClick={handleSubmit} disabled={isSubmitting} className="w-full btn-primary p-3 rounded-lg font-bold mt-2 flex justify-center items-center">
                        {isSubmitting ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Ajukan'}
                    </button>
                </div>
            </div>

            <AttendanceCameraModal
                isOpen={isCameraOpen}
                onClose={() => setIsCameraOpen(false)}
                onCapture={handleCapture}
                facingMode="environment"
            />
        </>
    );
};

// FIX: Added default export for the component to be lazily loaded.
export default NewOpexRequestScreen;
