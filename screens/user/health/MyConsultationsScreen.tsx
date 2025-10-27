import React from 'react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, VideoCameraIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const MyConsultationsScreen: React.FC = () => {
    const { user } = useAuth();
    const { consultations } = useData();
    const navigate = useNavigate();

    const userConsultations = consultations
        .filter(c => c.userId === user?.id)
        .sort((a, b) => new Date(b.scheduledTime).getTime() - new Date(a.scheduledTime).getTime());

    const upcoming = userConsultations.filter(c => c.status === 'Scheduled');
    const completed = userConsultations.filter(c => c.status === 'Completed');

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <h1 className="text-xl font-bold ml-4">Riwayat Konsultasi</h1>
            </div>
            
            <div>
                <h2 className="text-lg font-bold text-primary mb-2">Akan Datang</h2>
                {upcoming.length > 0 ? (
                    <div className="space-y-3">
                        {upcoming.map(c => (
                             <div key={c.id} className="bg-surface p-4 rounded-lg border border-border-color">
                                <p className="font-bold text-text-primary">Konsultasi dengan {c.doctorName}</p>
                                <p className="text-sm text-text-secondary">{c.doctorSpecialty}</p>
                                <p className="text-sm text-text-secondary mt-1">Jadwal: {new Date(c.scheduledTime).toLocaleString()}</p>
                                <Link to={`/consultation/${c.id}`} className="mt-2 inline-flex items-center btn-primary px-3 py-1 text-sm rounded-full">
                                    <VideoCameraIcon className="h-4 w-4 mr-1"/>
                                    Masuk Ruang Konsultasi
                                </Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary text-sm">Tidak ada jadwal konsultasi.</p>
                )}
            </div>

            <div>
                <h2 className="text-lg font-bold text-primary mb-2">Selesai</h2>
                {completed.length > 0 ? (
                    <div className="space-y-3">
                        {completed.map(c => (
                             <div key={c.id} className="bg-surface p-4 rounded-lg border border-border-color">
                                <p className="font-bold text-text-primary">Konsultasi dengan {c.doctorName}</p>
                                <p className="text-sm text-text-secondary">{c.doctorSpecialty}</p>
                                <p className="text-sm text-text-secondary mt-1">Selesai pada: {new Date(c.scheduledTime).toLocaleString()}</p>
                                {c.prescription && (
                                    <Link to={`/consultation/${c.id}`} className="mt-2 inline-flex items-center bg-secondary/20 text-secondary px-3 py-1 text-sm rounded-full">
                                        <DocumentTextIcon className="h-4 w-4 mr-1"/>
                                        Lihat Resep
                                    </Link>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary text-sm">Belum ada konsultasi yang selesai.</p>
                )}
            </div>
        </div>
    );
};

export default MyConsultationsScreen;