
import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { HomePageConfig } from '../../types';
import { MegaphoneIcon, Cog6ToothIcon, PaperClipIcon } from '@heroicons/react/24/solid';

const AdminHomePageOrchestrator: React.FC = () => {
    const { homePageConfig, updateHomePageConfig, products, articles } = useData();
    const [config, setConfig] = useState<HomePageConfig>(homePageConfig);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        setConfig(homePageConfig);
    }, [homePageConfig]);

    const handleSave = () => {
        setIsSaving(true);
        // In a real app, this would be an API call.
        // Here we simulate it.
        setTimeout(() => {
            // The context needs an update function for this. Let's assume it's `updateHomePageConfig`
            // and add it to DataContext.
            updateHomePageConfig(config);
            alert("Home page configuration saved!");
            setIsSaving(false);
        }, 1000);
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        
        if(name === 'announcementMessage') {
             setConfig(prev => ({ ...prev, globalAnnouncement: { ...prev.globalAnnouncement, message: value } }));
        } else if (name === 'announcementActive') {
            const checked = (e.target as HTMLInputElement).checked;
            setConfig(prev => ({ ...prev, globalAnnouncement: { ...prev.globalAnnouncement, active: checked } }));
        } else {
            setConfig(prev => ({ ...prev, [name]: value }));
        }
    };


    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Home Page Orchestrator</h1>
            <p className="text-text-secondary">Control the dynamic content displayed on the user's home screen.</p>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center"><MegaphoneIcon className="h-6 w-6 mr-2" /> Global Announcement</h2>
                <div className="space-y-4 max-w-lg">
                    <div className="flex items-center space-x-3">
                        <label htmlFor="announcementActive" className="font-bold text-text-secondary">Status:</label>
                        <input type="checkbox" id="announcementActive" name="announcementActive" checked={config.globalAnnouncement.active} onChange={handleInputChange} className="h-5 w-5 rounded text-primary focus:ring-primary" />
                        <span className={config.globalAnnouncement.active ? 'text-green-400' : 'text-red-400'}>{config.globalAnnouncement.active ? 'Active' : 'Inactive'}</span>
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Announcement Message</label>
                        <input
                            type="text"
                            name="announcementMessage"
                            value={config.globalAnnouncement.message}
                            onChange={handleInputChange}
                            className="w-full p-2 bg-surface-light rounded border border-border-color"
                            disabled={!config.globalAnnouncement.active}
                        />
                    </div>
                </div>
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4 flex items-center"><PaperClipIcon className="h-6 w-6 mr-2" /> Pinned "For You" Item</h2>
                <div className="space-y-4 max-w-lg">
                    <div>
                        <label className="block text-sm font-bold text-text-secondary mb-1">Select Item to Pin</label>
                         <select name="pinnedItemId" value={config.pinnedItemId || ''} onChange={handleInputChange} className="w-full p-2 bg-surface-light rounded border border-border-color">
                            <option value="">-- No Pinned Item --</option>
                            <optgroup label="Products">
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </optgroup>
                            <optgroup label="Articles">
                                {articles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                            </optgroup>
                        </select>
                        <p className="text-xs text-text-secondary mt-1">This item will appear first in the "For You" section on the home screen.</p>
                    </div>
                </div>
            </div>
            
             <div className="flex justify-end">
                <button 
                    onClick={handleSave} 
                    disabled={isSaving}
                    className="btn-primary px-6 py-2 rounded font-bold w-48 flex justify-center"
                >
                    {isSaving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Save Configuration'}
                </button>
            </div>

        </div>
    );
};

export default AdminHomePageOrchestrator;