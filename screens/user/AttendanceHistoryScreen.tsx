import React from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ClipboardDocumentListIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { Coordinates } from '../../types';

const LocationInfo: React.FC<{ location?: Coordinates }> = ({ location }) => {
    if (!location) return null;
    return (
        <p className="text-xs text-text-secondary mt-1 flex items-center">
            <MapPinIcon className="h-3 w-3 mr-1" />
            {location.latitude.toFixed(4)}, {location.longitude.toFixed(4)}
        </p>
    );
};

const AttendanceHistoryScreen: React.FC = () => {
    const { user } = useAuth();
    const { attendanceRecords } = useData();
    const navigate = useNavigate();

    const userRecords = attendanceRecords
        .filter(r => r.userId === user?.id)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

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
                                <div className="flex justify-between items-start mt-2 text-sm">
                                    <div>
                                        <p className="text-text-secondary">Masuk</p>
                                        <p className="font-semibold">{formatTime(record.clockInTime)}</p>
                                        <LocationInfo location={record.clockInLocation} />
                                    </div>
                                    <div className="text-right">
                                        <p className="text-text-secondary">Keluar</p>
                                        <p className="font-semibold">{formatTime(record.clockOutTime)}</p>
                                        <LocationInfo location={record.clockOutLocation} />
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
    );
};

export default AttendanceHistoryScreen;