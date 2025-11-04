
import React, { useState, useEffect } from 'react';
import * as ErrorBoundaryModule from 'react-error-boundary';
import { ExclamationTriangleIcon, SparklesIcon, ArrowPathIcon, MapPinIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI } from '@google/genai';

const RecoveryUI: React.FC<ErrorBoundaryModule.FallbackProps> = ({ error }) => {
    const [solution, setSolution] = useState<string | null>(null);
    const [isLoadingSolution, setIsLoadingSolution] = useState(false);
    const [locationAnalysis, setLocationAnalysis] = useState<string | null>(null);
    const [isLoadingLocation, setIsLoadingLocation] = useState(false);

    useEffect(() => {
        if (!error?.message) {
            const errorMessage = "Tidak dapat menganalisis error tanpa pesan kesalahan.";
            setSolution(errorMessage);
            setLocationAnalysis(errorMessage);
            return;
        }

        const generateSolution = async () => {
            setIsLoadingSolution(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `Anda adalah seorang senior software engineer yang sedang melakukan debugging. Berdasarkan pesan error React berikut, berikan 2-3 langkah solusi yang paling mungkin dan dapat ditindaklanjuti dalam Bahasa Indonesia. Buat dalam format daftar bernomor dan jelaskan secara singkat dan jelas. Pesan Error: "${error.message}"`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                setSolution(response.text);

            } catch (e) {
                console.error("AI solution generation failed:", e);
                setSolution("Gagal menghubungi AI untuk mendapatkan solusi. Periksa koneksi internet dan API Key Anda.");
            } finally {
                setIsLoadingSolution(false);
            }
        };

        const generateLocationAnalysis = async () => {
            setIsLoadingLocation(true);
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const prompt = `Anda adalah seorang senior software engineer yang sedang melakukan debugging. Berdasarkan pesan error dan stack trace berikut, identifikasi file dan fungsi yang paling mungkin menjadi sumber masalah. Jelaskan alasan Anda secara singkat dalam Bahasa Indonesia. Jangan hanya mengulang stack trace, tapi interpretasikan. Contoh: "Masalah kemungkinan besar ada di file 'HomeScreen.tsx' di dalam fungsi 'handleSomething', karena fungsi tersebut dipanggil tepat sebelum error terjadi menurut stack trace."

                Pesan Error: "${error.message}"
                Stack Trace:
                ${error.stack}`;
                
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: prompt,
                });

                setLocationAnalysis(response.text);
            } catch (e) {
                console.error("AI location analysis failed:", e);
                setLocationAnalysis("Gagal menghubungi AI untuk menganalisis lokasi. Periksa koneksi internet dan API Key Anda.");
            } finally {
                setIsLoadingLocation(false);
            }
        };

        generateSolution();
        generateLocationAnalysis();
    }, [error]);
    
    const handleReturnToPreviousPage = () => {
        window.history.back();
    };


    return (
        <div className="flex items-center justify-center h-screen w-screen bg-background text-text-primary p-4">
            <div className="text-center bg-surface p-8 rounded-lg border border-red-500 max-w-2xl w-full">
                <ExclamationTriangleIcon className="h-16 w-16 text-red-500 mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-primary mb-2">Terjadi Kesalahan Aplikasi</h1>
                <p className="text-text-secondary mb-6">
                    Sistem mendeteksi adanya kesalahan. Silakan coba kembali ke halaman sebelumnya.
                </p>

                <div className="text-left my-6 bg-surface-light p-4 rounded-lg border border-border-color">
                    <h2 className="font-bold text-lg mb-2">Penjelasan Teknis</h2>
                    <pre className="text-sm text-red-400 whitespace-pre-wrap font-mono">
                        {error.message}
                    </pre>
                </div>

                <div className="text-left my-6 bg-surface-light p-4 rounded-lg border border-border-color">
                    <h2 className="font-bold text-lg mb-2 flex items-center">
                        <MapPinIcon className="h-5 w-5 mr-2 text-primary" />
                        Analisis Lokasi Masalah (AI)
                    </h2>
                    {isLoadingLocation ? (
                        <div className="flex items-center space-x-2 text-text-secondary">
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            <span>AI sedang mencari lokasi...</span>
                        </div>
                    ) : (
                        <p className="text-sm text-text-primary whitespace-pre-wrap font-sans">{locationAnalysis}</p>
                    )}
                </div>

                <div className="text-left my-6 bg-surface-light p-4 rounded-lg border border-border-color">
                    <h2 className="font-bold text-lg mb-2 flex items-center">
                        <SparklesIcon className="h-5 w-5 mr-2 text-primary" />
                        Saran Solusi (AI)
                    </h2>
                    {isLoadingSolution ? (
                        <div className="flex items-center space-x-2 text-text-secondary">
                            <ArrowPathIcon className="h-4 w-4 animate-spin" />
                            <span>AI sedang menganalisis solusi...</span>
                        </div>
                    ) : (
                        <div className="text-sm text-text-primary whitespace-pre-wrap font-sans prose" dangerouslySetInnerHTML={{ __html: solution ? solution.replace(/(\d\.)/g, '<br/><strong>$1</strong>').replace(/\*\*/g, '') : '' }} />
                    )}
                </div>


                 <div className="mt-4">
                    <button
                        onClick={handleReturnToPreviousPage}
                        className="text-sm font-semibold text-primary hover:underline"
                    >
                        Kembali ke halaman sebelumnya
                    </button>
                </div>

            </div>
        </div>
    );
};

export default RecoveryUI;
