import React, { useState } from 'react';
import { useHealth } from '../../../contexts/HealthContext';
import { useAuth } from '../../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ShieldCheckIcon, PaperClipIcon, ClockIcon } from '@heroicons/react/24/solid';
import { InsuranceClaim } from '../../../types';
import { useApp } from '../../../contexts/AppContext';

const getStatusChip = (status: InsuranceClaim['status']) => {
    switch (status) {
        case 'Pending':
            return <span className="text-xs font-semibold bg-yellow-500/20 text-yellow-400 px-2 py-1 rounded-full">{status}</span>;
        case 'Approved':
            return <span className="text-xs font-semibold bg-green-500/20 text-green-400 px-2 py-1 rounded-full">{status}</span>;
        case 'Rejected':
            return <span className="text-xs font-semibold bg-red-500/20 text-red-400 px-2 py-1 rounded-full">{status}</span>;
    }
};

const InsuranceClaimScreen: React.FC = () => {
    const { user } = useAuth();
    const { insuranceClaims, submitInsuranceClaim } = useHealth();
    const { showToast } = useApp();
    const navigate = useNavigate();
    
    const [claimType, setClaimType] = useState<'Rawat Jalan' | 'Rawat Inap' | 'Kacamata'>('Rawat Jalan');
    const [amount, setAmount] = useState<number>(0);
    const [receipt, setReceipt] = useState<File | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const userClaims = insuranceClaims.filter(c => c.userId === user?.id).sort((a,b) => new Date(b.submissionDate).getTime() - new Date(a.submissionDate).getTime());

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setReceipt(e.target.files[0]);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (amount <= 0 || !receipt) {
            showToast("Jenis klaim, jumlah, dan bukti pembayaran harus diisi.", "warning");
            return;
        }
        setIsSubmitting(true);
        
        const reader = new FileReader();
        reader.readAsDataURL(receipt);
        reader.onload = async () => {
            const receiptUrl = reader.result as string;
            await submitInsuranceClaim({ type: claimType, amount, receiptUrl });
            setIsSubmitting(false);
            setAmount(0);
            setReceipt(null);
            (document.getElementById('receipt-upload') as HTMLInputElement).value = '';
        };
        reader.onerror = () => {
            showToast("Gagal memproses file bukti pembayaran.", "error");
            setIsSubmitting(false);
        };
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary flex items-center"><ShieldCheckIcon className="h-6 w-6 mr-2"/> Klaim Asuransi</h1>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Formulir Pengajuan Klaim</h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Jenis Klaim</label>
                        <select value={claimType} onChange={e => setClaimType(e.target.value as any)} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color">
                            <option value="Rawat Jalan">Rawat Jalan</option>
                            <option value="Rawat Inap">Rawat Inap</option>
                            <option value="Kacamata">Kacamata</option>
                        </select>
                    </div>
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Jumlah yang Diklaim (IDR)</label>
                        <input type="number" value={amount || ''} onChange={e => setAmount(Number(e.target.value))} className="w-full mt-1 p-3 bg-surface-light rounded border border-border-color" />
                    </div>
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Unggah Bukti Pembayaran</label>
                         <div className="mt-1 flex items-center space-x-2 p-3 bg-surface-light rounded border border-border-color">
                            <PaperClipIcon className="h-5 w-5 text-text-secondary"/>
                            <input id="receipt-upload" type="file" onChange={handleFileChange} className="w-full text-sm text-text-secondary file:hidden" />
                        </div>
                    </div>
                    <button type="submit" disabled={isSubmitting} className="w-full btn-primary p-3 rounded-lg font-bold mt-2 flex justify-center items-center">
                        {isSubmitting ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Ajukan Klaim'}
                    </button>
                </form>
            </div>
            
            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center"><ClockIcon className="h-5 w-5 mr-2"/> Riwayat Klaim</h2>
                 {userClaims.length > 