import React, { useState, useMemo } from 'react';
import PersonalizedGreeting from '../../components/user/PersonalizedGreeting';
import SmartAssistant from '../../components/user/SmartAssistant';
import ForYouWidget from '../../components/user/ForYouWidget';
import CompactArticleCard from '../../components/user/news/CompactArticleCard';
import { useApp } from '../../contexts/AppContext';
import { BuildingStorefrontIcon, CurrencyDollarIcon, NewspaperIcon, ClockIcon, Squares2X2Icon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import AttendanceCameraModal from '../../components/user/AttendanceCameraModal';
import { useHR } from '../../hooks/useHR';

// Skeleton Loader Component for HomeScreen
const HomeScreenSkeleton: React.FC = () => (
    <div className="p-4 space-y-8 animate-pulse">
        {/* Greeting Skeleton */}
        <div className="space-y-2">
            <div className="h-8 w-3/4 bg-surface-light rounded-lg"></div>
            <div className="h-4 w-1/2 bg-surface-light rounded-lg"></div>
        </div>

        {/* Smart Assistant Skeleton */}
        <div className="h-14 bg-surface rounded-full border-2 border-surface-light"></div>
        
        {/* Attendance Card Skeleton */}
        <div className="h-36 bg-surface rounded-lg p-4 space-y-3">
             <div className="h-5 w-1/3 bg-surface-light rounded-lg"></div>
             <div className="h-4 w-3/4 bg-surface-light rounded-lg"></div>
             <div className="h-12 bg-surface-light rounded-lg mt-2"></div>
        </div>

        {/* Quick Access Skeleton */}
        <div className="space-y-4">
             <div className="h-6 w-1/4 bg-surface-light rounded-lg"></div>
             <div className="grid grid-cols-3 gap-4">
                <div className="h-24 bg-surface rounded-lg"></div>
                <div className="h-24 bg-surface rounded-lg"></div>
                <div className="h-24 bg-surface rounded-lg"></div>
             </div>
             <div className="h-12 bg-surface rounded-lg"></div>
        </div>

        {/* For You & News Skeleton */}
        <div>
            <div className="h-6 w-1/3 bg-surface-light rounded-lg mb-4"></div>
            <div className="space-y-3">
                <div className="h-24 bg-surface rounded-lg flex items-center p-3 space-x-4">
                    <div className="w-16 h-16 bg-surface-light rounded-md flex-shrink-0"></div>
                    <div className="flex-grow space-y-2">
                         <div className="h-3 w-1/4 bg-surface-light rounded-full"></div>
                         <div className="h-4 w-full bg-surface-light rounded-lg"></div>
                         <div className="h-3 w-3/4 bg-surface-light rounded-lg"></div>
                    </div>
                </div>
                 <div className="h-24 bg-surface rounded-lg flex items-center p-3 space-x-4">
                    <div className="w-16 h-16 bg-surface-light rounded-md flex-shrink-0"></div>
                    <div className="flex-grow space-y-2">
                         <div className="h-3 w-1/4 bg-surface-light rounded-full"></div>
                         <div className="h-4 w-full bg-surface-light rounded-lg"></div>
                         <div className="h-3 w-3/4 bg-surface-light rounded-lg"></div>
                    </div>
                </div>
            </div>
        </div>
    </div>
);


const QuickAccess: React.FC = () => {
    const items = [
        { name: 'Market', icon: BuildingStorefrontIcon, path: '/market' },
        { name: 'Wallet', icon: CurrencyDollarIcon, path: '/wallet' },
        { name: 'News', icon: NewspaperIcon, path: '/news' },
    ];
    return (
        <div>
             <h2 className="text-lg font-bold text-text-primary mb-2">Akses Cepat</h2>
             <div className="grid grid-cols-3 gap-4 text-center">
                {items.map(item => (
                    <Link to={item.path} key={item.name} className="bg-surface p-4 rounded-lg flex flex-col items-center justify-center">
                        <item.icon className="h-8 w-8 text-primary mb-2" />
                        <span className="text-xs font-semibold">{item.name}</span>
                    </Link>
                ))}
            </div>
             <Link to="/features" className="mt-4 block bg-surface p-3 rounded-lg text-center font-semibold text-primary hover:bg-surface-light transition-colors">
                <div className="flex items-center justify-center">
                    <Squares2X2Icon className="h-5 w-5 mr-2" />
                    <span>Lihat Semua Layanan</span>
                </div>
            </Link>
        </div>
    );
};

const AttendanceCard: React.FC = () => {
    const { user } = useAuth();
    const { attendanceRecords, clockIn, clockOut } = useHR();
    const { showToast } = useApp();
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [cameraMode, setCameraMode] = useState<'in' | 'out' | null>(null);

    // This finds an open session (clocked in, not out)
    const activeRecord = useMemo(() => {
        if (!user) return null;
        return [...(attendanceRecords || [])]
            .filter(r => r.userId === user.id && r.clockInTime && !r.clockOutTime)
            .sort((a, b) => new Date(b.clockInTime!).getTime() - new Date(a.clockInTime!).getTime())[0];
    }, [attendanceRecords, user]);

    // This finds the very last attendance activity of any kind for today
    const latestRecordToday = useMemo(() => {
        if (!user) return null;
        const today = new Date().toISOString().split('T')[0];
        const recordsToday = (attendanceRecords || []).filter(r => r.userId === user.id && r.date === today);
        if (recordsToday.length === 0) return null;

        return recordsToday.sort((a, b) => {
            const timeA = new Date(a.clockOutTime || a.clockInTime || 0).getTime();
            const timeB = new Date(b.clockOutTime || b.clockInTime || 0).getTime();
            return timeB - timeA;
        })[0];
    }, [attendanceRecords, user]);

    const getStatus = () => {
        if (activeRecord) {
            return { text: `Anda masuk pukul ${new Date(activeRecord.clockInTime!).toLocaleTimeString('id-ID')}.`, button: 'Clock Out' };
        }
        if (latestRecordToday?.clockOutTime) {
            return { text: `Absen terakhir hari ini pukul ${new Date(latestRecordToday.clockOutTime).toLocaleTimeString('id-ID')}.`, button: 'Clock In' };
        }
        return { text: 'Anda belum absen hari ini.', button: 'Clock In' };
    };

    const handleClockButtonClick = (mode: 'in' | 'out') => {
        setCameraMode(mode);
        setIsCameraModalOpen(true);
    };

    const handlePhotoCapture = async (photoUrl: string) => {
        setIsCameraModalOpen(false);
        setIsLoading(true);
        
        let result;
        if (cameraMode === 'in') {
            result = await clockIn(photoUrl);
        } else if (cameraMode === 'out') {
            result = await clockOut(photoUrl);
        } else {
            result = { success: false, message: 'Invalid action.' };
        }
        
        showToast(result.message, result.success ? 'success' : 'error');
        setIsLoading(false);
        setCameraMode(null);
    };

    const status = getStatus();

    return (
        <>
            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center">
                    <ClockIcon className="h-5 w-5 mr-2" />
                    Absensi Hari Ini
                </h2>
                <p className="text-text-secondary text-sm mb-4">{status.text}</p>
                {status.button && (
                    <button
                        onClick={() => handleClockButtonClick(status.button === 'Clock In' ? 'in' : 'out')}
                        disabled={isLoading}
                        className="w-full btn-primary p-3 rounded-lg font-bold flex justify-center items-center"
                    >
                        {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : status.button}
                    </button>
                )}
            </div>
            <AttendanceCameraModal
                isOpen={isCameraModalOpen}
                onClose={() => setIsCameraModalOpen(false)}
                onCapture={handlePhotoCapture}
            />
        </>
    );
};


const HomeScreen: React.FC = () => {
    const { articles, users } = useApp();

    // The loading check is now localized. We check if 'users' (a core data array)
    // has been populated by AppContext. If not, we show the skeleton.
    if (!users || users.length === 0) {
        return <HomeScreenSkeleton />;
    }

    const latestNews = (articles || [])
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