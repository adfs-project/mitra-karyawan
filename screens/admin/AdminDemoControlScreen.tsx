import React from 'react';
import { useData } from '../../contexts/DataContext';
import { ShieldCheckIcon, ShieldExclamationIcon } from '@heroicons/react/24/solid';

const ToggleSwitch: React.FC<{
    label: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    Icon: React.ElementType;
}> = ({ label, description, enabled, onToggle, Icon }) => {
    return (
        <div className="bg-surface-light p-4 rounded-lg border border-border-color flex justify-between items-center">
            <div className="flex items-start">
                <div className={`p-2 rounded-full mr-4 ${enabled ? 'bg-secondary/20' : 'bg-primary/20'}`}>
                     <Icon className={`h-6 w-6 ${enabled ? 'text-secondary' : 'text-primary'}`} />
                </div>
                <div>
                    <h3 className="font-bold text-text-primary">{label}</h3>
                    <p className="text-sm text-text-secondary max-w-xl">{description}</p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-secondary"></div>
            </label>
        </div>
    );
};


const AdminAISettingsScreen: React.FC = () => {
    const { 
        isAiGuardrailDisabled,
        toggleAiGuardrail
    } = useData();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">AI & Privacy Settings</h1>
            <p className="text-text-secondary max-w-3xl">Kelola pengaturan privasi dan fungsionalitas untuk asisten AI di seluruh aplikasi.</p>

            <div className="space-y-4">
                 <ToggleSwitch
                    label="Disable 'Zero Data Access' AI Guardrail"
                    description="IZINKAN AI untuk mengakses data pengguna (transaksi, artikel yang disukai) untuk memberikan jawaban yang dipersonalisasi. Menonaktifkan ini akan meningkatkan kemampuan AI secara signifikan namun mengabaikan protokol privasi standar."
                    enabled={isAiGuardrailDisabled}
                    onToggle={toggleAiGuardrail}
                    Icon={isAiGuardrailDisabled ? ShieldExclamationIcon : ShieldCheckIcon}
                />
            </div>
        </div>
    );
};

export default AdminAISettingsScreen;
