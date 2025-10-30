import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { StethoscopeIcon, ClipboardDocumentListIcon, BeakerIcon, ShieldCheckIcon, DocumentTextIcon, SparklesIcon } from '@heroicons/react/24/solid';
import WellnessHub from '../../components/user/health/WellnessHub';
import SymptomCheckerModal from '../../components/user/health/SymptomCheckerModal';

const ActionCard: React.FC<{ title: string, to: string, icon: React.ElementType }> = ({ title, to, icon: Icon }) => (
    <Link to={to} className="bg-surface p-4 rounded-lg flex flex-col items-center justify-center text-center border border-border-color hover:border-primary transition-colors">
        <Icon className="h-10 w-10 text-primary mb-2" />
        <span className="text-sm font-semibold">{title}</span>
    </Link>
);


const HealthScreen: React.FC = () => {
    const [isSymptomModalOpen, setSymptomModalOpen] = useState(false);

    return (
        <div className="p-4 space-y-8">
            <h1 className="text-3xl font-bold text-primary">Pusat Kesehatan</h1>
            
            <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setSymptomModalOpen(true)} className="bg-surface p-4 rounded-lg flex flex-col items-center justify-center text-center border border-border-color hover:border-primary transition-colors">
                    <BeakerIcon className="h-10 w-10 text-primary mb-2" />
                    <span className="text-sm font-semibold">Cek Gejala AI</span>
                </button>
                <ActionCard title="Konsultasi Dokter" to="/placeholder/doctor-list" icon={StethoscopeIcon} />
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="font-bold mb-3">Layanan Kesehatan Saya</h2>
                <div className="space-y-2">
                    <Link to="/my-consultations" className="block p-3 bg-surface-light rounded-lg font-semibold text-sm hover:bg-border-color">Riwayat Konsultasi</Link>
                    <Link to="/prescriptions" className="block p-3 bg-surface-light rounded-lg font-semibold text-sm hover:bg-border-color">Resep Digital Saya</Link>
                    <Link to="/health-records" className="block p-3 bg-surface-light rounded-lg font-semibold text-sm hover:bg-border-color">Rekam Medis Saya</Link>
                    <Link to="/insurance-claims" className="block p-3 bg-surface-light rounded-lg font-semibold text-sm hover:bg-border-color">Klaim Asuransi</Link>
                </div>
            </div>
            
            <Link to="/subscribe-health-plus" className="block p-4 rounded-lg bg-gradient-to-r from-primary/20 to-secondary/20 border border-primary/50 text-center">
                 <h3 className="font-bold text-lg text-text-primary flex items-center justify-center"><SparklesIcon className="h-5 w-5 mr-2"/> Tingkatkan ke Health+</h3>
                 <p className="text-sm text-text-secondary mt-1">Dapatkan AI Health Coach pribadi dan penyimpanan dokumen tanpa batas.</p>
            </Link>

            <WellnessHub />

            <SymptomCheckerModal 
                isOpen={isSymptomModalOpen}
                onClose={() => setSymptomModalOpen(false)}
            />
        </div>
    );
};

export default HealthScreen;