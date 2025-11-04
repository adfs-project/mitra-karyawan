import React, { useState, useMemo } from 'react';
import { useData, Article, useAuth } from '@mk/shared';
import ArticleCard from '../../components/user/news/ArticleCard';
import CommentModal from '../../components/user/news/CommentModal';
import AiPersonalizedFeed from '../../components/user/news/AiPersonalizedFeed';
import { SparklesIcon, GlobeAltIcon, TagIcon, BookmarkIcon } from '@heroicons/react/24/solid';
import DesktopLeftSidebar from '../../components/layout/DesktopLeftSidebar';
import { Link } from 'react-router-dom';

type Tab = 'For You' | 'Global';

const RightSidebar: React.FC = () => {
    const { articles } = useData();
    const { user } = useAuth();

    const popularCategories = useMemo(() => {
        const counts: Record<string, number> = {};
        articles.forEach(a => {
            counts[a.category] = (counts[a.category] || 0) + 1;
        });
        return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    }, [articles]);

    return (
        <div className="sticky top-20 space-y-6">
            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h3 className="font-bold text-text-primary mb-2 flex items-center"><TagIcon className="h-4 w-4 mr-2" /> Kategori Populer</h3>
                <div className="space-y-2">
                    {popularCategories.map(([category, count]) => (
                        <div key={category} className="flex justify-between items-center text-sm p-2 bg-surface-light rounded-md">
                            <span className="font-semibold">{category}</span>
                            <span className="text-xs text-text-secondary font-bold">{count}</span>
                        </div>
                    ))}
                </div>
            </div>
             <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h3 className="font-bold text-text-primary mb-2 flex items-center"><BookmarkIcon className="h-4 w-4 mr-2" /> Artikel Tersimpan</h3>
                 <p className="text-xs text-text-secondary text-center py-4">Total {user?.bookmarkedArticles.length || 0} artikel tersimpan.</p>
                 <Link to="/bookmarked-articles" className="text-sm font-semibold text-primary block text-center">
                    Lihat Semua
                </Link>
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
        return [...articles]
            .filter(a => a.status === 'Published')
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }, [articles]);

    return (
        <div className="p-4 desktop:p-0 desktop:py-6 desktop:grid desktop:grid-cols-12 desktop:gap-8">
            <DesktopLeftSidebar />
            
            <main className="desktop:col-span-6 xl:col-span-7 space-y-4">
                <h1 className="text-2xl font-bold text-primary">Info & News</h1>

                <div className="flex border-b border-border-color">
                    <button
                        onClick={() => setActiveTab('For You')}
                        className={`flex items-center space-x-2 px-4 py-2 font-semibold ${activeTab === 'For You' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
                    >
                        <SparklesIcon className="h-5 w-5" />
                        <span>For You</span>
                    </button>
                    <button
                        onClick={() => setActiveTab('Global')}
                        className={`flex items-center space-x-2 px-4 py-2 font-semibold ${activeTab === 'Global' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}
                    >
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
            </main>

            <aside className="hidden desktop:block desktop:col-span-3 xl:col-span-3">
                <RightSidebar />
            </aside>

            <CommentModal
                isOpen={isCommentModalOpen}
                onClose={() => setCommentModalOpen(false)}
                article={selectedArticle}
            />
        </div>
    );
};

export default InfoNewsScreen;
