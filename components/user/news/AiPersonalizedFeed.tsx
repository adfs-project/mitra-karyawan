
import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { Article } from '../../../types';
import ArticleCard from './ArticleCard';
import { GoogleGenAI, Type } from "@google/genai";
import { SparklesIcon } from '@heroicons/react/24/solid';

const AiPersonalizedFeed: React.FC<{ onOpenComments: (article: Article) => void }> = ({ onOpenComments }) => {
    const { user } = useAuth();
    const { articles } = useData();
    const [recommendedArticles, setRecommendedArticles] = useState<Article[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const availableArticles = useMemo(() => {
        return articles.filter(a => a.status === 'Published');
    }, [articles]);

    useEffect(() => {
        const fetchFeed = async () => {
            if (!user || availableArticles.length === 0) {
                setIsLoading(false);
                return;
            }
            
            const prompt = `
                You are a personalization engine for an employee super-app's news feed.
                Your task is to create a personalized list of articles for a user based on their profile.

                User Profile:
                - Role: ${user.role}
                - Branch: ${user.profile.branch || 'Unknown'}

                Available Articles (JSON format):
                ${JSON.stringify(availableArticles.map(a => ({ id: a.id, title: a.title, category: a.category, summary: a.summary })), null, 2)}

                Please select up to 5 articles that would be most relevant to this user. Prioritize articles related to their work, branch, or general well-being.
                
                Your response MUST be a valid JSON object with a single key "article_ids", which is an array of strings of the recommended article IDs.
                Example: { "article_ids": ["a-001", "a-002"] }
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
                                article_ids: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                }
                            },
                            required: ["article_ids"]
                        }
                    }
                });

                const result = JSON.parse(response.text);
                const recommendedIds = result.article_ids || [];
                const feed = availableArticles
                    .filter(a => recommendedIds.includes(a.id))
                    .sort((a, b) => recommendedIds.indexOf(a.id) - recommendedIds.indexOf(b.id)); // Keep AI's order
                
                setRecommendedArticles(feed);

            } catch (error) {
                console.error("AI Personalized Feed Error:", error);
                // Fallback to latest articles
                setRecommendedArticles(availableArticles.slice(0, 5));
            } finally {
                setIsLoading(false);
            }
        };

        fetchFeed();
    }, [user, availableArticles]);

    if (isLoading) {
        return (
            <div className="text-center p-8">
                <SparklesIcon className="h-10 w-10 text-primary mx-auto animate-pulse" />
                <p className="mt-2 text-text-secondary">Menyiapkan feed untuk Anda...</p>
            </div>
        );
    }
    
    if(recommendedArticles.length === 0) {
        return <p className="text-center text-text-secondary py-4">Tidak ada artikel untuk ditampilkan.</p>
    }

    return (
        <div className="space-y-4">
            {recommendedArticles.map(article => (
                <ArticleCard key={article.id} article={article} onOpenComments={() => onOpenComments(article)} />
            ))}
        </div>
    );
};

export default AiPersonalizedFeed;
