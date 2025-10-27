import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Article } from '../../../types';
import ArticleCard from './ArticleCard';
import { GoogleGenAI, Type } from "@google/genai";

const AiPersonalizedFeed: React.FC<{ onOpenComments: (article: Article) => void }> = ({ onOpenComments }) => {
    const { articles } = useData();
    const { user } = useAuth();
    const [recommended, setRecommended] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user || articles.length === 0) {
                setIsLoading(false);
                return;
            }

            const publishedArticles = articles.filter(a => a.status === 'Published').map(a => ({
                id: a.id,
                title: a.title,
                category: a.category,
                summary: a.summary,
            }));

            const likedArticles = articles.filter(a => a.likes.includes(user.id)).map(a => a.title);
            const bookmarkedArticles = articles.filter(a => user.bookmarkedArticles.includes(a.id)).map(a => a.title);
            
            const prompt = `
                You are a news feed personalization engine for an employee super-app.
                Your task is to re-order the provided list of articles to create a personalized "For You" feed for a specific user.

                User Profile:
                - Role: ${user.role}
                - Branch: ${user.profile.branch || 'Unknown'}

                User Interactions:
                - Liked Articles: ${JSON.stringify(likedArticles)}
                - Bookmarked Articles: ${JSON.stringify(bookmarkedArticles)}

                Available Articles (do not recommend articles the user has already liked or bookmarked):
                ${JSON.stringify(publishedArticles)}

                Analyze the user's profile and interactions to determine their interests. Re-order the list of available articles from most to least relevant.
                Your response MUST be a valid JSON object with a single key "sorted_article_ids", which is an array of strings representing the article IDs in the recommended order.
                Example: { "sorted_article_ids": ["article-003", "article-001", "article-002"] }
            `;

            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                sorted_article_ids: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                }
                            },
                            required: ['sorted_article_ids']
                        }
                    }
                });

                const result = JSON.parse(response.text);
                const sortedIds = result.sorted_article_ids || [];
                const sortedArticles = sortedIds.map((id: string) => articles.find(a => a.id === id)).filter(Boolean as any as (x: Article | undefined) => x is Article);
                
                // Add remaining articles that weren't sorted by AI to the end
                const remainingArticles = articles.filter(a => a.status === 'Published' && !sortedIds.includes(a.id));
                setRecommended([...sortedArticles, ...remainingArticles]);

            } catch (error) {
                console.error("AI Feed Personalization Error:", error);
                // Fallback to default sort on error
                setRecommended([...articles].filter(a => a.status === 'Published').sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [user, articles]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="bg-surface rounded-lg p-4 h-64 animate-pulse"></div>
                ))}
            </div>
        );
    }
    
    if (recommended.length === 0) {
        return <p className="text-center text-text-secondary py-8">Tidak ada artikel untuk ditampilkan.</p>;
    }

    return (
        <div className="space-y-4">
            {recommended.map(article => (
                <ArticleCard key={article.id} article={article} onOpenComments={() => onOpenComments(article)} />
            ))}
        </div>
    );
};

export default AiPersonalizedFeed;
