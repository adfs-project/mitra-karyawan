import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { CheckCircleIcon, XCircleIcon, EyeIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ReceiptModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    receiptUrl: string | null;
}> = ({ isOpen, onClose, receiptUrl }) => {
    if (!isOpen || !receiptUrl) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-4 rounded-lg w-full max-w-lg border border-border-color relative">
                <button onClick={onClose} className="absolute -top-4 -right-4 bg-white text-black rounded-full p-1">
                    <XMarkIcon className="h-6 w-6" />
                </button>
                <img src={receiptUrl} alt="Receipt" className="max-w-full max-h-[80vh] mx-auto" />
            </div>
        </div>
    );
};

const HrBenefitManagement: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { insuranceClaims, approveInsuranceClaim, rejectInsuranceClaim } = useData();
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
    const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);

    const branchClaims = useMemo(() => {
        if (!hrUser) return [];
        return insuranceClaims.filter(claim => claim.branch === hrUser.profile.branch);
    }, [insuranceClaims, hrUser]);

    const pendingClaims = useMemo(() => branchClaims.filter(c => c.status === 'Pending'), [branchClaims]);
    const historyClaims = useMemo(() => branchClaims.filter(c => c.status !== 'Pending').sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime()), [branchClaims]);

    const handleApprove = async (claimId: string) => {
        if (window.confirm("Are you sure you want to approve this claim? This will transfer funds to the employee.")) {
            setProcessingId(claimId);
            await approveInsuranceClaim(claimId);
            setProcessingId(null);
        }
    };

    const handleReject = async (claimId: string) => {
        if (window.confirm("Are you sure you want to reject this claim?")) {
            setProcessingId(claimId);
            await rejectInsuranceClaim(claimId);
            setProcessingId(null);
        }
    };
    
    const viewReceipt = (url: string) => {
        setSelectedReceiptUrl(url);
        setIsReceiptModalOpen(true);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Manajemen Benefit & Klaim</h1>
            <p className="text-text-secondary">Tinjau dan proses klaim asuransi dari karyawan di cabang Anda.</p>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Klaim Tertunda</h2>
                <div className="overflow-x-auto">
                    {pendingClaims.length > 0 ? (
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-surface-light">
                                <tr>
                                    <th className="px-6 py-3">Karyawan</th>
                                    <th className="px-6 py-3">Jenis Klaim</th>
                                    <th className="px-6 py-3">Jumlah</th>
                                    <th className="px-6 py-3">Tanggal</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {pendingClaims.map(claim => (
                                    <tr key={claim.id} className="border-b border-border-color">
                                        <td className="px-6 py-4 font-medium text-text-primary">{claim.userName}</td>
                                        <td className="px-6 py-4">{claim.type}</td>
                                        <td className="px-6 py-4 font-semibold">{formatCurrency(claim.amount)}</td>
                                        <td className="px-6 py-4">{new Date(claim.submissionDate).toLocaleDateString()}</td>
                                        <td className="px-6 py-4">
                                            {processingId === claim.id ? (
                                                <div className="flex justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                                            ) : (
                                                <div className="flex justify-center space-x-2">
                                                    <button onClick={() => viewReceipt(claim.receiptUrl)} className="p-2 rounded-full bg-blue-500/20 hover:bg-blue-500/40" title="Lihat Bukti"><EyeIcon className="h-5 w-5 text-blue-400" /></button>
                                                    <button onClick={() => handleApprove(claim.id)} className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/40" title="Setujui"><CheckCircleIcon className="h-5 w-5 text-green-400" /></button>
                                                    <button onClick={() => handleReject(claim.id)} className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40" title="Tolak"><XCircleIcon className="h-5 w-5 text-red-400" /></button>
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center py-8">Tidak ada klaim yang menunggu persetujuan.</p>
                    )}
                </div>
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Riwayat Klaim</h2>
                <div className="overflow-x-auto max-h-96">
                    {historyClaims.length > 0 ? (
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-surface-light sticky top-0">
                                <tr>
                                    <th className="px-6 py-3">Karyawan</th>
                                    <th className="px-6 py-3">Jenis Klaim</th>
                                    <th className="px-6 py-3">Jumlah</th>
                                    <th className="px-6 py-3">Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {historyClaims.map(claim => (
                                     <tr key={claim.id} className="border-b border-border-color">
                                        <td className="px-6 py-4 font-medium text-text-primary">{claim.userName}</td>
                                        <td className="px-6 py-4">{claim.type}</td>
                                        <td className="px-6 py-4 font-semibold">{formatCurrency(claim.amount)}</td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 rounded-full text-xs font-semibold ${claim.status === 'Approved' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>{claim.status}</span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <p className="text-center py-8">Belum ada riwayat klaim.</p>
                    )}
                </div>
            </div>

            <ReceiptModal 
                isOpen={isReceiptModalOpen}
                onClose={() => setIsReceiptModalOpen(false)}
                receiptUrl={selectedReceiptUrl}
            />
        </div>
    );
};

export default HrBenefitManagement;