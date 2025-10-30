import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { User, Role, UserProfile } from '../types';
import vaultService from '../services/vaultService';

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
    const [pendingLogin, setPendingLogin] = useState<User | null>(null);
    const [pendingOTP, setPendingOTP] = useState<string | null>(null);

    useEffect(() => {
        const loggedInUser = sessionStorage.getItem('loggedInUser');
        if (loggedInUser) {
            const parsedUser = JSON.parse(loggedInUser);
            // We only store the sanitized user in session storage for safety.
            // On reload, this is sufficient for the UI until DataContext provides full sanitized data.
            setUser(parsedUser);
        }
    }, []);

    const login = async (email: string, password: string): Promise<'success' | '2fa_required' | 'not_found' | 'inactive' | 'incorrect_password'> => {
        const foundUser = vaultService.findUserByEmail(email);
        
        if (!foundUser) {
            return 'not_found';
        }

        if (!vaultService.verifyPassword(foundUser, password)) {
            return 'incorrect_password';
        }

        if (foundUser.status === 'inactive') {
            return 'inactive';
        }

        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        setPendingLogin(foundUser);
        setPendingOTP(otp);

        console.log(`[SIMULASI EMAIL] Kode OTP untuk ${foundUser.email} adalah: ${otp}`);
        alert(`[SIMULASI] Kode OTP untuk ${foundUser.email} adalah: ${otp}\n(Cek console untuk melihat kode ini lagi)`);

        return '2fa_required';
    };
    
    const verify2FA = async (otp: string): Promise<'success' | 'failed'> => {
        if (pendingLogin && pendingOTP && otp === pendingOTP) {
            const sanitizedUser = vaultService.getSanitizedData().users.find(u => u.id === pendingLogin.id)!;
            setUser(sanitizedUser);
            sessionStorage.setItem('loggedInUser', JSON.stringify(sanitizedUser));
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
        
        const allUserEmails = new Set(vaultService.getSanitizedData().users.map(u => u.email.toLowerCase()));

        for (const employeeData of employeesData) {
            if (allUserEmails.has(employeeData.email.toLowerCase())) {
                failed++;
                errors.push(`Email already exists: ${employeeData.email}`);
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
            allUserEmails.add(newUser.email.toLowerCase()); 
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
             sessionStorage.setItem('loggedInUser', JSON.stringify(sanitizedUser));
        }
    };

    const changePassword = async (currentPassword: string, newPassword:string): Promise<'success' | 'incorrect_password'> => {
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
        <AuthContext.Provider value={{ user, login, verify2FA, logout, register, updateCurrentUser, createEmployee, createMultipleEmployeesByHr, createHrAccountByAdmin, createFinanceAccountByAdmin, changePassword }}>
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