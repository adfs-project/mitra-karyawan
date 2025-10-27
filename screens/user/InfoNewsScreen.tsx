import React, { useState, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { MagnifyingGlassIcon, PencilSquareIcon } from '@heroicons/react/24/outline';
import { Article } from '../../types';
import ArticleCard from '../../components/user/news/ArticleCard';
import CommentModal from '../../components/user/news/CommentModal';
import AiPersonalizedFeed from '../../components/user/news/AiPersonalizedFeed';

type Tab = 'Untuk Anda' | 'Perusahaan' | 'Trending';

const InfoNewsScreen: React.FC = () => {
    const { articles } = useData();
    const [activeTab, setActiveTab] = useState<Tab>('Untuk Anda');
    const [searchTerm, setSearchTerm] = useState('');
    const [filterCategory, setFilterCategory] = useState<string | null>(null);

    const [isCommentModalOpen, setCommentModalOpen] = useState(false);
    const [selectedArticleForComment, setSelectedArticleForComment] = useState<Article | null>(null);

    const handleOpenComments = (article: Article) => {
        setSelectedArticleForComment(article);
        setCommentModalOpen(true);
    };

    const publishedArticles = useMemo(() => 
        articles.filter(article => article.status === 'Published'), 
    [articles]);

    const categories = useMemo(() => 
        ['All', ...Array.from(new Set(publishedArticles.map(a => a.category).filter(c => c !== 'Banner')))], 
    [publishedArticles]);

    const displayedArticles = useMemo(() => {
        let filtered = publishedArticles;

        if (searchTerm) {
            filtered = filtered.filter(a =>
                a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                a.summary.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        if (filterCategory && filterCategory !== 'All') {
            filtered = filtered.filter(a => a.category === filterCategory);
        }

        if (activeTab === 'Trending') {
            const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return filtered
                .filter(a => new Date(a.timestamp) > sevenDaysAgo)
                .sort((a, b) => (b.likes.length + b.comments.length) - (a.likes.length + a.comments.length));
        }
        
        // Default chronological sort for 'Perusahaan' tab
        return filtered.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    }, [publishedArticles, searchTerm, filterCategory, activeTab]);

    const renderContent = () => {
        if (activeTab === 'Untuk Anda') {
            return <AiPersonalizedFeed onOpenComments={handleOpenComments} />;
        }

        return (
             <div className="space-y-4">
                {displayedArticles.length > 0 ? displayedArticles.map(article => (
                    <ArticleCard key={article.id} article={article} onOpenComments={() => handleOpenComments(article)} />
                )) : (
                    <p className="text-center text-text-secondary py-8">Tidak ada artikel yang cocok dengan filter Anda.</p>
                )}
            </div>
        )
    };
    
    const handleCategoryClick = (category: string) => {
        setFilterCategory(prev => prev === category ? null : category);
        if(activeTab === 'Untuk Anda') {
            setActiveTab('Perusahaan');
        }
    };

    return (
        <div className="p-4 space-y-4">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-secondary">Info & News</h1>
                <button 
                    onClick={() => alert("Fitur 'Kirim Ide' akan segera hadir! Untuk saat ini, silakan hubungi tim HR atau Admin.")}
                    className="flex items-center text-sm font-semibold bg-secondary/20 text-secondary px-3 py-1.5 rounded-lg hover:bg-secondary/30"
                >
                    <PencilSquareIcon className="h-4 w-4 mr-1.5" />
                    Kirim Ide/Berita
                </button>
            </div>


            <div className="relative">
                 <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                 <input
                    type="text"
                    placeholder="Cari artikel..."
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="w-full bg-surface border border-border-color rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-secondary"
                />
            </div>

            <div className="flex border-b border-border-color">
                {(['Untuk Anda', 'Perusahaan', 'Trending'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => setActiveTab(tab)} className={`px-4 py-2 font-semibold ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                        {tab}
                    </button>
                ))}
            </div>
            
             <div className="flex overflow-x-auto space-x-2 pb-2">
                {categories.map(cat => (
                    <button key={cat} onClick={() => handleCategoryClick(cat)}
                        className={`flex-shrink-0 px-3 py-1 text-sm rounded-full border ${filterCategory === cat ? 'bg-primary text-black border-primary' : 'bg-surface-light border-border-color text-text-secondary'}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>
            
            {renderContent()}

            <CommentModal
                isOpen={isCommentModalOpen}
                onClose={() => setCommentModalOpen(false)}
                article={selectedArticleForComment}
            />
        </div>
    );
};

export default InfoNewsScreen;