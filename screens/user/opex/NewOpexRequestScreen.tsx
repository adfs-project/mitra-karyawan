import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useData } from '../../../contexts/DataContext';
import { ArrowLeftIcon, CameraIcon, CheckCircleIcon } from '@heroicons/react/24/solid';
import { Coordinates, OpexRequestType } from '../../../types';
import LocationName from '../../../components/common/LocationName';

type Step = 'form' | 'photoObject' | 'photoReceipt' | 'review';
const opexTypes: OpexRequestType[] = ['Bensin', 'Token Listrik', 'Beli Barang', 'Fotocopy', 'Parkir'];

const CameraView: React.FC<{ onCapture: (url: string) => void; onBack: () => void; title: string; subtitle: string; }> = ({ onCapture, onBack, title, subtitle }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setError(null);
        navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } })
            .then(mediaStream => {
                setStream(mediaStream);
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
            })
            .catch(err => {
                setError("Tidak dapat mengakses kamera belakang. Pastikan Anda telah memberikan izin.");
            });

        return () => {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, canvas.width, canvas.height);
            onCapture(canvas.toDataURL('image/jpeg', 0.8));
        }
    };

    return (
        <div className="fixed inset-0 bg-black z-20 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md text-center">
                <h2 className="text-xl font-bold text-white">{title}</h2>
                <p className="text-gray-300 mb-4">{subtitle}</p>
            </div>
             <div className="w-full max-w-md aspect-video bg-black rounded-lg overflow-hidden border-2 border-border-color relative">
                {error ? <div className="flex items-center justify-center h-full text-center text-red-400 p-4">{error}</div> : <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover" />}
                <canvas ref={canvasRef} className="hidden" />
            </div>
            <div className="w-full max-w-md flex justify-around items-center mt-6">
                <button onClick={onBack} className="text-white font-semibold">Kembali</button>
                 <button onClick={handleCapture} disabled={!!error} className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white/50 disabled:opacity-50">
                    <div className="w-16 h-16 bg-white rounded-full ring-2 ring-inset ring-black"></div>
                </button>
                 <div className="w-16"></div> {/* Placeholder for spacing */}
            </div>
        </div>
    );
};

const NewOpexRequestScreen: React.FC = () => {
    const navigate = useNavigate();
    const { submitOpexRequest, showToast } = useData();
    const [step, setStep] = useState<Step>('form');
    
    const [type, setType] = useState<OpexRequestType>('Bensin');
    const [amount, setAmount] = useState<number>(0);
    const [description, setDescription] = useState('');

    const [photoObjectUrl, setPhotoObjectUrl] = useState<string | null>(null);
    const [photoReceiptUrl, setPhotoReceiptUrl] = useState<string | null>(null);
    const [location, setLocation] = useState<Coordinates | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleNextToPhoto = (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0 || !description.trim()) {
            showToast("Jumlah dan deskripsi harus diisi.", "warning");
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setLocation({ latitude: position.coords.latitude, longitude: position.coords.longitude });
                setStep('photoObject');
            },
            (error) => {
                showToast("Gagal mendapatkan lokasi. Pastikan izin lokasi telah diberikan.", "error");
                console.error("Geolocation Error:", error);
            },
            { enableHighAccuracy: true }
        );
    };

    const handleSubmit = async () => {
        if (!photoObjectUrl || !photoReceiptUrl || !location) {
            showToast("Semua bukti (foto & lokasi) diperlukan.", "error");
            return;
        }
        setIsSubmitting(true);
        await submitOpexRequest({
            type, amount, description, proofLocation: location, proofPhotoUrl1: photoObjectUrl, proofPhotoUrl2: photoReceiptUrl
        });
        setIsSubmitting(false);
        navigate('/opex', { replace: true });
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Pengajuan Opex Baru</h1>
            </div>

            {step === 'form' && (
                <form onSubmit={handleNextToPhoto} className="bg-surface p-6 rounded-lg border border-border-color space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Jenis Pengeluaran</label>
                        <select value={type} onChange={e => setType(e.target.value as any)} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color">
                            {opexTypes.map(t => <option key={t} value={t}>{t}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Jumlah (IDR)</label>
                        <input type="number" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Deskripsi</label>
                        <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color" />
                    </div>
                    <button type="submit" className="w-full btn-primary p-3 rounded-lg font-bold mt-2">Lanjut ke Ambil Foto</button>
                </form>
            )}

            {step === 'photoObject' && (
                <CameraView 
                    onCapture={(url) => { setPhotoObjectUrl(url); setStep('photoReceipt'); }} 
                    onBack={() => setStep('form')}
                    title="Langkah 1: Foto Objek"
                    subtitle="Arahkan kamera ke objek pengeluaran (misal: dispenser SPBU, meteran listrik)."
                />
            )}

            {step === 'photoReceipt' && (
                <CameraView 
                    onCapture={(url) => { setPhotoReceiptUrl(url); setStep('review'); }} 
                    onBack={() => setStep('photoObject')}
                    title="Langkah 2: Foto Nota"
                    subtitle="Arahkan kamera ke bukti pembayaran/nota."
                />
            )}

            {step === 'review' && (
                <div className="bg-surface p-6 rounded-lg border border-border-color space-y-4 animate-fade-in">
                    <h2 className="text-xl font-bold">Konfirmasi Pengajuan</h2>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-text-secondary">Jenis</p><p className="font-bold">{type}</p></div>
                        <div><p className="text-text-secondary">Jumlah</p><p className="font-bold text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount)}</p></div>
                        <div className="col-span-2"><p className="text-text-secondary">Deskripsi</p><p>{description}</p></div>
                        <div className="col-span-2"><p className="text-text-secondary">Lokasi</p><LocationName location={location} /></div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-bold text-text-secondary mb-1">Foto Objek</p>
                            <img src={photoObjectUrl!} alt="Object proof" className="w-full h-32 object-cover rounded-lg border border-border-color"/>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-secondary mb-1">Foto Nota</p>
                            <img src={photoReceiptUrl!} alt="Receipt proof" className="w-full h-32 object-cover rounded-lg border border-border-color"/>
                        </div>
                    </div>
                     <button onClick={handleSubmit} disabled={isSubmitting} className="w-full btn-primary p-3 rounded-lg font-bold mt-2 flex justify-center items-center">
                        {isSubmitting ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Kirim Pengajuan'}
                    </button>
                    <button onClick={() => setStep('form')} disabled={isSubmitting} className="w-full text-center text-sm text-text-secondary mt-2">Ubah Data</button>
                </div>
            )}

        </div>
    );
};

export default NewOpexRequestScreen;
