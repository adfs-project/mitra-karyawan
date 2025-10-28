import React, { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { buildSecurePrompt } from '../../services/aiGuardrailService';

const SmartAssistant: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const { logAssistantQuery, isAiGuardrailDisabled } = useData();
    const { user } = useAuth();


    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setMessage('');
        setIsError(false);
        
        let prompt;
        if (isAiGuardrailDisabled) {
             const userContext = `Current user balance is: ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user?.wallet.balance || 0)}.`;
             prompt = `You are a helpful in-app assistant. You CAN access some user data to answer questions. Answer the user's query based on the provided context. Be concise and helpful. Respond in Indonesian. Context: ${userContext}\n\nUser Query: "${query}"`;
             logAssistantQuery(query, 'PERSONALIZED_QUERY');
        } else {
             prompt = buildSecurePrompt(
                query, 
                "Your ONLY function is to provide GENERIC descriptions of the app's features. For example, if asked 'What can I do in the wallet?', explain the wallet features generally."
            );
            logAssistantQuery(query, 'GENERIC_QUERY');
        }


        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const responseText = response.text;
            
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
                    placeholder={isAiGuardrailDisabled ? "Tanya apa saja (misal: 'saldo saya')" : "Tanya tentang fitur aplikasi..."}
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