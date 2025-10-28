import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '../../../contexts/DataContext';
import { VideoCameraIcon, PhoneIcon, ChatBubbleLeftRightIcon, DocumentTextIcon, ArrowLeftIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from "@google/genai";
import { getConsultationTemplatePrompt } from '../../../services/aiGuardrailService';

const ConsultationRoomScreen: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { consultations, endConsultation, showToast } = useData();
    const consultation = consultations.find(c => c.id === id);
    const [time, setTime] = useState(0);
    const [isEnding, setIsEnding] = useState(false);

    useEffect(() => {
        if (consultation?.status === 'Scheduled') {
            const timer = setInterval(() => setTime(prev => prev + 1), 1000);
            return () => clearInterval(timer);
        }
    }, [consultation]);

    const handleEndConsultation = async () => {
        if (!consultation) return;
        setIsEnding(true);

        const securePrompt = getConsultationTemplatePrompt();

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: securePrompt,
                 config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            notes: { type: Type.STRING },
                            prescription: { type: Type.STRING }
                        },
                        required: ['notes', 'prescription']
                    }
                }
            });

            const result = JSON.parse(response.text);
            await endConsultation(consultation.id, result.notes, result.prescription);

        } catch (err) {
            console.error("AI Consultation Template Error:", err);
            showToast("AI template generation failed. Using fallback.", "error");
            // Fallback to a hardcoded template if AI fails
            await endConsultation(consultation.id, "[Gagal memuat templat AI]", "[Gagal memuat templat AI]");
        } finally {
            setIsEnding(false);
        }
    };


    if (!consultation) {
        return <div className="p-4 text-center">Konsultasi tidak ditemukan.</div>;
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        return `${mins}:${secs}`;
    };
    
    const isSafetyAlert = consultation.prescription?.startsWith('SAFETY_ALERT:');

    return (
        <div className="flex flex-col h-full">
            <header className="p-4 flex items-center bg-surface border-b border-border-color">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light">
                    <ArrowLeftIcon className="h-6 w-6" />
                </button>
                <div className="ml-4">
                    <h1 className="text-lg font-bold">Konsultasi dengan {consultation.doctorName}</h1>
                    {consultation.status === 'Scheduled' && (
                        <p className="text-sm text-green-400">● Live ({formatTime(time)})</p>
                    )}
                </div>
            </header>
            
            <main className="flex-grow flex flex-col md:flex-row bg-background">
                {/* Video Feed Simulation */}
                <div className="w-full md:w-2/3 bg-black flex flex-col items-center justify-center relative p-2">
                    <div className="w-full aspect-video bg-gray-900 rounded-lg flex items-center justify-center text-white relative overflow-hidden">
                        <img src={`https://i.pravatar.cc/400?u=${consultation.doctorId}`} alt="Doctor" className="w-full h-full object-cover"/>
                        <div className="absolute bottom-2 left-2 bg-black/50 p-2 rounded">
                            <p className="font-semibold">{consultation.doctorName}</p>
                            <p className="text-xs">{consultation.doctorSpecialty}</p>
                        </div>
                    </div>
                     <div className="absolute bottom-4 right-4 w-24 h-32 bg-gray-800 border-2 border-border-color rounded-lg overflow-hidden">
                        <img src={`https://i.pravatar.cc/150?u=${consultation.userId}`} alt="You" className="w-full h-full object-cover"/>
                     </div>

                    {consultation.status === 'Scheduled' && (
                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-4 bg-black/50 p-3 rounded-full">
                            <button onClick={handleEndConsultation} disabled={isEnding} className="p-3 bg-red-600 rounded-full">
                                {isEnding ? <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : <PhoneIcon className="h-6 w-6 text-white" />}
                            </button>
                        </div>
                    )}
                </div>

                {/* Info Panel */}
                <div className="w-full md:w-1/3 bg-surface p-4 border-l border-border-color overflow-y-auto">
                    {consultation.status === 'Completed' ? (
                        <div>
                            <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
                                <DocumentTextIcon className="h-6 w-6 mr-2"/>
                                Ringkasan & Resep
                            </h2>
                            <div className="bg-surface-light p-4 rounded-lg space-y-2">
                                <h3 className="font-bold">Catatan Dokter</h3>
                                <p className="text-sm text-text-secondary">{consultation.notes || "Tidak ada catatan."}</p>
                                <h3 className="font-bold pt-2 border-t border-border-color">Resep</h3>
                                {isSafetyAlert ? (
                                    <div className="bg-red-500/20 border border-red-500 p-4 rounded-lg">
                                        <h3 className="font-bold text-red-400">PERINGATAN KEAMANAN</h3>
                                        <p className="text-sm text-red-300 whitespace-pre-wrap">{consultation.prescription?.replace('SAFETY_ALERT:', '').trim()}</p>
                                    </div>
                                ) : (
                                    <p className="text-sm text-text-secondary whitespace-pre-wrap">{consultation.prescription || "Tidak ada resep."}</p>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div>
                            <h2 className="text-xl font-bold text-primary mb-4 flex items-center">
                                <ChatBubbleLeftRightIcon className="h-6 w-6 mr-2"/>
                                Obrolan
                            </h2>
                            <div className="h-64 bg-surface-light rounded-lg p-2 flex flex-col items-center justify-center text-text-secondary">
                                <p>Fitur obrolan segera hadir.</p>
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default ConsultationRoomScreen;