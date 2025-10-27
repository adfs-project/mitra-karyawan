import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { MagnifyingGlassIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from "@google/genai";
import { useData } from '../../contexts/DataContext';

const SmartAssistant: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const { logAssistantQuery } = useData();

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setError('');

        const prompt = `
            You are an expert intent detection system for the "Mitra Karyawan" super app.
            Your task is to analyze the user's query and determine the most relevant action and its parameters.
            The available actions are: 'SEARCH_MARKETPLACE', 'VIEW_BALANCE', 'VIEW_NEWS'.
            You MUST respond with a valid JSON object with the keys "action" and "params".
            - For 'SEARCH_MARKETPLACE', the "params" object must have a "query" key with the search term as a string.
            - For 'VIEW_BALANCE', "params" should be null.
            - For 'VIEW_NEWS', "params" should be null.
            
            If the user's intent is unclear or doesn't match any action, return an action of 'UNSURE' and params as null.

            User Query: "${query}"
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            action: { type: Type.STRING },
                            params: { 
                                type: Type.OBJECT,
                                properties: {
                                    query: { type: Type.STRING }
                                },
                                nullable: true,
                            },
                        },
                        required: ['action', 'params']
                    }
                }
            });

            const result = JSON.parse(response.text);

            logAssistantQuery(query, result.action || 'UNSURE');

            switch (result.action) {
                case 'SEARCH_MARKETPLACE':
                    navigate('/market', { state: { searchQuery: result.params.query } });
                    break;
                case 'VIEW_BALANCE':
                    navigate('/wallet');
                    break;
                case 'VIEW_NEWS':
                    navigate('/news');
                    break;
                case 'UNSURE':
                default:
                    setError("Saya tidak yakin apa yang Anda maksud. Coba gunakan kata kunci yang lebih spesifik.");
                    break;
            }

        } catch (err) {
            console.error("Smart Assistant Error:", err);
            setError("Maaf, terjadi kesalahan saat memproses permintaan Anda.");
            logAssistantQuery(query, 'ERROR');
        } finally {
            setIsLoading(false);
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
                    placeholder="Tanya asisten cerdas..."
                    className="w-full bg-surface border-2 border-transparent text-text-primary rounded-full py-3 pl-11 pr-24 focus:outline-none"
                    disabled={isLoading}
                />
                <button type="submit" disabled={isLoading} className="absolute right-2 top-1/2 -translate-y-1/2 btn-primary rounded-full px-4 py-1.5 text-sm flex items-center">
                    {isLoading 
                        ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> 
                        : <MagnifyingGlassIcon className="h-4 w-4 mr-1"/>}
                    {isLoading ? '' : 'Cari'}
                </button>
            </form>
            {error && <p className="text-red-500 text-xs text-center">{error}</p>}
        </div>
    );
};

export default SmartAssistant;