import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { LinkIcon, BoltIcon, TicketIcon, PhoneIcon, ChevronDownIcon } from '@heroicons/react/24/solid';
import { IntegrationStatus } from '../../types';

interface Feature {
    id: string;
    name: string;
}

interface FeatureGroup {
    title: string;
    icon: React.ElementType;
    features: Feature[];
}

const featureGroups: FeatureGroup[] = [
    {
        title: 'PPOB & Tagihan',
        icon: BoltIcon,
        features: [
            { id: 'ppob-listrik', name: 'Listrik PLN' },
            { id: 'ppob-pdam', name: 'Air PDAM' },
            { id: 'ppob-internet', name: 'Internet & TV Kabel' },
            { id: 'ppob-bpjs', name: 'BPJS Kesehatan' },
        ],
    },
    {
        title: 'Pulsa & Data',
        icon: PhoneIcon,
        features: [{ id: 'pulsa', name: 'Isi Ulang Pulsa & Paket Data' }],
    },
    {
        title: 'Gaya Hidup',
        icon: TicketIcon,
        features: [
            { id: 'lifestyle-cinema', name: 'Tiket Bioskop' },
            { id: 'lifestyle-game', name: 'Voucher Game' },
            { id: 'lifestyle-donation', name: 'Donasi' },
        ],
    },
];

const ServiceLinkageCard: React.FC<{ group: FeatureGroup }> = ({ group }) => {
    const { apiIntegrations, serviceLinkage, updateServiceLinkage, showToast } = useData();
    
    const activeApis = useMemo(() => 
        apiIntegrations.filter(api => api.status === IntegrationStatus.Active), 
    [apiIntegrations]);

    const handleLinkageChange = (featureId: string, apiId: string) => {
        updateServiceLinkage(featureId, apiId === 'null' ? null : apiId);
        showToast(`${featureId} linkage updated.`, 'success');
    };

    return (
        <div className="bg-surface p-6 rounded-lg border border-border-color">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <group.icon className="h-6 w-6 mr-3 text-primary" />
                {group.title}
            </h2>
            <div className="space-y-4">
                {group.features.map(feature => (
                    <div key={feature.id} className="flex items-center justify-between p-3 bg-surface-light rounded-lg">
                        <span className="font-semibold text-text-primary">{feature.name}</span>
                        <div className="relative">
                             <select
                                value={serviceLinkage[feature.id] || 'null'}
                                onChange={(e) => handleLinkageChange(feature.id, e.target.value)}
                                className="w-48 appearance-none bg-surface border border-border-color rounded-md py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                                disabled={activeApis.length === 0}
                            >
                                <option value="null">-- Tidak Terhubung --</option>
                                {activeApis.map(api => (
                                    <option key={api.id} value={api.id}>{api.name} ({api.type})</option>
                                ))}
                            </select>
                             <ChevronDownIcon className="h-4 w-4 text-text-secondary absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                        </div>
                    </div>
                ))}
                {activeApis.length === 0 && (
                    <p className="text-xs text-center text-yellow-400 p-2 bg-yellow-500/10 rounded-md">
                        Tidak ada API yang aktif. Aktifkan API di menu 'API Integration' untuk menghubungkan layanan.
                    </p>
                )}
            </div>
        </div>
    );
};

const AdminServiceLinkageScreen: React.FC = () => {
    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary flex items-center">
                <LinkIcon className="h-8 w-8 mr-3" />
                Service Linkage Orchestrator
            </h1>
            <p className="text-text-secondary max-w-3xl">
                Hubungkan fitur-fitur aplikasi dengan penyedia API pihak ketiga yang aktif. Jika sebuah fitur tidak terhubung, fitur tersebut akan dinonaktifkan di sisi pengguna.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {featureGroups.map(group => (
                    <ServiceLinkageCard key={group.title} group={group} />
                ))}
            </div>
        </div>
    );
};

export default AdminServiceLinkageScreen;