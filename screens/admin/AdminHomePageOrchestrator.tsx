import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { HomePageConfig } from '../../types';
import { PinIcon, Bars3Icon, MegaphoneIcon, ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

const quickAccessItemsMap: Record<string, string> = {
    ppob: 'PPOB & Tagihan',
    market: 'Marketplace',
    health: 'Layanan Kesehatan',
    gov: 'Layanan Pemerintah',
    lifestyle: 'Gaya Hidup',
    pulsa: 'Pulsa & Data',
    cashout: 'Tarik Tunai',
    daily: 'Belanja Harian',
};


const AdminHomePageOrchestrator: React.FC = () => {
    const { homePageConfig, updateHomePageConfig, products, articles } = useData();
    const [config, setConfig] = useState<HomePageConfig>(homePageConfig);

    const handleSave = () => {
        updateHomePageConfig(config);
        alert("Home page configuration saved!");
    };
    
    const moveQuickAccessItem = (index: number, direction: 'up' | 'down') => {
        const newOrder = [...config.quickAccessOrder];
        const targetIndex = direction === 'up' ? index - 1 : index + 1;

        if (targetIndex < 0 || targetIndex >= newOrder.length) return;

        [newOrder[index], newOrder[targetIndex]] = [newOrder[targetIndex], newOrder[index]];
        setConfig(prev => ({ ...prev, quickAccessOrder: newOrder }));
    };

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold text-primary">Home Page Orchestrator</h1>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                    {/* Pinned Item */}
                    <div className="bg-surface p-6 rounded-lg border border-border-color">
                        <h2 className="text-xl font-bold mb-4 flex items-center"><PinIcon className="h-5 w-5 mr-2" /> Pinned "For You" Item</h2>
                        <p className="text-sm text-text-secondary mb-3">Highlight one item to appear first for all users.</p>
                        <select
                            value={config.pinnedItemId || ''}
                            onChange={e => setConfig(prev => ({...prev, pinnedItemId: e.target.value || null}))}
                            className="w-full p-2 bg-surface-light rounded border border-border-color"
                        >
                            <option value="">-- No Pinned Item --</option>
                            <optgroup label="Products">
                                {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </optgroup>
                            <optgroup label="Articles">
                                {articles.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
                            </optgroup>
                        </select>
                    </div>

                    {/* Global Announcement */}
                    <div className="bg-surface p-6 rounded-lg border border-border-color">
                        <h2 className="text-xl font-bold mb-4 flex items-center"><MegaphoneIcon className="h-5 w-5 mr-2" /> Global Announcement</h2>
                        <div className="space-y-3">
                             <div>
                                <label className="text-sm font-bold text-text-secondary">Message</label>
                                <input
                                    type="text"
                                    value={config.globalAnnouncement?.message || ''}
                                    onChange={e => {
                                        // FIX: Robustly handle updates when globalAnnouncement might be null.
                                        setConfig(prev => {
                                            const currentAnnouncement = prev.globalAnnouncement || { message: '', active: false };
                                            return {
                                                ...prev,
                                                globalAnnouncement: {
                                                    ...currentAnnouncement,
                                                    message: e.target.value,
                                                }
                                            };
                                        });
                                    }}
                                    className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color"
                                />
                            </div>
                             <div className="flex items-center space-x-3">
                                <label className="relative inline-flex items-center cursor-pointer">
                                    <input type="checkbox" checked={config.globalAnnouncement?.active || false} onChange={e => {
                                        // FIX: Robustly handle updates when globalAnnouncement might be null.
                                        setConfig(prev => {
                                            const currentAnnouncement = prev.globalAnnouncement || { message: '', active: false };
                                            return {
                                                ...prev,
                                                globalAnnouncement: {
                                                    ...currentAnnouncement,
                                                    active: e.target.checked,
                                                }
                                            };
                                        });
                                    }} className="sr-only peer" />
                                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                                </label>
                                <span className="font-semibold">{config.globalAnnouncement?.active ? 'Active' : 'Inactive'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column */}
                <div className="bg-surface p-6 rounded-lg border border-border-color">
                    <h2 className="text-xl font-bold mb-4 flex items-center"><Bars3Icon className="h-5 w-5 mr-2" /> Quick Access Order</h2>
                     <ul className="space-y-2">
                        {config.quickAccessOrder.map((itemId, index) => (
                            <li key={itemId} className="flex items-center justify-between bg-surface-light p-2 rounded">
                                <span className="font-semibold">{quickAccessItemsMap[itemId]}</span>
                                <div className="space-x-1">
                                    <button onClick={() => moveQuickAccessItem(index, 'up')} disabled={index === 0} className="p-1 rounded hover:bg-border-color disabled:opacity-30"><ArrowUpIcon className="h-4 w-4" /></button>
                                    <button onClick={() => moveQuickAccessItem(index, 'down')} disabled={index === config.quickAccessOrder.length - 1} className="p-1 rounded hover:bg-border-color disabled:opacity-30"><ArrowDownIcon className="h-4 w-4" /></button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
            
            <div className="mt-8 flex justify-end">
                <button onClick={handleSave} className="btn-primary px-8 py-3 rounded-lg font-bold">
                    Save Configuration
                </button>
            </div>
        </div>
    );
};

export default AdminHomePageOrchestrator;