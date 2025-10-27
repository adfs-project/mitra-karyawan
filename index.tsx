import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AuthProvider } from './contexts/AuthContext';
import { DataProvider } from './contexts/DataContext';
import ErrorBoundary from './components/common/ErrorBoundary';
import RecoveryUI from './components/common/RecoveryUI';
import { ThemeProvider } from './contexts/ThemeContext';

// --- START: Anti-Blank Screen Defense System ---

// 1. Versioning: Should be updated with each new deployment.
// This allows detection of an app update.
const APP_VERSION = '2.1.0'; 

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
    return false; // Fail safe, render recovery UI.
  }
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
      // FIX: Added ThemeProvider to wrap the application and enable theme functionality.
      <ThemeProvider>
        <AuthProvider>
          <DataProvider>
            <ErrorBoundary>
              <App />
            </ErrorBoundary>
          </DataProvider>
        </AuthProvider>
      </ThemeProvider>
    ) : (
      <RecoveryUI />
    )}
  </React.StrictMode>
);