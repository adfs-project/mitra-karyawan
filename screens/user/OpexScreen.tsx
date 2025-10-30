import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, CreditCardIcon, PlusIcon } from '@heroicons/react/24/solid';
import { OpexRequest, OpexRequestStatus } from '../../types';
import { useHR } from '../../contexts/HRContext';

const getStatusChip = (status: OpexRequestStatus) => {
    switch (status) {
        case 'Pending HR Verification':
        case 'Pending Finance Approval':
            return <span className="text-xs font-semibold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">Pending</span>;
        case 'Approved':
            return <span className="text-xs font-semibold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{status}</span>;
        case 'Rejected':
            return <span className="text-xs font-semibold bg-red-500/20 text-red-400 px-2 py-1 rounded-full">{status}</span>;
    }
};

const OpexScreen: React.FC = () => {
    const { user } = useAuth();
    const { opexRequests } = useHR();
    const navigate = useNavigate();

    const userRequests = opexRequests
        .filter(r => r.userId === user?.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Pengajuan Dana Opex</h1>
            </div>

            <div className="flex justify-end">
                <button onClick={() => navigate('/opex/new')} className="btn-primary flex items-center px-4 py-2 rounded-lg font-bold">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Buat Pengajuan Baru
                </button>
            </div>
            
            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Riwayat Pengajuan</h2>
                {userRequests.length > 0 ? (
                    <div className="space-y-3">
                        {userRequests.map(req => (
                            <div key={req.id} className="bg-surface-light p-3 rounded-lg flex justify-between items-center">
                                <div>
                                    <p className="font-semibold text-text-primary">{req.type} - {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(req.amount)}</p>
                                    <p className="text-xs text-text-secondary">Diajukan: {new Date(req.timestamp).toLocaleDateString()}</p>
                                </div>
                                {getStatusChip(req.status)}
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <CreditCardIcon className="h-16 w-16 mx-auto text-text-secondary opacity-50"/>
                        <p className="mt-4 text-text-secondary">Anda belum memiliki riwayat pengajuan dana opex.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default OpexScreen;