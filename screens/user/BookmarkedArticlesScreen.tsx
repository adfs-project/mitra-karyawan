import React from 'react';
// FIX: Replaced useCore with useApp as DataContext is deprecated.
import { useApp } from '../../contexts/AppContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BookmarkIcon } from '@heroicons/react/24/outline';
import { BookmarkIcon as BookmarkSolidIcon } from '@heroicons/react/24/solid';
import ArticleCard from '../../components/user/news/ArticleCard'; 

const BookmarkedArticlesScreen: React.FC = () => {
    const { user } = useAuth();
    const { articles } = useApp();

    const bookmarkedArticles = articles.filter(a => user?.bookmarkedArticles.includes(a.id));

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-2xl font-bold text-primary flex items-center">
                <BookmarkSolidIcon className="h-7 w-7 mr-2" /> Artikel Tersimpan
            </h1>

            {bookmarkedArticles.length > 0 ? (
                <div className="space-y-4">
                    {bookmarkedArticles.map(article => (
                        <ArticleCard key={article.id} article={article} onOpenComments={() => { /* Not needed here or implement if required */ }} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <BookmarkIcon className="h-20 w-20 mx-auto text-text-secondary" />
                    <h2 className="mt-4 text-xl font-semibold text-text-primary">Anda Belum Menyimpan Artikel</h2>
                    <p className="text-text-secondary mt-2">Simpan artikel yang Anda anggap penting dengan menekan ikon bookmark.</p>
                    <Link to="/news" className="mt-6 inline-block btn-secondary px-6 py-2 rounded-lg font-bold">
                        Jelajahi Info & News
                    </Link>
                </div>
            )}
        </div>
    );
};

export default BookmarkedArticlesScreen;