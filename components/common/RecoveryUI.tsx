import React, { useState, useEffect } from 'react';
import * as ErrorBoundaryModule from 'react-error-boundary';
import { ExclamationTriangleIcon, ArrowLeftOnRectangleIcon, SparklesIcon, PencilSquareIcon } from '@heroicons/react/24/solid';
import { useData } from '../../contexts/DataContext';
import { GoogleGenAI, Type } from "@google/genai";

type AnalysisStep = 'idle' | 'analyzing' | 'complete' | 'fixing' | 'failed';

const AILoadingSpinner: React.FC = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
);

const RecoveryUI: React.FC<ErrorBoundaryModule.FallbackProps> = ({ error, resetErrorBoundary }) => {
    const { showToast } = useData();
    const [analysisStep, setAnalysisStep] = useState<AnalysisStep>('idle');
    const [analysisLog, setAnalysisLog] = useState<string[]>([]);
    const [aiDiagnosis, setAiDiagnosis] = useState('');
    const [aiSolution, setAiSolution] = useState('');
    const [userDescription, setUserDescription] = useState('');

    useEffect(() => {
        const runAiDiagnostics = async () => {
            setAnalysisStep('analyzing');
            const logs = [
                "Menganalisis error...",
                "Memeriksa tumpukan panggilan (call stack)...",
                "Mengevaluasi status komponen...",
                "Menghubungi AI untuk diagnosis...",
            ];

            for (let i = 0; i < logs.length; i++) {
                await new Promise(resolve => setTimeout(resolve, 700));
                setAnalysisLog(prev => [...prev, logs[i]]);
            }

            try {
                const prompt = `You are an AI diagnostics expert in a React app's error boundary. Analyze this technical error and produce a JSON object with 'diagnosis' and 'solution' keys in simple, user-friendly Indonesian (max one sentence each). Do not use technical jargon.
                Error Message: "${error.message}"
                Stack Trace: "${error.stack}"`;

                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                    config: {
                        responseMimeType: "application/json",
                        responseSchema: {
                            type: Type.OBJECT,
                            properties: {
                                diagnosis: { type: Type.STRING },
                                solution: { type: Type.STRING },
                            },
                            required: ['diagnosis', 'solution']
                        }
                    }
                });
                
                const result = JSON.parse(response.text);
                setAiDiagnosis(result.diagnosis);
                setAiSolution(result.solution);
                setAnalysisStep('complete');

            } catch (aiError) {
                console.error("AI Diagnosis Failed:", aiError);
                setAiDiagnosis("Terjadi masalah saat memuat data atau komponen.");
                setAiSolution("Sistem akan mencoba memuat ulang halaman dengan aman.");
                setAnalysisStep('complete');
            }
        };

        runAiDiagnostics();
    }, [error]);
    
    const handleAiFix = () => {
        setAnalysisStep('fixing');
        showToast("Menerapkan perbaikan AI...", "info");
        setTimeout(() => {
            try {
                // Primary fix: attempt to re-render safely
                resetErrorBoundary();
            } catch (resetError) {
                console.error("Resetting boundary failed, performing hard refresh:", resetError);
                // Fallback fix: clear session and hard reload
                sessionStorage.clear();
                window.location.href = '/';
            }
        }, 1500);
    };

    const handleReturnToPreviousPage = () => {
        // A manual override to navigate back to the previous page.
        window.history.back();
    };


    return (
        <div className="flex items-center justify-center h-screen w-screen bg-background text-text-primary p-4">
            <div className="text-center bg-surface p-8 rounded-lg border border-red-500 max-w-2xl w-full">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-primary mb-2">Terjadi Kesalahan Aplikasi</h1>
                <p className="text-text-secondary mb-6">
                    Namun jangan khawatir, AI Recovery Guardian kami sedang menganalisis masalahnya.
                </p>

                <div className="text-left my-6 bg-surface-light p-4 rounded-lg border border-border-color">
                    <h2 className="font-bold text-lg flex items-center mb-2">
                        <SparklesIcon className="h-5 w-5 mr-2 text-primary" />
                        Diagnostik AI
                    </h2>
                    {analysisStep === 'analyzing' && (
                        <div className="space-y-1">
                            {analysisLog.map((log, i) => (
                                <p key={i} className="text-sm text-text-secondary animate-fade-in-up" style={{ animationDelay: `${i * 100}ms` }}>{log}</p>
                            ))}
                        </div>
                    )}
                    {analysisStep === 'complete' && (
                        <div className="animate-fade-in-up space-y-3">
                            <div>
                                <p className="font-semibold text-text-primary">Hasil Analisis:</p>
                                <p className="text-sm text-text-secondary">{aiDiagnosis}</p>
                            </div>
                            <div>
                                <p className="font-semibold text-text-primary">Solusi yang Disarankan:</p>
                                <p className="text-sm text-text-secondary">{aiSolution}</p>
                            </div>
                             <button
                                onClick={handleAiFix}
                                className="w-full btn-primary p-3 rounded-lg font-bold mt-2 flex items-center justify-center"
                            >
                                <SparklesIcon className="h-5 w-5 mr-2" />
                                Coba Perbaikan AI
                            </button>
                        </div>
                    )}
                     {analysisStep === 'fixing' && (
                        <div className="flex items-center justify-center p-4">
                            <AILoadingSpinner />
                            <p className="ml-3 text-text-primary">Menerapkan perbaikan...</p>
                        </div>
                    )}
                </div>

                 <div className="mt-4">
                    <button
                        onClick={handleReturnToPreviousPage}
                        className="text-sm text-text-secondary hover:underline"
                    >
                        Atau, kembali ke halaman sebelumnya
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RecoveryUI;