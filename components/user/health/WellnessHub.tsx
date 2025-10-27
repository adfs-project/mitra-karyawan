import React from 'react';
import { useAuth } from '../../../contexts/AuthContext';
import { useData } from '../../../contexts/DataContext';
import { TrophyIcon, BookOpenIcon, SparklesIcon, FireIcon, UserGroupIcon } from '@heroicons/react/24/solid';

const moodOptions = ['Sangat Sedih', 'Sedih', 'Biasa', 'Senang', 'Sangat Senang'];
const moodIcons = ['😔', '😕', '😐', '😊', '😄'];

const WellnessHub: React.FC = () => {
    const { user } = useAuth();
    // In a real app, challenges would come from useData
    const challenges = [
        { id: 'steps-challenge', title: 'Tantangan 10.000 Langkah', description: 'Jalan 10.000 langkah setiap hari selama seminggu.', participants: [{userName: 'Budi Karyawan', progress: 60}, {userName: 'Super Admin', progress: 85}] },
    ];

    return (
        <div className="space-y-6">
            <div className="bg-surface p-4 rounded-lg">
                <h3 className="text-lg font-bold flex items-center mb-4">
                    <TrophyIcon className="h-5 w-5 mr-2 text-primary" />
                    Tantangan Kesehatan
                </h3>
                <div className="space-y-4">
                    {challenges.map(challenge => (
                        <div key={challenge.id} className="bg-surface-light p-4 rounded-lg">
                            <h4 className="font-bold text-text-primary">{challenge.title}</h4>
                            <p className="text-xs text-text-secondary">{challenge.description}</p>
                            <div className="mt-2">
                                <p className="text-sm font-semibold flex items-center"><UserGroupIcon className="h-4 w-4 mr-1"/> Papan Peringkat</p>
                                <ul className="text-xs space-y-1 mt-1">
                                    {challenge.participants.sort((a,b) => b.progress - a.progress).map(p => (
                                         <li key={p.userName} className="flex justify-between items-center">
                                            <span>{p.userName}</span>
                                            <span className="font-bold">{p.progress}%</span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                             <button className="w-full mt-3 btn-secondary py-1 rounded-full text-sm font-bold">
                                Ikut Tantangan
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            <div className="bg-surface p-4 rounded-lg">
                <h3 className="text-lg font-bold flex items-center mb-4">
                    <BookOpenIcon className="h-5 w-5 mr-2 text-primary" />
                    Jurnal Suasana Hati
                </h3>
                <p className="text-sm text-text-secondary mb-3">Bagaimana perasaan Anda hari ini?</p>
                <div className="flex justify-around">
                    {moodIcons.map((icon, index) => (
                        <button key={moodOptions[index]} title={moodOptions[index]} className="text-3xl p-2 rounded-full hover:bg-surface-light transition-transform hover:scale-125">
                            {icon}
                        </button>
                    ))}
                </div>
            </div>

            <div className="bg-surface p-4 rounded-lg">
                <h3 className="text-lg font-bold flex items-center mb-2">
                    <SparklesIcon className="h-5 w-5 mr-2 text-primary" />
                    Pojok Relaksasi
                </h3>
                <p className="text-sm text-text-secondary mb-3">Ambil waktu sejenak untuk menenangkan pikiran Anda.</p>
                <div className="space-y-2">
                    <button className="w-full text-left p-3 bg-surface-light rounded-lg hover:bg-primary/20">Meditasi Terpandu (5 Menit)</button>
                    <button className="w-full text-left p-3 bg-surface-light rounded-lg hover:bg-primary/20">Latihan Pernapasan</button>
                </div>
            </div>
        </div>
    );
};

export default WellnessHub;