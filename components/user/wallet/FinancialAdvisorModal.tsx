import React, { useState, useRef, useEffect } from 'react';
import { XMarkIcon, PaperAirplaneIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI } from "@google/genai";
import { Transaction } from '../../../types';
import { useData } from '../../../contexts/DataContext';
import { buildSecurePrompt } from '../../../services/aiGuardrailService';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const FinancialAdvisorModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    userTransactions: Transaction[];
}> = ({ isOpen, onClose, userTransactions }) => {
    const { isAiGuardrailDisabled } = useData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const getInitialGreeting = () => {
        if (isAiGuardrailDisabled) {
            return {
                sender: 'ai' as 'ai',
                text: 'Halo! Saya adalah penasihat keuangan AI Anda. Saya telah menganalisis data transaksi Anda secara anonim. Silakan bertanya untuk mendapatkan saran yang dipersonalisasi, misalnya "Di mana pengeluaran terbesar saya bulan ini?" atau "Berikan saya tips berhemat berdasarkan kebiasaan saya."',
            };
        }
        return {
            sender: 'ai' as 'ai',
            text: 'Halo! Saya adalah penasihat keuangan AI. Saya bisa memberikan saran umum tentang keuangan, seperti cara berhemat atau membuat anggaran. Saya tidak memiliki akses ke data transaksi Anda demi privasi Anda.',
        };
    };

    useEffect(() => {
        if (isOpen) {
            setMessages([getInitialGreeting()]);
        }
    }, [isOpen, isAiGuardrailDisabled]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!query.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        let prompt;
        if (isAiGuardrailDisabled) {
            const transactionSummary = userTransactions.slice(0, 20).map(t => `${t.type} (${t.description}): ${t.amount}`).join('\n');
            prompt = `You are a financial advisor AI. Analyze the following anonymous transaction data for a user and answer their question. Provide actionable insights and suggestions based on the data. Be friendly and respond in Indonesian.\n\nTransaction Data:\n${transactionSummary}\n\nUser Question: "${userMessage.text}"`;
        } else {
             prompt = buildSecurePrompt(
                userMessage.text,
                "You are a generic financial advisor. If the user asks a safe, generic financial question (e.g., 'How can I save more money?', 'What is a budget?'), provide a helpful, general-purpose answer in Indonesian. Do not ask for their personal data to improve your answer."
            );
        }

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
            const errorMessage: Message = { sender: 'ai', text: "Maaf, terjadi kesalahan saat menghubungi AI. Silakan coba lagi nanti." };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface rounded-lg shadow-lg w-full max-w-lg h-[80vh] border border-border-color flex flex-col">
                <header className="p-4 border-b border-border-color flex justify-between items-center">
                    <h2 className="text-lg font-bold text-secondary flex items-center">
                        <SparklesIcon className="h-6 w-6 mr-2" />
                        Analis Keuangan AI
                    </h2>
                    <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light">
                        <XMarkIcon className="h-6 w-6 text-text-secondary" />
                    </button>
                </header>
                
                <main className="flex-grow p-4 overflow-y-auto space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-xs md:max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-black' : 'bg-surface-light'}`}>
                                <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                         <div className="flex justify-start">
                             <div className="max-w-xs p-3 rounded-lg bg-surface-light">
                                 <div className="flex items-center space-x-2">
                                     <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                                     <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-150"></div>
                                     <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce delay-300"></div>
                                 </div>
                             </div>
                         </div>
                    )}
                    <div ref={messagesEndRef} />
                </main>

                <footer className="p-4 border-t border-border-color">
                    <div className="flex items-center space-x-2">
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                            placeholder={isAiGuardrailDisabled ? "Tanya tentang keuangan pribadi Anda..." : "Tanya saran keuangan umum..."}
                            className="w-full bg-surface-light border border-border-color rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
                            disabled={isLoading}
                        />
                        <button onClick={handleSend} disabled={isLoading || !query.trim()} className="p-2 btn-secondary rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                            <PaperAirplaneIcon className="h-5 w-5" />
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
};

export default FinancialAdvisorModal;