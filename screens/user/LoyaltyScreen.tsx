
import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { StarIcon, ShoppingBagIcon, BanknotesIcon, TrophyIcon } from '@heroicons/react/24/solid';
import { Achievement } from '../../types';

const achievementDetails: Record<Achievement, { name: string; description: string; icon: React.ElementType }> = {
    'First Purchase': {
        name: 'Pembeli Pertama',
        description: 'Anda telah melakukan pembelian pertama di marketplace!',
        icon: ShoppingBagIcon,
    },
    'Punctual Payer': {
        name: 'Pembayar Tepat Waktu',
        description: 'Anda berhasil membayar tagihan PPOB pertama Anda.',
        icon: BanknotesIcon,
    },
    'Top Spender': {
        name: 'Top Spender',
        description: 'Diberikan kepada pengguna dengan pengeluaran tertinggi.',
        icon: TrophyIcon,
    },
};

const LoyaltyScreen: React.FC = () => {
    const { user } = useAuth();

    if (!user) return null;

    const allAchievements = Object.keys(achievementDetails) as Achievement[];

    return (
        <div className="p-4 space-y-6">
            <div className="text-center">
                <h1 className="text-3xl font-bold text-secondary">Program Loyalitas</h1>
                <p className="text-text-secondary mt-1">Dapatkan poin dan lencana dari setiap transaksi!</p>
            </div>

            <div className="bg-surface p-6 rounded-lg shadow-lg border border-secondary/50 text-center">
                <p className="text-text-secondary text-sm">Total Poin Anda</p>
                {/* FIX: Completed the JSX for displaying loyalty points which was cut off in the original file. */}
                <div className="flex items-center justify-center space-x-2 my-2">
                    <StarIcon className="h-8 w-8 text-secondary" />
                    <p className="text-4xl font-bold text-secondary">{user.loyaltyPoints.toLocaleString('id-ID')}</p>
                </div>
                <p className="text-xs text-text-secondary">Tukarkan poin dengan voucher & hadiah menarik!</p>
            </div>

            <div>
                <h2 className="text-lg font-bold text-text-primary mb-2">Pencapaian Anda</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {allAchievements.map(ach => {
                        const hasAchieved = user.achievements.includes(ach);
                        const details = achievementDetails[ach];
                        return (
                            <div key={ach} className={`p-4 rounded-lg border ${hasAchieved ? 'bg-secondary/20 border-secondary' : 'bg-surface border-border-color opacity-60'}`}>
                                <details.icon className={`h-8 w-8 mb-2 ${hasAchieved ? 'text-secondary' : 'text-text-secondary'}`} />
                                <h3 className="font-bold text-text-primary">{details.name}</h3>
                                <p className="text-xs text-text-secondary mt-1">{details.description}</p>
                            </div>
                        )
                    })}
                </div>
            </div>
        </div>
    );
};

export default LoyaltyScreen;
