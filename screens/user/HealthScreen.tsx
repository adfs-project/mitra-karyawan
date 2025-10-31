import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import SymptomCheckerModal from '../../components/user/health/SymptomCheckerModal';
import WellnessHub from '../../components/user/health/WellnessHub';

import {
    UsersIcon,
    ChatBubbleLeftRightIcon,
    ClipboardDocumentCheckIcon,
    DocumentTextIcon,
    ShieldCheckIcon,
    BeakerIcon,
    SparklesIcon,
} from '@heroicons/react/24/solid';

const FeatureCard: React.FC<{ title: string, description: string, icon: React.ElementType, onClick: () => void, disabled?: boolean }> =
    ({ title, description, icon: Icon, onClick, disabled }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        className="bg-surface p-4 rounded-lg border border-border-color hover:border-primary hover:bg-surface-light transition-all flex items-start space-x-4 text-left w-full disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:border-border-color"
    >
        <div className="p-2 bg-primary/20 rounded-lg mt-1">
            <Icon className="h-6 w-6 text-primary" />
        </div>
        <div>
            <h3 className="font-bold text-text-primary">{title}</h3>
            <p className="text-sm text-text-secondary">{description}</p>
        </div>
    </button>
);

const HealthScreen: React.FC = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const { homePageConfig } = useApp();
    const [isSymptomModalOpen, setSymptomModalOpen] = useState(false);

    const isSymptomCheckerEnabled = homePageConfig.featureFlags.aiSymptomChecker;

    return (
        <div className="p-4 space-y-6">
            <div>
                <h1 className="text-3xl font-bold text-primary">Pusat Kesehatan</h1>
                <p className="text-text-secondary">Kelola semua kebutuhan kesehatan Anda di satu tempat.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FeatureCard
                    title="Telekonsultasi"
                    description="Jadwalkan sesi konsultasi video dengan dokter kami."
                    icon={UsersIcon}
                    onClick={() => navigate('/health')} // Placeholder, should go to doctor list
                />
                <FeatureCard
                    title="Riwayat Konsultasi"
                    description="Lihat semua riwayat dan jadwal konsultasi Anda."
                    icon={ChatBubbleLeftRightIcon}
                    onClick={() => navigate('/my-consultations')}
                />
                 <FeatureCard
                    title="Resep Digital"
                    description="Lihat dan tebus resep obat digital dari dokter."
                    icon={ClipboardDocumentCheckIcon}
                    onClick={() => navigate('/prescriptions')}
                />
                 <FeatureCard
                    title="Rekam Medis Saya"
                    description="Unggah dan kelola dokumen kesehatan pribadi Anda."
                    icon={DocumentTextIcon}
                    onClick={() => navigate('/health-records')}
                />
                 <FeatureCard
                    title="Klaim Asuransi"
                    description="Ajukan klaim asuransi rawat jalan atau rawat inap."
                    icon={ShieldCheckIcon}
                    onClick={() => navigate('/insurance-claims')}
                />
                <FeatureCard
                    title="Info Kesehatan AI"
                    description="Dapatkan informasi umum tentang gejala (bukan diagnosis)."
                    icon={BeakerIcon}
                    onClick={() => setSymptomModalOpen(true)}
                    disabled={!isSymptomCheckerEnabled}
                />
                 {!user?.isPremium && (
                    <div className="md:col-span-2">
                        <button onClick={() => navigate('/subscribe-health-plus')} className="w-full bg-gradient-to-r from-primary/20 to-secondary/20 p-4 rounded-lg border border-primary/50 hover:border-primary transition-all flex items-center text-left space-x-4">
                             <SparklesIcon className="h-8 w-8 text-primary" />
                             <div>
                                <h2 className="text-lg font-bold text-text-primary">Tingkatkan ke Health+</h2>
                                <p className="text-sm text-text-secondary">Buka AI Health Coach untuk rencana makan & latihan personal.</p>
                            </div>
                        </button>
                    </div>
                )}
            </div>
            
            <WellnessHub />

            <SymptomCheckerModal isOpen={isSymptomModalOpen} onClose={() => setSymptomModalOpen(false)} />
        </div>
    );
};

export default HealthScreen;