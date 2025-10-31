import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import RecoveryUI from './components/common/RecoveryUI';
import { AppProvider } from './contexts/AppContext';

// Application version, reads from build environment or falls back to a hardcoded value.
const APP_VERSION = (import.meta as any)?.env?.VITE_APP_VERSION || '1.5.4';
console.log(`Mitra Karyawan App Version: ${APP_VERSION}`);

// Crash loop detection logic - Temporarily disabled
// const crashCount = parseInt(sessionStorage.getItem('crash_count') || '0', 10);
// sessionStorage.setItem('crash_count', (crashCount + 1).toString());

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);

// Crash loop check temporarily disabled.
// if (crashCount > 2) {
//     root.render(<RecoveryUI />);
// } else {
root.render(
    <React.StrictMode>
        <ErrorBoundary FallbackComponent={RecoveryUI}>
            <ThemeProvider>
                <AuthProvider>
                    <AppProvider>
                        <App />
                    </AppProvider>
                </AuthProvider>
            </ThemeProvider>
        </ErrorBoundary>
    </React.StrictMode>
);
// }