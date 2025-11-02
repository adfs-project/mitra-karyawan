import React, { useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
// FIX: Replaced useCore with useApp as DataContext is deprecated.
import { useData } from '../../../contexts/DataContext';
import { Article } from '../../../types';
import ArticleCard from './ArticleCard';
import { SparklesIcon } from '@heroicons/react/24/solid';

const AiPersonalizedFeed: React.FC<{ onOpenComments: (article: Article) => void }> = ({ onOpenComments }) => {
    const { user } = useAuth();
    const { articles, interestProfiles } = useData();

    const personalizedFeed = useMemo(() => {
        if (!user) return [];
        const tags = interestProfiles[user.id] || [];
        if (tags.length === 0) return [];

        const scoredArticles = articles.map(article => {
            let score = 0;
            const articleText = `${article.title} ${article.summary} ${article.category}`.toLowerCase();
            tags.forEach(tag => {
                if (articleText.includes(tag.toLowerCase())) {
                    score++;
                }
            });
            // Boost newer articles
            const timeDiff = new Date().getTime() - new Date(article.timestamp).getTime();
            const daysAgo = timeDiff / (1000 * 3600 * 24);
            score += Math.max(0, 1 - (daysAgo / 30)); // Add up to 1 point for articles within last 30 days

            return { article, score };
        });

        return scoredArticles
            .filter(item => item.score > 0 && item.article.status === 'Published')
            .sort((a, b) => b.score - a.score)
            .map(item => item.article);
            
    }, [articles, user, interestProfiles]);

    if (!user || !interestProfiles[user.id] || interestProfiles[user.id].length === 0) {
        return (
            <div className="text-center p-8 bg-surface rounded-lg border border-border-color">
                <SparklesIcon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="mt-4 text-lg font-bold text-text-primary">Feed Anda Sedang Disiapkan</h3>
                <p className="mt-2 text-text-secondary text-sm max-w-sm mx-auto">
                    Berinteraksilah dengan aplikasi, seperti menyukai artikel atau menambahkan produk ke wishlist, untuk mendapatkan rekomendasi berita yang dipersonalisasi di sini.
                </p>
            </div>
        );
    }
    
    if (personalizedFeed.length === 0) {
        return <p className="text-center text-text-secondary py-8">Tidak ada rekomendasi yang cocok saat ini. Jelajahi tab Global!</p>
    }

    return (
        <div className="space-y-4">
            {personalizedFeed.map(article => (
                <ArticleCard key={article.id} article={article} onOpenComments={() => onOpenComments(article)} />
            ))}
        </div>
    );
};

export default AiPersonalizedFeed;
