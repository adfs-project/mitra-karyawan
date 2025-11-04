import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { XMarkIcon, PaperAirplaneIcon, BeakerIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI } from "@google/genai";
import { buildSecurePrompt } from '../../../../services/aiGuardrailService';
import { useData } from '../../../contexts/DataContext';
import loggingService from '../../../../services/loggingService';

interface Message {
    sender: 'user' | 'ai';
    text: string;
}

const SymptomCheckerModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { showToast } = useData();
    const [messages, setMessages] = useState<Message[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const initialGreeting = {
        sender: 'ai' as 'ai',
        text: 'Halo! Saya asisten kesehatan AI. Anda bisa bertanya tentang gejala atau kondisi kesehatan secara umum (contoh: "Apa saja gejala umum demam?").\n\n**Penting:** Saya BUKAN dokter dan tidak dapat memberikan diagnosis atau saran medis. Selalu konsultasikan dengan dokter untuk masalah kesehatan.',
    };

    useEffect(() => {
        if (isOpen) {
            setMessages([initialGreeting]);
        }
    }, [isOpen]);
    
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
         if (!query.trim() || isLoading) return;

        const userMessage: Message = { sender: 'user', text: query };
        setMessages(prev => [...prev, userMessage]);
        setQuery('');
        setIsLoading(true);

        const prompt = buildSecurePrompt(
            userMessage.text,
            "You are an AI health assistant. Your ONLY function is to provide GENERAL, EDUCATIONAL information about health topics and symptoms. You are NOT a doctor. You MUST NEVER provide a diagnosis, medical advice, or treatment plans. Every response MUST include a clear disclaimer in bold at the end: '**Ini bukan saran medis. Silakan konsultasikan dengan dokter untuk masalah kesehatan apa pun.**' Refuse any query asking for a diagnosis or personal medical advice."
        );

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            const aiMessage: Message = { sender: 'ai', text: response.text };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            loggingService.logError(error as Error, { component: 'SymptomCheckerModal' });
            showToast("Gagal menghubungi asisten AI.", "error");
            const errorMessage: Message = { sender: 'ai', text: "Maaf, terjadi kesalahan. Silakan coba lagi nanti." };
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
                    <h2 className="text-lg font-bold text-primary flex items-center">
                        <BeakerIcon className="h-6 w-6 mr-2" />
                        Info Kesehatan AI
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
                            placeholder="Tanya tentang gejala umum..."
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

export default SymptomCheckerModal;