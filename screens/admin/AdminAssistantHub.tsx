

import React, { useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { ChatBubbleLeftRightIcon, ChartPieIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid';

const AdminAssistantHub: React.FC = () => {
    const { assistantLogs } = useData();

    const intentAnalytics = useMemo(() => {
        const intentCounts = assistantLogs.reduce((acc: Record<string, number>, log) => {
            acc[log.detectedIntent] = (acc[log.detectedIntent] || 0) + 1;
            return acc;
        }, {});

        return Object.entries(intentCounts)
            .sort(([, a], [, b]) => b - a)
            .map(([intent, count]) => ({ intent, count }));
    }, [assistantLogs]);

    const unsureLogs = useMemo(() => {
        return assistantLogs.filter(log => log.detectedIntent === 'UNSURE' || log.detectedIntent === 'ERROR');
    }, [assistantLogs]);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary flex items-center">
                <ChatBubbleLeftRightIcon className="h-8 w-8 mr-3" />
                Smart Assistant Intelligence Hub
            </h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 bg-surface p-6 rounded-lg border border-border-color">
                    <h2 className="text-xl font-bold mb-4 flex items-center"><ChartPieIcon className="h-5 w-5 mr-2" /> Intent Distribution</h2>
                    <div className="space-y-2">
                        {intentAnalytics.map(({ intent, count }) => (
                            <div key={intent} className="flex justify-between items-center text-sm">
                                <span className="font-semibold text-text-primary">{intent}</span>
                                <span className="font-bold bg-surface-light px-2 py-0.5 rounded">{count}</span>
                            </div>
                        ))}
                         {intentAnalytics.length === 0 && <p className="text-sm text-text-secondary">No queries logged yet.</p>}
                    </div>
                </div>
                <div className="lg:col-span-2 bg-surface p-6 rounded-lg border border-border-color">
                    <h2 className="text-xl font-bold mb-4 flex items-center"><QuestionMarkCircleIcon className="h-5 w-5 mr-2" /> "Unsure Intent" Review Queue</h2>
                    <div className="max-h-60 overflow-y-auto pr-2">
                        <ul className="space-y-2">
                            {unsureLogs.map(log => (
                                <li key={log.id} className="bg-surface-light p-3 rounded">
                                    <p className="font-mono text-sm text-text-primary">"{log.query}"</p>
                                    <p className="text-xs text-text-secondary mt-1">{new Date(log.timestamp).toLocaleString()}</p>
                                </li>
                            ))}
                        </ul>
                        {unsureLogs.length === 0 && <p className="text-sm text-text-secondary">No "unsure" queries logged yet. Great!</p>}
                    </div>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                 <h2 className="text-xl font-bold mb-4">Full Query Log</h2>
                 <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-surface-light sticky top-0">
                            <tr>
                                <th scope="col" className="px-6 py-3">Timestamp</th>
                                <th scope="col" className="px-6 py-3">User Query</th>
                                <th scope="col" className="px-6 py-3">Detected Intent</th>
                                <th scope="col" className="px-6 py-3">User ID</th>
                            </tr>
                        </thead>
                        <tbody>
                            {assistantLogs.map(log => (
                                <tr key={log.id} className="bg-surface border-b border-border-color">
                                    <td className="px-6 py-4">{new Date(log.timestamp).toLocaleString()}</td>
                                    <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{log.query}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            log.detectedIntent === 'UNSURE' ? 'bg-yellow-500/20 text-yellow-400' : 
                                            log.detectedIntent === 'ERROR' ? 'bg-red-500/20 text-red-400' :
                                            'bg-green-500/20 text-green-400'
                                        }`}>{log.detectedIntent}</span>
                                    </td>
                                    <td className="px-6 py-4 font-mono text-xs">{log.userId}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    );
};

export default AdminAssistantHub;