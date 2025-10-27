import React, { useState, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { SparklesIcon } from '@heroicons/react/24/solid';
import { buildSecurePrompt } from '../../../services/aiGuardrailService';

const AiRecommendations: React.FC<{ searchTerm: string }> = ({ searchTerm }) => {
    const [advice, setAdvice] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const fetchAdvice = async () => {
            if (!searchTerm.trim()) {
                setAdvice('');
                return;
            }
            setIsLoading(true);

            const securePrompt = buildSecurePrompt(
                searchTerm,
                `Your only role is to provide generic shopping tips. Provide 2-3 short, general tips for finding a good product in the category related to the user's search query. For example, for "keyboard", suggest "Pertimbangkan jenis switch (mechanical vs. membrane)" or "Cek opsi konektivitas nirkabel". Respond only with the tips, formatted nicely in Indonesian.`
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
