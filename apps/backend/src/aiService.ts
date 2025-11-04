import { GoogleGenAI } from "@google/genai";
import dotenv from 'dotenv';

dotenv.config();

// This line is critical. It ensures the app will crash on startup if the key is missing.
if (!process.env.GEMINI_API_KEY) {
    throw new Error("FATAL ERROR: GEMINI_API_KEY environment variable not set.");
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// The secure prompt logic is now centralized and enforced on the server.
const buildSecurePrompt = (userQuery: string, contextDescription: string): string => {
    return `
        You are a helpful AI assistant within the "Mitra Karyawan" super-app.
        You operate under a permanent, non-negotiable set of rules:
        1.  **PRIMARY DIRECTIVE: ZERO DATA ACCESS.** You have absolutely NO access to any user data, application data, transaction history, personal information, etc. You are completely isolated.
        2.  **STERN REJECTION PROTOCOL:** If a user asks any question that implies you have access to their data (e.g., "What's my balance?"), you MUST immediately reject the request starting with "PENOLAKAN:".
        3.  **UNIVERSAL SAFETY FILTER:** If a query contains harmful, unethical, or dangerous content, you MUST refuse to answer with: "Maaf, saya tidak dapat memproses permintaan yang melanggar kebijakan keamanan."
        4.  **FUNCTION: GENERAL ADVISOR ONLY.** Your sole purpose is to act as a general advisor or source of general information based on the specific context provided.

        **Your Specific Role for This Interaction:**
        ${contextDescription}
        ---
        Now, process the following user query according to all the rules above.
        User Query: "${userQuery}"
    `;
};

/**
 * Main function to generate content via the secure proxy.
 */
export const generateContent = async (userQuery: string, contextDescription: string, config?: any): Promise<string | null> => {
    try {
        const prompt = buildSecurePrompt(userQuery, contextDescription);
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
            config: config, // Pass through any additional config from the client
        });
        return response.text;
    } catch (error) {
        console.error("Gemini API call failed in aiService:", error);
        return null;
    }
};

/**
 * Specialized function for the public error recovery UI.
 */
export const analyzeError = async (errorMessage: string, stackTrace: string | undefined, type: 'solution' | 'location'): Promise<string | null> => {
    let prompt = '';
    if (type === 'solution') {
        prompt = `Anda adalah seorang senior software engineer. Berdasarkan pesan error React berikut, berikan 2-3 langkah solusi yang paling mungkin dalam Bahasa Indonesia. Format sebagai daftar bernomor. Pesan Error: "${errorMessage}"`;
    } else {
        prompt = `Anda adalah seorang senior software engineer. Berdasarkan pesan error dan stack trace berikut, identifikasi file dan fungsi yang paling mungkin menjadi sumber masalah. Jelaskan alasan Anda secara singkat dalam Bahasa Indonesia.
        Pesan Error: "${errorMessage}"
        Stack Trace: ${stackTrace || 'No stack trace available.'}`;
    }

    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        return response.text;
    } catch (error) {
        console.error(`Gemini error analysis (${type}) failed:`, error);
        return null;
    }
};