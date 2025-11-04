import React, { useState, useMemo } from 'react';
import PersonalizedGreeting from '../../components/user/PersonalizedGreeting';
import SmartAssistant from '../../components/user/SmartAssistant';
import ForYouWidget from '../../components/user/ForYouWidget';
import CompactArticleCard from '../../components/user/news/CompactArticleCard';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { BuildingStorefrontIcon, CurrencyDollarIcon, NewspaperIcon, ClockIcon, Squares2X2Icon, SparklesIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import AttendanceCameraModal from '../../components/user/AttendanceCameraModal';

const QuickAccess: React.FC = () => {
    const { homePageConfig, logEngagementEvent } = useData();
    const baseItems = [ { name: 'Market', icon: BuildingStorefrontIcon, path: '/market' }, { name: 'Wallet', icon: CurrencyDollarIcon, path: '/wallet' }, { name: 'News', icon: NewspaperIcon, path: '/news' }, ];
    if (homePageConfig.featureFlags.aiInvestmentBot) { baseItems.push({ name: 'AI Bot', icon: SparklesIcon, path: '/placeholder/ai-investment-bot' }); }
    const gridColsClass = baseItems.length === 4 ? 'grid-cols-4' : 'grid-cols-2';
    return (
        <div>
             <h2 className="text-lg font-bold text-text-primary mb-2">Akses Cepat</h2>
             <div className={`grid ${gridColsClass} gap-4 text-center`}>
                {baseItems.map(item => ( <Link to={item.path} key={item.name} onClick={() => logEngagementEvent('quickAccessClicks', item.name)} className="bg-surface p-4 rounded-lg flex flex-col items-center justify-center aspect-square" > <item.icon className="h-12 w-12 text-primary mb-3" /> <span className="text-sm font-semibold">{item.name}</span> </Link> ))}
            </div>
             <Link to="/features" className="mt-4 block bg-surface p-3 rounded-lg text-center font-semibold text-primary hover:bg-surface-light transition-colors">
                <div className="flex items-center justify-center"> <Squares2X2Icon className="h-5 w-5 mr-2" /> <span>Lihat Semua Layanan</span> </div>
            </Link>
        </div>
    );
};

const AttendanceCard: React.FC = () => {
    const { user } = useAuth();
    const { attendanceRecords, clockIn, clockOut, showToast } = useData();
    const [isLoading, setIsLoading] = useState(false);
    const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);
    const [cameraMode, setCameraMode] = useState<'in' | 'out' | null>(null);
    const activeRecord = useMemo(() => { if (!user) return null; return [...(attendanceRecords || [])] .filter(r => r.userId === user.id && r.clockInTime && !r.clockOutTime) .sort((a, b) => new Date(b.clockInTime!).getTime() - new Date(a.clockInTime!).getTime())[0]; }, [attendanceRecords, user]);
    const latestRecordToday = useMemo(() => { if (!user) return null; const today = new Date().toISOString().split('T')[0]; const recordsToday = (attendanceRecords || []).filter(r => r.userId === user.id && r.date === today); if (recordsToday.length === 0) return null; return recordsToday.sort((a, b) => { const timeA = new Date(a.clockOutTime || a.clockInTime || 0).getTime(); const timeB = new Date(b.clockOutTime || b.clockInTime || 0).getTime(); return timeB - timeA; })[0]; }, [attendanceRecords, user]);
    const getStatus = () => { if (activeRecord) { return { text: `Anda masuk pukul ${new Date(activeRecord.clockInTime!).toLocaleTimeString('id-ID')}.`, button: 'Clock Out' }; } if (latestRecordToday?.clockOutTime) { return { text: `Absen terakhir hari ini pukul ${new Date(latestRecordToday.clockOutTime).toLocaleTimeString('id-ID')}.`, button: 'Clock In' }; } return { text: 'Anda belum absen hari ini.', button: 'Clock In' }; };
    const handleClockButtonClick = (mode: 'in' | 'out') => { setCameraMode(mode); setIsCameraModalOpen(true); };
    const handlePhotoCapture = async (photoUrl: string) => { setIsCameraModalOpen(false); setIsLoading(true); let result = await (cameraMode === 'in' ? clockIn(photoUrl) : clockOut(photoUrl)); showToast(result.message, result.success ? 'success' : 'error'); setIsLoading(false); setCameraMode(null); };
    const status = getStatus();
    return ( <> <div className="bg-surface p-4 rounded-lg border border-border-color"> <h2 className="text-lg font-bold text-text-primary mb-2 flex items-center"> <ClockIcon className="h-5 w-5 mr-2" /> Absensi Hari Ini </h2> <p className="text-text-secondary text-sm mb-4">{status.text}</p> {status.button && ( <button onClick={() => handleClockButtonClick(status.button === 'Clock In' ? 'in' : 'out')} disabled={isLoading} className="w-full btn-primary p-3 rounded-lg font-bold flex justify-center items-center" > {isLoading ? <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : status.button} </button> )} </div> <AttendanceCameraModal isOpen={isCameraModalOpen} onClose={() => setIsCameraModalOpen(false)} onCapture={handlePhotoCapture} /> </> );
};

const RightSidebar: React.FC = () => {
    const { notifications, products } = useData();
    const { user } = useAuth();
    const userNotifications = (notifications || []).filter(n => n.userId === user?.id).slice(0, 3);
    const cooperativeProducts = (products || []).filter(p => p.sellerId === 'admin-001').slice(0, 2);
    return (
        <div className="sticky top-20 space-y-6">
            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h3 className="font-bold text-text-primary mb-2">Notifikasi Terbaru</h3>
                <div className="space-y-3">
                    {userNotifications.length > 0 ? userNotifications.map(n => (
                        <div key={n.id} className="text-xs">
                            <p className="text-text-primary truncate">{n.message}</p>
                            <p className="text-text-secondary">{new Date(n.timestamp).toLocaleDateString()}</p>
                        </div>
                    )) : <p className="text-xs text-text-secondary">Tidak ada notifikasi.</p>}
                </div>
            </div>
            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h3 className="font-bold text-text-primary mb-2">Sorotan Koperasi</h3>
                <div className="space-y-3">
                    {cooperativeProducts.map(p => (
                        <Link to="/market" key={p.id} className="flex items-center space-x-3 hover:bg-surface-light p-1 rounded-lg">
                            <img src={p.imageUrl} alt={p.name} className="w-10 h-10 rounded object-cover" />
                            <div>
                                <p className="text-xs font-semibold">{p.name}</p>
                                <p className="text-xs font-bold text-primary">{new Intl.NumberFormat('id-ID',{style:'currency', currency:'IDR'}).format(p.price)}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

const HomeScreen: React.FC = () => {
    const { articles } = useData();
    const latestNews = (articles || []) .filter(a => a.status === 'Published') .sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()) .slice(0, 2);
    return (
        <div className="py-6 grid grid-cols-10 gap-8">
            <div className="col-span-10 lg:col-span-7">
                <div className="space-y-8">
                    <PersonalizedGreeting />
                    <SmartAssistant />
                    <AttendanceCard />
                    <QuickAccess />
                    <ForYouWidget />
                    <div>
                         <h2 className="text-lg font-bold text-text-primary mb-4">Info & Berita Terbaru</h2>
                         <div className="space-y-3">
                            {latestNews.map(article => ( <CompactArticleCard key={article.id} article={article} /> ))}
                         </div>
                    </div>
                </div>
            </div>
            <aside className="hidden lg:block col-span-3">
                <RightSidebar />
            </aside>
        </div>
    );
};

export default HomeScreen;