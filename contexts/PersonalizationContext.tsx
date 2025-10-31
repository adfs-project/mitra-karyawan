import React, { createContext, useState, useContext, useEffect, ReactNode, useCallback, useRef, useMemo } from 'react';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import { GoogleGenAI, Type } from '@google/genai';
import { useMarketplace } from '../hooks/useMarketplace';

interface PersonalizationContextType {
    interestProfiles: Record<string, string[]>;
    updateUserInterestProfile: (userId: string) => Promise<void>;
}

const PersonalizationContext = createContext<PersonalizationContextType | undefined>(undefined);

export const PersonalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { articles, users } = useApp(); 
    const { products } = useMarketplace();
    const [interestProfiles, setInterestProfiles] = useState<Record<string, string[]>>({});
    const [isUpdating, setIsUpdating] = useState<Record<string, boolean>>({});
    const isInitialMount = useRef(true);

    useEffect(() => {
        const storedProfiles = localStorage.getItem('app_interest_profiles');
        if (storedProfiles) {
            setInterestProfiles(JSON.parse(storedProfiles));
        }
    }, []);

    const updateUserInterestProfile = useCallback(async (userId: string) => {
        if (isUpdating[userId] || !users || !articles || !products) return;

        setIsUpdating(prev => ({ ...prev, [userId]: true }));

        const currentUser = users.find(u => u.id === userId);
        if (!currentUser) {
            setIsUpdating(prev => ({ ...prev, [userId]: false }));
            return;
        }

        const bookmarkedArticles = articles.filter(a => currentUser.bookmarkedArticles.includes(a.id));
        const wishlistedProducts = products.filter(p => currentUser.wishlist.includes(p.id));
        const likedArticles = articles.filter(a => a.likes.includes(currentUser.id));


        const interestSignals = [
            ...bookmarkedArticles.map(a => `Artikel: ${a.title} (Kategori: ${a.category})`),
            ...wishlistedProducts.map(p => `Produk: ${p.name} (Kategori: ${p.category})`),
            ...likedArticles.map(a => `Menyukai Artikel: ${a.title} (Kategori: ${a.category})`),
        ];
        
        if (interestSignals.length < 2) {
            setIsUpdating(prev => ({ ...prev, [userId]: false }));
            return;
        }

        const prompt = `Based on this user's recent activity (likes, bookmarks, wishlist), generate a JSON array of 5-7 concise, lowercase interest tags that describe them. Combine related concepts. Example output: ["health & fitness", "gadgets", "personal finance"]. User activity: ${interestSignals.slice(0, 10).join(', ')}`;
        
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                    }
                }
            });
            const newTags = JSON.parse(response.text);
            
            setInterestProfiles(prev => {
                const updatedProfiles = { ...prev, [userId]: newTags };
                localStorage.setItem('app_interest_profiles', JSON.stringify(updatedProfiles));
                return updatedProfiles;
            });

        } catch (error) {
            console.error("Failed to update user interest profile:", error);
        } finally {
            setIsUpdating(prev => ({ ...prev, [userId]: false }));
        }
    }, [isUpdating, users, articles, products]);

    const wishlistDeps = JSON.stringify(user?.wishlist);
    const bookmarksDeps = JSON.stringify(user?.bookmarkedArticles);
    const likesDeps = useMemo(() => {
        if (!user || !articles) return "[]";
        return JSON.stringify(articles.filter(a => a.likes.includes(user.id)).map(a => a.id).sort());
    }, [articles, user]);

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        if (user) {
            updateUserInterestProfile(user.id);
        }
    }, [wishlistDeps, bookmarksDeps, likesDeps, user, updateUserInterestProfile]);
    
    return (
        <PersonalizationContext.Provider value={{ interestProfiles, updateUserInterestProfile }}>
            {children}
        </PersonalizationContext.Provider>
    );
};

export const usePersonalization = (): PersonalizationContextType => {
    const context = useContext(PersonalizationContext);
    if (context === undefined) {
        throw new Error('usePersonalization must be used within a PersonalizationProvider');
    }
    return context;
};
