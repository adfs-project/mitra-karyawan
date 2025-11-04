import React, { useState, useEffect } from 'react';
import { PerformanceReview, Kpi } from '../../types';
import { XMarkIcon, PlusIcon, TrashIcon } from '@heroicons/react/24/solid';

interface KpiModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (review: PerformanceReview) => void;
    review: PerformanceReview | null;
    employeeName: string;
}

const KpiModal: React.FC<KpiModalProps> = ({ isOpen, onClose, onSave, review, employeeName }) => {
    const [currentReview, setCurrentReview] = useState<PerformanceReview | null>(review);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        // Deep copy to prevent unintended state mutations
        setCurrentReview(review ? JSON.parse(JSON.stringify(review)) : null);
    }, [review]);

    const handleKpiChange = (index: number, field: keyof Kpi, value: string | number) => {
        if (!currentReview) return;
        const newKpis = [...currentReview.kpis];
        (newKpis[index] as any)[field] = field === 'metric' || field === 'managerComment' ? value : Number(value);
        setCurrentReview({ ...currentReview, kpis: newKpis });
    };

    const addKpi = () => {
        if (!currentReview) return;
        const newKpi: Kpi = { id: `kpi-${Date.now()}`, metric: '', target: 0, actual: 0, weight: 0 };
        setCurrentReview({ ...currentReview, kpis: [...currentReview.kpis, newKpi] });
    };

    const removeKpi = (index: number) => {
        if (!currentReview) return;
        setCurrentReview({ ...currentReview, kpis: currentReview.kpis.filter((_, i) => i !== index) });
    };
    
    const calculateScore = () => {
        if (!currentReview || currentReview.kpis.length === 0) return 0;

        let totalScore = 0;
        currentReview.kpis.forEach(kpi => {
            const achievement = kpi.target > 0 ? (kpi.actual / kpi.target) * 100 : 0;
            const cappedAchievement = Math.min(achievement, 120); 
            totalScore += (cappedAchievement / 100) * kpi.weight;
        });
        return totalScore;
    };

    const handleSave = (isFinal: boolean) => {
        if (!currentReview) return;
        
        const totalWeight = currentReview.kpis.reduce((sum, kpi) => sum + kpi.weight, 0);
        if (totalWeight !== 100) {
            alert(`Total weight must be 100%, but it is currently ${totalWeight}%.`);
            return;
        }

        setIsLoading(true);
        const finalScore = calculateScore();
        
        onSave({
            ...currentReview,
            status: isFinal ? 'Finalized' : currentReview.status,
            finalScore: isFinal ? finalScore : currentReview.finalScore,
        });
        setIsLoading(false);
    };

    if (!isOpen || !currentReview) return null;

    const isManagerEditable = currentReview.status === 'SelfAssessmentComplete' || currentReview.status === 'Pending';
    const isFinalizable = currentReview.status === 'SelfAssessmentComplete';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-6xl border border-border-color max-h-[90vh] flex flex-col">
                <div className="flex justify-between items-center mb-4 flex-shrink-0">
                    <div>
                        <h2 className="text-2xl font-bold text-primary">Manager Review</h2>
                        <p className="text-text-secondary">Untuk: {employeeName} | Periode: {currentReview.period}</p>
                    </div>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light"><XMarkIcon className="h-6 w-6" /></button>
                </div>

                <div className="overflow-y-auto flex-grow pr-2">
                    <table className="w-full text-sm">
                        <thead className="text-left text-text-secondary uppercase">
                            <tr>
                                <th className="p-2 w-[25%]">Metric</th>
                                <th className="p-2 w-[10%]">Target</th>
                                <th className="p-2 w-[25%]" colSpan={2}>Actual (Employee / Manager)</th>
                                <th className="p-2 w-[25%]" colSpan={2}>Comments (Employee / Manager)</th>
                                <th className="p-2 w-[10%]">Weight (%)</th>
                                <th className="p-2 w-[5%]"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {currentReview.kpis.map((kpi, index) => (
                                <tr key={kpi.id} className="border-t border-border-color">
                                    <td><input type="text" value={kpi.metric} onChange={e => handleKpiChange(index, 'metric', e.target.value)} className="w-full bg-surface-light p-2 rounded border border-border-color" /></td>
                                    <td><input type="number" value={kpi.target} onChange={e => handleKpiChange(index, 'target', e.target.value)} className="w-full bg-surface-light p-2 rounded border border-border-color" /></td>
                                    
                                    {/* Employee Actual (Read-only) */}
                                    <td><input type="number" value={review?.kpis[index]?.actual || 0} readOnly className="w-full bg-surface p-2 rounded border border-border-color text-text-secondary italic" /></td>
                                    {/* Manager Actual (Editable) */}
                                    <td><input type="number" value={kpi.actual} onChange={e => handleKpiChange(index, 'actual', e.target.value)} disabled={!isManagerEditable} className="w-full bg-surface-light p-2 rounded border border-border-color" /></td>
                                    
                                    {/* Employee Comment (Read-only) */}
                                    <td><textarea value={review?.kpis[index]?.employeeComment || ''} readOnly rows={2} className="w-full bg-surface p-2 rounded border border-border-color text-text-secondary italic text-xs" /></td>
                                    {/* Manager Comment (Editable) */}
                                    <td><textarea value={kpi.managerComment} onChange={e => handleKpiChange(index, 'managerComment', e.target.value)} disabled={!isManagerEditable} rows={2} className="w-full bg-surface-light p-2 rounded border border-border-color text-xs" /></td>

                                    <td><input type="number" value={kpi.weight} onChange={e => handleKpiChange(index, 'weight', e.target.value)} className="w-full bg-surface-light p-2 rounded border border-border-color" /></td>
                                    <td><button onClick={() => removeKpi(index)} className="p-2 text-red-500"><TrashIcon className="h-5 w-5"/></button></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <button onClick={addKpi} className="mt-4 flex items-center text-sm font-semibold text-primary"><PlusIcon className="h-4 w-4 mr-1"/> Add KPI</button>
                </div>

                <div className="flex justify-end space-x-4 pt-4 mt-4 border-t border-border-color flex-shrink-0">
                    <button onClick={() => handleSave(false)} disabled={isLoading || !isManagerEditable} className="px-6 py-2 rounded bg-surface-light disabled:opacity-50">Save as Draft</button>
                    <button onClick={() => handleSave(true)} disabled={isLoading || !isFinalizable} className="btn-primary px-6 py-2 rounded font-bold w-48 flex justify-center disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Finalize Score'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default KpiModal;
