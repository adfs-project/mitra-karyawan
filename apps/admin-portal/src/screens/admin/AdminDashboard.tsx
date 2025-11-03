import React, { useMemo } from 'react';
import { useData } from '@mk/shared';
import { UsersIcon, BanknotesIcon, ShoppingCartIcon, ArrowTrendingUpIcon, CursorArrowRaysIcon, SparklesIcon } from '@heroicons/react/24/outline';

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

const EngagementAnalyticsDashboard: React.FC = () => {
    const { engagementAnalytics, articles, assistantLogs, products } = useData();

    const getMostClickedItem = (clicks: Record<string, number>) => {
        if (Object.keys(clicks).length === 0) return { name: 'N/A', clicks: 0 };
        const [id, clicksCount] = Object.entries(clicks).sort(([, a], [, b]) => b - a)[0];
        
        let name = id;
        if(id.startsWith('product:')){
            const product = products.find(p => p.id === id.split(':')[1]);
            name = product?.name || id;
        } else if (id.startsWith('article:')) {
            const article = articles.find(a => a.id === id.split(':')[1]);
            name = article?.title || id;
        } else if (id.startsWith('loyalty:')) {
            name = "Loyalty Card";
        }

        return { name, clicks: clicksCount };
    };

    const mostClickedForYou = getMostClickedItem(engagementAnalytics.forYouClicks);

    return (
        <div className="bg-surface p-6 rounded-lg border border-border-color">
            <h2 className="text-xl font-bold mb-4">Home Screen Engagement</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <StatCard 
                    title="Most Clicked 'For You' Item" 
                    value={mostClickedForYou.name}
                    icon={CursorArrowRaysIcon} 
                />
                 <StatCard 
                    title="Smart Assistant Queries" 
                    value={assistantLogs.length}
                    icon={SparklesIcon} 
                />
            </div>
        </div>
    );
};


const AdminDashboard: React.FC = () => {
    const { users, transactions, adminWallets } = useData();

    const totalUsers = users.length;
    const totalTransactions = transactions.length;

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Dashboard Overview</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Users" value={totalUsers} icon={UsersIcon} />
                <StatCard 
                    title="Platform Profit" 
                    value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(adminWallets.profit)} 
                    icon={BanknotesIcon} 
                />
                <StatCard title="Total Transactions" value={totalTransactions} icon={ArrowTrendingUpIcon} />
            </div>

            <EngagementAnalyticsDashboard />

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Recent Transactions</h2>
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs text-text-secondary uppercase bg-surface-light">
                            <tr>
                                <th scope="col" className="px-6 py-3">User</th>
                                <th scope="col" className="px-6 py-3">Type</th>
                                <th scope="col" className="px-6 py-3">Amount</th>
                                <th scope="col" className="px-6 py-3">Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {transactions.slice(0, 5).map(tx => (
                                <tr key={tx.id} className="bg-surface border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary whitespace-nowrap">{tx.userName}</td>
                                    <td className="px-6 py-4">{tx.type}</td>
                                    <td className={`px-6 py-4 font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                        {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(tx.amount)}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${tx.status === 'Completed' ? 'bg-green-500/20 text-green-400' : tx.status === 'Pending' ? 'bg-yellow-500/20 text-yellow-400' : 'bg-red-500/20 text-red-400'}`}>{tx.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;