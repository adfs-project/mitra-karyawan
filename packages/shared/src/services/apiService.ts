
import { ApiIntegration } from '../types';

const possibleFailures = [
    "Invalid API Key provided.",
    "Connection timed out. Check firewall settings.",
    "API Endpoint returned 403 Forbidden.",
    "Client ID does not match registered application.",
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const testApiConnection = async (credentials: ApiIntegration['credentials'] | undefined, integrationName: string): Promise<{ success: boolean; message: string }> => {
    await sleep(1500 + Math.random() * 1000); // Simulate network latency

    // 1. Basic validation
    if (!credentials?.apiKey || !credentials.clientId || !credentials.secretKey) {
        return { success: false, message: "All credential fields are required." };
    }

    // 2. "Real" validation based on patterns
    if (!credentials.apiKey.toLowerCase().includes(integrationName.toLowerCase())) {
        return { success: false, message: `Connection failed: API Key does not seem valid for ${integrationName}.` };
    }

    if (credentials.secretKey.length < 16) {
        return { success: false, message: "Connection failed: Secret Key is too short. Must be at least 16 characters." };
    }

    // 3. Simulate other random network/API errors, but with a lower chance
    if (Math.random() < 0.1) { // 10% chance of a random network-like error
        const failureReason = possibleFailures[Math.floor(Math.random() * possibleFailures.length)];
        return { success: false, message: failureReason };
    }
    
    return { success: true, message: "Connection successful and credentials are valid." };
};
