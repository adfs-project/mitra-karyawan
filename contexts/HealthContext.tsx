import React, { createContext, useContext, ReactNode } from 'react';
import { Doctor, Consultation, MoodHistory, HealthChallenge, HealthDocument, Eprescription, InsuranceClaim, EprescriptionItem } from '../types';
import { useApp } from './AppContext';

// This is now a placeholder context. All functionality has been disabled.

interface HealthContextType {
    doctors: Doctor[];
    consultations: Consultation[];
    eprescriptions: Eprescription[];
    healthDocuments: HealthDocument[];
    healthChallenges: HealthChallenge[];
    insuranceClaims: InsuranceClaim[];
    addDoctor: (data: Omit<Doctor, 'id' | 'availableSlots'>) => void;
    updateDoctor: (data: Doctor) => void;
    deleteDoctor: (doctorId: string) => void;
    bookConsultation: (doctorId: string, slotTime: string) => Promise<{ success: boolean; message: string; consultationId?: string }>;
    endConsultation: (consultationId: string, chatSummary: string, prescriptionItems?: EprescriptionItem[]) => Promise<void>;
    addMoodEntry: (mood: MoodHistory['mood']) => void;
    joinHealthChallenge: (challengeId: string) => void;
    createHealthChallenge: (challenge: { title: string; description: string }) => Promise<void>;
    addHealthDocument: (doc: { name: string; fileUrl: string }) => Promise<void>;
    deleteHealthDocument: (docId: string) => void;
    submitInsuranceClaim: (claim: { type: InsuranceClaim['type']; amount: number; receiptUrl: string; }) => Promise<void>;
    approveInsuranceClaim: (claimId: string) => Promise<void>;
    rejectInsuranceClaim: (claimId: string) => Promise<void>;
    subscribeToHealthPlus: () => Promise<void>;
    redeemEprescription: (eprescriptionId: string) => Promise<{ success: boolean; message: string; }>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { showToast } = useApp();

    const disabledToast = () => {
        showToast("Fitur Kesehatan saat ini dinonaktifkan.", "info");
    };
    
    const disabledPromise = async () => {
        disabledToast();
        return { success: false, message: 'Fitur dinonaktifkan.' };
    };
    
    const disabledVoidPromise = async () => {
        disabledToast();
    };

    const value: HealthContextType = {
        doctors: [],
        consultations: [],
        eprescriptions: [],
        healthDocuments: [],
        healthChallenges: [],
        insuranceClaims: [],
        addDoctor: disabledToast,
        updateDoctor: disabledToast,
        deleteDoctor: disabledToast,
        bookConsultation: disabledPromise,
        endConsultation: disabledVoidPromise,
        addMoodEntry: disabledToast,
        joinHealthChallenge: disabledToast,
        createHealthChallenge: disabledVoidPromise,
        addHealthDocument: disabledVoidPromise,
        deleteHealthDocument: disabledToast,
        submitInsuranceClaim: disabledVoidPromise,
        approveInsuranceClaim: disabledVoidPromise,
        rejectInsuranceClaim: disabledVoidPromise,
        subscribeToHealthPlus: disabledVoidPromise,
        redeemEprescription: disabledPromise,
    };

    return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
};

export const useHealth = (): HealthContextType => {
    const context = useContext(HealthContext);
    if (context === undefined) throw new Error('useHealth must be used within a HealthProvider');
    return context;
};
