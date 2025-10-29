import React, { useState, useRef, useEffect } from 'react';
import { SparklesIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from '../../types';

const HrAiCopilotScreen: React.FC = () => {
    const { user } = useAuth();
    const { getBranchMoodAnalytics, showToast } = useData();
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [query, setQuery] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        setMessages([{
            sender: 'ai',
            text: `Halo ${user?.profile.name}! Saya adalah Co-pilot AI Anda. Bagaimana saya bisa membantu tugas HR Anda hari ini? Anda bisa menggunakan salah satu tombol di bawah atau ketik pertanyaan Anda.`
        }]);
    }, [user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = async (promptText?: string) => {
        const currentQuery = promptText || query;
        if (!currentQuery.trim() || isLoading) return;

        const userMessage: ChatMessage = { sender: 'user', text: currentQuery };
        setMessages(prev => [...prev, userMessage]);
        if (!promptText) setQuery('');
        setIsLoading(true);

        let aiResponseText = "Maaf, terjadi kesalahan. Silakan coba lagi.";

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            if (currentQuery.toLowerCase().includes('moral')) {
                const moraleData = await getBranchMoodAnalytics(user!.profile.branch!);
                const dataBreakdown = moraleData.data.map(d => `- ${d.mood}: ${d.count} entri`).join('\n');
                aiResponseText = `${moraleData.summary}\n\nBerikut adalah rincian datanya:\n${dataBreakdown}`;
            } else {
                const companyPolicy = "Kebijakan kerja jarak jauh kami mengizinkan hingga 2 hari kerja dari rumah per minggu dengan persetujuan manajer. Jatah cuti tahunan adalah 20 hari per tahun, ditambah hari libur nasional. Cuti sakit memerlukan surat keterangan dokter setelah 2 hari berturut-turut.";
                const prompt = `Anda adalah AI Co-pilot untuk Manajer HR. Peran Anda HANYA sebatas membantu tugas-tugas HR yang berkaitan dengan kebijakan internal perusahaan atau data yang diberikan.
                Informasi Kontekstual (Kebijakan Perusahaan): ${companyPolicy}.
                Permintaan Pengguna: "${currentQuery}"
                Berdasarkan konteks di atas, berikan respons yang profesional dalam Bahasa Indonesia. Anda HARUS menolak dengan sopan untuk menjawab pertanyaan yang tidak terkait dengan HR atau kebijakan perusahaan ini (misalnya, pertanyaan hukum umum, saran pribadi, atau topik di luar pekerjaan). Jika membuat draf dokumen, gunakan format yang jelas.`;
                
                const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
                aiResponseText = response.text;
            }
        } catch (error) {
            console.error("AI Co-pilot Error:", error);
            showToast("Gagal berkomunikasi dengan AI Co-pilot.", "error");
        }

        const aiMessage: ChatMessage = { sender: 'ai', text: aiResponseText };
        setMessages(prev => [...prev, aiMessage]);
        setIsLoading(false);
    };

    const promptStarters = [
        "Analisis moral tim untuk cabang saya",
        "Buat draf pengumuman tentang acara town hall Q3",
        "Apa kebijakan kita tentang kerja jarak jauh?",
    ];

    return (
        <div className="h-full flex flex-col bg-surface">
            <h1 className="text-2xl font-bold text-primary p-4 border-b border-border-color flex-shrink-0">
                <SparklesIcon className="h-6 w-6 mr-2 inline-block"/>
                HR AI Co-pilot
            </h1>
            
            <main className="flex-grow p-4 overflow-y-auto space-y-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-black' : 'bg-surface-light'}`}>
                            <p className="text-sm" style={{ whiteSpace: 'pre-wrap' }}>{msg.text}</p>
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                         <div className="max-w-xs p-3 rounded-lg bg-surface-light">
                             <div className="flex items-center space-x-2">
                                 <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce"></div>
                                 <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{animationDelay: '150ms'}}></div>
                                 <div className="w-2 h-2 bg-text-secondary rounded-full animate-bounce" style={{animationDelay: '300ms'}}></div>
                             </div>
                         </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </main>

            <footer className="p-4 border-t border-border-color flex-shrink-0">
                 <div className="flex flex-wrap gap-2 mb-2">
                    {promptStarters.map((prompt) => (
                        <button key={prompt} onClick={() => handleSend(prompt)} className="px-3 py-1 bg-surface-light border border-border-color rounded-full text-xs hover:bg-primary hover:text-black">
                            {prompt}
                        </button>
                    ))}
                </div>
                <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Tanya AI Co-pilot..."
                        className="w-full bg-surface-light border border-border-color rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={isLoading}
                    />
                    <button onClick={() => handleSend()} disabled={isLoading || !query.trim()} className="p-2 btn-secondary rounded-full disabled:opacity-50 disabled:cursor-not-allowed">
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default HrAiCopilotScreen;
