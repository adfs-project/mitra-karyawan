import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { ArrowLeftIcon, SparklesIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from "@google/genai";

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
    const { showToast } = useData();
    const [activeTab, setActiveTab] = useState<Tab>('Makan');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [input, setInput] = useState('');

    useEffect(() => {
        if (!user?.isPremium) {
            navigate('/subscribe-health-plus', { replace: true });
        }
    }, [user, navigate]);

    const getPrompt = () => {
        switch(activeTab) {
            case 'Makan':
                return `Anda adalah seorang ahli gizi AI. Buat rencana makan sederhana untuk 1 hari (pagi, siang, malam) dalam Bahasa Indonesia untuk seseorang dengan tujuan: "${input}". Fokus pada makanan yang mudah ditemukan di Indonesia. Berikan juga satu tips singkat terkait tujuan tersebut.`;
            case 'Latihan':
                return `Anda adalah seorang pelatih kebugaran AI. Buat program latihan sederhana untuk 1 sesi dalam Bahasa Indonesia untuk seseorang dengan tujuan: "${input}". Sertakan 3-4 gerakan dengan jumlah set dan repetisi. Asumsikan pengguna memiliki peralatan minim (misal: matras).`;
            case 'Mood':
                const moodHistory = user?.healthData.moodHistory.map(h => `${h.date}: ${h.mood}`).join(', ') || 'tidak ada data';
                return `Anda adalah seorang psikolog AI. Berdasarkan ringkasan data mood berikut: [${moodHistory}], berikan satu insight singkat dan satu saran praktis dalam Bahasa Indonesia untuk meningkatkan kesejahteraan mental pengguna.`;
        }
    };

    const getPlaceholder = () => {
         switch(activeTab) {
            case 'Makan': return 'e.g., Menurunkan berat badan';
            case 'Latihan': return 'e.g., Meningkatkan kekuatan otot perut';
            case 'Mood': return 'Klik "Analisis" untuk mendapatkan insight dari data mood Anda.';
        }
    }

    const handleGenerate = async () => {
        if (activeTab !== 'Mood' && !input.trim()) {
            showToast("Harap isi tujuan Anda.", "warning");
            return;
        }

        setIsLoading(true);
        setResult('');

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: getPrompt(),
            });
            setResult(response.text);
        } catch (error) {
            console.error("Health+ AI Error:", error);
            showToast("Gagal menghubungi AI Coach.", "error");
            setResult("Terjadi kesalahan. Silakan coba lagi nanti.");
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

            <div className="flex border-b border-border-color">
                {(['Makan', 'Latihan', 'Mood'] as Tab[]).map(tab => (
                    <button key={tab} onClick={() => { setActiveTab(tab); setResult(''); setInput(''); }} className={`px-4 py-2 font-semibold ${activeTab === tab ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                        {tab === 'Makan' ? 'Rencana Makan' : tab === 'Latihan' ? 'Program Latihan' : 'Analisis Mood'}
                    </button>
                ))}
            </div>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <label className="text-sm font-bold text-text-secondary">
                    {activeTab === 'Makan' ? 'Apa tujuan diet Anda?' : activeTab === 'Latihan' ? 'Apa tujuan kebugaran Anda?' : 'Analisis Kesejahteraan Mental'}
                </label>
                <div className="flex items-center space-x-2 mt-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder={getPlaceholder()}
                        disabled={isLoading || activeTab === 'Mood'}
                        className="w-full p-3 bg-surface-light rounded border border-border-color disabled:opacity-50"
                    />
                    <button onClick={handleGenerate} disabled={isLoading} className="btn-primary px-4 py-3 rounded font-bold w-40 flex justify-center items-center">
                        {isLoading ? <AILoadingSpinner /> : (activeTab === 'Mood' ? 'Analisis' : 'Generate')}
                    </button>
                </div>
                {result && <AIResultDisplay content={result} />}
            </div>
        </div>
    );
};

export default HealthPlusScreen;
