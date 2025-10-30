import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHealth } from '../../../contexts/HealthContext';
import { useAuth } from '../../../contexts/AuthContext';
import { ArrowLeftIcon, PhoneIcon, PaperAirplaneIcon } from '@heroicons/react/24/solid';
import { ChatMessage } from '../../../types';

const ConsultationRoomScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { consultations, endConsultation } = useHealth();
    const consultation = useMemo(() => consultations.find(c => c.id === id), [consultations, id]);

    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [timer, setTimer] = useState(900); // 15 minutes in seconds
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const timerRef = useRef<number>();

    const isEnded = consultation?.status === 'Completed';

    useEffect(() => {
        if (consultation && !isEnded) {
            setChatMessages([
                { sender: 'ai', text: `Halo ${user?.profile.name}, saya Dr. ${consultation.doctorName}. Apa yang bisa saya bantu?` }
            ]);
            timerRef.current = window.setInterval(() => {
                setTimer(prev => (prev > 0 ? prev - 1 : 0));
            }, 1000);
        } else if (isEnded) {
             setChatMessages([
                { sender: 'ai', text: `Konsultasi telah berakhir. Terima kasih.` }
            ]);
        }
        
        return () => clearInterval(timerRef.current);
    }, [consultation, user, isEnded]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [chatMessages]);

    const handleSendMessage = () => {
        if (!newMessage.trim() || isLoading || isEnded) return;
        const userMessage: ChatMessage = { sender: 'user', text: newMessage };
        setChatMessages(prev => [...prev, userMessage]);
        setNewMessage('');
        setIsLoading(true);

        setTimeout(() => {
            setChatMessages(prev => [...prev, { sender: 'ai', text: 'Baik, saya mengerti. Bisa jelaskan lebih lanjut?' }]);
            setIsLoading(false);
        }, 1500 + Math.random() * 1000);
    };

    const handleEndConsultation = async () => {
        if (!consultation || isLoading) return;
        setIsLoading(true);
        const chatSummary = chatMessages.map(m => `${m.sender}: ${m.text}`).join('\n');
        await endConsultation(consultation.id, chatSummary);
        setIsLoading(false);
    };
    
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };

    if (!consultation) {
        return <div className="p-4 text-center">Konsultasi tidak ditemukan.</div>;
    }

    return (
        <div className="h-full flex flex-col bg-surface">
             <header className="p-4 flex items-center justify-between border-b border-border-color flex-shrink-0">
                <div className="flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                        <ArrowLeftIcon className="h-6 w-6"/>
                    </button>
                    <div>
                        <h1 className="text-lg font-bold">{consultation.doctorName}</h1>
                        <p className="text-xs text-text-secondary">{consultation.doctorSpecialty}</p>
                    </div>
                </div>
                {!isEnded && <div className="font-mono text-lg font-bold text-secondary">{formatTime(timer)}</div>}
            </header>
            
            <main className="flex-grow p-4 overflow-y-auto space-y-4">
                 {isEnded && (
                    <div className="bg-green-500/10 p-4 rounded-lg text-center border border-green-500/50">
                        <h2 className="font-bold text-green-400">Konsultasi Selesai</h2>
                        <p className="text-sm text-text-secondary mt-1">Terima kasih telah menggunakan layanan kami. Resep (jika ada) dapat dilihat di halaman resep digital.</p>
                        {consultation.eprescriptionId && (
                            <button onClick={() => navigate('/prescriptions')} className="mt-2 text-sm font-bold text-primary underline">Lihat Resep</button>
                        )}
                    </div>
                )}
                
                {chatMessages.map((msg, i) => (
                    <div key={i} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs p-3 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-black' : 'bg-surface-light'}`}>
                            <p className="text-sm whitespace-pre-wrap">{msg.text}</p>
                        </div>
                    </div>
                ))}
                 {isLoading && !isEnded && (
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

            <footer className="p-4 border-t border-border-color flex-shrink-0 space-y-3">
                 <div className="flex items-center space-x-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                        placeholder={isEnded ? "Konsultasi telah berakhir" : "Ketik pesan..."}
                        className="w-full bg-surface-light border border-border-color rounded-full py-2 px-4 focus:outline-none focus:ring-1 focus:ring-primary"
                        disabled={isLoading || isEnded}
                    />
                    <button onClick={handleSendMessage} disabled={!newMessage.trim() || isLoading || isEnded} className="p-2 btn-secondary rounded-full disabled:opacity-50">
                        <PaperAirplaneIcon className="h-5 w-5" />
                    </button>
                </div>
                 <div className="flex justify-center">
                    <button onClick={handleEndConsultation} disabled={isLoading || isEnded} className="px-6 py-2 bg-red-500 text-white rounded-full font-bold flex items-center space-x-2 disabled:bg-gray-600">
                        <PhoneIcon className="h-5 w-5" />
                        <span>{isLoading ? 'Processing...' : isEnded ? "Panggilan Berakhir" : "Akhiri Konsultasi"}</span>
                    </button>
                 </div>
            </footer>
        </div>
    );
};

export default ConsultationRoomScreen;
