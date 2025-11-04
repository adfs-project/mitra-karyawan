
// Simulates a centralized logging service like Sentry or LogRocket.

const MAX_LOGS = 50;
const LOG_STORAGE_KEY = 'app_error_logs';

export interface LogEntry {
    timestamp: string;
    message: string;
    stack?: string;
    metadata?: Record<string, any>;
}

class LoggingService {
    
    private getLogs(): LogEntry[] {
        try {
            const storedLogs = sessionStorage.getItem(LOG_STORAGE_KEY);
            return storedLogs ? JSON.parse(storedLogs) : [];
        } catch (error) {
            console.error("Failed to parse logs from sessionStorage:", error);
            return [];
        }
    }

    private saveLogs(logs: LogEntry[]): void {
        sessionStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(logs));
    }

    public logError(error: Error, metadata?: Record<string, any>): void {
        const newLog: LogEntry = {
            timestamp: new Date().toISOString(),
            message: error.message,
            stack: error.stack,
            metadata: metadata || {},
        };

        // For developers to see it immediately in the console
        console.error(`[REMOTE_LOG]`, newLog);

        // Store it for the admin viewer
        const logs = this.getLogs();
        logs.unshift(newLog); // Add to the beginning
        if (logs.length > MAX_LOGS) {
            logs.pop(); // Keep the log size manageable
        }
        this.saveLogs(logs);
    }

    public getRecentLogs(): LogEntry[] {
        return this.getLogs();
    }
    
    public clearLogs(): void {
        sessionStorage.removeItem(LOG_STORAGE_KEY);
    }
}

const loggingService = new LoggingService();
export default loggingService;
