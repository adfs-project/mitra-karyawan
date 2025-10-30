import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { CoreProvider } from './contexts/DataContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import RecoveryUI from './components/common/RecoveryUI';
import { MarketplaceProvider } from './contexts/MarketplaceContext';
import { HealthProvider } from './contexts/HealthContext';
import { HRProvider } from './contexts/HRContext';
import { AppProvider } from './contexts/AppContext';

// Application version, reads from build environment or falls back to a hardcoded value.
const APP_VERSION = (import.meta as any)?.env?.VITE_APP_VERSION || '1.5.3';
console.log(`Mitra Karyawan App Version: ${APP_VERSION}`);

// Crash loop detection logic
// App.tsx will clear this on successful mount.
// If App crashes before mounting, this counter will persist and increment on reload.
const crashCount = parseInt(sessionStorage.getItem('crash_count') || '0', 10);
sessionStorage.setItem('crash_count', (crashCount + 1).toString());

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

if (crashCount > 2) {
    // After 3 failed attempts, show recovery UI and stop trying.
    root.render(<RecoveryUI />);
} else {
    root.render(
        <React.StrictMode>
            <ErrorBoundary FallbackComponent={RecoveryUI}>
                <ThemeProvider>
                    <AuthProvider>
                        <AppProvider>
                            <CoreProvider>
                                <HRProvider>
                                    <HealthProvider>
                                        <MarketplaceProvider>
                                            <App />
                                        </MarketplaceProvider>
                                    </HealthProvider>
                                </HRProvider>
                            </CoreProvider>
                        </AppProvider>
                    </AuthProvider>
                </ThemeProvider>
            </ErrorBoundary>
        </React.StrictMode>
    );
}