import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from '@heroicons/react/24/solid';
import { buildSecurePrompt } from '../../../services/aiGuardrailService';
import { useMarketplace } from '../../../hooks/useMarketplace';
import { Product } from '../../../types';
import ProductCard from './ProductCard';

const FallbackRecommendations: React.FC = () => {
    const { products, addToCart } = useMarketplace();

    const topRatedProducts = [...products]
        .sort((a, b) => b.rating - a.rating)
        .slice(0, 3);
    
    return (
        <div className="bg-surface p-4 rounded-lg border border-border-color">
            <h2 className="text-lg font-bold text-text-primary mb-2">Produk Terlaris</h2>
            <div className="grid grid-cols-3 gap-2">
                {topRatedProducts.map(product => (
                    <div key={product.id} className="bg-surface-light rounded-lg overflow-hidden text-center text-xs p-2">
                        <img src={product.imageUrl} alt={product.name} className="w-full h-16 object-cover rounded" />
                        <p className="font-semibold truncate mt-1">{product.name}</p>
                         <button onClick={() => addToCart(product.id, 1)} className="mt-1 w-full bg-primary/20 text-primary text-xs py-1 rounded">
                            + Add
                         </button>
                    </div>
                ))}
            </div>
        </div>
    );
};


const AiRecommendations: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [showFallback, setShowFallback] = useState(false);

    useEffect(() => {
        const fetchAdvice = async () => {
            if (!searchTerm.trim()) {
                setAdvice('');
                setShowFallback(false);
                return;
            }
            setIsLoading(true);
            setShowFallback(false);

            const securePrompt = buildSecurePrompt(
                searchTerm,
                `Your ONLY function is to provide generic shopping tips related to the user's search query. Provide 2-3 short, general tips for finding a good product within that category. For example, for "keyboard", suggest "Pertimbangkan jenis switch". You MUST politely refuse to answer any questions not related to shopping tips for that product category, such as comparing prices with other websites or giving off-topic advice. Respond only with the tips, formatted nicely in Indonesian.`
            );
            
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: "gemini-2.5-flash",
                    contents: securePrompt,
                });
                
                setAdvice(response.text);

            } catch (error) {
                console.error("AI Recommendation Error:", error);
                // Graceful Degradation: Show fallback instead of an error
                setShowFallback(true);
                setAdvice('');
            } finally {
                setIsLoading(false);
            }
        };

        const debounce = setTimeout(() => {
            fetchAdvice();
        }, 500); // Debounce API calls

        return () => clearTimeout(debounce);
    }, [searchTerm]);

    if (isLoading) {
        return (
            <div className="text-center p-4">
                <p className="text-text-secondary">AI sedang menyiapkan tips belanja...</p>
            </div>
        );
    }
    
    if (showFallback) {
        return <FallbackRecommendations />;
    }

    if (!advice) {
        return null;
    }

    return (
        <div className="bg-surface p-4 rounded-lg border border-primary/50">
            <h2 className="text-lg font-bold text-primary mb-2 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" /> Tips Belanja dari AI
            </h2>
            <div className="text-sm text-text-primary whitespace-pre-wrap">
                {advice}
            </div>
        </div>
    );
};

export default AiRecommendations;