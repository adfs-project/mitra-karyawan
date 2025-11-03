import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { Article } from '../../types';
import ArticleCard from '../../components/user/news/ArticleCard';
import CommentModal from '../../components/user/news/CommentModal';
import AiPersonalizedFeed from '../../components/user/news/AiPersonalizedFeed';
import { SparklesIcon, GlobeAltIcon } from '@heroicons/react/24/solid';

type Tab = 'For You' | 'Global';

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
        <div className="p-4 space-y-4">
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

            <CommentModal
                isOpen={isCommentModalOpen}
                onClose={() => setCommentModalOpen(false)}
                article={selectedArticle}
            />
        </div>
    );
};

export default InfoNewsScreen;