import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, BuildingLibraryIcon, DocumentTextIcon, TruckIcon } from '@heroicons/react/24/solid';

const services = [
    { name: 'Bayar Pajak PBB', icon: DocumentTextIcon },
    { name: 'e-Samsat', icon: TruckIcon },
    { name: 'Penerimaan Negara (MPN G3)', icon: BuildingLibraryIcon },
];

const GovernmentServicesScreen = () => {
    const navigate = useNavigate();
    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Layanan Pemerintah</h1>
            </div>
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <p className="text-text-secondary mb-4">Akses dan bayar layanan pemerintah dengan cepat dan aman. Fitur ini sedang dalam pengembangan.</p>
                <div className="space-y-3">
                    {services.map(service => (
                        <div key={service.name} className="flex items-center p-4 bg-surface-light rounded-lg border border-border-color cursor-not-allowed opacity-70">
                            <service.icon className="h-8 w-8 text-secondary mr-4" />
                            <span className="font-bold text-lg text-text-primary">{service.name}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default GovernmentServicesScreen;
