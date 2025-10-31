import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { CheckCircleIcon, XCircleIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { OpexRequest, OpexRequestType, User } from '../../types';
import LocationName from '../../components/common/LocationName';
import { useHR } from '../../hooks/useHR';

type Tab = 'Opex Requests';

const PhotoViewerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    photoUrl: string | null;
}> = ({ isOpen, onClose, photoUrl }) => {
    if (!isOpen || !photoUrl) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div className="bg-surface p-2 rounded-lg relative" onClick={e => e.stopPropagation()}>
                <img src={photoUrl} alt="Proof" className="max-w-full max-h-[80vh] rounded" />
                <button onClick={onClose} className="absolute -top-3 -right-3 bg-white text-black rounded-full p-1"><XMarkIcon className="h-6 w-6"/></button>
            </div>
        </div>
    );
};


const HrOpexManagementScreen: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users } = useApp();
    const { opexRequests, approveOpexByHr, rejectOpexByHr } = useHR();
    const [activeTab, setActiveTab] = useState<Tab>('Opex Requests');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [viewingPhoto, setViewingPhoto] = useState<string | null>(null);
    const [mealAllowanceAmounts, setMealAllowanceAmounts] = useState<Record<string, number>>({});

    const branchEmployees = useMemo(() => {
        if (!hrUser) return [];
        return users.filter(u => u.profile.branch === hrUser.profile.branch && u.role === 'User');
    }, [users, hrUser]);

    const pendingOpex = useMemo(() => opexRequests.filter(r => r.branch === hrUser?.profile.branch && r.status === 'Pending HR Verification'), [opexRequests, hrUser]);
    const historyOpex = useMemo(() => opexRequests.filter(r => r.branch === hrUser?.profile.branch && r.status !== 'Pending HR Verification'), [opexRequests, hrUser]);

    const handleAmountChange = (id: string, value: number) => {
        setMealAllowanceAmounts(prev => ({ ...prev, [id]: value }));
    };

    const handleApproveOpex = async (id: string) => {
        const request = pendingOpex.find(r => r.id === id);
        if (!request) return;

        if (request.type === 'Biaya Makan Perjalanan Dinas') {
            const amount = mealAllowanceAmounts[id];
            if (!amount || amount <= 0) {
                alert('Please enter a valid amount for the meal allowance.');
                return;
            }
            setProcessingId(id);
            await approveOpexByHr(id, amount);
            setProcessingId(null);
        } else {
            setProcessingId(id);
            await approveOpexByHr(id);
            setProcessingId(null);
        }
    };

    const handleRejectOpex = async (id: string) => {
        const reason = prompt("Please provide a reason for rejection:");
        if (reason) {
            setProcessingId(id);
            await rejectOpexByHr(id, reason);
            setProcessingId(null);
        }
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

    const renderOpexContent = (title: string, requests: OpexRequest[]) => (
        <div className="bg-surface p-4 rounded-lg border border-border-color">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            <div className="overflow-x-auto">
                {requests.length > 0 ? (
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface-light">
                            <tr>
                                <th className="px-6 py-3">Karyawan</th>
                                <th className="px-6 py-3">Jenis</th>
                                <th className="px-6 py-3">Jumlah</th>
                                <th className="px-6 py-3">Lokasi</th>
                                <th className="px-6 py-3 text-center">Bukti</th>
                                <th className="px-6 py-3 text-center">Status/Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {requests.map(req => (
                                <tr key={req.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary">{req.userName}</td>
                                    <td className="px-6 py-4">{req.type}</td>
                                    <td className="px-6 py-4 font-semibold">
                                        {req.type === 'Biaya Makan Perjalanan Dinas' && req.status === 'Pending HR Verification' ? (
                                            <input 
                                                type="number"
                                                value={mealAllowanceAmounts[req.id] || ''}
                                                onChange={(e) => handleAmountChange(req.id, Number(e.target.value))}
                                                className="w-28 p-1 bg-surface rounded border border-border-color"
                                                placeholder="Set Amount"
                                            />
                                        ) : (
                                            formatCurrency(req.amount)
                                        )}
                                    </td>
                                    <td className="px-6 py-4"><LocationName location={req.proofLocation} /></td>
                                    <td className="px-6 py-4">
                                        {req.type !== 'Biaya Makan Perjalanan Dinas' && (
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => setViewingPhoto(req.proofPhotoUrl1)} className="text-primary hover:underline text-xs">Objek</button>
                                                <button onClick={() => setViewingPhoto(req.proofPhotoUrl2)} className="text-primary hover:underline text-xs">Nota</button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        {req.status === 'Pending HR Verification' ? (
                                            processingId === req.id ? (
                                                <div className="flex justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                                            ) : (
                                                <div className="flex justify-center space-x-2">
                                                    <button onClick={() => handleApproveOpex(req.id)} className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/40" title="Verify & Forward to Finance"><CheckCircleIcon className="h-5 w-5 text-green-400" /></button>
                                                    <button onClick={() => handleRejectOpex(req.id)} className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40"><XCircleIcon className="h-5 w-5 text-red-400" /></button>
                                                </div>
                                            )
                                        ) : (
                                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                 req.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 
                                                 req.status === 'Rejected' ? 'bg-red-500/20 text-red-400' : 
                                                 'bg-blue-500/20 text-blue-400'}`
                                             }>{req.status}</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : <p className="text-center py-8">Tidak ada data.</p>}
            </div>
        </div>
    );
    
    const renderContent = () => {
        return (
            <div className="space-y-6">
                {renderOpexContent("Permintaan Verifikasi", pendingOpex)}
                {renderOpexContent("Riwayat", historyOpex)}
            </div>
        );
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Manajemen Dana Opex</h1>
            <p className="text-text-secondary">Verifikasi dan teruskan pengajuan dana operasional dari karyawan di cabang Anda ke departemen Keuangan.</p>
            
            <div className="flex border-b border-border-color">
                {(['Opex Requests'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                        {tab}
                    </button>
                ))}
            </div>

            {renderContent()}

            <PhotoViewerModal isOpen={!!viewingPhoto} onClose={() => setViewingPhoto(null)} photoUrl={viewingPhoto} />
        </div>
    );
};

export default HrOpexManagementScreen;
