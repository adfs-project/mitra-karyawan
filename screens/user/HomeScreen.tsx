import React, { useState, useMemo } from 'react';
import PersonalizedGreeting from '../../components/user/PersonalizedGreeting';
import SmartAssistant from '../../components/user/SmartAssistant';
import ForYouWidget from '../../components/user/ForYouWidget';
import CompactArticleCard from '../../components/user/news/CompactArticleCard';
import { useData } from '../../contexts/DataContext';
import { BuildingStorefrontIcon, CurrencyDollarIcon, HeartIcon, NewspaperIcon, ClockIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';


const QuickAccess: React.FC = () => {
    const items = [
        { name: 'Market', icon: BuildingStorefrontIcon, path: '/market' },
        { name: 'Wallet', icon: CurrencyDollarIcon, path: '/wallet' },
        { name: 'Health', icon: HeartIcon, path: '/health' },
        { name: 'News', icon: NewspaperIcon, path: '/news' },
    ];
    return (
        <div>
             <h2 className="text-lg font-bold text-text-primary mb-2">Akses Cepat</h2>
             <div className="grid grid-cols-4 gap-4 text-center">
                {items.map(item => (
                    <Link to={item.path} key={item.name} className="bg-surface p-4 rounded-lg flex flex-col items-center justify-center">
                        <item.icon className="h-8 w-8 text-primary mb-2" />
                        <span className="text-xs font-semibold">{item.name}</span>
                    </Link>
                ))}
            </div>
        </div>
    );
};

const AttendanceCard: React.FC = () => {
    const { user } = useAuth();
    const { attendanceRecords, clockIn, clockOut, showToast } = useData();
    const [isLoading, setIsLoading] = useState(false);

    const todaysRecord = useMemo(() => {
        if (!user) return null;
        const today = new Date().toISOString().split('T')[0];
        return attendanceRecords.find(r => r.userId === user.id && r.date === today);
    }, [attendanceRecords, user]);

    const getStatus = () => {
        if (todaysRecord?.clockOutTime) {
            return { text: `Absen selesai. Keluar pukul ${new Date(todaysRecord.clockOutTime).toLocaleTimeString('id-ID')}.`, button: null };
        }
        if (todaysRecord?.clockInTime) {
            return { text: `Anda masuk pukul ${new Date(todaysRecord.clockInTime).toLocaleTimeString('id-ID')}.`, button: 'Clock Out' };
        }
        return { text: 'Anda belum absen hari ini.', button: 'Clock In' };
    };

    const handleClockIn = async () => {
        setIsLoading(true);
        const result = await clockIn();
        showToast(result.message, result.success ? 'success' : 'error');
        setIsLoading(false);
    };

    const handleClockOut = async () => {
        setIsLoading(true);
        const result = await clockOut();
        showToast(result.message, result.success ? 'success' : 'error');
        setIsLoading(false);
    };

    const status = getStatus();

    return (
        <div className="bg-surface p-4 rounded-lg border border-border-color">
            <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center">
                <ClockIcon className="h-5 w-5 mr-2" />
                Absensi Hari Ini
            </h2>
            <p className="text-text-secondary text-sm mb-4">{status.text}</p>
            {status.button && (
                <button
                    onClick={status.button === 'Clock In' ? handleClockIn : handleClockOut}
                    disabled={isLoading}
                    className="w-full btn-primary p-3 rounded-lg font-bold flex justify-center items-center"
                >
                    {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : status.button}
                </button>
            )}
        </div>
    );
};


const HomeScreen: React.FC = () => {
    const { articles } = useData();

    const latestNews = articles
        .filter(a => a.status === 'Published')
        .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 2);

    return (
        <div className="space-y-8 p-4">
            <PersonalizedGreeting />
            <SmartAssistant />
            <AttendanceCard />
            <QuickAccess />
            <ForYouWidget />
            <div>
                 <h2 className="text-lg font-bold text-text-primary mb-4">Info & Berita Terbaru</h2>
                 <div className="space-y-3">
                    {latestNews.map(article => (
                        <CompactArticleCard key={article.id} article={article} />
                    ))}
                 </div>
            </div>
        </div>
    );
};

export default HomeScreen;