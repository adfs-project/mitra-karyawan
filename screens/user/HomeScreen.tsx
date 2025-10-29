import React from 'react';
import PersonalizedGreeting from '../../components/user/PersonalizedGreeting';
import SmartAssistant from '../../components/user/SmartAssistant';
import ForYouWidget from '../../components/user/ForYouWidget';
import CompactArticleCard from '../../components/user/news/CompactArticleCard';
import { useData } from '../../contexts/DataContext';
import { BuildingStorefrontIcon, CurrencyDollarIcon, HeartIcon, NewspaperIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';

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
