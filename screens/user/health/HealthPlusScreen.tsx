import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';
// FIX: Replaced useData with useApp since it's only used for showToast.
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
    const { showToast } = useApp();
    const [activeTab, setActiveTab] = useState<Tab>('Makan');
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState('');
    const [input, setInput] = useState('');

    useEffect(() => {
        if (!user?.isPremium) {
            navigate('/subscribe-health-plus', { replace: true });
        }
    }, [user, navigate]);


    const handleGenerate = async () => {
        // AI feature is disabled
        return;
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

            <div className="bg-surface p-4 rounded-lg border border-yellow-500/50 text-center">
                <h2 className="text-xl font-bold text-yellow-400">Fitur Dinonaktifkan</h2>
                <p className="text-text-secondary mt-2 text-sm">
                    Untuk meningkatkan privasi dan keamanan data, fitur Health+ AI Coach dinonaktifkan sementara. Kami sedang meninjau protokol keamanan kami untuk memberikan layanan terbaik.
                </p>
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
                        placeholder="Fitur AI dinonaktifkan"
                        disabled={true}
                        className="w-full p-3 bg-surface-light rounded border border-border-color disabled:opacity-50"
                    />
                    <button onClick={handleGenerate} disabled={true} className="btn-primary px-4 py-3 rounded font-bold w-40 flex justify-center items-center disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {isLoading ? <AILoadingSpinner /> : (activeTab === 'Mood' ? 'Analisis' : 'Generate')}
                    </button>
                </div>
                {result && <AIResultDisplay content={result} />}
            </div>
        </div>
    );
};

export default HealthPlusScreen;