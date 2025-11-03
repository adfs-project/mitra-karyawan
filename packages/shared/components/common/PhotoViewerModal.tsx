import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/solid';

interface PhotoViewerModalProps {
    isOpen: boolean;
    onClose: () => void;
    imageUrl: string | null;
}

const PhotoViewerModal: React.FC<PhotoViewerModalProps> = ({ isOpen, onClose, imageUrl }) => {
    if (!isOpen || !imageUrl) return null;

    return (
        <div
            className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4 animate-fade-in"
            onClick={onClose}
        >
            <div className="relative" onClick={e => e.stopPropagation()}>
                <img
                    src={imageUrl}
                    alt="Attendance verification"
                    className="max-w-full max-h-[90vh] rounded-lg shadow-2xl"
                />
                <button
                    onClick={onClose}
                    className="absolute -top-3 -right-3 bg-white text-black rounded-full p-1.5 shadow-lg"
                    aria-label="Close image viewer"
                >
                    <XMarkIcon className="h-6 w-6" />
                </button>
            </div>
        </div>
    );
};

export default PhotoViewerModal;