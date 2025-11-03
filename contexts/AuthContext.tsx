import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Role, UserProfile } from '../types';
import vaultService from '../services/vaultService';

type LoginResult = { result: 'success' | 'not_found' | 'inactive' | 'incorrect_password' };


interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<LoginResult>;
    logout: () => void;
    register: (userData: Omit<User, 'id' | 'role' | 'status' | 'wallet' | 'achievements' | 'loyaltyPoints' | 'wishlist' | 'bookmarkedArticles' | 'healthData'>) => Promise<'success' | 'exists'>;
    updateCurrentUser: (updatedUser: User) => void;
    createEmployee: (employeeData: {
        email: string;
        password: string;
        profile: Omit<UserProfile, 'photoUrl' | 'branch'>;
    }) => Promise<'success' | 'exists'>;
    createMultipleEmployeesByHr: (employeesData: {
        email: string;
        password: string;
        profile: Omit<UserProfile, 'photoUrl' | 'branch'>;
    }[]) => Promise<{ success: number; failed: number; errors: string[] }>;
    createHrAccountByAdmin: (hrData: {
        email: string;
        password: string;
        profile: Omit<UserProfile, 'photoUrl'>;
    }) => Promise<'success' | 'exists' | 'unauthorized'>;
    createFinanceAccountByAdmin: (financeData: {
        email: string;
        password: string;
        profile: Omit<UserProfile, 'photoUrl'>;
    }) => Promise<'success' | 'exists' | 'unauthorized'>;
    changePassword: (currentPassword: string, newPassword: string) => Promise<'success' | 'incorrect_password'>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);

    useEffect(() => {
        // Temporarily disabled session persistence
        // const loggedInUser = sessionStorage.getItem('loggedInUser');
        // if (loggedInUser) {
        //     const parsedUser = JSON.parse(loggedInUser);
        //     // We only store the sanitized user in session storage for safety.
        //     // On reload, this is sufficient for the UI until DataContext provides full sanitized data.
        //     setUser(parsedUser);
        // }
    }, []);

    const login = async (email: string, password: string): Promise<LoginResult> => {
        const foundUser = vaultService.findUserByEmail(email);
        
        if (!foundUser) {
            return { result: 'not_found' };
        }

        if (!vaultService.verifyPassword(foundUser, password)) {
            return { result: 'incorrect_password' };
        }

        if (foundUser.status === 'inactive') {
            return { result: 'inactive' };
        }

        // OTP is removed. Directly log in the user.
        const sanitizedUser = vaultService.getSanitizedData().users.find(u => u.id === foundUser.id)!;
        setUser(sanitizedUser);
        
        return { result: 'success' };
    };

    const logout = () => {
        setUser(null);
        
        // As per user request, clear all persisted application data upon logout
        // to ensure no changes from the session are saved.
        Object.keys(localStorage).forEach(key => {
            if (key.startsWith('app_')) {
                localStorage.removeItem(key);
            }
        });

        // Force a full application reload to re-initialize the vault with initial mock data.
        window.location.reload();
    };

    const register = async (userData: Omit<User, 'id' | 'role' | 'status' | 'wallet' | 'achievements' | 'loyaltyPoints' | 'wishlist' | 'bookmarkedArticles' | 'healthData'>): Promise<'success' | 'exists'> => {
        if (vaultService.findUserByEmail(userData.email)) {
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
        vaultService.addNewUser(newUser); // Handles hashing and saving
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
        if (vaultService.findUserByEmail(employeeData.email)) {
            return 'exists';
        }

        const newUser: User = {
            id: `user-${Date.now()}`,
            email: employeeData.email,
            password: employeeData.password, // Will be hashed by vault
            role: Role.User,
            status: 'active',
            profile: {
                ...employeeData.profile,
                branch: user.profile.branch,
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
        vaultService.addNewUser(newUser);
        return 'success';
    };

    const createMultipleEmployeesByHr = async (employeesData: {
        email: string;
        password: string;
        profile: Omit<UserProfile, 'photoUrl' | 'branch'>;
    }[]): Promise<{ success: number; failed: number; errors: string[] }> => {
        if (!user || user.role !== Role.HR) {
            throw new Error("Only HR users can create new employees.");
        }

        let success = 0;
        let failed = 0;
        const errors: string[] = [];
        const emailsInThisUpload = new Set<string>();

        for (const employeeData of employeesData) {
            const email = employeeData.email.toLowerCase();
            if (vaultService.findUserByEmail(email) || emailsInThisUpload.has(email)) {
                failed++;
                errors.push(`Email already exists or is duplicated in file: ${employeeData.email}`);
                continue;
            }

            const newUser: User = {
                id: `user-${Date.now()}-${success}`,
                email: employeeData.email,
                password: employeeData.password,
                role: Role.User,
                status: 'active',
                profile: {
                    ...employeeData.profile,
                    branch: user.profile.branch,
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
            vaultService.addNewUser(newUser);
            emailsInThisUpload.add(email); 
            success++;
        }

        return { success, failed, errors };
    };

    const createHrAccountByAdmin = async (hrData: {
        email: string;
        password: string;
        profile: Omit<UserProfile, 'photoUrl'>;
    }): Promise<'success' | 'exists' | 'unauthorized'> => {
        if (!user || user.role !== Role.Admin) {
            return 'unauthorized';
        }
        if (vaultService.findUserByEmail(hrData.email)) {
            return 'exists';
        }
    
        const newHrUser: User = {
            id: `hr-${Date.now()}`,
            email: hrData.email,
            password: hrData.password, // Will be hashed by vault
            role: Role.HR,
            status: 'active',
            profile: {
                ...hrData.profile,
                photoUrl: `https://i.pravatar.cc/150?u=${hrData.email}`,
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
        vaultService.addNewUser(newHrUser);
        return 'success';
    };

    const createFinanceAccountByAdmin = async (financeData: {
        email: string;
        password: string;
        profile: Omit<UserProfile, 'photoUrl'>;
    }): Promise<'success' | 'exists' | 'unauthorized'> => {
        if (!user || user.role !== Role.Admin) {
            return 'unauthorized';
        }
        if (vaultService.findUserByEmail(financeData.email)) {
            return 'exists';
        }
    
        const newFinanceUser: User = {
            id: `finance-${Date.now()}`,
            email: financeData.email,
            password: financeData.password, // Will be hashed by vault
            role: Role.Finance,
            status: 'active',
            profile: {
                ...financeData.profile,
                photoUrl: `https://i.pravatar.cc/150?u=${financeData.email}`,
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
        vaultService.addNewUser(newFinanceUser);
        return 'success';
    };
    
    const updateCurrentUser = (updatedUser: User) => {
        // This function now receives a sanitized user, but we need to update the real user in the vault.
        // We'll trust the caller isn't modifying sensitive data, as they don't have it.
        // Vault handles merging and saving correctly.
        const fullUser = vaultService.findUserByEmail(updatedUser.email);
        if (fullUser) {
             const mergedUser = {
                ...fullUser,
                ...updatedUser,
                profile: {
                    ...fullUser.profile,
                    ...updatedUser.profile
                }
             };
             vaultService.updateUser(mergedUser);
             const sanitizedUser = vaultService.getSanitizedData().users.find(u => u.id === mergedUser.id)!;
             setUser(sanitizedUser);
             // sessionStorage.setItem('loggedInUser', JSON.stringify(sanitizedUser)); // Temporarily disabled
        }
    };

    const changePassword = async (currentPassword: string, newPassword: string): Promise<'success' | 'incorrect_password'> => {
        if (!user) {
            return 'incorrect_password';
        }
        const fullUser = vaultService.findUserByEmail(user.email);
        if (!fullUser || !vaultService.verifyPassword(fullUser, currentPassword)) {
            return 'incorrect_password';
        }

        const updatedUser: User = { ...fullUser, password: newPassword };
        vaultService.updateUser(updatedUser, true); // true to hash the new password

        return 'success';
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateCurrentUser, createEmployee, createMultipleEmployeesByHr, createHrAccountByAdmin, createFinanceAccountByAdmin, changePassword }}>
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