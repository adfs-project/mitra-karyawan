import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { ApiIntegration, IntegrationStatus } from '../../types';
import { BanknotesIcon, WalletIcon, BuildingStorefrontIcon, XMarkIcon } from '@heroicons/react/24/solid';

const AILoadingSpinner: React.FC = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
);

const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg shadow-lg w-full max-w-md border border-border-color">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <div className="text-text-secondary mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color">Cancel</button>
                    <button onClick={onConfirm} className="px-4 py-2 rounded btn-secondary">Confirm</button>
                </div>
            </div>
        </div>
    );
};

const IntegrationCard: React.FC<{
    integration: ApiIntegration,
    onDeactivate: (integration: ApiIntegration) => void,
    onManage: (integration: ApiIntegration) => void,
}> = ({ integration, onDeactivate, onManage }) => {
    const isActive = integration.status === IntegrationStatus.Active;
    const Icon = integration.type === 'Bank' ? BanknotesIcon : integration.type === 'E-Wallet' ? WalletIcon : BuildingStorefrontIcon;

    return (
        <div className="bg-surface p-4 rounded-lg border border-border-color flex flex-col justify-between">
            <div>
                <div className="flex items-center mb-2">
                    <Icon className="h-8 w-8 text-primary mr-3" />
                    <h3 className="text-lg font-bold">{integration.name}</h3>
                </div>
                 <div className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded-full ${isActive ? 'bg-green-400' : 'bg-red-400'}`}></div>
                    <p className={`text-sm font-semibold ${isActive ? 'text-green-400' : 'text-red-400'}`}>
                       {integration.status}
                    </p>
                </div>
            </div>
            <div className="mt-4 flex space-x-2 items-center">
                <button onClick={() => onManage(integration)} className="text-sm px-3 py-1.5 rounded bg-surface-light hover:bg-border-color flex-grow text-center">
                    Manage
                </button>
                {isActive && (
                    <button onClick={() => onDeactivate(integration)} className="text-sm px-3 py-1.5 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30">
                        Deactivate
                    </button>
                )}
            </div>
        </div>
    );
}

const ManageApiModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    integration: ApiIntegration | null;
}> = ({ isOpen, onClose, integration }) => {
    const { updateApiIntegration } = useData();
    const [creds, setCreds] = useState({ apiKey: '', clientId: '', secretKey: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    React.useEffect(() => {
        if (integration) {
            setCreds({
                apiKey: integration.credentials?.apiKey || '',
                clientId: integration.credentials?.clientId || '',
                secretKey: integration.credentials?.secretKey || '',
            });
            setError('');
            setSuccessMessage('');
        }
    }, [integration]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setCreds(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSaveAndTest = async () => {
        if (!integration) return;
        setIsLoading(true);
        setError('');
        setSuccessMessage('');

        const result = await updateApiIntegration(integration.id, creds);
        
        if (result.success) {
            setSuccessMessage(result.message);
            setTimeout(() => {
                onClose();
            }, 1500);
        } else {
            setError(result.message);
        }
        setIsLoading(false);
    };

    if (!isOpen || !integration) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Manage API: {integration.name}</h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light"><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                     <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">API Key</label>
                        <input type="text" name="apiKey" value={creds.apiKey} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" placeholder="Enter API Key"/>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Client ID</label>
                        <input type="text" name="clientId" value={creds.clientId} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" placeholder="Enter Client ID"/>
                    </div>
                     <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Secret Key</label>
                        <input type="password" name="secretKey" value={creds.secretKey} onChange={handleChange} className="w-full p-2 bg-surface-light rounded border border-border-color" placeholder="Enter Secret Key"/>
                    </div>
                </div>

                {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
                {successMessage && <p className="text-green-400 text-sm mt-4 text-center">{successMessage}</p>}

                <div className="flex justify-end space-x-4 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color">Close</button>
                    <button onClick={handleSaveAndTest} disabled={isLoading} className="btn-primary px-4 py-2 rounded w-48 flex justify-center items-center">
                        {isLoading ? <><AILoadingSpinner /> <span className="ml-2">Testing...</span></> : 'Save & Test Connection'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminApiIntegration: React.FC = () => {
    const { apiIntegrations, deactivateApiIntegration } = useData();
    const [manageModalOpen, setManageModalOpen] = useState(false);
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    const [selectedApi, setSelectedApi] = useState<ApiIntegration | null>(null);

    const handleManage = (integration: ApiIntegration) => {
        setSelectedApi(integration);
        setManageModalOpen(true);
    };

    const handleDeactivate = (integration: ApiIntegration) => {
        setSelectedApi(integration);
        setConfirmModalOpen(true);
    };

    const confirmDeactivation = async () => {
        if (selectedApi) {
            await deactivateApiIntegration(selectedApi.id);
        }
        setConfirmModalOpen(false);
        setSelectedApi(null);
    };

    const renderIntegrations = (type: 'Bank' | 'E-Wallet' | 'Retail') => (
        <div>
            <h2 className="text-2xl font-bold mb-4 text-secondary">{type} Integrations</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiIntegrations.filter(api => api.type === type).map(api => (
                    <IntegrationCard 
                        key={api.id} 
                        integration={api} 
                        onManage={handleManage}
                        onDeactivate={handleDeactivate}
                    />
                ))}
            </div>
        </div>
    );

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">API Integration Management</h1>
            <p className="text-text-secondary max-w-3xl">Connect to external partners by providing credentials. A successful connection test is required to activate an integration.</p>

            {renderIntegrations('Bank')}
            {renderIntegrations('E-Wallet')}
            {renderIntegrations('Retail')}

            <ManageApiModal isOpen={manageModalOpen} onClose={() => setManageModalOpen(false)} integration={selectedApi} />
            <ConfirmationModal 
                isOpen={confirmModalOpen} 
                onClose={() => setConfirmModalOpen(false)}
                onConfirm={confirmDeactivation}
                title="Confirm Deactivation"
            >
                <p>Are you sure you want to deactivate the integration with <span className="font-bold">{selectedApi?.name}</span>? This will immediately halt all related services.</p>
            </ConfirmationModal>
        </div>
    );
};

export default AdminApiIntegration;