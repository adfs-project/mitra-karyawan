import React, { useState, useEffect, useRef } from 'react';
import { CameraIcon, XMarkIcon } from '@heroicons/react/24/solid';

interface AttendanceCameraModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCapture: (photoUrl: string) => void;
}

const AttendanceCameraModal: React.FC<AttendanceCameraModalProps> = ({ isOpen, onClose, onCapture }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setError(null);
            navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } })
                .then(mediaStream => {
                    setStream(mediaStream);
                    if (videoRef.current) {
                        videoRef.current.srcObject = mediaStream;
                    }
                })
                .catch(err => {
                    console.error("Camera access error:", err);
                    setError("Tidak dapat mengakses kamera. Pastikan Anda telah memberikan izin di pengaturan browser.");
                });
        } else {
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
                setStream(null);
            }
        }
    }, [isOpen]);

    const handleCapture = () => {
        if (videoRef.current && canvasRef.current) {
            setIsCapturing(true);
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                // Flip the image horizontally for a mirror effect
                context.translate(canvas.width, 0);
                context.scale(-1, 1);
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                
                // Get the data URL
                const photoUrl = canvas.toDataURL('image/jpeg', 0.8);
                onCapture(photoUrl);
            }
            setIsCapturing(false);
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-90 flex flex-col items-center justify-center z-50 p-4">
            <button onClick={onClose} className="absolute top-4 right-4 p-2 text-white bg-black/50 rounded-full">
                <XMarkIcon className="h-6 w-6" />
            </button>
            <div className="w-full max-w-md aspect-square bg-black rounded-lg overflow-hidden border-2 border-border-color relative">
                {error ? (
                    <div className="flex items-center justify-center h-full text-center text-red-400 p-4">{error}</div>
                ) : (
                    <video ref={videoRef} autoPlay playsInline className="w-full h-full object-cover transform -scale-x-100" />
                )}
                 <canvas ref={canvasRef} className="hidden" />
            </div>
            <p className="text-white text-center mt-4 mb-6">Posisikan wajah Anda di dalam bingkai.</p>
            <button 
                onClick={handleCapture} 
                disabled={!!error || isCapturing}
                className="w-20 h-20 bg-white rounded-full flex items-center justify-center border-4 border-white/50 disabled:opacity-50"
                aria-label="Ambil foto"
            >
                <div className="w-16 h-16 bg-white rounded-full ring-2 ring-inset ring-black"></div>
            </button>
        </div>
    );
};

export default AttendanceCameraModal;
