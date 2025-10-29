import React from 'react';
import { ShieldCheckIcon } from '@heroicons/react/24/solid';

const AiPersonalizedFeed: React.FC<{ onOpenComments: (article: any) => void }> = ({ onOpenComments }) => {

    return (
        <div className="text-center p-8 bg-surface rounded-lg border border-border-color">
            <ShieldCheckIcon className="h-12 w-12 text-primary mx-auto" />
            <h3 className="mt-4 text-lg font-bold text-text-primary">Privasi Anda Terjaga</h3>
            <p className="mt-2 text-text-secondary text-sm max-w-sm mx-auto">
                Untuk melindungi privasi Anda, AI kami tidak mengakses data pribadi Anda untuk membuat feed yang dipersonalisasi. Silakan lihat tab "Global" untuk berita terbaru.
            </p>
        </div>
    );
};

export default AiPersonalizedFeed;