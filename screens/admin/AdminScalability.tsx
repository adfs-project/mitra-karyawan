import React, { useState } from 'react';
import { CloudIcon, ServerIcon, CircleStackIcon, GlobeAltIcon, ArrowsRightLeftIcon, ShareIcon, CpuChipIcon } from '@heroicons/react/24/solid';
import { useData } from '../../contexts/DataContext';
import { ScalabilityService, ScalabilityServiceStatus } from '../../types';

const serviceIcons: Record<ScalabilityService['type'], React.ElementType> = {
    redis: CircleStackIcon,
    rabbitmq: ArrowsRightLeftIcon,
    read_replicas: ServerIcon,
    load_balancer: GlobeAltIcon,
    cdn: ShareIcon,
    db_sharding: CpuChipIcon
};

const statusConfig: Record<ScalabilityServiceStatus, { color: string; pulse: boolean }> = {
    [ScalabilityServiceStatus.Active]: { color: 'bg-green-500', pulse: false },
    [ScalabilityServiceStatus.Inactive]: { color: 'bg-gray-500', pulse: false },
    [ScalabilityServiceStatus.Provisioning]: { color: 'bg-blue-500', pulse: true },
    [ScalabilityServiceStatus.AwaitingConfig]: { color: 'bg-yellow-500', pulse: true },
    [ScalabilityServiceStatus.Migrating]: { color: 'bg-purple-500', pulse: true },
    [ScalabilityServiceStatus.Error]: { color: 'bg-red-500', pulse: false },
};

const ServiceCard: React.FC<{ service: ScalabilityService }> = ({ service }) => {
    const { provisionScalabilityService } = useData();
    const [isLoading, setIsLoading] = useState(false);
    const Icon = serviceIcons[service.type];
    const { color, pulse } = statusConfig[service.status];

    const handleProvision = async () => {
        if (window.confirm(`Are you sure you want to provision ${service.name}? This will simulate incurring costs.`)) {
            setIsLoading(true);
            await provisionScalabilityService(service.id);
            setIsLoading(false);
        }
    };
    
    const isActionable = service.status === ScalabilityServiceStatus.Inactive || service.status === ScalabilityServiceStatus.Error;

    return (
        <div className="bg-surface p-6 rounded-lg border border-border-color flex flex-col justify-between">
            <div>
                <div className="flex justify-between items-start">
                    <div>
                        <Icon className="h-8 w-8 text-primary" />
                        <h3 className="text-lg font-bold mt-2">{service.name}</h3>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center justify-end space-x-2">
                             <div className={`w-3 h-3 rounded-full ${color} ${pulse ? 'animate-pulse' : ''}`}></div>
                            <span className="font-semibold text-sm">{service.status}</span>
                        </div>
                         <p className="text-2xl font-bold text-secondary mt-2">${service.cost.toLocaleString()}/mo</p>
                    </div>
                </div>
                
                {/* Log Viewer */}
                {service.logs.length > 0 && (
                    <div className="mt-4 bg-black font-mono text-xs rounded-lg p-2 h-32 overflow-y-auto">
                        {service.logs.map((log, i) => (
                            <p key={i} className="text-green-400 whitespace-pre-wrap animate-fade-in-up" style={{animationDelay: `${i * 50}ms`}}>
                                <span className="text-gray-500 mr-2">{new Date(log.timestamp).toLocaleTimeString()}</span>
                                {log.message}
                            </p>
                        ))}
                    </div>
                )}
            </div>

            <div className="mt-4">
                 <button 
                    onClick={handleProvision} 
                    disabled={!isActionable || isLoading}
                    className="w-full btn-primary p-2 rounded font-bold text-sm disabled:bg-gray-600 disabled:cursor-not-allowed flex justify-center items-center"
                >
                    {isLoading ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : (isActionable ? 'Provision Service' : service.status)}
                </button>
            </div>
        </div>
    );
};

const AdminScalability: React.FC = () => {
    const { scalabilityServices } = useData();

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Infrastructure Orchestration</h1>
            <p className="text-text-secondary">Simulate provisioning and scaling of cloud infrastructure components. Active services will incur monthly costs reflected in the financial hub.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scalabilityServices.map(service => (
                    <ServiceCard key={service.id} service={service} />
                ))}
            </div>
        </div>
    );
};

export default AdminScalability;