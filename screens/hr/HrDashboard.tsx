import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { UsersIcon, CalendarDaysIcon, UserPlusIcon, SparklesIcon } from '@heroicons/react/24/solid';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType; to: string; }> = ({ title, value, icon: Icon, to }) => (
    <Link to={to} className="bg-surface p-6 rounded-lg border border-border-color hover:border-primary transition-all">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary/20 text-primary mr-4">
                <Icon className="h-8 w-8" />
            </div>
            <div>
                <p className="text-3xl font-bold text-text-primary">{value}</p>
                <p className="text-sm text-text-secondary">{title}</p>
            </div>
        </div>
    </Link>
);

const HrDashboard: React.FC = () => {
    const { user } = useAuth();
    const { users, leaveRequests } = useData();

    if (!user || user.role !== 'HR') return null;

    const branch = user.profile.branch;
    const branchEmployees = users.filter(u => u.profile.branch === branch && u.role === 'User');
    const pendingLeaves = leaveRequests.filter(req => req.branch === branch && req.status === 'Pending');

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const newHires = branchEmployees.filter(e => e.profile.joinDate && new Date(e.profile.joinDate) > thirtyDaysAgo);

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary">HR Dashboard: {branch}</h1>
            <p className="text-text-secondary">Ringkasan aktivitas dan metrik penting untuk cabang Anda.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total Karyawan Aktif" value={branchEmployees.length} icon={UsersIcon} to="/hr/onboarding" />
                <StatCard title="Permintaan Cuti Pending" value={pendingLeaves.length} icon={CalendarDaysIcon} to="/hr/leave" />
                <StatCard title="Karyawan Baru Bulan Ini" value={newHires.length} icon={UserPlusIcon} to="/hr/onboarding" />
            </div>

             <Link to="/hr/copilot" className="block bg-gradient-to-r from-primary/20 to-secondary/20 p-6 rounded-lg border border-primary/50 hover:border-primary transition-all">
                <div className="flex items-center">
                    <SparklesIcon className="h-12 w-12 text-primary mr-4" />
                     <div>
                        <h2 className="text-xl font-bold text-text-primary">HR AI Co-pilot</h2>
                        <p className="text-sm text-text-secondary">Tingkatkan produktivitas Anda. Analisis moral tim, buat draf pengumuman, dan dapatkan jawaban instan dengan bantuan AI.</p>
                    </div>
                </div>
            </Link>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Aktivitas Terkini</h2>
                {pendingLeaves.length > 0 ? (
                    <div className="space-y-2">
                        {pendingLeaves.slice(0, 3).map(req => (
                            <div key={req.id} className="p-3 bg-surface-light rounded-md flex justify-between items-center">
                                <p className="text-sm"><span className="font-bold">{req.userName}</span> mengajukan cuti dari <span className="font-semibold">{req.startDate}</span> hingga <span className="font-semibold">{req.endDate}</span>.</p>
                                <Link to="/hr/leave" className="text-xs font-bold text-primary hover:underline">Lihat Detail</Link>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-text-secondary text-center py-4">Tidak ada aktivitas terbaru.</p>
                )}
            </div>
        </div>
    );
};

export default HrDashboard;