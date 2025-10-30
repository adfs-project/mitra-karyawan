import React, { useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import RecoveryUI from './components/common/RecoveryUI';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from 'react-error-boundary';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';
import loggingService from './services/loggingService';

// --- START: Anti-Blank Screen Defense System V2 ---

// 1. Versioning: Should be updated with each new deployment.
const APP_VERSION = '1.5.27'; 

// 2. Centralized Hard Reset Logic
const handleHardReset = () => {
    console.warn("Performing a hard reset of the application state...");
    try {
        // Clear all app-related storage to prevent data incompatibility crashes.
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('app_')) {
                localStorage.removeItem(key);
            }
        });
        localStorage.removeItem('app_version'); // Also remove version lock
        sessionStorage.clear();

        // Force a fresh reload from the server
        window.location.reload();
    } catch (error) {
        console.error("Failed to perform hard reset:", error);
        alert("Could not perform reset. Please clear your browser cache manually and try again.");
    }
};


// 3. Centralized Recovery UI Trigger
let recoveryTriggered = false;
const renderRecoveryScreen = (error?: Error | Event | PromiseRejectionEvent) => {
    if (recoveryTriggered) return;
    recoveryTriggered = true;

    console.error("A critical, unrecoverable error occurred. Rendering Recovery UI.", error);
    if (error && error instanceof Error) {
        loggingService.logError(error, { component: 'CriticalBoundary' });
    } else {
         loggingService.logError(new Error('Unknown critical error'), { component: 'CriticalBoundary', originalEvent: error });
    }

    const rootElement = document.getElementById('root');
    if (rootElement) {
        const root = ReactDOM.createRoot(rootElement);
        root.render(<RecoveryUI />);
    } else {
        // Fallback if even the root element is gone
        document.body.innerHTML = `<div style="color:white;padding:2rem;">CRITICAL ERROR: Application root not found.</div>`;
    }
};

// 4. Global Error Handlers (Catch errors outside React)
window.addEventListener('error', (event) => renderRecoveryScreen(event));
window.addEventListener('unhandledrejection', (event) => renderRecoveryScreen(event));


// 5. Preflight Checks & Crash Loop Detection
const runPreflightChecks = (): boolean => {
  try {
    // Check for version mismatch (indicates an update)
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      console.warn(`Version mismatch detected. Old: ${storedVersion}, New: ${APP_VERSION}. Clearing local storage.`);
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith('app_')) {
          localStorage.removeItem(key);
        }
      });
      localStorage.setItem('app_version', APP_VERSION);
    }

    // Check for crash loop
    const crashCount = parseInt(sessionStorage.getItem('crash_count') || '0', 10);
    if (crashCount > 3) {
      console.error("Crash loop detected. Triggering Recovery UI.");
      return false; // Indicates failure, will trigger recovery UI.
    }
    sessionStorage.setItem('crash_count', (crashCount + 1).toString());

    return true; // All checks passed.
  } catch (error) {
    console.error("Error during preflight checks:", error);
    loggingService.logError(error as Error, { component: 'PreflightChecks' });
    return false; // Fail safe, trigger recovery UI.
  }
};

// 6. Enhanced Error Boundary Fallback UI
const ErrorFallback: React.FC<{ error: Error; resetErrorBoundary: () => void }> = ({ error, resetErrorBoundary }) => {
    
    useEffect(() => {
        loggingService.logError(error, { component: 'ErrorBoundary' });
    }, [error]);

    return (
        <div className="flex items-center justify-center h-screen w-screen bg-background text-text-primary p-4">
            <div className="text-center bg-surface p-8 rounded-lg border border-border-color max-w-lg">
                <ExclamationTriangleIcon className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-primary mb-2">Oops! Terjadi Kesalahan</h1>
                <p className="text-text-secondary mb-6">
                    Sesuatu berjalan tidak semestinya. Tim kami telah diberitahu. Silakan coba muat ulang halaman atau lakukan reset jika masalah berlanjut.
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                        onClick={() => window.location.reload()}
                        className="btn-secondary px-6 py-2 rounded-lg font-bold"
                    >
                        Muat Ulang Halaman
                    </button>
                    <button
                        onClick={handleHardReset}
                        className="btn-primary px-6 py-2 rounded-lg font-bold"
                    >
                        Hard Reset Aplikasi
                    </button>
                </div>
            </div>
        </div>
    );
};


// --- END: Anti-Blank Screen Defense System V2 ---


try {
    const rootElement = document.getElementById('root');
    if (!rootElement) {
      throw new Error("Could not find root element to mount to");
    }

    const root = ReactDOM.createRoot(rootElement);
    const preflightChecksPassed = runPreflightChecks();

    if (preflightChecksPassed) {
        root.render(
          <React.StrictMode>
            <ErrorBoundary FallbackComponent={ErrorFallback}>
              <ThemeProvider>
                <AuthProvider>
                  <DataProvider>
                    <App />
                  </DataProvider>
                </AuthProvider>
              </ThemeProvider>
            </ErrorBoundary>
          </React.StrictMode>
        );
    } else {
        renderRecoveryScreen(new Error("Preflight checks failed."));
    }
} catch (error) {
    renderRecoveryScreen(error as Error);
}