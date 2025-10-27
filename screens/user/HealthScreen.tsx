import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { StethoscopeIcon, BeakerIcon, UserGroupIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Doctor } from '../../types';
import SymptomCheckerModal from '../../components/user/health/SymptomCheckerModal';
import WellnessHub from '../../components/user/health/WellnessHub';

type Tab = 'Layanan Medis' | 'Kesejahteraan';

const DoctorCard: React.FC<{ doctor: Doctor }> = ({ doctor }) => (
    <Link to={`/doctor/${doctor.id}`} className="flex-shrink-0 w-40 text-center bg-surface p-4 rounded-lg border border-border-color hover:border-primary transition-colors">
        <img src={doctor.imageUrl} alt={doctor.name} className="w-24 h-24 rounded-full mx-auto border-2 border-primary" />
        <p className="font-bold mt-2 text-sm text-text-primary truncate">{doctor.name}</p>
        <p className="text-xs text-text-secondary">{doctor.specialty}</p>
    </Link>
);

const MedicalServices: React.FC = () => {
    const { doctors } = useData();
    const [filter, setFilter] = useState('All');

    const specialties = useMemo(() => ['All', ...Array.from(new Set(doctors.map(d => d.specialty)))], [doctors]);
    const filteredDoctors = useMemo(() => {
        if (filter === 'All') return doctors;
        return doctors.filter(d => d.specialty === filter);
    }, [doctors, filter]);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-lg font-bold text-text-primary mb-2">Temui Dokter Kami</h2>
                <div className="flex overflow-x-auto space-x-2 pb-2">
                    {specialties.map(spec => (
                        <button key={spec} onClick={() => setFilter(spec)} className={`flex-shrink-0 px-3 py-1 text-sm rounded-full border ${filter === spec ? 'bg-primary text-black border-primary' : 'bg-surface-light border-border-color text-text-secondary'}`}>
                            {spec}
                        </button>
                    ))}
                </div>
                <div className="flex overflow-x-auto space-x-4 pt-4 pb-2">
                    {filteredDoctors.map(doctor => <DoctorCard key={doctor.id} doctor={doctor} />)}
                </div>
            </div>

            <div className="bg-surface p-4 rounded-lg flex items-center justify-between">
                <div>
                    <h3 className="font-bold text-text-primary">Riwayat Konsultasi</h3>
                    <p className="text-sm text-text-secondary">Lihat semua sesi konsultasi Anda.</p>
                </div>
                <Link to="/my-consultations" className="btn-secondary px-4 py-2 text-sm rounded-lg">Lihat Riwayat</Link>
            </div>
        </div>
    );
};


const HealthScreen: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('Layanan Medis');
    const [isSymptomModalOpen, setSymptomModalOpen] = useState(false);

    return (
        <div className="p-4 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-primary">Layanan Kesehatan</h1>
                <p className="text-text-secondary mt-1">Solusi kesehatan lengkap di ujung jari Anda.</p>
            </div>
            
            <div className="bg-surface p-6 rounded-lg shadow-lg border border-primary/50 text-center">
                <h2 className="text-xl font-bold text-primary flex items-center justify-center">
                    <BeakerIcon className="h-6 w-6 mr-2"/> Asisten Kesehatan AI
                </h2>
                <p className="text-sm text-text-secondary mt-2">Gunakan AI untuk menganalisa gejala kesehatan Anda dan dapatkan rekomendasi dokter yang tepat.</p>
                <button onClick={() => setSymptomModalOpen(true)} className="mt-4 btn-primary px-6 py-2 rounded-full font-bold">
                    Mulai Cek Gejala
                </button>
            </div>
            
            <div>
                <div className="flex border-b border-border-color">
                    {(['Layanan Medis', 'Kesejahteraan'] as Tab[]).map(tab => (
                        <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold flex items-center ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                            {tab === 'Layanan Medis' ? <StethoscopeIcon className="h-5 w-5 mr-2" /> : <HeartIcon className="h-5 w-5 mr-2" />}
                            {tab}
                        </button>
                    ))}
                </div>
                <div className="mt-4">
                    {activeTab === 'Layanan Medis' ? <MedicalServices /> : <WellnessHub />}
                </div>
            </div>

            <SymptomCheckerModal isOpen={isSymptomModalOpen} onClose={() => setSymptomModalOpen(false)} />
        </div>
    );
};

export default HealthScreen;