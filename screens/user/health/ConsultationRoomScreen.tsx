import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useHealth } from '../../../contexts/HealthContext';
import { PhoneIcon } from '@heroicons/react/24/solid';
import { PaperAirplaneIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../../contexts/AuthContext';

interface ChatMessage {
    sender: 'user' | 'doctor';
    text: string;
}

const ConsultationRoomScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { user } = useAuth();
    const { consultations } = useHealth();
    
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const consultation = consultations.find(c => c.id === id);

    useEffect(() => {
        if (consultation) {
            setMessages([{ sender: 'doctor', text: `Halo ${user?.profile.name}, saya Dr. ${consultation.doctorName}. Apa yang bisa saya bantu hari ini?` }]);
        }
    }, [consultation, user]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleSend = () => {
        if (!input.trim()) return;
        setMessages(prev => [...prev, { sender: 'user', text: input }]);
        setInput('');
        // Simulate doctor's response
        setTimeout(() => {
            setMessages(prev => [...prev, { sender: 'doctor', text: "Baik, saya mengerti. Bisa ceritakan lebih detail?" }]);
        }, 1500);
    };

    if (!consultation) {
        return <div className="p-4 text-center">Konsultasi tidak ditemukan.</div>;
    }
    
    const isCompleted = consultation.status === 'Completed';

    return (
        <div className="p-4">
             <div className="mb-4">
                <h1 className="text-xl font-bold">Dr. {consultation.doctorName}</h1>
                <p className="text-sm text-text-secondary">{consultation.doctorSpecialty}</p>
            </div>
            
            <div className="flex flex-col md:flex-row gap-4">
                {/* Video Call Section */}
                <div className="md:w-2/3 flex flex-col">
                    <div className="relative w-full aspect-video bg-black rounded-lg flex items-center justify-center">
                        <p className="text-white">Simulasi Panggilan Video...</p>
                        <div className="absolute bottom-4 right-4 w-32 h-24 bg-surface rounded-md border-2 border-border-color">
                             <p className="text-xs text-center p-2">Anda</p>
                        </div>
                    </div>
                    {!isCompleted && (
                        <div className="flex justify-center space-x-4 mt-4">
                            <button className="p-3 bg-red-500 text-white rounded-full">
                                <PhoneIcon className="h-6 w-6" />
                            </button>
                        </div>
                    )}
                </div>

                {/* Chat & Notes Section */}
                <div className="md:w-1/3 border border-border-color rounded-lg flex flex-col h-96">
                     <div className="flex-grow p-4 overflow-y-auto space-y-3">
                        {messages.map((msg, index) => (
                            <div key={index} className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
                                <div className={`max-w-xs p-2 rounded-lg ${msg.sender === 'user' ? 'bg-primary text-black' : 'bg-surface-light'}`}>
                                    <p className="text-sm">{msg.text}</p>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>
                    {!isCompleted && (
                        <div className="p-4 border-t border-border-color flex items-center space-x-2">
                             <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                                placeholder="Ketik pesan..."
                                className="w-full bg-surface-light border border-border-color rounded-full py-2 px-4"
                            />
                            <button onClick={handleSend} className="p-2 btn-secondary rounded-full">
                                <PaperAirplaneIcon className="h-5 w-5" />
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConsultationRoomScreen;
