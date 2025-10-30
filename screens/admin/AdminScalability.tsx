import React, { useEffect, useRef, useState } from 'react';
// FIX: Replaced useCore with useApp as it is the correct exported member from AppContext.
import { useApp } from '../../contexts/AppContext';
import { ScalabilityService, ScalabilityServiceStatus } from '../../types';
import { GlobeAltIcon, ServerIcon, CircleStackIcon, BoltIcon, QueueListIcon, DocumentDuplicateIcon, WifiIcon, CloudIcon } from '@heroicons/react/24/solid';
import { provisionService } from '../../services/orchestratorService';

const getStatusColor = (status: ScalabilityServiceStatus) => {
    switch (status) {
        case ScalabilityServiceStatus.Active: return 'text-green-400 border-green-400';
        case ScalabilityServiceStatus.Provisioning:
        case ScalabilityServiceStatus.AwaitingConfig:
        case ScalabilityServiceStatus.Scaling:
        case ScalabilityServiceStatus.Migrating:
             return 'text-yellow-400 border-yellow-400';
        case ScalabilityServiceStatus.Inactive: return 'text-gray-400 border-gray-400';
        case ScalabilityServiceStatus.Error: return 'text-red-400 border-red-400';
    }
};

const Terminal: React.FC<{ service: ScalabilityService }> = ({ service }) => {
    const terminalRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (terminalRef.current) {
            terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
        }
    }, [service.logs]);
    
    const isRunning = service.status !== ScalabilityServiceStatus.Inactive 
        && service.status !== ScalabilityServiceStatus.Active 
        && service.status !== ScalabilityServiceStatus.Error;

    if (service.logs.length === 0) return null;

    return (
        <div ref={terminalRef} className="mt-2 bg-black p-4 rounded-md font-mono text-xs text-green-400 h-32 overflow-y-auto border border-border-color">
            {service.logs.map((log, i) => (
                 <p key={i} className={`whitespace-pre-wrap ${log.startsWith('ERROR:') ? 'text-red-500' : ''}`}>{`> ${log}`}</p>
            ))}
            {isRunning && <div className="w-2 h-4 bg-green-400 animate-pulse ml-1 inline-block"></div>}
        </div>
    );
};

// --- Specialized Visual Components ---

const Metric: React.FC<{ label: string; value: string | number; unit?: string; }> = ({ label, value, unit }) => (
    <div className="text-sm text-center">
        <p className="text-text-secondary">{label}</p>
        <p className="font-bold text-lg text-primary">{value}<span className="text-xs">{unit}</span></p>
    </div>
);


const LoadBalancerVisual: React.FC<{ service: ScalabilityService }> = ({ service }) => (
    <div className="mt-4">
        <div className="flex justify-around items-center mb-2">
            <Metric label="Servers Active" value={service.metadata?.servers} />
            <Metric label="Requests/Sec" value={service.metadata?.rps} />
        </div>
        <div className="h-10 bg-surface-light rounded flex items-center p-1 space-x-1 overflow-hidden">
            {[...Array(service.metadata?.servers)].map((_, i) => (
                <div key={i} className={`h-full flex-grow bg-green-500 rounded-sm animate-pulse`} style={{animationDelay: `${i*100}ms`}}></div>
            ))}
        </div>
    </div>
);

const CDNVisual: React.FC<{ service: ScalabilityService }> = ({ service }) => (
    <div className="mt-4">
         <div className="relative">
            <GlobeAltIcon className="w-full h-20 text-surface-light"/>
            {service.status === ScalabilityServiceStatus.Active && (
                <>
                    <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-primary rounded-full animate-ping"></div>
                    <div className="absolute top-1/3 right-1/4 w-2 h-2 bg-primary rounded-full animate-ping" style={{animationDelay: '0.5s'}}></div>
                    <div className="absolute bottom-1/4 left-1/3 w-2 h-2 bg-primary rounded-full animate-ping" style={{animationDelay: '0.2s'}}></div>
                </>
            )}
        </div>
        <div className="flex justify-around text-center mt-1">
            <Metric label="Cache Hit Ratio" value={service.metadata?.cacheHitRatio} unit="%" />
            <Metric label="Avg. Latency" value={service.metadata?.latency} unit="ms" />
        </div>
    </div>
);

