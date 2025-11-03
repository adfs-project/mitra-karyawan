import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { MoodHistory, HealthChallenge } from '../../types';
import { TrophyIcon, BookOpenIcon, SparklesIcon, FireIcon, UserGroupIcon } from '@heroicons/react/24/solid';


const moodOptions: MoodHistory['mood'][] = ['Sangat Sedih', 'Sedih', 'Biasa', 'Senang', 'Sangat Senang'];
const moodIcons = ['😔', '😕', '😐', '😊', '😄'];

const ChallengeCard: React.FC<{ challenge: HealthChallenge }> = ({ challenge }) => {
    const { joinHealthChallenge } = useData();
    const { user } = useAuth();

    const handleJoin = () => {
        joinHealthChallenge(challenge.id);
    };
    
    const isParticipant = challenge.participants.some(p => p.userId === user?.id);

    return (
        <div className="bg-surface-light p-4 rounded-lg">
            <h4 className="font-bold text-text-primary">{challenge.title}</h4>
            <p className="text-xs text-text-secondary">{challenge.description}</p>
            {challenge.participants.length > 0 && (
                 <div className="mt-2">
                    <p className="text-sm font-semibold flex items-center"><UserGroupIcon className="h-4 w-4 mr-1"/> {challenge.participants.length} Peserta</p>
                </div>
            )}
            <button 
                onClick={handleJoin} 
                disabled={isParticipant}
                className="w-full mt-3 btn-secondary py-1 rounded-full text-sm font-bold disabled:bg-gray-600 disabled:cursor-not-allowed"
            >
                {isParticipant ? 'Telah Bergabung' : 'Ikut Tantangan'}
            </button>
        </div>
    );
};

const WellnessHub: React.FC = () => {
    const { user } = useAuth();
    const { addMoodEntry, healthChallenges, addNotification } = useData();

    const handleMoodClick = (mood: MoodHistory['mood']) => {
        addMoodEntry(mood);
    };
    
    const handleRelaxationClick = () => {
        addNotification(user!.id, 'Sesi relaksasi dimulai.', 'info');
    }

    return (
        <div className="space-y-6">
            <div className="bg-surface p-4 rounded-lg">
                <h3 className="text-lg font-bold flex items-center mb-4">
                    <TrophyIcon className="h-5 w-5 mr-2 text-primary" />
                    Tantangan Kesehatan Perusahaan
                </h3>
                <div className="space-y-4">
                    {healthChallenges.length > 0 ? (
                        healthChallenges.map(challenge => (
                            <ChallengeCard key={challenge.id} challenge={challenge} />
                        ))
                    ) : (
                        <p className="text-sm text-center text-text-secondary py-4">Belum ada tantangan yang tersedia saat ini.</p>
                    )}
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
                        <button key={moodOptions[index]} title={moodOptions[index]} onClick={() => handleMoodClick(moodOptions[index])} className="text-3xl p-2 rounded-full hover:bg-surface-light transition-transform hover:scale-125">
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
                    <button onClick={handleRelaxationClick} className="w-full text-left p-3 bg-surface-light rounded-lg hover:bg-primary/20">Meditasi Terpandu (5 Menit)</button>
                    <button onClick={handleRelaxationClick} className="w-full text-left p-3 bg-surface-light rounded-lg hover:bg-primary/20">Latihan Pernapasan</button>
                </div>
            </div>
        </div>
    );
};

export default WellnessHub;