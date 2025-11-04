import React, { useState, useMemo } from 'react';
import { useData, useAuth, Article } from '@mk/shared';
import ArticleCard from '../../components/user/news/ArticleCard';
import CommentModal from '../../components/user/news/CommentModal';
import AiPersonalizedFeed from '../../components/user/news/AiPersonalizedFeed';
import { SparklesIcon, GlobeAltIcon, BookmarkIcon, TagIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import DesktopLeftSidebar from '../../components/layout/DesktopLeftSidebar';

type Tab = 'For You' | 'Global';

const RightSidebar: React.FC = () => {
    const { articles, user } = useData();

    const popularCategories = useMemo(() => {
        const categoryCount: Record<string, number> = {};
        articles.forEach(article => {
            categoryCount[article.category] = (categoryCount[article.category] || 0) + 1;
        });
        return Object.entries(categoryCount).sort(([, a], [, b]) => b - a).slice(0, 5).map(([name]) => name);
    }, [articles]);

    const bookmarked = articles.filter(a => user?.bookmarkedArticles.includes(a.id)).slice(0, 5);

    return (
        <div className="space-y-6">
            <div className="p-4 bg-surface rounded-lg border border-border-color">
                <h3 className="font-bold text-text-secondary text-sm mb-2 flex items-center"><TagIcon className="h-4 w-4 mr-2"/> Kategori Populer</h3>
                <div className="flex flex-wrap gap-2">
                    {popularCategories.map(category => (
                        <span key={category} className="text-xs bg-secondary/20 text-secondary font-semibold py-1 px-2 rounded">{category}</span>
                    ))}
                </div>
            </div>
             <div className="p-4 bg-surface rounded-lg border border-border-color">
                <h3 className="font-bold text-text-secondary text-sm mb-2 flex items-center"><BookmarkIcon className="h-4 w-4 mr-2"/> Artikel Tersimpan</h3>
                 <div className="space-y-2">
                    {bookmarked.map(article => (
                        <Link key={article.id} to="/news" className="block text-sm text-text-primary hover:text-primary truncate">- {article.title}</Link>
                    ))}
                     {bookmarked.length === 0 && <p className="text-xs text-text-secondary text-center">Belum ada artikel yang disimpan.</p>}
                </div>
            </div>
        </div>
    );
};


const InfoNewsScreen: React.FC = () => {
    const { articles } = useData();
    const [activeTab, setActiveTab] = useState<Tab>('For You');
    const [isCommentModalOpen, setCommentModalOpen] = useState(false);
    const [selectedArticle, setSelectedArticle] = useState<Article | null>(null);

    const handleOpenComments = (article: Article) => {
        setSelectedArticle(article);
        setCommentModalOpen(true);
    };
    
    const globalFeed = useMemo(() => {
        return [...articles].filter(a => a.status === 'Published').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [articles]);

    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <DesktopLeftSidebar />

            <main className="lg:col-span-6 p-4 lg:p-0">
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-primary">Info & News</h1>

                    <div className="flex border-b border-border-color">
                        <button onClick={() => setActiveTab('For You')} className={`flex items-center space-x-2 px-4 py-2 font-semibold ${activeTab === 'For You' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                            <SparklesIcon className="h-5 w-5" />
                            <span>For You</span>
                        </button>
                        <button onClick={() => setActiveTab('Global')} className={`flex items-center space-x-2 px-4 py-2 font-semibold ${activeTab === 'Global' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                            <GlobeAltIcon className="h-5 w-5" />
                            <span>Global</span>
                        </button>
                    </div>

                    <div>
                        {activeTab === 'For You' ? (
                            <AiPersonalizedFeed onOpenComments={handleOpenComments} />
                        ) : (
                            <div className="space-y-4">
                                {globalFeed.map(article => (
                                    <ArticleCard key={article.id} article={article} onOpenComments={() => handleOpenComments(article)} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            <aside className="hidden lg:block lg:col-span-3">
                 <div className="sticky top-20">
                    <RightSidebar />
                </div>
            </aside>

            <CommentModal isOpen={isCommentModalOpen} onClose={() => setCommentModalOpen(false)} article={selectedArticle} />
        </div>
    );
};

export default InfoNewsScreen;
