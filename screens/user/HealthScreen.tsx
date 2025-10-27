
import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { BeakerIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { DocumentTextIcon } from '@heroicons/react/24/outline';
import SymptomCheckerModal from '../../components/user/health/SymptomCheckerModal';
import WellnessHub from '../../components/user/health/WellnessHub';

const DoctorCard: React.FC<{ doctor: import('../../types').Doctor }> = ({ doctor }) => (
    <div className="bg-surface p-4 rounded-lg border border-border-color flex items-center space-x-4">
        <img src={doctor.imageUrl} alt={doctor.name} className="w-16 h-16 rounded-full" />
        <div className="flex-grow">
            <p className="font-bold text-text-primary">{doctor.name}</p>
            <p className="text-sm text-primary">{doctor.specialty}</p>
        </div>
        <Link to={`/doctor/${doctor.id}`} className="px-3 py-1 bg-primary text-black text-sm font-semibold rounded-full">
            Lihat
        </Link>
    </div>
);


const HealthScreen: React.FC = () => {
    const { doctors } = useData();
    const [isSymptomModalOpen, setSymptomModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'Teleconsultation' | 'Wellness'>('Teleconsultation');

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Layanan Kesehatan</h1>
            
            <div className="flex border-b border-border-color">
                <button
                    onClick={() => setActiveTab('Teleconsultation')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'Teleconsultation' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
                >
                    Telekonsultasi
                </button>
                 <button
                    onClick={() => setActiveTab('Wellness')}
                    className={`px-4 py-2 font-semibold ${activeTab === 'Wellness' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
                >
                    Kesehatan & Kebugaran
                </button>
            </div>
            
            {activeTab === 'Teleconsultation' ? (
                <div className="space-y-4 animate-fade-in">
                    <button onClick={() => setSymptomModalOpen(true)} className="w-full flex items-center justify-center p-4 bg-secondary/20 text-secondary rounded-lg font-bold text-lg hover:bg-secondary/30">
                        <BeakerIcon className="h-6 w-6 mr-2" />
                        Cek Gejala dengan AI
                    </button>
                    <Link to="/my-consultations" className="w-full flex items-center justify-center p-4 bg-surface-light rounded-lg font-semibold hover:bg-border-color">
                        <DocumentTextIcon className="h-6 w-6 mr-2 text-primary" />
                        Lihat Riwayat Konsultasi Saya
                    </Link>
                    <div>
                        <h2 className="text-xl font-bold text-text-primary my-4 flex items-center"><UserGroupIcon className="h-5 w-5 mr-2" /> Temui Dokter Kami</h2>
                        <div className="space-y-3">
                            {doctors.map(doctor => (
                                <DoctorCard key={doctor.id} doctor={doctor} />
                            ))}
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-fade-in">
                    <WellnessHub />
                </div>
            )}
            
            <SymptomCheckerModal 
                isOpen={isSymptomModalOpen}
                onClose={() => setSymptomModalOpen(false)}
            />
        </div>
    );
};

export default HealthScreen;
