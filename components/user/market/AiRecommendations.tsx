
import React, { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { useData } from '../../../contexts/DataContext';
import { Product } from '../../../types';
import { SparklesIcon } from '@heroicons/react/24/solid';
import ProductCard from './ProductCard';

const AiRecommendations: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
    const { products } = useData();
    const [recommendations, setRecommendations] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!searchTerm.trim()) {
                setRecommendations([]);
                return;
            }
            setIsLoading(true);

            const prompt = `
                You are a product recommendation engine for an employee marketplace app.
                Based on the user's search query and the available product list, suggest up to 4 relevant products.
                Only include products that are highly relevant to the search query.

                User Search Query: "${searchTerm}"

                Available Products (JSON format):
                ${JSON.stringify(products.map(p => ({ id: p.id, name: p.name, category: p.category, description: p.description })), null, 2)}

                Your response MUST be a valid JSON object with a single key "product_ids", which is an array of strings representing the recommended product IDs.
                Example: { "product_ids": ["p-001", "p-003"] }
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
                                product_ids: {
                                    type: Type.ARRAY,
                                    items: { type: Type.STRING }
                                }
                            },
                            required: ["product_ids"]
                        }
                    }
                });
                
                const result = JSON.parse(response.text);
                const recommendedIds = result.product_ids || [];
                const recommendedProducts = products.filter(p => recommendedIds.includes(p.id));
                setRecommendations(recommendedProducts);

            } catch (error) {
                console.error("AI Recommendation Error:", error);
                setRecommendations([]);
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            fetchRecommendations();
        }, 500); // Debounce API calls

        return () => clearTimeout(debounce);
    }, [searchTerm, products]);

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <p className="text-text-secondary">AI is looking for recommendations...</p>
            </div>
        );
    }
    
    if (recommendations.length === 0) {
        return null;
    }

    return (
        <div className="bg-surface p-4 rounded-lg border border-primary/50">
            <h2 className="text-lg font-bold text-primary mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" /> Rekomendasi AI Untuk Anda
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {recommendations.map(product => (
                    <ProductCard key={product.id} product={product} onBuyClick={() => {}} />
                ))}
            </div>
        </div>
    );
};

export default AiRecommendations;
