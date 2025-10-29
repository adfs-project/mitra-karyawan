import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Role, UserProfile } from '../types';
import { initialUsers } from '../data/mockData';

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<'success' | '2fa_required' | 'not_found' | 'inactive' | 'incorrect_password'>;
    verify2FA: (otp: string) => Promise<'success' | 'failed'>;
    logout: () => void;
    register: (userData: Omit<User, 'id' | 'role' | 'status' | 'wallet' | 'achievements' | 'loyaltyPoints' | 'wishlist' | 'bookmarkedArticles' | 'healthData'>) => Promise<'success' | 'exists'>;
    updateCurrentUser: (updatedUser: User) => void;
    createEmployee: (employeeData: {
        email: string;
        password: string;
        profile: Omit<UserProfile, 'photoUrl' | 'branch'>;
    }) => Promise<'success' | 'exists'>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<'success' | 'incorrect_password'>;
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
    const [pendingOTP, setPendingOTP] = useState<string | null>(null);

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

        // --- NEW: 2FA FOR ALL USERS ---
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setPendingLogin(foundUser);
        setPendingOTP(otp);

        // Simulate sending email with OTP
        console.log(`[SIMULASI EMAIL] Kode OTP untuk ${foundUser.email} adalah: ${otp}`);
        // For development convenience, show an alert.
        alert(`[SIMULASI] Kode OTP untuk ${foundUser.email} adalah: ${otp}\n(Cek console untuk melihat kode ini lagi)`);

        return '2fa_required';
    };
    
    const verify2FA = async (otp: string): Promise<'success' | 'failed'> => {
        // In a real app, this OTP would be verified against a service.
        // For this simulation, we compare it with the generated one.
        if (pendingLogin && pendingOTP && otp === pendingOTP) {
            setUser(pendingLogin);
            sessionStorage.setItem('loggedInUser', JSON.stringify(pendingLogin));
            setPendingLogin(null);
            setPendingOTP(null);
            return 'success';
        }
        return 'failed';
    };

    const logout = () => {
        setUser(null);
        sessionStorage.removeItem('loggedInUser');
        setPendingLogin(null);
        setPendingOTP(null);
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

    const createEmployee = async (employeeData: {
        email: string;
        password: string;
        profile: Omit<UserProfile, 'photoUrl' | 'branch'>;
    }): Promise<'success' | 'exists'> => {
        if (!user || user.role !== Role.HR) {
            throw new Error("Only HR users can create new employees.");
        }
        if (users.some(u => u.email.toLowerCase() === employeeData.email.toLowerCase())) {
            return 'exists';
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            email: employeeData.email,
            password: employeeData.password,
            role: Role.User,
            status: 'active',
            profile: {
                ...employeeData.profile,
                branch: user.profile.branch, // Automatically assign the HR's branch
                photoUrl: `https://i.pravatar.cc/150?u=${employeeData.email}`,
            },
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

    const changePassword = async (currentPassword: string, newPassword:string): Promise<'success' | 'incorrect_password'> => {
        if (!user) {
            return 'incorrect_password'; // Should not happen
        }
        if (user.password !== currentPassword) {
            return 'incorrect_password';
        }

        const updatedUser: User = { ...user, password: newPassword };
        updateCurrentUser(updatedUser); // This handles all state and storage updates

        return 'success';
    };

    return (
        <AuthContext.Provider value={{ user, login, verify2FA, logout, register, updateCurrentUser, createEmployee, changePassword }}>
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