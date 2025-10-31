import React, { useState } from 'react';
import { HeartIcon, PlusIcon, UserGroupIcon } from '@heroicons/react/24/solid';
import { useHealth } from '../../contexts/HealthContext';
import { HealthChallenge } from '../../types';

const ChallengeFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onSave: (data: { title: string; description: string; }) => void;
}> = ({ isOpen, onClose, onSave }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');

    const handleSave = () => {
        if (!title.trim() || !description.trim()) {
            alert("Title and description are required.");
            return;
        }
        onSave({ title, description });
        setTitle('');
        setDescription('');
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Create New Health Challenge</h2>
                <div className="space-y-4">
                    <input type="text" placeholder="Challenge Title (e.g., 10,000 Steps a Day)" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-surface-light rounded" />
                    <textarea placeholder="Brief description of the challenge" value={description} onChange={e => setDescription(e.target.value)} className="w-full p-2 bg-surface-light rounded" rows={3}></textarea>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Cancel</button>
                    <button onClick={handleSave} className="btn-primary px-4 py-2 rounded">Create Challenge</button>
                </div>
            </div>
        </div>
    );
};

const HrWellnessManagement: React.FC = () => {
    const { healthChallenges, createHealthChallenge } = useHealth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                 <h1 className="text-3xl font-bold text-primary flex items-center">
                    <HeartIcon className="h-8 w-8 mr-2"/>
                    Wellness Management
                </h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center px-4 py-2 rounded">
                    <PlusIcon className="h-5 w-5 mr-2" /> Create Challenge
                </button>
            </div>
            
            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Active Company Challenges</h2>
                <div className="space-y-3">
                    {healthChallenges.map(challenge => (
                        <div key={challenge.id} className="bg-surface-light p-4 rounded-lg">
                            <h3 className="font-bold text-text-primary">{challenge.title}</h3>
                            <p className="text-xs text-text-secondary">{challenge.description}</p>
                            <div className="flex items-center text-sm text-text-secondary mt-2">
                                <UserGroupIcon className="h-4 w-4 mr-1" />
                                <span>{challenge.participants.length} Participants</span>
                            </div>
                        </div>
                    ))}
                    {healthChallenges.length === 0 && <p className="text-center py-8 text-text-secondary">No active challenges.</p>}
                </div>
            </div>
            
            <ChallengeFormModal 
                isOpen={isModalOpen} 
                onClose={() => setIsModalOpen(false)} 
                onSave={createHealthChallenge}
            />
        </div>
    );
};

export default HrWellnessManagement;
