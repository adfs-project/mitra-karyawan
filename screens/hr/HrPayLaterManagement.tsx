import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { OpexRequest } from '../../types';
import { CheckIcon, XMarkIcon, EyeIcon } from '@heroicons/react/24/solid';
import LocationName from '../../components/common/LocationName';
import PhotoViewerModal from '../../components/common/PhotoViewerModal';

const OpexDetailsModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    request: OpexRequest | null;
    onApprove: (id: string) => void;
    onReject: (id: string) => void;
    processingId: string | null;
}> = ({ isOpen, onClose, request, onApprove, onReject, processingId }) => {
    const [isPhotoModalOpen, setIsPhotoModalOpen] = useState(false);
    const [viewingPhotoUrl, setViewingPhotoUrl] = useState<string | null>(null);

    const openPhoto = (url: string) => {
        setViewingPhotoUrl(url);
        setIsPhotoModalOpen(true);
    };

    if (!isOpen || !request) return null;

    return (
        <>
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
                <div className="bg-surface p-6 rounded-lg w-full max-w-2xl border border-border-color max-h-[90vh] overflow-y-auto">
                    <h2 className="text-xl font-bold mb-4">Detail Pengajuan Dana Opex</h2>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                        <div><p className="text-text-secondary">Karyawan</p><p className="font-bold">{request.userName}</p></div>
                        <div><p className="text-text-secondary">Jenis</p><p className="font-bold">{request.type}</p></div>
                        <div><p className="text-text-secondary">Jumlah</p><p className="font-bold text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(request.amount)}</p></div>
                        <div><p className="text-text-secondary">Tanggal</p><p className="font-bold">{new Date(request.timestamp).toLocaleString('id-ID')}</p></div>
                        <div className="col-span-2"><p className="text-text-secondary">Deskripsi</p><p>{request.description}</p></div>
                        <div className="col-span-2"><p className="text-text-secondary">Lokasi</p><LocationName location={request.proofLocation} /></div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-sm font-bold text-text-secondary mb-1">Foto Bukti 1 (Objek)</p>
                            <img src={request.proofPhotoUrl1} alt="Proof 1" onClick={() => openPhoto(request.proofPhotoUrl1)} className="w-full h-48 object-cover rounded-lg cursor-pointer border border-border-color" />
                        </div>
                        <div>
                            <p className="text-sm font-bold text-text-secondary mb-1">Foto Bukti 2 (Nota)</p>
                            <img src={request.proofPhotoUrl2} alt="Proof 2" onClick={() => openPhoto(request.proofPhotoUrl2)} className="w-full h-48 object-cover rounded-lg cursor-pointer border border-border-color" />
                        </div>
                    </div>
                    
                    {request.status === 'Pending' && (
                        <div className="flex justify-end space-x-2 mt-6">
                            <button onClick={() => onReject(request.id)} disabled={!!processingId} className="btn-secondary px-4 py-2 rounded flex items-center"><XMarkIcon className="h-5 w-5 mr-1"/> Tolak</button>
                            <button onClick={() => onApprove(request.id)} disabled={!!processingId} className="btn-primary px-4 py-2 rounded flex items-center"><CheckIcon className="h-5 w-5 mr-1"/> Setujui & Cairkan Dana</button>
                        </div>
                    )}
                </div>
            </div>
            <PhotoViewerModal
                isOpen={isPhotoModalOpen}
                onClose={() => setIsPhotoModalOpen(false)}
                imageUrl={viewingPhotoUrl}
            />
        </>
    );
};


const HrPayLaterManagementScreen: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { opexRequests, approveOpexRequest, rejectOpexRequest } = useData();
    const [selectedRequest, setSelectedRequest] = useState<OpexRequest | null>(null);
    const [detailsModalOpen, setDetailsModalOpen] = useState(false);
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'Pending' | 'History'>('Pending');

    const branchRequests = useMemo(() => {
        if (!hrUser) return [];
        return opexRequests.filter(req => req.branch === hrUser.profile.branch)
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [opexRequests, hrUser]);

    const pendingRequests = useMemo(() => branchRequests.filter(r => r.status === 'Pending'), [branchRequests]);
    const historyRequests = useMemo(() => branchRequests.filter(r => r.status !== 'Pending'), [branchRequests]);

    const handleOpenDetails = (request: OpexRequest) => {
        setSelectedRequest(request);
        setDetailsModalOpen(true);
    };

    const handleApprove = async (id: string) => {
        setProcessingId(id);
        await approveOpexRequest(id);
        setProcessingId(null);
        setDetailsModalOpen(false);
    };

    const handleReject = async (id: string) => {
        setProcessingId(id);
        await rejectOpexRequest(id);
        setProcessingId(null);
        setDetailsModalOpen(false);
    };
    
    const requestsToShow = activeTab === 'Pending' ? pendingRequests : historyRequests;

    return (
        <>
            <div className="p-4 space-y-6">
                <h1 className="text-3xl font-bold text-primary">Manajemen Dana Opex</h1>
                
                <div className="flex border-b border-border-color">
                    <button onClick={() => setActiveTab('Pending')} className={`px-4 py-2 font-semibold ${activeTab === 'Pending' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                        Menunggu Persetujuan ({pendingRequests.length})
                    </button>
                    <button onClick={() => setActiveTab('History')} className={`px-4 py-2 font-semibold ${activeTab === 'History' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                        Riwayat
                    </button>
                </div>

                <div className="bg-surface p-4 rounded-lg border border-border-color">
                    {requestsToShow.length > 0 ? (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left text-text-secondary">
                                <thead className="text-xs text-text-secondary uppercase bg-surface-light">
                                    <tr>
                                        <th className="px-6 py-3">Karyawan</th>
                                        <th className="px-6 py-3">Jenis</th>
                                        <th className="px-6 py-3">Jumlah</th>
                                        <th className="px-6 py-3">Tanggal</th>
                                        <th className="px-6 py-3">Status</th>
                                        <th className="px-6 py-3 text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requestsToShow.map(req => (
                                        <tr key={req.id} className="bg-surface border-b border-border-color">
                                            <td className="px-6 py-4 font-medium text-text-primary">{req.userName}</td>
                                            <td className="px-6 py-4">{req.type}</td>
                                            <td className="px-6 py-4 font-semibold text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(req.amount)}</td>
                                            <td className="px-6 py-4">{new Date(req.timestamp).toLocaleDateString()}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                    req.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' :
                                                    req.status === 'Approved' ? 'bg-green-500/20 text-green-400' :
                                                    'bg-red-500/20 text-red-400'
                                                }`}>{req.status}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleOpenDetails(req)} className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/30" title="Lihat Detail">
                                                    <EyeIcon className="h-5 w-5 text-blue-400"/>
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <p className="text-center text-text-secondary py-4">Tidak ada pengajuan dana opex.</p>
                    )}
                </div>
            </div>
            
            <OpexDetailsModal
                isOpen={detailsModalOpen}
                onClose={() => setDetailsModalOpen(false)}
                request={selectedRequest}
                onApprove={handleApprove}
                onReject={handleReject}
                processingId={processingId}
            />
        </>
    );
};

export default HrPayLaterManagementScreen;