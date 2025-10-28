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

// --- START: Anti-Blank Screen Defense System ---

// 1. Versioning: Should be updated with each new deployment.
// This allows detection of an app update.
const APP_VERSION = '2.5.0'; 

// 2. Preflight Checks & Crash Loop Detection
const runPreflightChecks = (): boolean => {
  try {
    // Check for version mismatch (indicates an update)
    const storedVersion = localStorage.getItem('app_version');
    if (storedVersion !== APP_VERSION) {
      console.warn(`Version mismatch detected. Old: ${storedVersion}, New: ${APP_VERSION}. Clearing local storage.`);
      // Clear all app-related storage to prevent data incompatibility crashes.
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
      // If the app has crashed repeatedly, stop trying to render it.
      console.error("Crash loop detected. Rendering Recovery UI.");
      return false; // Indicates failure, render recovery UI.
    }
    // Increment crash count before attempting to render.
    // A successful render will clear this counter.
    sessionStorage.setItem('crash_count', (crashCount + 1).toString());

    return true; // All checks passed.
  } catch (error) {
    console.error("Error during preflight checks:", error);
    loggingService.logError(error as Error, { component: 'PreflightChecks' });
    return false; // Fail safe, render recovery UI.
  }
};

// 3. Modern Error Boundary Fallback UI
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
                    Sesuatu berjalan tidak semestinya. Tim kami telah diberitahu. Silakan coba muat ulang halaman.
                </p>
                <button
                    onClick={() => window.location.reload()} // Simple and robust reload
                    className="btn-secondary px-6 py-2 rounded-lg font-bold"
                >
                    Muat Ulang Halaman
                </button>
            </div>
        </div>
    );
};


// --- END: Anti-Blank Screen Defense System ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);

const preflightChecksPassed = runPreflightChecks();

root.render(
  <React.StrictMode>
    {preflightChecksPassed ? (
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <ThemeProvider>
          <AuthProvider>
            <DataProvider>
              <App />
            </DataProvider>
          </AuthProvider>
        </ThemeProvider>
      </ErrorBoundary>
    ) : (
      <RecoveryUI />
    )}
  </React.StrictMode>
);