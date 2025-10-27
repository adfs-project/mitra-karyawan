import React, { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../../contexts/DataContext';
import { buildSecurePrompt } from '../../services/aiGuardrailService';

const SmartAssistant: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const { logAssistantQuery } = useData();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setMessage('');
        setIsError(false);
        
        const securePrompt = buildSecurePrompt(
            query, 
            "Your ONLY function is to provide GENERIC descriptions of the app's features. For example, if asked 'What can I do in the wallet?', explain the wallet features generally."
        );

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: securePrompt,
            });

            const responseText = response.text;
            logAssistantQuery(query, 'GENERIC_QUERY');
            
            if(responseText.startsWith('PENOLAKAN:') || responseText.startsWith('Maaf,')) {
                setIsError(true);
            } else {
                setIsError(false);
            }
            setMessage(responseText);

        } catch (err) {
            console.error("Smart Assistant Error:", err);
            setMessage("Maaf, terjadi kesalahan saat memproses permintaan Anda.");
            setIsError(true);
            logAssistantQuery(query, 'ERROR');
        } finally {
            setIsLoading(false);
            setQuery('');
        }
    };

    return (
        <div className="space-y-2">
            <form onSubmit={handleSearch} className="relative glowing-border rounded-full shadow-lg">
                <SparklesIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-primary" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Tanya tentang fitur aplikasi..."
                    className="w-full bg-surface border-2 border-transparent text-text-primary rounded-full py-3 pl-11 pr-24 focus:outline-none"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary rounded-full px-4 py-1.5 text-sm flex items-center">
                    {isLoading 
                        ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> 
                        : null}
                    {isLoading ? '' : 'Tanya'}
                </button>
            </form>
            {message && <p className={`${isError ? 'text-red-500' : 'text-primary'} text-xs text-center p-2 bg-surface-light rounded-md`}>{message}</p>}
        </div>
    );
};

export default SmartAssistant;
