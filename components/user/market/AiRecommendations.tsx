
import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Product } from '../../../types';
import { Link } from 'react-router-dom';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from "@google/genai";

const ProductCard: React.FC<{ product: Product }> = ({ product }) => (
    <Link to="/market" state={{ searchQuery: product.name }} className="flex-shrink-0 w-40 bg-surface-light rounded-lg border border-border-color overflow-hidden hover:border-primary transition-all">
        <img src={product.imageUrl} alt={product.name} className="w-full h-20 object-cover" />
        <div className="p-2">
            <h3 className="font-semibold text-xs text-text-primary truncate">{product.name}</h3>
            <p className="font-bold text-primary text-sm mt-1">
                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
            </p>
        </div>
    </Link>
);

const AiRecommendations: React.FC = () => {
    const { products, transactions } = useData();
    const { user } = useAuth();
    const [recommended, setRecommended] = useState<Product[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchRecommendations = async () => {
            if (!user || products.length === 0) {
                 setIsLoading(false);
                 return;
            }

            const userPurchases = transactions
                .filter(tx => tx.userId === user.id && tx.type === 'Marketplace')
                .map(tx => ({ description: tx.description, amount: tx.amount }));

            if (userPurchases.length === 0) {
                // For new users, recommend the newest products
                const newestProducts = [...products]
                    // FIX: Parse matched string from ID to number for correct sorting.
                    .sort((a, b) => parseInt((b.id.match(/\d+/) || ['0'])[0], 10) - parseInt((a.id.match(/\d+/) || ['0'])[0], 10))
                    .slice(0, 5);
                setRecommended(newestProducts);
                setIsLoading(false);
                return;
            }
            
             const availableProducts = products.map(p => ({id: p.id, name: p.name, category: p.category, price: p.price }));

            const prompt = `
                You are a product recommendation engine for an employee marketplace.
                Based on the user's purchase history and the list of available products, recommend up to 5 products.
                Prioritize products from categories the user has purchased from before, or products that are complementary.
                Do not recommend products the user has already effectively purchased (e.g. if they bought "Baju Kemeja", don't recommend it again).
                
                User Purchase History:
                ${JSON.stringify(userPurchases)}

                Available Products:
                ${JSON.stringify(availableProducts)}

                Your response MUST be a valid JSON object containing a single key "product_ids", which is an array of strings representing the recommended product IDs.
                Example: { "product_ids": ["prod-162987", "prod-162999"] }
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
                            required: ['product_ids']
                        }
                    }
                });

                const result = JSON.parse(response.text);
                const recommendedIds = result.product_ids || [];
                const recommendedProducts = products.filter(p => recommendedIds.includes(p.id));
                setRecommended(recommendedProducts);

            } catch (error) {
                console.error("AI Recommendation Error:", error);
                // Fallback to newest products on error
                // FIX: Parse matched string from ID to number for correct sorting.
                const newestProducts = [...products].sort((a, b) => parseInt((b.id.match(/\d+/) || ['0'])[0], 10) - parseInt((a.id.match(/\d+/) || ['0'])[0], 10)).slice(0, 5);
                setRecommended(newestProducts);
            } finally {
                setIsLoading(false);
            }
        };

        fetchRecommendations();
    }, [user, products, transactions]);

    if (products.length === 0) return null;

    return (
        <div>
            <h2 className="text-lg font-bold text-text-primary mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2 text-secondary" />
                Rekomendasi Untuk Anda
            </h2>
            <div className="flex overflow-x-auto space-x-4 pb-4">
                {isLoading ? (
                     Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="flex-shrink-0 w-40 h-36 bg-surface-light rounded-lg animate-pulse"></div>
                     ))
                ) : recommended.length > 0 ? (
                    recommended.map(product => <ProductCard key={product.id} product={product} />)
                ) : (
                    <p className="text-sm text-text-secondary">Tidak ada rekomendasi saat ini.</p>
                )}
            </div>
        </div>
    );
};

export default AiRecommendations;
