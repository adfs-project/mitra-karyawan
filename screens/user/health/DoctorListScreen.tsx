import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useData } from '../../../contexts/DataContext';
import { ArrowLeftIcon, VideoCameraIcon } from '@heroicons/react/24/solid';
import { Doctor } from '../../../types';

const DoctorCard: React.FC<{ doctor: Doctor }> = ({ doctor }) => (
    <Link to={`/doctor/${doctor.id}`} className="bg-surface p-4 rounded-lg border border-border-color hover:border-primary hover:bg-surface-light transition-all flex items-center space-x-4 text-left w-full">
        <img src={doctor.imageUrl} alt={doctor.name} className="w-16 h-16 rounded-full flex-shrink-0 object-cover" />
        <div className="flex-grow">
            <h3 className="font-bold text-text-primary">{doctor.name}</h3>
            <p className="text-sm text-primary font-semibold">{doctor.specialty}</p>
            <p className="text-xs text-text-secondary mt-1">{doctor.bio.substring(0, 50)}...</p>
        </div>
        <div className="text-right">
            <p className="font-bold text-lg text-secondary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(doctor.consultationFee)}</p>
            <p className="text-xs text-text-secondary">per sesi</p>
        </div>
    </Link>
);


const DoctorListScreen: React.FC = () => {
    const navigate = useNavigate();
    const { doctors } = useData();

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary flex items-center">
                    <VideoCameraIcon className="h-6 w-6 mr-2" />
                    Telekonsultasi
                </h1>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <p className="text-sm text-text-secondary mb-4">Pilih dokter yang tersedia untuk memulai sesi konsultasi video.</p>
                {doctors.length > 0 ? (
                    <div className="space-y-3">
                        {doctors.map(doc => (
                            <DoctorCard key={doc.id} doctor={doc} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center py-8 text-text-secondary">Saat ini tidak ada dokter yang tersedia.</p>
                )}
            </div>
        </div>
    );
};

export default DoctorListScreen;