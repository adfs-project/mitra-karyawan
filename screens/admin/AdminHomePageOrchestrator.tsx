import React, { useState, useEffect } from 'react';
// FIX: Replaced useCore with useApp and added useApp for showToast.
import { useApp } from '../../contexts/AppContext';
import { HomePageConfig } from '../../types';
import { CheckCircleIcon } from '@heroicons/react/24/solid';
import { SparklesIcon } from '@heroicons/react/24/outline';
// FIX: Import useMarketplace to get products data.
import { useMarketplace } from '../../hooks/useMarketplace';


const AdminHomePageOrchestrator: React.FC = () => {
    // FIX: Get products data from useMarketplace hook.
    const { homePageConfig, updateHomePageConfig, articles, showToast } = useApp();
    const { products } = useMarketplace();
    const [config, setConfig] = useState<HomePageConfig>(homePageConfig);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setConfig(homePageConfig);
    }, [homePageConfig]);

    const handleSave = () => {
        setIsSaving(true);
        updateHomePageConfig(config);
        setTimeout(() => {
            setIsSaving(false);
            showToast('Home page configuration saved!', 'success');
        }, 1000);
    };
    
    const allPinnableItems = [
        ...products.map(p => ({ id: p.id, name: `[Product] ${p.name}` })),
        ...articles.map(a => ({ id: a.id, name: `[Article] ${a.title}` }))
    ];

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Home Page Orchestrator</h1>
            <p className="text-text-secondary max-w-3xl">Control the content that users see on their home page. Pin important items to the "For You" widget to increase visibility.</p>
            
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center">
                    <SparklesIcon className="h-5 w-5 mr-2" />
                    "For You" Widget Configuration
                </h2>
                <div className="max-w-lg">
                    <label className="block text-sm font-bold text-text-secondary mb-1">Select an Item to Pin</label>
                    <select
                        value={config.pinnedItemId || ''}
                        onChange={(e) => setConfig(prev => ({...prev, pinnedItemId: e.target.value || null}))}
                        className="w-full p-2 bg-surface-light rounded border border-border-color"
                    >
                        <option value="">-- No Pinned Item --</option>
                        {allPinnableItems.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                    </select>
                    <p className="text-xs text-text-secondary mt-1">This item will appear as the first card in every user's "For You" section.</p>
                </div>
                
                <div className="mt-6 flex justify-end">
                    <button onClick={handleSave} disabled={isSaving} className="btn-primary px-6 py-2 rounded font-bold flex items-center w-48 justify-center">
                        {isSaving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : (
                            <><CheckCircleIcon className="h-5 w-5 mr-2" /> Save Configuration</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminHomePageOrchestrator;