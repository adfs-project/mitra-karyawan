import React, { useState, useEffect } from 'react';
import { useData } from '../../../contexts/DataContext';
import { ShieldExclamationIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI, Type } from "@google/genai";

interface Anomaly {
    transaction_id: string;
    reason: string;
}

const AnomalyDetectionWidget: React.FC = () => {
    const { transactions } = useData();
    const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    const runDetection = async () => {
        if (transactions.length < 5) return;
        setIsLoading(true);
        setAnomalies([]);

        const recentTransactions = transactions.slice(0, 50); // Analyze last 50 transactions

        const prompt = `
            You are a fraud detection AI for an employee financial super-app.
            Analyze the following list of recent transactions and identify any suspicious or anomalous activities.
            Look for patterns like:
            - Unusually large top-ups or transfers compared to the user's average.
            - Multiple small, rapid transfers to different (simulated) recipients.
            - Transactions at odd hours (e.g., 3 AM).
            
            Transactions Data:
            ${JSON.stringify(recentTransactions.map(t => ({ id: t.id, userId: t.userId, type: t.type, amount: t.amount, timestamp: t.timestamp })), null, 2)}

            Your response MUST be a valid JSON object containing a single key "anomalies", which is an array of objects.
            Each object in the array should have two keys: "transaction_id" (the ID of the flagged transaction) and "reason" (a brief explanation of why it's suspicious).
            If no anomalies are found, return an empty array.
            Example: { "anomalies": [{"transaction_id": "tx-123", "reason": "Unusually large top-up amount."}] }
        `;

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: "gemini-2.5-flash",
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.OBJECT,
                        properties: {
                            anomalies: {
                                type: Type.ARRAY,
                                items: {
                                    type: Type.OBJECT,
                                    properties: {
                                        transaction_id: { type: Type.STRING },
                                        reason: { type: Type.STRING }
                                    },
                                    required: ["transaction_id", "reason"]
                                }
                            }
                        },
                        required: ["anomalies"]
                    }
                }
            });

            const result = JSON.parse(response.text);
            setAnomalies(result.anomalies || []);
        } catch (error) {
            console.error("AI Anomaly Detection Error:", error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        // Run once on component mount
        runDetection();
    }, []); // Dependency array is empty to run only once

    return (
        <div className="bg-surface p-6 rounded-lg border border-yellow-500/50">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center"><ShieldExclamationIcon className="h-5 w-5 mr-2 text-yellow-400" /> AI Anomaly Detection</h2>
                <button onClick={runDetection} disabled={isLoading} className="btn-secondary px-3 py-1 rounded text-sm disabled:opacity-50">
                    {isLoading ? 'Scanning...' : 'Re-scan'}
                </button>
            </div>
            {isLoading ? (
                <p className="text-text-secondary">AI is analyzing recent transactions...</p>
            ) : anomalies.length > 0 ? (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {anomalies.map((anomaly, index) => (
                        <li key={index} className="bg-surface-light p-2 rounded">
                            <p className="text-sm font-semibold text-yellow-400">{anomaly.reason}</p>
                            <p className="text-xs text-text-secondary font-mono">Transaction ID: {anomaly.transaction_id}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="text-text-secondary">No suspicious activities detected in recent transactions.</p>
            )}
        </div>
    );
};

export default AnomalyDetectionWidget;