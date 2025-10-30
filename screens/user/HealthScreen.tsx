import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StethoscopeIcon, ClipboardDocumentListIcon, DocumentTextIcon, ShieldCheckIcon, SparklesIcon, BeakerIcon } from '@heroicons/react/24/solid';
import { useHealth } from '../../contexts/HealthContext';
import { Doctor } from '../../types';
import WellnessHub from '../../components/user/health/WellnessHub';
import SymptomCheckerModal from '../../components/user/health/SymptomCheckerModal';

const DoctorCard: React.FC<{ doctor: Doctor }> = ({ doctor }) => (
    <Link to={`/doctor/${doctor.id}`} className="flex-shrink-0 w-40 bg-surface p-4 rounded-lg text-center border border-border-color hover:border-primary transition-colors">
        <img src={doctor.imageUrl} alt={doctor.name} className="w-20 h-20 rounded-full mx-auto" />
        <p className="font-bold text-sm mt-2">{doctor.name}</p>
        <p className="text-xs text-text-secondary">{doctor.specialty}</p>
    </Link>
);

const HealthScreen: React.FC = () => {
    const { doctors } = useHealth();
    const [isSymptomModalOpen, setIsSymptomModalOpen] = useState(false);

    const quickAccessItems = [
        { name: "Riwayat Konsultasi", icon: ClipboardDocumentListIcon, path: "/my-consultations" },
        { name: "Resep Digital", icon: DocumentTextIcon, path: "/prescriptions" },
        { name: "Rekam Medis Saya", icon: DocumentTextIcon, path: "/health-record" },
        { name: "Klaim Asuransi", icon: ShieldCheckIcon, path: "/insurance-claim" },
    ];

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-primary">Kesehatan</h1>

            <div className="bg-blue-500/10 border border-blue-400 text-blue-300 p-4 rounded-lg text-center">
                <p className="font-bold">Darurat?</p>
                <p className="text-sm mt-1">Segera hubungi 119 atau kunjungi fasilitas kesehatan terdekat.</p>
            </div>
            
            <div className="bg-surface p-4 rounded-lg">
                <h3 className="text-lg font-bold flex items-center mb-4">
                    <StethoscopeIcon className="h-5 w-5 mr-2 text-primary" />
                    Konsultasi Online
                </h3>
                {doctors.length > 0 ? (
                    <div className="flex overflow-x-auto space-x-4 pb-2">
                        {doctors.map(doctor => (
                            <DoctorCard key={doctor.id} doctor={doctor} />
                        ))}
                    </div>
                ) : (
                    <p className="text-center text-sm text-text-secondary py-4">Saat ini belum ada dokter yang tersedia.</p>
                )}
            </div>

            <div className="grid grid-cols-2 gap-4">
                {quickAccessItems.map(item => (
                    <Link key={item.name} to={item.path} className="bg-surface p-4 rounded-lg flex flex-col items-center justify-center text-center">
                        <item.icon className="h-8 w-8 text-primary mb-2" />
                        <span className="text-xs font-semibold">{item.name}</span>
                    </Link>
                ))}
            </div>
            
            <button 
                onClick={() => setIsSymptomModalOpen(true)}
                disabled={true}
                className="w-full btn-secondary p-3 rounded-lg flex items-center justify-center font-bold space-x-2 disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                <BeakerIcon className="h-6 w-6" />
                <span>Cek Info Kesehatan (AI Dinonaktifkan)</span>
            </button>

            <WellnessHub />
            
            <SymptomCheckerModal isOpen={isSymptomModalOpen} onClose={() => setIsSymptomModalOpen(false)} />
        </div>
    );
};

export default HealthScreen;
