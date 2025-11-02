import React from 'react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ClipboardDocumentCheckIcon, ArchiveBoxIcon, ShoppingCartIcon } from '@heroicons/react/24/solid';
import { Eprescription } from '../../../types';

const EprescriptionCard: React.FC<{ pres: Eprescription }> = ({ pres }) => {
    const navigate = useNavigate();

    return (
        <div className="bg-surface-light p-4 rounded-lg border border-border-color">
            <div className="flex justify-between items-start">
                <div>
                    <p className="text-xs text-text-secondary">Resep dari: <span className="font-bold">{pres.doctorName}</span></p>
                    <p className="font-bold text-text-primary">Diterbitkan: {new Date(pres.issueDate).toLocaleDateString()}</p>
                    <div className="mt-2 text-sm space-y-1">
                        {pres.items.map((item, i) => <p key={i} className="text-text-secondary">- {item.drugName} ({item.dosage})</p>)}
                    </div>
                </div>
                {pres.status === 'New' ? (
                    <button onClick={() => navigate(`/pharmacy-checkout/${pres.id}`)} className="flex items-center bg-primary text-black font-bold text-sm px-3 py-1.5 rounded-full">
                        <ShoppingCartIcon className="h-4 w-4 mr-1" />
                        Tebus Online
                    </button>
                ) : (
                    <span className="text-xs font-semibold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">Sudah Ditebus</span>
                )}
            </div>
        </div>
    );
};

const EprescriptionScreen: React.FC = () => {
    const { user } = useAuth();
    const { eprescriptions } = useData();
    const navigate = useNavigate();

    const userPrescriptions = eprescriptions
        .filter(e => e.patientId === user?.id)
        .sort((a, b) => new Date(b.issueDate).getTime() - new Date(a.issueDate).getTime());

    const newPrescriptions = userPrescriptions.filter(e => e.status === 'New');
    const historyPrescriptions = userPrescriptions.filter(e => e.status === 'Redeemed');

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Resep Digital Saya</h1>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center"><ClipboardDocumentCheckIcon className="h-5 w-5 mr-2" /> Resep Baru</h2>
                {newPrescriptions.length > 0 ? (
                    <div className="space-y-3">
                        {newPrescriptions.map(pres => <EprescriptionCard key={pres.id} pres={pres} />)}
                    </div>
                ) : (
                    <p className="text-sm text-center text-text-secondary py-8">Tidak ada resep baru.</p>
                )}
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center"><ArchiveBoxIcon className="h-5 w-5 mr-2" /> Riwayat Resep</h2>
                {historyPrescriptions.length > 0 ? (
                    <div className="space-y-3">
                        {historyPrescriptions.map(pres => <EprescriptionCard key={pres.id} pres={pres} />)}
                    </div>
                ) : (
                    <p className="text-sm text-center text-text-secondary py-8">Tidak ada riwayat resep.</p>
                )}
            </div>
        </div>
    );
};

export default EprescriptionScreen;