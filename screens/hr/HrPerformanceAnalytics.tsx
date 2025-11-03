import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { ChartBarIcon, StarIcon, ExclamationTriangleIcon } from '@heroicons/react/24/solid';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-surface p-6 rounded-lg border border-border-color">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary/20 text-primary mr-4">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
        </div>
    </div>
);

const HrPerformanceAnalytics: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users, performanceReviews } = useData();

    const branchAnalytics = useMemo(() => {
        if (!hrUser) return { averageScore: 0, finalizedCount: 0, pendingCount: 0, distribution: [] };

        const branchEmployeeIds = new Set(users.filter(u => u.profile.branch === hrUser.profile.branch && u.role === 'User').map(u => u.id));
        
        const branchReviews = performanceReviews.filter(pr => branchEmployeeIds.has(pr.userId));

        const finalizedReviews = branchReviews.filter(pr => pr.status === 'Finalized');
        const totalScore = finalizedReviews.reduce((sum, r) => sum + r.finalScore, 0);
        const averageScore = finalizedReviews.length > 0 ? (totalScore / finalizedReviews.length) : 0;

        const pendingCount = branchReviews.filter(pr => pr.status === 'Pending' || pr.status === 'SelfAssessmentComplete').length;

        const distribution = [
            { range: '< 70', count: finalizedReviews.filter(r => r.finalScore < 70).length },
            { range: '70-85', count: finalizedReviews.filter(r => r.finalScore >= 70 && r.finalScore <= 85).length },
            { range: '> 85', count: finalizedReviews.filter(r => r.finalScore > 85).length },
        ];

        return {
            averageScore: averageScore.toFixed(2),
            finalizedCount: finalizedReviews.length,
            pendingCount,
            distribution,
        };
    }, [hrUser, users, performanceReviews]);

    const maxDistributionCount = Math.max(...branchAnalytics.distribution.map(d => d.count), 1);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Performance Analytics - {hrUser?.profile.branch}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Average Final Score" value={branchAnalytics.averageScore} icon={StarIcon} />
                <StatCard title="Reviews Finalized" value={`${branchAnalytics.finalizedCount}`} icon={ChartBarIcon} />
                <StatCard title="Reviews Pending" value={branchAnalytics.pendingCount} icon={ExclamationTriangleIcon} />
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Score Distribution</h2>
                <div className="flex justify-around items-end space-x-4 h-48">
                    {branchAnalytics.distribution.map(item => (
                        <div key={item.range} className="flex flex-col items-center flex-grow text-center">
                            <div className="w-full h-full bg-surface-light rounded-t-md flex items-end">
                                <div 
                                    className="w-full bg-primary rounded-t-md" 
                                    style={{ height: `${(item.count / maxDistributionCount) * 100}%` }}
                                ></div>
                            </div>
                            <span className="text-xs font-bold text-text-primary mt-1">{item.count}</span>
                            <span className="text-xs text-text-secondary">{item.range}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default HrPerformanceAnalytics;
