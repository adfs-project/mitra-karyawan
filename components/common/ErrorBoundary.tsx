import React, { ErrorInfo, ReactNode } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

class ErrorBoundary extends React.Component<Props, State> {
  // FIX: Initialize state as a public class field to ensure it is correctly typed and available on `this`. This resolves errors related to `this.state` and `this.props` not existing.
  public state: State = { hasError: false };

  // FIX: The explicit constructor was removed. It is redundant when using a class field to initialize state and can cause typing issues with `this.props` in some environments, leading to the reported errors.

  static getDerivedStateFromError(_: Error): State {
    // Update state so the next render will show the fallback UI.
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center justify-center h-screen w-screen bg-background text-text-primary p-4">
            <div className="text-center bg-surface p-8 rounded-lg border border-border-color max-w-lg">
                <ExclamationTriangleIcon className="h-16 w-16 text-secondary mx-auto mb-4" />
                <h1 className="text-2xl font-bold text-primary mb-2">Oops! Terjadi Kesalahan</h1>
                <p className="text-text-secondary mb-6">
                    Sesuatu berjalan tidak semestinya. Tim kami telah diberitahu. Silakan coba muat ulang halaman.
                </p>
                <button
                    onClick={() => window.location.reload()}
                    className="btn-secondary px-6 py-2 rounded-lg font-bold"
                >
                    Muat Ulang Halaman
                </button>
            </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;