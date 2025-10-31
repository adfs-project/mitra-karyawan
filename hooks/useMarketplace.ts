import { useContext } from 'react';
// FIX: Correctly import the exported MarketplaceContext.
import { MarketplaceContext, MarketplaceContextType } from '../contexts/MarketplaceContext';

// This hook is now a simple consumer for the dedicated MarketplaceContext.
// All logic has been moved to MarketplaceProvider to isolate state and improve performance.
export const useMarketplace = (): MarketplaceContextType => {
    const context = useContext(MarketplaceContext);
    if (context === undefined) {
        throw new Error('useMarketplace must be used within a MarketplaceProvider');
    }
    return context;
};