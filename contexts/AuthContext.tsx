import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Role } from '../types';
import { initialUsers } from '../data/mockData';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<'success' | '2fa_required' | 'not_found' | 'inactive' | 'incorrect_password'>;
    verify2FA: (otp: string) => Promise<'success' | 'failed'>;
    logout: () => void;
    register: (userData: Omit<User, 'id' | 'role' | 'status' | 'wallet' | 'achievements' | 'loyaltyPoints' | 'wishlist' | 'bookmarkedArticles' | 'healthData'>) => Promise<'success' | 'exists'>;
    updateCurrentUser: (updatedUser: User) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [users, setUsers] = useState<User[]>(() => {
        try {
            const storedUsers = localStorage.getItem('app_users');
            return storedUsers ? JSON.parse(storedUsers) : initialUsers;
        } catch (error) {
            return initialUsers;
        }
    });
    const [pendingLogin, setPendingLogin] = useState<User | null>(null);

    useEffect(() => {
        localStorage.setItem('app_users', JSON.stringify(users));
    }, [users]);
    
    useEffect(() => {
        const loggedInUser = sessionStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            // Sync with latest user data from "DB"
            const latestUserData = users.find(u => u.id === parsedUser.id);
            if (latestUserData) {
                setUser(latestUserData);
                sessionStorage.setItem('loggedInUser', JSON.stringify(latestUserData));
            } else {
                 // User might have been deleted, log them out
                 logout();
            }
        }
    }, [users]);

    const login = async (email: string, password: string): Promise<'success' | '2fa_required' | 'not_found' | 'inactive' | 'incorrect_password'> => {
        const foundUser = users.find(u => u.email.toLowerCase() === email.toLowerCase());
        if (!foundUser) {
            return 'not_found';
        }
        if (foundUser.password !== password) {
            return 'incorrect_password';
        }
        if (foundUser.status === 'inactive') {
            return 'inactive';
        }

        if (foundUser.role === Role.Admin || foundUser.role === Role.HR) {
            setPendingLogin(foundUser);
            return '2fa_required';
        }
        
        setUser(foundUser);
        sessionStorage.setItem('loggedInUser', JSON.stringify(foundUser));
        return 'success';
    };
    
    const verify2FA = async (otp: string): Promise<'success' | 'failed'> => {
        // In a real app, this OTP would be verified against a service like Google Authenticator.
        // For this simulation, any 6-digit code is accepted.
        if (pendingLogin && otp.length === 6 && /^\d+$/.test(otp)) {
            setUser(pendingLogin);
            sessionStorage.setItem('loggedInUser', JSON.stringify(pendingLogin));
            setPendingLogin(null);
            return 'success';
        }
        return 'failed';
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('loggedInUser');
    };

    const register = async (userData: Omit<User, 'id' | 'role' | 'status' | 'wallet' | 'achievements' | 'loyaltyPoints' | 'wishlist' | 'bookmarkedArticles' | 'healthData'>): Promise<'success' | 'exists'> => {
        if (users.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
            return 'exists';
        }
        const newUser: User = {
            ...userData,
            id: `user-${Date.now()}`,
            role: Role.User,
            status: 'active',
            wallet: { balance: 0, isFrozen: false },
            achievements: [],
            loyaltyPoints: 0,
            wishlist: [],
            bookmarkedArticles: [],
            healthData: {
                moodHistory: [],
                activeChallenges: []
            }
        };
        setUsers(prevUsers => [...prevUsers, newUser]);
        return 'success';
    };
    
    const updateCurrentUser = (updatedUser: User) => {
        setUser(updatedUser);
        setUsers(prev => prev.map(u => u.id === updatedUser.id ? updatedUser : u));
        sessionStorage.setItem('loggedInUser', JSON.stringify(updatedUser));
    };

    return (
        <AuthContext.Provider value={{ user, login, verify2FA, logout, register, updateCurrentUser }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};