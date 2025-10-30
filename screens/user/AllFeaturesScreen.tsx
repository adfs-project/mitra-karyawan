import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
    ArrowLeftIcon, 
    BoltIcon, 
    BuildingLibraryIcon, 
    TicketIcon,
    DevicePhoneMobileIcon,
    CreditCardIcon,
    ShoppingBagIcon
} from '@heroicons/react/24/solid';

const features = [
    { name: 'PPOB & Tagihan', path: '/ppob', icon: BoltIcon, description: 'Bayar listrik, air, internet, dll.' },
    { name: 'Layanan Pemerintah', path: '/government-services', icon: BuildingLibraryIcon, description: 'Bayar PBB, e-Samsat, & lainnya.' },
    { name: 'Gaya Hidup', path: '/lifestyle', icon: TicketIcon, description: 'Tiket bioskop, voucher game, & donasi.' },
    { name: 'Pulsa & Data', path: '/mobile-topup', icon: DevicePhoneMobileIcon, description: 'Isi ulang pulsa & paket data.' },
    { name: 'Tarik Tunai', path: '/cash-out', icon: CreditCardIcon, description: 'Ambil uang tunai di ATM & retail.' },
    { name: 'Belanja Harian', path: '/daily-needs', icon: ShoppingBagIcon, description: 'Kebutuhan harian dari Koperasi.' },
];

const AllFeaturesScreen: React.FC = () => {
    const navigate = useNavigate();

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Semua Layanan</h1>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {features.map((feature) => (
                    <Link
                        key={feature.name}
                        to={feature.path}
                        className="bg-surface p-4 rounded-lg border border-border-color hover:border-primary hover:bg-surface-light transition-all flex items-center space-x-4"
                    >
                        <feature.icon className="h-10 w-10 text-primary flex-shrink-0" />
                        <div>
                            <h2 className="font-bold text-text-primary">{feature.name}</h2>
                            <p className="text-sm text-text-secondary">{feature.description}</p>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default AllFeaturesScreen;