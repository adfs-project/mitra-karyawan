import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useApp } from '../../../contexts/AppContext';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from "@google/genai";
import { useHealth } from '../../../contexts/HealthContext';

type Tab = 'Makan' | 'Latihan' | 'Mood';

const AILoadingSpinner: React.FC = () => (
    <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
);

const AIResultDisplay: React.FC<{ content: string }> = ({ content }) => (
    <div className="bg-surface-light p-4 rounded-lg mt-4 border border-border-color">
        <p className="text-sm whitespace-pre-wrap">{content}</p>
    </div>
);

const HealthPlusScreen: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const { showToast, homePageConfig } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>('Makan');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [input, setInput] = useState('');

    const isCoachEnabled = homePageConfig.featureFlags.aiHealthCoach;

    useEffect(() => {
        if (!user?.isPremium) {
            navigate('/subscribe-health-plus', { replace: true });
        }
    }, [user, navigate]);


    const handleGenerate = async () => {
        if (!input.trim() || !isCoachEnabled) return;

        setIsLoading(true);
        setResult('');
        let prompt = '';

        switch (activeTab) {
            case 'Makan':
                prompt = `Buatkan contoh rencana makan sederhana untuk satu hari (pagi, siang, malam) dalam Bahasa Indonesia untuk tujuan: "${input}". Fokus pada makanan umum yang mudah ditemukan. Berikan dalam format poin-poin.`;
                break;
            case 'Latihan':
                prompt = `Buatkan contoh program latihan sederhana untuk satu sesi dalam Bahasa Indonesia dengan tujuan: "${input}". Sertakan 3-4 gerakan dengan jumlah set/repetisi. Fokus pada latihan tanpa alat. Berikan dalam format poin-poin.`;
                break;
            case 'Mood':
                prompt = `Berikan 3 tips umum dan actionable dalam Bahasa Indonesia untuk membantu meningkatkan suasana hati atau mengelola stres terkait: "${input}". Berikan dalam format poin-poin.`;
                break;
        }

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            setResult(response.text);
        } catch (error) {
            console.error("Health Coach AI Error:", error);
            showToast("Gagal menghubungi AI Coach.", "error");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary flex items-center">
                    <SparklesIcon className="h-6 w-6 mr-2"/>
                    Health+ AI Coach
                </h1>
            </div>

            {!isCoachEnabled && (
                <div className="bg-surface p-4 rounded-lg border border-yellow-500/50 text-center">
                    <h2 className="text-xl font-bold text-yellow-400">Fitur Dinonaktifkan</h2>
                    <p className="text-text-secondary mt-2 text-sm">
                        Fitur Health+ AI Coach saat ini tidak tersedia. Silakan hubungi admin untuk informasi lebih lanjut.
                    </p>
                </div>
            )}

            <div className={`flex border-b border-border-color ${!isCoachEnabled ? 'opacity-50' : ''}`}>
                {(['Makan', 'Latihan', 'Mood'] as Tab[]).map(tab => (
                    <button key={tab} disabled={!isCoachEnabled} onClick={() => { setActiveTab(tab); setResult(''); setInput(''); }} className={`px-4 py-2 font-semibold ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                        {tab === 'Makan' ? 'Rencana Makan' : tab === 'Latihan' ? 'Program Latihan' : 'Analisis Mood'}
                    </button>
                ))}
            </div>

            <div className={`bg-surface p-4 rounded-lg border border-border-color ${!isCoachEnabled ? 'opacity-50' : ''}`}>
                <label className="text-sm font-bold text-text-secondary">
                    {activeTab === 'Makan' ? 'Apa tujuan diet Anda? (e.g., menurunkan berat badan, menambah massa otot)' : activeTab === 'Latihan' ? 'Apa tujuan kebugaran Anda? (e.g., membakar lemak, latihan di rumah)' : 'Apa yang sedang Anda rasakan atau pikirkan?'}
                </label>
                <div className="flex items-center space-x-2 mt-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={isCoachEnabled ? "Ketik tujuan Anda..." : "Fitur AI dinonaktifkan"}
                        disabled={isLoading || !isCoachEnabled}
                        className="w-full p-3 bg-surface-light rounded border border-border-color disabled:opacity-50"
                    />
                    <button onClick={handleGenerate} disabled={isLoading || !input.trim() || !isCoachEnabled} className="btn-primary px-4 py-3 rounded font-bold w-40 flex justify-center items-center disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? <AILoadingSpinner /> : (activeTab === 'Mood' ? 'Analisis' : 'Generate')}
                    </button>
                </div>
                {result && <AIResultDisplay content={result} />}
            </div>
        </div>
    );
};

export default HealthPlusScreen;