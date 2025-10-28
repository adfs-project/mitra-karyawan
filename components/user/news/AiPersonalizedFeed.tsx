import React, { useState, useEffect } from 'react';
import { Article } from '../../../types';
import { ShieldCheckIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { GoogleGenAI } from '@google/genai';
import ArticleCard from './ArticleCard';

const AiPersonalizedFeed: React.FC<{ onOpenComments: (article: Article) => void }> = ({ onOpenComments }) => {
    const { isAiGuardrailDisabled, articles } = useData();
    const { user } = useAuth();
    const [recommendations, setRecommendations] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!isAiGuardrailDisabled || !user) return;

            setIsLoading(true);
            const bookmarkedTitles = articles
                .filter(a => user.bookmarkedArticles.includes(a.id))
                .map(a => a.title)
                .join(', ');
            
            if (bookmarkedTitles.length === 0) {
                 setRecommendations("Simpan beberapa artikel terlebih dahulu untuk mendapatkan rekomendasi yang lebih baik.");
                 setIsLoading(false);
                 return;
            }

            const prompt = `Based on the user's bookmarked article titles ("${bookmarkedTitles}"), suggest 2 other article titles from the full list that they might also like. Provide only the titles, separated by a newline. Full list of available article titles: ${articles.map(a => `"${a.title}"`).join(', ')}`;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                const titles = response.text.split('\n').map(t => t.trim().replace(/"/g, ''));
                const foundArticles = articles.filter(a => titles.includes(a.title));
                setRecommendedArticles(foundArticles);

            } catch (error) {
                console.error("AI Recommendation Error:", error);
                setRecommendations("Gagal mendapatkan rekomendasi dari AI.");
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();

    }, [isAiGuardrailDisabled, user, articles]);

    if (!isAiGuardrailDisabled) {
        return (
            <div className="text-center p-8 bg-surface rounded-lg border border-border-color">
                <ShieldCheckIcon className="h-12 w-12 text-primary mx-auto" />
                <h3 className="mt-4 text-lg font-bold text-text-primary">Privasi Anda Terjaga</h3>
                <p className="mt-2 text-text-secondary text-sm max-w-sm mx-auto">
                    Untuk melindungi privasi Anda, AI kami tidak mengakses data pribadi Anda. Aktifkan mode AI cerdas di panel admin untuk mencoba feed yang dipersonalisasi.
                </p>
            </div>
        );
    }
    
    if (isLoading) {
        return (
            <div className="text-center p-8">
                <SparklesIcon className="h-12 w-12 text-primary mx-auto animate-pulse" />
                <p className="mt-4 text-text-secondary">AI sedang menyiapkan feed untuk Anda...</p>
            </div>
        );
    }

    if (recommendedArticles.length > 0) {
        return (
            <div className="space-y-4">
                <h3 className="font-bold text-lg text-primary">Direkomendasikan untuk Anda oleh AI</h3>
                {recommendedArticles.map(article => (
                     <ArticleCard key={article.id} article={article} onOpenComments={() => onOpenComments(article)} />
                ))}
            </div>
        )
    }

    return (
         <div className="text-center p-8 bg-surface rounded-lg border border-border-color">
            <p className="text-text-secondary text-sm">{recommendations || "Tidak ada rekomendasi saat ini. Coba simpan beberapa artikel."}</p>
        </div>
    );
};

export default AiPersonalizedFeed;