import React, { useState } from 'react';
import { useHealth } from '../../contexts/HealthContext';
import { Link } from 'react-router-dom';
import { BeakerIcon, UserGroupIcon, DocumentTextIcon, ClipboardDocumentListIcon, ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/solid';
import SymptomCheckerModal from '../../components/user/health/SymptomCheckerModal';
import WellnessHub from '../../components/user/health/WellnessHub';
import { useAuth } from '../../contexts/AuthContext';

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

const HealthPlusUpsellCard: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;

    const destination = user.isPremium ? "/health-plus" : "/subscribe-health-plus";

    return (
        <Link to={destination} className="block bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-lg border border-primary/50 hover:border-primary transition-all mb-6">
            <div className="flex items-center">
                <SparklesIcon className="h-12 w-12 text-primary mr-4" />
                <div>
                    <div className="flex items-center">
                        <h2 className="text-xl font-bold text-text-primary">Health+ AI Coach</h2>
                        {!user.isPremium && (
                             <span className="ml-2 text-xs font-bold bg-secondary text-black px-2 py-0.5 rounded-full">PREMIUM</span>
                        )}
                    </div>
                    <p className="text-sm text-text-secondary">Dapatkan rencana makan, program latihan, dan analisis mood yang dipersonalisasi khusus untuk Anda.</p>
                </div>
            </div>
        </Link>
    );
};


const HealthScreen: React.FC = () => {
    const { doctors } = useHealth();
    const [isSymptomModalOpen, setSymptomModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'Teleconsultation' | 'Wellness'>('Teleconsultation');
    
    const quickAccessButtons = [
        { name: 'Rekam Medis Saya', icon: DocumentTextIcon, path: '/health-record' },
        { name: 'Resep Digital Saya', icon: ClipboardDocumentListIcon, path: '/prescriptions' },
        { name: 'Klaim Asuransi', icon: ShieldCheckIcon, path: '/insurance-claim' },
    ];


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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                         {quickAccessButtons.map(btn => (
                             <Link key={btn.path} to={btn.path} className="flex flex-col items-center justify-center p-3 bg-surface-light rounded-lg font-semibold hover:bg-border-color text-center">
                                <btn.icon className="h-6 w-6 mb-1 text-primary" />
                                <span className="text-xs">{btn.name}</span>
                            </Link>
                         ))}
                    </div>

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
                    <HealthPlusUpsellCard />
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