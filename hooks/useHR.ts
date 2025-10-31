import { useContext } from 'react';
// FIX: Correctly import the exported HRContext.
import { HRContext, HRContextType } from '../contexts/HRContext';

// This hook is now a simple consumer for the dedicated HRContext.
// All logic has been moved to HRProvider to isolate state and improve performance.
export const useHR = (): HRContextType => {
    const context = useContext(HRContext);
    if (context === undefined) {
        throw new Error('useHR must be used within an HRProvider');
    }
    return context;
};
