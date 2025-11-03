import React, { useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User, PerformanceReview } from '../../types';
import { ClipboardDocumentCheckIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import KpiModal from '../../components/hr/KpiModal';

const HrPerformanceScreen: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users, performanceReviews, updatePerformanceReview } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReview, setSelectedReview] = useState<PerformanceReview | null>(null);

    const branchEmployees = useMemo(() => {
        if (!hrUser) return [];
        return users.filter(u => u.profile.branch === hrUser.profile.branch && u.role === 'User');
    }, [users, hrUser]);

    const handleManageKpis = (user: User) => {
        let review = performanceReviews.find(pr => pr.userId === user.id && pr.period === 'Q3 2024');
        if (!review) {
            // Create a new one if it doesn't exist for the demo
            review = {
                id: `pr-${user.id}-${Date.now()}`,
                userId: user.id,
                period: 'Q3 2024',
                kpis: [],
                finalScore: 0,
                status: 'Pending'
            };
        }
        setSelectedReview(review);
        setIsModalOpen(true);
    };

    const handleSaveChanges = async (review: PerformanceReview) => {
        await updatePerformanceReview(review);
        setIsModalOpen(false);
    };
    
    const getStatusText = (status: PerformanceReview['status']) => {
        switch (status) {
            case 'Pending': return 'Menunggu Penilaian Diri Karyawan';
            case 'SelfAssessmentComplete': return 'Menunggu Tinjauan Manajer';
            case 'Finalized': return 'Selesai';
            default: return 'Unknown';
        }
    };

    return (
        <>
            <div className="p-4 space-y-6">
                <h1 className="text-3xl font-bold text-primary flex items-center">
                    <ClipboardDocumentCheckIcon className="h-8 w-8 mr-2" />
                    Performance Management
                </h1>
                <p className="text-text-secondary">Kelola Key Performance Indicators (KPI) dan tinjau kinerja karyawan di cabang Anda.</p>
                
                <div className="bg-surface p-4 rounded-lg border border-border-color">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm text-left text-text-secondary">
                            <thead className="text-xs uppercase bg-surface-light">
                                <tr>
                                    <th className="px-6 py-3">Karyawan</th>
                                    <th className="px-6 py-3">Manajer</th>
                                    <th className="px-6 py-3">Periode</th>
                                    <th className="px-6 py-3">Skor Akhir</th>
                                    <th className="px-6 py-3">Status</th>
                                    <th className="px-6 py-3 text-center">Aksi</th>
                                </tr>
                            </thead>
                            <tbody>
                                {branchEmployees.map(emp => {
                                    const review = performanceReviews.find(pr => pr.userId === emp.id && pr.period === 'Q3 2024');
                                    const manager = users.find(u => u.id === emp.profile.managerId);
                                    return (
                                        <tr key={emp.id} className="border-b border-border-color">
                                            <td className="px-6 py-4 font-medium text-text-primary">{emp.profile.name}</td>
                                            <td className="px-6 py-4">{manager?.profile.name || 'N/A'}</td>
                                            <td className="px-6 py-4">{review?.period || 'Q3 2024'}</td>
                                            <td className={`px-6 py-4 font-bold ${review && review.finalScore > 85 ? 'text-green-400' : 'text-text-primary'}`}>{review?.status === 'Finalized' ? review.finalScore.toFixed(2) : 'N/A'}</td>
                                            <td className="px-6 py-4">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${review?.status === 'Finalized' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'}`}>
                                                    {getStatusText(review?.status || 'Pending')}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button onClick={() => handleManageKpis(emp)} className="font-medium text-primary hover:underline flex items-center justify-center mx-auto">
                                                    <PencilSquareIcon className="h-4 w-4 mr-1"/>
                                                    Kelola KPI
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
            <KpiModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                review={selectedReview}
                onSave={handleSaveChanges}
                employeeName={users.find(u => u.id === selectedReview?.userId)?.profile.name || ''}
            />
        </>
    );
};

export default HrPerformanceScreen;