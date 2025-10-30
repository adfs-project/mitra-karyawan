

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ClipboardDocumentListIcon, CameraIcon } from '@heroicons/react/24/solid';
import LocationName from '../../components/common/LocationName';
import PhotoViewerModal from '../../components/common/PhotoViewerModal';
import { useHR } from '../../hooks/useHR';

const AttendanceHistoryScreen: React.FC = () => {
    const { user } = useAuth();
    const { attendanceRecords } = useHR();
    const navigate = useNavigate();
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

    const userRecords = attendanceRecords
        .filter(r => r.userId === user?.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const openPhotoModal = (url: string) => {
        setViewingPhotoUrl(url);
        setIsPhotoModalOpen(true);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
        });
    };
    
    const formatTime = (timeString?: string) => {
        if (!timeString) return '-';
        return new Date(timeString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <>
            <div className="p-4 space-y-6">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                        <ArrowLeftIcon className="h-6 w-6"/>
                    </button>
                    <h1 className="text-2xl font-bold text-primary flex items-center">
                        <ClipboardDocumentListIcon className="h-6 w-6 mr-2"/>
                        Riwayat Absensi
                    </h1>
                </div>

                <div className="bg-surface p-4 rounded-lg border border-border-color">
                    {userRecords.length > 0 ? (
                        <div className="space-y-3">
                            {userRecords.map(record => (
                                <div key={record.id} className="bg-surface-light p-4 rounded-lg">
                                    <p className="font-bold text-text-primary">{formatDate(record.date)}</p>
                                    <div className="mt-2 text-sm space-y-3 pt-3 border-t border-border-color">
                                        <div>
                                            <p className="text-text-secondary">Masuk</p>
                                            <p className="font-semibold text-lg">{formatTime(record.clockInTime)}</p>
                                            <div className="flex items-center space-x-1">
                                                <LocationName location={record.clockInLocation} />
                                                {record.clockInPhotoUrl && (
                                                    <button onClick={() => openPhotoModal(record.clockInPhotoUrl!)} className="p-1 rounded-full hover:bg-black/10" aria-label="Lihat foto selfie masuk">
                                                        <CameraIcon className="h-4 w-4 text-primary" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-text-secondary">Keluar</p>
                                            <p className="font-semibold text-lg">{formatTime(record.clockOutTime)}</p>
                                             <div className="flex items-center space-x-1">
                                                <LocationName location={record.clockOutLocation} />
                                                {record.clockOutPhotoUrl && (
                                                    <button onClick={() => openPhotoModal(record.clockOutPhotoUrl!)} className="p-1 rounded-full hover:bg-black/10" aria-label="Lihat foto selfie keluar">
                                                        <CameraIcon className="h-4 w-4 text-primary" />
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12">
                            <ClipboardDocumentListIcon className="h-16 w-16 mx-auto text-text-secondary opacity-50"/>
                            <p className="mt-4 text-text-secondary">Anda belum memiliki riwayat absensi.</p>
                        </div>
                    )}
                </div>
            </div>
            <PhotoViewerModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                imageUrl={viewingPhotoUrl}
            />
        </>
    );
};

export default AttendanceHistoryScreen;