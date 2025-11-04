import React, { useState } from 'react';
import { SparklesIcon } from '@heroicons/react/24/solid';
import { useData, useAuth, circuitBreaker, loggingService } from '@mk/shared';

// The GoogleGenAI import is removed as all AI calls now go through the backend proxy.

const SmartAssistant: React.FC = () => {
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [isError, setIsError] = useState(false);
    const { logAssistantQuery, showToast } = useData();
    const { user } = useAuth();


    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!query.trim()) return;

        setIsLoading(true);
        setMessage('');
        setIsError(false);
        
        if (!circuitBreaker.allowRequest('gemini-proxy')) {
            showToast('AI service is temporarily unavailable. Please try again later.', 'error');
            setIsLoading(false);
            return;
        }
        
        logAssistantQuery(query, 'GENERIC_QUERY');

        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:4000/api/ai/generate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    prompt: query,
                    contextDescription: "Your ONLY function is to provide GENERIC descriptions of the app's features. For example, if asked 'What can I do in the wallet?', explain the wallet features generally. You MUST politely refuse to answer any questions not related to the app's features."
                }),
            });

            if (!response.ok) {
                throw new Error(`Backend proxy failed with status: ${response.status}`);
            }

            const data = await response.json();
            const responseText = data.text;
            
            circuitBreaker.recordSuccess('gemini-proxy');
            
            if(responseText.startsWith('PENOLAKAN:') || responseText.startsWith('Maaf,')) {
                setIsError(true);
            } else {
                setIsError(false);
            }
            setMessage(responseText);

        } catch (err) {
            circuitBreaker.recordFailure('gemini-proxy');
            loggingService.logError(err as Error, { component: 'SmartAssistant', query });
            showToast("Failed to contact the AI assistant.", "error");
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
