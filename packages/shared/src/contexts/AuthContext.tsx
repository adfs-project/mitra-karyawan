
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
        // Session persistence is handled by the vault service on initialization.
        // This effect can be used for other side-effects on auth state change if needed.
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

        const sanitizedUser = vaultService.getSanitizedData().users.find(u => u.id === foundUser.id)!;
        setUser(sanitizedUser);

        // --- STAGE 3: Application Redirection Logic ---
        const staffRoles = [Role.Admin, Role.HR, Role.Finance, 'Manager' as Role]; // Manager is not in Role enum, temp fix
        const isDevelopment = window.location.hostname === 'localhost';

        if (isDevelopment) {
            const employeeAppUrl = 'http://localhost:3000';
            const adminPortalUrl = 'http://localhost:3001';

            if (staffRoles.includes(foundUser.role)) {
                // If the user is staff but is on the employee app URL, redirect to admin portal
                if (window.location.origin !== adminPortalUrl) {
                    window.location.href = adminPortalUrl;
                    // Return a promise that never resolves to prevent further rendering on the old page
                    return new Promise(() => {});
                }
            } else { // User role
                // If the user is an employee but is on the admin portal URL, redirect to employee app
                if (window.location.origin !== employeeAppUrl) {
                    window.location.href = employeeAppUrl;
                    // Return a promise that never resolves
                    return new Promise(() => {});
                }
            }
        }
        // In production, you would have logic like:
        // if (staffRoles.includes(foundUser.role)) { window.location.href = 'https://portal.mitrakaryawan.com'; }
        // else { window.location.href = 'https://app.mitrakaryawan.com'; }
        
        return { result: 'success' };
    };

    const logout = () => {
        setUser(null);
        
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('app_')) {
                sessionStorage.removeItem(key);
            }
        });

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
        vaultService.addNewUser(newUser);
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
            password: hrData.password,
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
            password: financeData.password,
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
        vaultService.updateUser(updatedUser, true);

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
