import React, { useMemo, useState, useEffect } from 'react';
import { User, PerformanceReview, Kpi } from '../../packages/shared/types';
import { XMarkIcon, ClipboardDocumentCheckIcon } from '@heroicons/react/24/solid';
import { useData } from '../../packages/shared/contexts/DataContext';

interface MyKpiModalProps {
    isOpen: boolean;
    onClose: () => void;
    user: User;
}

const MyKpiModal: React.FC<MyKpiModalProps> = ({ isOpen, onClose, user }) => {
    const { performanceReviews, submitSelfAssessment } = useData();
    const [localReview, setLocalReview] = useState<PerformanceReview | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const originalReview = useMemo(() => {
        const review = performanceReviews.find(pr => pr.userId === user.id);
        // Create a new review if it doesn't exist
        if (!review) {
            return {
                id: `pr-new-${user.id}`,
                userId: user.id,
                period: 'Q3 2024',
                kpis: [],
                finalScore: 0,
                status: 'Pending'
            } as PerformanceReview;
        }
        return review;
    }, [performanceReviews, user.id]);
    
    useEffect(() => {
        if (isOpen) {
            setLocalReview(JSON.parse(JSON.stringify(originalReview))); // Deep copy for local edits
        }
    }, [isOpen, originalReview]);
    
    if (!isOpen || !localReview) return null;

    const isEditable = localReview.status === 'Pending';

    const handleKpiChange = (index: number, field: 'actual' | 'employeeComment', value: string | number) => {
        if (!isEditable) return;
        const newKpis = [...localReview.kpis];
        (newKpis[index] as any)[field] = field === 'actual' ? Number(value) : value;
        setLocalReview({ ...localReview, kpis: newKpis });
    };

    const handleSubmit = async () => {
        if (window.confirm("Are you sure you want to submit your self-assessment? You won't be able to edit it after submission.")) {
            setIsLoading(true);
            await submitSelfAssessment(localReview);
            setIsLoading(false);
            onClose();
        }
    };
    
    const getAchievementColor = (achievement: number) => {
        if (achievement >= 100) return 'text-green-400';
        if (achievement >= 75) return 'text-yellow-400';
        return 'text-red-400';
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-4xl border border-border-color max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-primary flex items-center">
                            <ClipboardDocumentCheckIcon className="h-6 w-6 mr-2" />
                            {isEditable ? 'Self-Assessment' : 'My Performance & KPIs'}
                        </h2>
                        <p className="text-text-secondary">Periode: {localReview.period}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light"><XMarkIcon className="h-6 w-6" /></button>
                </div>

                {!localReview.kpis || localReview.kpis.length === 0 ? (
                    <div className="text-center py-16">
                        <p className="text-text-secondary">Your manager has not set any KPIs for this period yet.</p>
                    </div>
                ) : (
                    <>
                        <div className="overflow-y-auto flex-grow pr-2">
                            <table className="w-full text-sm">
                                <thead className="text-left text-text-secondary uppercase">
                                    <tr>
                                        <th className="p-2 w-1/4">Metric</th>
                                        <th className="p-2">Target</th>
                                        <th className="p-2">My Actual</th>
                                        <th className="p-2 w-1/3">My Comments</th>
                                        {!isEditable && <th className="p-2 w-1/3">Manager's Comments</th>}
                                    </tr>
                                </thead>
                                <tbody>
                                    {localReview.kpis.map((kpi, index) => (
                                        <tr key={kpi.id} className="border-t border-border-color">
                                            <td className="p-2 font-semibold text-text-primary align-top">{kpi.metric}</td>
                                            <td className="p-2 align-top">{kpi.target.toLocaleString('id-ID')}</td>
                                            <td className="p-2 align-top">
                                                {isEditable ? (
                                                    <input type="number" value={kpi.actual || ''} onChange={e => handleKpiChange(index, 'actual', e.target.value)} className="w-full bg-surface-light p-1 rounded border border-border-color" />
                                                ) : (
                                                    <span>{kpi.actual.toLocaleString('id-ID')}</span>
                                                )}
                                            </td>
                                            <td className="p-2 align-top">
                                                {isEditable ? (
                                                    <textarea value={kpi.employeeComment || ''} onChange={e => handleKpiChange(index, 'employeeComment', e.target.value)} rows={2} className="w-full bg-surface-light p-1 rounded border border-border-color text-xs" />
                                                ) : (
                                                    <p className="text-xs text-text-secondary italic">{kpi.employeeComment || '-'}</p>
                                                )}
                                            </td>
                                            {!isEditable && (
                                                <td className="p-2 align-top">
                                                    <p className="text-xs text-text-primary">{kpi.managerComment || '-'}</p>
                                                </td>
                                            )}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        <div className="flex justify-between items-center pt-4 mt-4 border-t-2 border-primary flex-shrink-0">
                            {isEditable ? (
                                <button onClick={handleSubmit} disabled={isLoading} className="btn-primary px-6 py-2 rounded font-bold w-48 flex justify-center">
                                     {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Submit Self-Assessment'}
                                </button>
                            ) : <div />}
                             <div className="text-right">
                                <p className="text-text-secondary text-sm">Final Score</p>
                                <p className={`text-3xl font-bold ${getAchievementColor(localReview.finalScore)}`}>
                                    {localReview.status === 'Finalized' ? localReview.finalScore.toFixed(2) : 'Pending Manager Review'}
                                </p>
                             </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default MyKpiModal;