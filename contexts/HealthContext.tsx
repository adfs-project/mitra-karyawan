import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { Doctor, Consultation, Eprescription, EprescriptionItem, MoodHistory, HealthDocument, HealthChallenge, InsuranceClaim, User } from '../types';
import vaultService from '../services/vaultService';
import { useAuth } from './AuthContext';
import { useCore } from './DataContext';
import { useApp } from './AppContext';

type HealthData = {
    doctors: Doctor[];
    consultations: Consultation[];
    eprescriptions: Eprescription[];
    healthDocuments: HealthDocument[];
    healthChallenges: HealthChallenge[];
    insuranceClaims: InsuranceClaim[];
};

interface HealthContextType extends HealthData {
    bookConsultation: (doctorId: string, slotTime: string) => Promise<{ success: boolean; message: string; consultationId?: string }>;
    addDoctor: (data: Omit<Doctor, 'id' | 'availableSlots'>) => void;
    updateDoctor: (doctor: Doctor) => void;
    deleteDoctor: (doctorId: string) => void;
    addMoodEntry: (mood: MoodHistory['mood']) => void;
    joinHealthChallenge: (challengeId: string) => void;
    createHealthChallenge: (challengeData: { title: string, description: string }) => Promise<void>;
    addHealthDocument: (docData: { name: string; fileUrl: string; }) => Promise<void>;
    deleteHealthDocument: (docId: string) => void;
    submitInsuranceClaim: (claimData: { type: InsuranceClaim['type']; amount: number; receiptUrl: string; }) => Promise<void>;
    approveInsuranceClaim: (claimId: string) => Promise<void>;
    rejectInsuranceClaim: (claimId: string) => Promise<void>;
    redeemPrescription: (prescriptionId: string, totalCost: number) => Promise<{ success: boolean; message: string }>;
    subscribeToHealthPlus: () => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateCurrentUser } = useAuth();
    const { addTransaction, addNotification } = useCore();
    const { showToast } = useApp();

    const [healthData, setHealthData] = useState<HealthData>({
        doctors: vaultService.getSanitizedData().doctors,
        consultations: vaultService.getSanitizedData().consultations,
        eprescriptions: vaultService.getSanitizedData().eprescriptions,
        healthDocuments: vaultService.getSanitizedData().healthDocuments,
        healthChallenges: vaultService.getSanitizedData().healthChallenges,
        insuranceClaims: vaultService.getSanitizedData().insuranceClaims,
    });

    const updateState = <K extends keyof HealthData>(key: K, value: HealthData[K]) => {
        vaultService.setData(key, value as any);
        setHealthData(prev => ({ ...prev, [key]: value }));
    };

    const addDoctor = (data: Omit<Doctor, 'id' | 'availableSlots'>) => {
        const newDoctor: Doctor = {
            ...data,
            id: `doc-${Date.now()}`,
            availableSlots: [{ time: '09:00', isBooked: false }, { time: '10:00', isBooked: false }, { time: '11:00', isBooked: false }, { time: '13:00', isBooked: false }, { time: '14:00', isBooked: false }],
        };
        updateState('doctors', [...healthData.doctors, newDoctor]);
        showToast('Health provider added successfully.', 'success');
    };

    const updateDoctor = (doctor: Doctor) => {
        updateState('doctors', healthData.doctors.map(d => d.id === doctor.id ? doctor : d));
        showToast('Health provider updated successfully.', 'success');
    };

    const deleteDoctor = (doctorId: string) => {
        updateState('doctors', healthData.doctors.filter(d => d.id !== doctorId));
        showToast('Health provider removed.', 'success');
    };

    const bookConsultation = async (doctorId: string, slotTime: string): Promise<{ success: boolean; message: string; consultationId?: string }> => {
        if (!user) return { success: false, message: 'You must be logged in.' };
        const doctor = healthData.doctors.find(d => d.id === doctorId);
        if (!doctor) return { success: false, message: 'Doctor not found.' };

        const txResult = await addTransaction({
            userId: user.id,
            type: 'Teleconsultation',
            amount: -doctor.consultationFee,
            description: `Consultation fee for Dr. ${doctor.name}`,
            status: 'Completed',
        });

        if (!txResult.success) {
            return { success: false, message: `Payment failed: ${txResult.message}` };
        }

        const newConsultation: Consultation = {
            id: `cons-${Date.now()}`,
            userId: user.id,
            userName: user.profile.name,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            scheduledTime: new Date().toISOString(), // In a real app, this would be the actual slot time
            status: 'Scheduled',
        };
        updateState('consultations', [...healthData.consultations, newConsultation]);

        const newDoctors = healthData.doctors.map(d => {
            if (d.id === doctorId) {
                return { ...d, availableSlots: d.availableSlots.map(s => s.time === slotTime ? { ...s, isBooked: true } : s) };
            }
            return d;
        });
        updateState('doctors', newDoctors);

        return { success: true, message: 'Booking successful!', consultationId: newConsultation.id };
    };

    const addMoodEntry = (mood: MoodHistory['mood']) => {
        if (!user) return;
        const newEntry: MoodHistory = { date: new Date().toISOString().split('T')[0], mood };
        const newHistory = [...user.healthData.moodHistory.filter(h => h.date !== newEntry.date), newEntry];
        updateCurrentUser({ ...user, healthData: { ...user.healthData, moodHistory: newHistory } });
        showToast('Mood for today recorded.', 'success');
    };
    
    const joinHealthChallenge = (challengeId: string) => {
        if (!user) return;
        const newChallenges = healthData.healthChallenges.map(c => {
            if (c.id === challengeId && !c.participants.some(p => p.userId === user.id)) {
                return { ...c, participants: [...c.participants, { userId: user.id, progress: 0 }] };
            }
            return c;
        });
        updateState('healthChallenges', newChallenges);
        showToast('You have joined the challenge!', 'success');
    };

    const createHealthChallenge = async (challengeData: { title: string, description: string }) => {
        if (!user) return;
        const newChallenge: HealthChallenge = {
            id: `hc-${Date.now()}`,
            ...challengeData,
            creator: { hrId: user.id, branch: user.profile.branch || 'N/A' },
            participants: []
        };
        updateState('healthChallenges', [newChallenge, ...healthData.healthChallenges]);
        showToast('New health challenge created.', 'success');
    };
    
    const addHealthDocument = async (docData: { name: string; fileUrl: string; }) => {
        if (!user) return;
        const newDoc: HealthDocument = {
            ...docData,
            id: `doc-${Date.now()}`,
            userId: user.id,
            uploadDate: new Date().toISOString(),
        };
        updateState('healthDocuments', [newDoc, ...healthData.healthDocuments]);
        showToast('Document uploaded successfully.', 'success');
    };

    const deleteHealthDocument = (docId: string) => {
        showToast("Penghapusan data inti dinonaktifkan secara permanen untuk melindungi integritas sistem.", 'warning');
    };
    
    const submitInsuranceClaim = async (claimData: { type: InsuranceClaim['type']; amount: number; receiptUrl: string; }) => {
        if (!user) return;
        const newClaim: InsuranceClaim = {
            ...claimData,
            id: `claim-${Date.now()}`,
            userId: user.id,
            userName: user.profile.name,
            branch: user.profile.branch || 'N/A',
            submissionDate: new Date().toISOString(),
            status: 'Pending',
        };
        updateState('insuranceClaims', [newClaim, ...healthData.insuranceClaims]);
        showToast('Insurance claim submitted successfully.', 'success');
    };

    const approveInsuranceClaim = async (claimId: string) => {
        const claim = healthData.insuranceClaims.find(c => c.id === claimId);
        if (!claim) return;

        const txResult = await addTransaction({
            userId: claim.userId,
            type: 'Insurance Claim',
            amount: claim.amount,
            description: `Reimbursement for ${claim.type} claim`,
            status: 'Completed',
        });
        if (txResult.success) {
            updateState('insuranceClaims', healthData.insuranceClaims.map(c => c.id === claimId ? { ...c, status: 'Approved' } : c));
            addNotification(claim.userId, `Your insurance claim for ${claim.type} has been approved.`, 'success');
            showToast('Claim approved and funds disbursed.', 'success');
        } else {
            showToast(`Failed to disburse funds: ${txResult.message}`, 'error');
        }
    };

    const rejectInsuranceClaim = async (claimId: string) => {
        const claim = healthData.insuranceClaims.find(c => c.id === claimId);
        if (!claim) return;
        updateState('insuranceClaims', healthData.insuranceClaims.map(c => c.id === claimId ? { ...c, status: 'Rejected' } : c));
        addNotification(claim.userId, `Your insurance claim for ${claim.type} has been rejected.`, 'error');
        showToast('Claim rejected.', 'success');
    };

    const redeemPrescription = async (prescriptionId: string, totalCost: number): Promise<{ success: boolean; message: string }> => {
        if (!user) return { success: false, message: 'User not found.' };

        const txResult = await addTransaction({
            userId: user.id,
            type: 'Obat & Resep',
            amount: -totalCost,
            description: `Pembelian resep #${prescriptionId}`,
            status: 'Completed'
        });

        if (txResult.success) {
            updateState('eprescriptions', healthData.eprescriptions.map(e => e.id === prescriptionId ? { ...e, status: 'Redeemed' } : e));
            return { success: true, message: 'Pembayaran berhasil!' };
        } else {
            return txResult;
        }
    };

    const subscribeToHealthPlus = async () => {
        if (!user) return;
        const txResult = await addTransaction({
            userId: user.id,
            type: 'PPOB', // Using PPOB for generic subscription
            amount: -50000,
            description: `Health+ Subscription (Monthly)`,
            status: 'Completed'
        });
        if (txResult.success) {
            updateCurrentUser({ ...user, isPremium: true });
        } else {
            showToast(`Subscription failed: ${txResult.message}`, 'error');
        }
    };


    const value: HealthContextType = {
        ...healthData,
        bookConsultation,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        addMoodEntry,
        joinHealthChallenge,
        createHealthChallenge,
        addHealthDocument,
        deleteHealthDocument,
        submitInsuranceClaim,
        approveInsuranceClaim,
        rejectInsuranceClaim,
        redeemPrescription,
        subscribeToHealthPlus,
    };

    return (
        <HealthContext.Provider value={value}>
            {children}
        </HealthContext.Provider>
    );
};

export const useHealth = (): HealthContextType => {
    const context = useContext(HealthContext);
    if (context === undefined) {
        throw new Error('useHealth must be used within a HealthProvider');
    }
    return context;
};
