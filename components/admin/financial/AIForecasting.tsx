import React, { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI } from "@google/genai";
import { useData } from '../../../contexts/DataContext';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const AIForecasting: React.FC = () => {
    const { transactions } = useData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const initialGreeting = {
        sender: 'ai' as 'ai',
        text: 'I can help with financial forecasting. Ask me something like "Project our marketplace GMV for next month" or "Simulate the impact of increasing commission to 7%".',
    };
    
    useEffect(() => {
        if (messages.length === 0) {
            setMessages([initialGreeting]);
        }
    }, []);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!query.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        const prompt = `
            You are a financial analyst AI. Your task is to analyze historical transaction data and provide forecasts or simulations based on the user's query.
            Respond in a clear, professional manner.

            Historical Transaction Data (simplified):
            ${JSON.stringify(transactions.slice(-100).map(t => ({type: t.type, amount: t.amount, timestamp: t.timestamp})), null, 2)}
            
            Current assumptions: Marketplace commission is 5%.

            User Query: "${userMessage.text}"
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const aiMessage: Message = { sender: 'ai', text: response.text };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error("Gemini API Error:", error);
            const errorMessage: Message = { sender: 'ai', text: "Sorry, I encountered an error while processing the forecast. Please try again." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="bg-surface p-6 rounded-lg border border-border-color h-full flex flex-col">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <SparklesIcon className="h-5 w-5 mr-2" /> AI Forecasting & Simulation
            </h2>
            <main className="flex-grow bg-surface-light p-2 rounded-t-lg overflow-y-auto space-y-3">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs md:max-w-md p-2 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-black' : 'bg-surface'}`}>
                            <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                         <div className="max-w-xs p-3 rounded-lg bg-surface">
                             <div className="flex items-center space-x-2">
                                 <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                             </div>
                         </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </main>
            <footer className="p-2 bg-surface-light rounded-b-lg">
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Ask for a forecast..."
                        className="w-full bg-surface border border-border-color rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary text-sm"
                        disabled={isLoading}
                    />
                    <button onClick={handleSend} disabled={isLoading || !query.trim()} className="p-2 btn-secondary rounded-full disabled:opacity-50">
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default AIForecasting;