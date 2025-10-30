import React, { useState, useEffect } from 'react';
// FIX: Replaced useData with useCore as it is the correct exported member from DataContext.
import { useCore } from '../../contexts/DataContext';
import { ShieldCheckIcon, ShieldExclamationIcon, PuzzlePieceIcon } from '@heroicons/react/24/solid';
import loggingService, { LogEntry } from '../../services/loggingService';

const ToggleSwitch: React.FC<{
    label: string;
    description: string;
    enabled: boolean;
    onToggle: (enabled: boolean) => void;
    Icon: React.ElementType;
    iconColor: string;
}> = ({ label, description, enabled, onToggle, Icon, iconColor }) => {
    return (
        <div className="bg-surface-light p-4 rounded-lg border border-border-color flex justify-between items-center">
            <div className="flex items-start">
                <div className={`p-2 rounded-full mr-4 ${enabled ? `${iconColor}/20` : 'bg-primary/20'}`}>
                     <Icon className={`h-6 w-6 ${enabled ? iconColor : 'text-primary'}`} />
                </div>
                <div>
                    <h3 className="font-bold text-text-primary">{label}</h3>
                    <p className="text-sm text-text-secondary max-w-xl">{description}</p>
                </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" checked={enabled} onChange={(e) => onToggle(e.target.checked)} className="sr-only peer" />
                <div className={`w-14 h-8 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all ${enabled ? 'peer-checked:bg-secondary' : 'peer-checked:bg-primary'}`}></div>
            </label>
        </div>
    );
};

const ErrorLogViewer: React.FC = () => {
    const [logs, setLogs] = useState<LogEntry[]>([]);

    useEffect(() => {
        setLogs(loggingService.getRecentLogs());
    }, []);

    const handleClearLogs = () => {
        loggingService.clearLogs();
        setLogs([]);
    }

    return (
        <div className="bg-surface p-6 rounded-lg border border-border-color">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Simulated Error Log</h2>
                <button onClick={handleClearLogs} className="text-sm btn-secondary px-3 py-1 rounded">Clear Logs</button>
            </div>
            <div className="bg-black font-mono text-xs rounded-lg p-4 h-96 overflow-y-auto">
                {logs.length > 0 ? logs.map(log => (
                    <div key={log.timestamp} className="border-b border-gray-700 pb-2 mb-2">
                        <p className="text-yellow-400">[{log.timestamp}]</p>
                        <p className="text-red-500 font-bold">{log.message}</p>
                        {log.metadata && <p className="text-blue-400">Meta: {JSON.stringify(log.metadata)}</p>}
                        {log.stack && <pre className="text-gray-500 whitespace-pre-wrap">{log.stack}</pre>}
                    </div>
                )) : <p className="text-gray-500">No errors logged in this session.</p>}
            </div>
        </div>
    )
}


const AdminDemoControlScreen: React.FC = () => {
    const { 
        homePageConfig,
        updateHomePageConfig
    } = useCore();
    const [activeTab, setActiveTab] = useState<'Settings' | 'Logs'>('Settings');

    const handleFeatureFlagToggle = (flagName: keyof typeof homePageConfig.featureFlags, enabled: boolean) => {
        const newConfig = {
            ...homePageConfig,
            featureFlags: {
                ...homePageConfig.featureFlags,
                [flagName]: enabled
            }
        };
        updateHomePageConfig(newConfig);
    }


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">AI, Privacy & Feature Controls</h1>
            <p className="text-text-secondary max-w-3xl">Kelola pengaturan privasi, fungsionalitas AI, dan aktifkan fitur eksperimental di seluruh aplikasi.</p>

             <div className="flex border-b border-border-color">
                <button onClick={() => setActiveTab('Settings')} className={`px-4 py-2 font-semibold ${activeTab === 'Settings' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                    Settings
                </button>
                <button onClick={() => setActiveTab('Logs')} className={`px-4 py-2 font-semibold ${activeTab === 'Logs' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                    Error Log Viewer
                </button>
            </div>

            {activeTab === 'Settings' ? (
                <div className="space-y-6">
                    <div>
                        <h2 className="text-xl font-bold mb-2">AI Privacy</h2>
                        <div className="bg-surface-light p-4 rounded-lg border border-border-color flex items-center">
                            <div className="p-2 rounded-full mr-4 bg-primary/20">
                                <ShieldCheckIcon className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-bold text-text-primary">'Zero Data Access' AI Guardrail</h3>
                                <p className="text-sm text-text-secondary max-w-xl">
                                    Protokol privasi AI diaktifkan secara permanen. AI tidak dapat mengakses data pengguna apa pun, memastikan privasi dan keamanan maksimum.
                                </p>
                            </div>
                        </div>
                    </div>
                     <div>
                        <h2 className="text-xl font-bold mb-2">Feature Flags</h2>
                         <ToggleSwitch
                            label="Enable 'AI Investment Bot' Feature"
                            description="Aktifkan fitur eksperimental 'AI Investment Bot' di menu Akses Cepat pada halaman utama pengguna. Gunakan ini untuk mensimulasikan peluncuran fitur baru yang berisiko."
                            enabled={homePageConfig.featureFlags.aiInvestmentBot}
                            onToggle={(enabled) => handleFeatureFlagToggle('aiInvestmentBot', enabled)}
                            Icon={PuzzlePieceIcon}
                            iconColor="text-blue-400"
                        />
                    </div>
                </div>
            ) : (
                <ErrorLogViewer />
            )}
        </div>
    );
};

export default AdminDemoControlScreen;