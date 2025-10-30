import React, { useState } from 'react';
import { useHealth } from '../../contexts/HealthContext';
import { useAuth } from '../../contexts/AuthContext';
import { HealthChallenge } from '../../types';
import { PlusIcon, HeartIcon, UserGroupIcon, XMarkIcon } from '@heroicons/react/24/solid';

const ChallengeModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { createHealthChallenge } = useHealth();
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleCreate = async () => {
        if (!title || !description) {
            alert("Judul dan deskripsi harus diisi.");
            return;
        }
        setIsLoading(true);
        await createHealthChallenge({ title, description });
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Buat Tantangan Baru</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                    <input type="text" placeholder="Judul Tantangan (e.g., Tantangan Yoga 7 Hari)" value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    <textarea value={description} onChange={e => setDescription(e.target.value)} rows={3} placeholder="Deskripsi singkat tentang tantangan..." className="w-full p-2 bg-surface-light rounded border border-border-color"></textarea>
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Batal</button>
                    <button onClick={handleCreate} disabled={isLoading} className="btn-primary px-4 py-2 rounded w-36 flex justify-center">
                        {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Buat Tantangan'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const HrWellnessManagement: React.FC = () => {
    const { user } = useAuth();
    const { healthChallenges } = useHealth();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const branchChallenges = healthChallenges.filter(c => typeof c.creator !== 'string' && c.creator.branch === user?.profile.branch);
    const systemChallenges = healthChallenges.filter(c => c.creator === 'System');

    const renderChallengeList = (title: string, challenges: HealthChallenge[]) => (
         <div className="bg-surface p-4 rounded-lg border border-border-color">
            <h2 className="text-xl font-bold mb-4">{title}</h2>
            {challenges.length > 0 ? (
                <div className="space-y-3">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="bg-surface-light p-3 rounded-lg">
                            <h3 className="font-bold text-text-primary">{challenge.title}</h3>
                            <p className="text-xs text-text-secondary">{challenge.description}</p>
                            <div className="mt-2 flex items-center text-sm">
                                <UserGroupIcon className="h-4 w-4 mr-1 text-primary"/>
                                <span className="font-semibold">{challenge.participants.length}</span>
                                <span className="text-text-secondary ml-1">Peserta</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-text-secondary text-center py-4">Tidak ada tantangan dalam kategori ini.</p>
            )}
        </div>
    );

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary flex items-center"><HeartIcon className="h-8 w-8 mr-2"/> Manajemen Kebugaran</h1>
                <button onClick={() => setIsModalOpen(true)} className="btn-primary flex items-center px-4 py-2 rounded-lg font-bold">
                    <PlusIcon className="h-5 w-5 mr-2" />
                    Buat Tantangan
                </button>
            </div>
            
            <p className="text-text-secondary">Buat dan kelola program serta tantangan kesehatan untuk meningkatkan keterlibatan dan kesejahteraan karyawan di cabang Anda.</p>

            {renderChallengeList(`Tantangan Cabang ${user?.profile.branch}`, branchChallenges)}
            {renderChallengeList("Tantangan Sistem (Global)", systemChallenges)}

            <ChallengeModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default HrWellnessManagement;