const ShardingVisual: React.FC<{ service: ScalabilityService }> = ({ service }) => (
    <div className="mt-4">
        <div className="flex justify-around items-center h-24">
            {[...Array(service.metadata?.shards || 1)].map((_, i) => (
                <div key={i} className="flex flex-col items-center animate-fade-in-up" style={{animationDelay: `${i*100}ms`}}>
                    <CircleStackIcon className={`w-10 h-10 ${service.status === ScalabilityServiceStatus.Active ? 'text-primary' : 'text-text-secondary'}`} />
                    <span className="text-xs mt-1">Shard {i+1}</span>
                </div>
            ))}
        </div>
    </div>
);

const RedisVisual: React.FC<{ service: ScalabilityService; }> = ({ service }) => (
    <div className="mt-4">
        <div className="flex justify-around items-center mb-2">
            <Metric label="Hit Ratio" value={service.metadata?.cacheHitRatio} unit="%" />
            <Metric label="Memory" value={service.metadata?.memoryUsage} unit="MB" />
            <Metric label="Keys" value={service.metadata?.keys.toLocaleString('id-ID')} />
        </div>
    </div>
);

const RabbitMQVisual: React.FC<{ service: ScalabilityService; }> = ({ service }) => (
    <div className="mt-4">
        <div className="flex justify-around items-center mb-2">
             <Metric label="Queue Length" value={service.metadata?.queueLength.toLocaleString('id-ID')} />
             <Metric label="Processed/sec" value={service.metadata?.processedPerSec} />
             <Metric label="Workers" value={service.metadata?.workers} />
        </div>
        <div className="w-full bg-surface-light rounded-full h-4 mt-1">
            <div className="bg-secondary h-4 rounded-full" style={{ width: `${Math.min((service.metadata?.queueLength / 50000) * 100, 100)}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
    </div>
);

const ReadReplicasVisual: React.FC<{ service: ScalabilityService; }> = ({ service }) => (
     <div className="mt-4">
        <div className="flex justify-around items-end h-20 text-center">
            <div className="w-1/3">
                <p className="text-xs text-text-secondary">Primary DB</p>
                <div className="h-12 bg-surface-light rounded-t-md flex items-end mt-1">
                    <div className="w-full bg-red-500 rounded-t-md" style={{ height: `${service.metadata?.primaryLoad}%`, transition: 'height 0.5s ease-out' }}></div>
                </div>
                <p className="text-xs font-bold">{service.metadata?.primaryLoad}%</p>
            </div>
             <div className="w-1/3">
                <p className="text-xs text-text-secondary">Replica DB</p>
                <div className="h-16 bg-surface-light rounded-t-md flex items-end mt-1">
                    <div className="w-full bg-blue-500 rounded-t-md" style={{ height: `${service.metadata?.replicaLoad}%`, transition: 'height 0.5s ease-out' }}></div>
                </div>
                <p className="text-xs font-bold">{service.metadata?.replicaLoad}%</p>
            </div>
             <div className="w-1/4">
                 <Metric label="Lag" value={service.metadata?.replicaLag} unit="ms" />
            </div>
        </div>
    </div>
);


const OrchestrationCard: React.FC<{ 
    service: ScalabilityService,
    onStart: (id: ScalabilityService['type']) => void;
    isCloudConnected: boolean;
}> = ({ service, onStart, isCloudConnected }) => {
    
    const getIcon = () => {
        switch(service.type) {
            case 'load_balancer': return <ServerIcon className="h-6 w-6 mr-3 text-primary" />;
            case 'cdn': return <GlobeAltIcon className="h-6 w-6 mr-3 text-primary" />;
            case 'redis': return <BoltIcon className="h-6 w-6 mr-3 text-primary" />;
            case 'rabbitmq': return <QueueListIcon className="h-6 w-6 mr-3 text-primary" />;
            case 'read_replicas': return <DocumentDuplicateIcon className="h-6 w-6 mr-3 text-primary" />;
            case 'db_sharding': return <CircleStackIcon className="h-6 w-6 mr-3 text-primary" />;
            default: return null;
        }
    }
    
    return (
        <div className="bg-surface p-4 rounded-lg border border-border-color flex flex-col">
            <div className="flex items-center">
                {getIcon()}
                <h3 className="text-lg font-bold">{service.name}</h3>
            </div>
            <p className="text-xs text-text-secondary mt-1 flex-grow h-10">{service.description}</p>

            {service.status === ScalabilityServiceStatus.Active && (
                <div className="text-xs font-bold text-primary my-2">
                    Est. Cost: ${service.cost}/mo
                </div>
            )}

            <div className="my-2 flex justify-between items-center">
                <span className={`text-xs font-bold px-2 py-1 border rounded-full ${getStatusColor(service.status)}`}>{service.status}</span>
                <button 
                    onClick={() => onStart(service.type)}
                    disabled={!isCloudConnected || service.status !== ScalabilityServiceStatus.Inactive}
                    className="btn-primary px-3 py-1 rounded text-sm disabled:bg-gray-600 disabled:cursor-not-allowed disabled:shadow-none disabled:transform-none"
                >
                    Activate
                </button>
            </div>
            
            {service.type === 'load_balancer' && <LoadBalancerVisual service={service} />}
            {service.type === 'cdn' && <CDNVisual service={service} />}
            {service.type === 'db_sharding' && <ShardingVisual service={service} />}
            {service.type === 'redis' && <RedisVisual service={service} />}
            {service.type === 'rabbitmq' && <RabbitMQVisual service={service} />}
            {service.type === 'read_replicas' && <ReadReplicasVisual service={service} />}


            <Terminal service={service} />
        </div>
    );
};

const AdminScalability: React.FC = () => {
    const { scalabilityServices, updateScalabilityService } = useApp();
    const [isCloudConnected, setIsCloudConnected] = useState(false);
    const [isConnecting, setIsConnecting] = useState(false);

    const handleConnectCloud = () => {
        setIsConnecting(true);
        setTimeout(() => {
            setIsConnecting(false);
            setIsCloudConnected(true);
        }, 1500);
    };


    const handleStartIntegration = async (type: ScalabilityService['type']) => {
        const service = scalabilityServices.find(s => s.type === type);
        if (!service) return;

        try {
            const finalCost = await provisionService(type, (status, log, metadata) => {
                // Real-time update callback
                updateScalabilityService(service.id, status, log, metadata);
            });
            // Final successful state
            updateScalabilityService(service.id, ScalabilityServiceStatus.Active, "SUCCESS: Service is now ACTIVE.", undefined, finalCost);

        } catch (error) {
            console.error("Provisioning failed:", error);
            const errorMessage = (error instanceof Error) ? error.message : "An unknown error occurred.";
            updateScalabilityService(service.id, ScalabilityServiceStatus.Error, `ERROR: ${errorMessage}`);
        }
    };

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Infrastructure Orchestration Dashboard</h1>
            <p className="text-text-secondary max-w-3xl">Simulate infrastructure upgrades to handle 10 million users. Activate services to provision and monitor them as if interacting with a real cloud platform.</p>
            
            <div className="bg-surface p-4 rounded-lg border border-border-color flex items-center justify-between">
                <div className="flex items-center">
                    <CloudIcon className={`h-8 w-8 mr-3 ${isCloudConnected ? 'text-primary' : 'text-text-secondary'}`} />
                    <div>
                        <h2 className="text-lg font-bold">Cloud Provider Connection</h2>
                        <p className={`text-sm font-semibold ${isCloudConnected ? 'text-green-400' : 'text-yellow-400'}`}>
                            Status: {isConnecting ? 'Connecting...' : isCloudConnected ? 'Connected (Simulated)' : 'Disconnected'}
                        </p>
                    </div>
                </div>
                {!isCloudConnected && (
                     <button onClick={handleConnectCloud} disabled={isConnecting} className="btn-primary px-4 py-2 rounded flex items-center w-40 justify-center">
                        {isConnecting ? (
                            <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                           <><WifiIcon className="h-5 w-5 mr-2" /> Connect</>
                        )}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {scalabilityServices.map(service => (
                    <OrchestrationCard 
                        key={service.id} 
                        service={service} 
                        onStart={handleStartIntegration} 
                        isCloudConnected={isCloudConnected}
                    />
                ))}
            </div>
        </div>
    );
};

export default AdminScalability;