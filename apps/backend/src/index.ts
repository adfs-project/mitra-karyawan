import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { authenticateToken } from './authMiddleware'; // Assuming this exists from previous guide
import { generateContent, analyzeError } from './aiService';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// --- Secure AI Proxy Endpoint ---
// This endpoint is protected and requires a valid JWT from a logged-in user.
app.post('/api/ai/generate', authenticateToken, async (req, res) => {
    const { prompt, contextDescription, config } = req.body;
    if (!prompt || !contextDescription) {
        return res.status(400).json({ message: 'Prompt and contextDescription are required.' });
    }

    try {
        const aiResponse = await generateContent(prompt, contextDescription, config);
        if (aiResponse === null) {
            throw new Error("AI service failed to generate content.");
        }
        res.json({ text: aiResponse });
    } catch (error) {
        console.error('AI Proxy Error:', error);
        res.status(500).json({ message: 'Error communicating with AI service.' });
    }
});

// --- Public, Restricted AI Endpoint for Error Analysis ---
// This endpoint is public but has a very specific purpose to prevent abuse.
app.post('/api/ai/analyze-error', async (req, res) => {
    const { errorMessage, stackTrace } = req.body;
    if (!errorMessage) {
        return res.status(400).json({ message: 'Error message is required.' });
    }
    
    try {
        // We make two parallel calls to get both pieces of analysis.
        const [solution, location] = await Promise.all([
            analyzeError(errorMessage, stackTrace, 'solution'),
            analyzeError(errorMessage, stackTrace, 'location')
        ]);

        if (solution === null || location === null) {
            throw new Error("AI service failed to analyze error.");
        }

        res.json({ solution, location });

    } catch (error) {
        console.error('AI Error Analysis Proxy Error:', error);
        res.status(500).json({ message: 'Error communicating with AI service for analysis.' });
    }
});


app.listen(port, () => {
  console.log(`Backend server is running on http://localhost:${port}`);
});

// NOTE: You would add other endpoints (login, initial-data, etc.) here as well.
// This file is focused on the AI proxy implementation as requested.