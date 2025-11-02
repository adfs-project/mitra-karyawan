import React from 'react';
import { useData } from '../../contexts/DataContext';
import { ShieldCheckIcon, SparklesIcon, ExclamationTriangleIcon, Cog6ToothIcon, WrenchScrewdriverIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { SystemIntegrityLog, SystemIntegrityLogType } from '../../types';

const logIcons: Record<SystemIntegrityLogType, React.ElementType> = {
    WALLET_SYNC: WrenchScrewdriverIcon,
    CART_CLEANUP: ShoppingCartIcon,
    STOCK_RESET: Cog6ToothIcon,
    DISPUTE_ESCALATION: ExclamationTriangleIcon,
    AUTO_DISPUTE_RESOLUTION: SparklesIcon,
};

const logColors: Record<SystemIntegrityLogType, string> = {
    WALLET_SYNC: 'text-blue-400',
    CART_CLEANUP: 'text-green-400',
    STOCK_RESET: 'text-orange-400',
    DISPUTE_ESCALATION: 'text-yellow-400',
    AUTO_DISPUTE_RESOLUTION: 'text-purple-400',
};

const AdminSystemIntegrityScreen: React.FC = () => {
    const { homePageConfig, updateHomePageConfig, integrityLogs } = useData();

    const isGuardianActive = homePageConfig.isIntegrityGuardianActive;

    const handleToggleGuardian = () => {
        updateHomePageConfig({
            ...homePageConfig,
            isIntegrityGuardianActive: !isGuardianActive,
        });
    };

    const fixesThisSession = integrityLogs.length;
    const autoResolutions = integrityLogs.filter(log => log.type === 'AUTO_DISPUTE_RESOLUTION').length;
    const escalations = integrityLogs.filter(log => log.type === 'DISPUTE_ESCALATION').length;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary flex items-center">
                <ShieldCheckIcon className="h-8 w-8 mr-2" />
                System Integrity Guardian
            </h1>
            <p className="text-text-secondary">Monitor and control the automated system that detects and resolves data inconsistencies.</p>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <div className="flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold">Guardian Status</h2>
                        <p className={`font-semibold ${isGuardianActive ? 'text-green-400' : 'text-red-400'}`}>
                            {isGuardianActive ? 'Active and Monitoring' : 'Inactive'}
                        </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={isGuardianActive} onChange={handleToggleGuardian} className="sr-only peer" />
                        <div className="w-14 h-8 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-primary"></div>
                    </label>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-surface p-4 rounded-lg"><p className="text-text-secondary text-sm">Total Fixes (This Session)</p><p className="text-2xl font-bold">{fixesThisSession}</p></div>
                <div className="bg-surface p-4 rounded-lg"><p className="text-text-secondary text-sm">Auto-Resolved Disputes</p><p className="text-2xl font-bold">{autoResolutions}</p></div>
                <div className="bg-surface p-4 rounded-lg"><p className="text-text-secondary text-sm">Escalated Disputes</p><p className="text-2xl font-bold">{escalations}</p></div>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Guardian Action Log</h2>
                <div className="max-h-96 overflow-y-auto pr-2 space-y-2">
                    {integrityLogs.length > 0 ? integrityLogs.map(log => {
                        const Icon = logIcons[log.type];
                        const color = logColors[log.type];
                        return (
                            <div key={log.id} className="bg-surface-light p-3 rounded-lg flex items-start space-x-3">
                                <Icon className={`h-5 w-5 mt-1 flex-shrink-0 ${color}`} />
                                <div>
                                    <p className="font-semibold text-sm text-text-primary">{log.message}</p>
                                    <p className="text-xs text-text-secondary">{new Date(log.timestamp).toLocaleString()}</p>
                                </div>
                            </div>
                        );
                    }) : (
                        <p className="text-center text-text-secondary py-8">No actions logged by the Guardian in this session.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminSystemIntegrityScreen;