import { ApiIntegration } from '../types';

const possibleFailures = [
    "Invalid API Key provided.",
    "Connection timed out. Check firewall settings.",
    "API Endpoint returned 403 Forbidden.",
    "Client ID does not match registered application.",
];

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const testApiConnection = async (credentials?: ApiIntegration['credentials']): Promise<{ success: boolean; message: string }> => {
    await sleep(1500 + Math.random() * 1000); // Simulate network latency

    // Basic validation
    if (!credentials?.apiKey || !credentials.clientId || !credentials.secretKey) {
        return { success: false, message: "All credential fields are required." };
    }

    // Simulate random failure
    if (Math.random() > 0.8) { // 20% chance of failure
        const failureReason = possibleFailures[Math.floor(Math.random() * possibleFailures.length)];
        return { success: false, message: failureReason };
    }
    
    return { success: true, message: "Connection successful and credentials are valid." };
};
