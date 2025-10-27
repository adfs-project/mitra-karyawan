import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronRightIcon, PencilSquareIcon, HeartIcon, BuildingStorefrontIcon, BanknotesIcon, ArrowRightOnRectangleIcon, BookmarkIcon, DocumentTextIcon, BriefcaseIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Role } from '../../types';

const MyAccountScreen: React.FC = () => {
    const { user, logout } = useAuth();

    if (!user) return null;

    const menuItems = [
        { name: 'Edit Profil', icon: PencilSquareIcon, path: '#' },
        { name: 'Riwayat Konsultasi', icon: DocumentTextIcon, path: '/my-consultations' },
        { name: 'Wishlist Saya', icon: HeartIcon, path: '/wishlist' },
        { name: 'Toko Saya', icon: BuildingStorefrontIcon, path: '/my-products' },
        { name: 'Artikel Tersimpan', icon: BookmarkIcon, path: '/bookmarked-articles' },
        { name: 'Aplikasi PayLater', icon: BanknotesIcon, path: '#' },
    ];
    
    const hrMenuItem = { name: 'Portal HR', icon: BriefcaseIcon, path: '/hr-portal' };

    return (
        <div className="pb-4">
            <div className="bg-surface p-6 flex justify-between items-center">
                <div className="flex items-center space-x-4">
                    <img src={user.profile.photoUrl} alt="Profile" className="w-20 h-20 rounded-full border-2 border-primary" />
                    <div>
                        <h1 className="text-2xl font-bold text-text-primary">{user.profile.name}</h1>
                        <p className="text-text-secondary">{user.email}</p>
                    </div>
                </div>
            </div>
            
            <div className="m-4 bg-surface rounded-lg border border-border-color">
                {user.role === Role.HR && (
                     <Link to={hrMenuItem.path} key={hrMenuItem.name} className="flex justify-between items-center p-4 w-full text-left border-b border-border-color bg-primary/10 hover:bg-primary/20">
                        <div className="flex items-center">
                            <hrMenuItem.icon className="h-6 w-6 text-primary mr-4" />
                            <span className="text-primary font-bold">{hrMenuItem.name}</span>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-primary" />
                    </Link>
                )}
                {menuItems.map((item, index) => (
                    <Link to={item.path} key={item.name} className={`flex justify-between items-center p-4 w-full text-left ${index < menuItems.length - 1 ? 'border-b border-border-color' : ''} hover:bg-surface-light`}>
                        <div className="flex items-center">
                            <item.icon className="h-6 w-6 text-primary mr-4" />
                            <span className="text-text-primary">{item.name}</span>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-text-secondary" />
                    </Link>
                ))}
            </div>

             <div className="m-4">
                <button 
                    onClick={logout} 
                    className="w-full flex items-center justify-center p-4 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-colors"
                >
                    <ArrowRightOnRectangleIcon className="h-6 w-6 mr-2" />
                    Logout
                </button>
            </div>
        </div>
    );
};

export default MyAccountScreen;