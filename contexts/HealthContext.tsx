

import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { Doctor, Consultation, MoodHistory, HealthChallenge, HealthDocument, Eprescription, InsuranceClaim, EprescriptionItem, Role } from '../types';
import { useApp } from './AppContext';
import { useAuth } from './AuthContext';
import { GoogleGenAI, Type } from "@google/genai";
import { getConsultationTemplatePrompt } from '../services/aiGuardrailService';
import vaultService from '../services/vaultService';

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
    endConsultation: (consultationId: string, chatSummary: string) => Promise<void>;
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
    const { user, updateCurrentUser } = useAuth();
    const { 
        doctors, consultations, eprescriptions, healthDocuments, 
        healthChallenges, insuranceClaims, users,
        updateState, addTransaction, addNotification, showToast 
    } = useApp();

     const addDoctor = useCallback((data: Omit<Doctor, 'id' | 'availableSlots'>) => {
        const newDoctor: Doctor = {
            ...data,
            id: `doc-${Date.now()}`,
            availableSlots: [
                { time: '09:00', isBooked: false }, { time: '10:00', isBooked: false },
                { time: '11:00', isBooked: false }, { time: '13:00', isBooked: false },
                { time: '14:00', isBooked: false }, { time: '15:00', isBooked: false },
            ]
        };
        updateState('doctors', [...doctors, newDoctor]);
        showToast('Doctor added successfully.', 'success');
    }, [doctors, updateState, showToast]);

    const updateDoctor = useCallback((data: Doctor) => {
        updateState('doctors', doctors.map(d => d.id === data.id ? data : d));
        showToast('Doctor updated successfully.', 'success');
    }, [doctors, updateState, showToast]);

    const deleteDoctor = useCallback((doctorId: string) => {
        showToast("Core data deletion is permanently disabled.", 'warning');
    }, [showToast]);

    const bookConsultation = useCallback(async (doctorId: string, slotTime: string): Promise<{ success: boolean; message: string; consultationId?: string }> => {
        if (!user) return { success: false, message: 'User not logged in.' };
        const doctor = doctors.find(d => d.id === doctorId);
        if (!doctor) return { success: false, message: 'Doctor not found.' };

        const txResult = await addTransaction({
            userId: user.id,
            type: 'Teleconsultation',
            amount: -doctor.consultationFee,
            description: `Consultation with ${doctor.name}`,
            status: 'Completed',
        });

        if (!txResult.success) {
            return { success: false, message: txResult.message };
        }

        const newConsultation: Consultation = {
            id: `cons-${Date.now()}`,
            userId: user.id,
            userName: user.profile.name,
            doctorId: doctor.id,
            doctorName: doctor.name,
            doctorSpecialty: doctor.specialty,
            scheduledTime: new Date().toISOString(),
            status: 'Scheduled',
        };
        updateState('consultations', [...consultations, newConsultation]);
        updateState('doctors', doctors.map(d => d.id === doctorId ? { ...d, availableSlots: d.availableSlots.map(s => s.time === slotTime ? { ...s, isBooked: true } : s) } : d));
        
        return { success: true, message: 'Booking successful!', consultationId: newConsultation.id };

    }, [user, doctors, consultations, updateState, addTransaction]);

    const endConsultation = useCallback(async (consultationId: string, chatSummary: string) => {
        if (!user) return;
        const consultation = consultations.find(c => c.id === consultationId);
        if (!consultation) return;

        let eprescriptionId: string | undefined = undefined;

        if (Math.random() > 0.3) { // 70% chance to get a prescription
            try {
                const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: getConsultationTemplatePrompt(),
                    config: { responseMimeType: 'application/json' }
                });
                
                const { notes, prescription } = JSON.parse(response.text);
                
                const newEprescription: Eprescription = {
                    id: `epres-${Date.now()}`,
                    consultationId: consultation.id,
                    patientId: user.id,
                    doctorId: consultation.doctorId,
                    doctorName: consultation.doctorName,
                    issueDate: new Date().toISOString(),
                    items: prescription,
                    status: 'New',
                };
                updateState('eprescriptions', [...eprescriptions, newEprescription]);
                eprescriptionId = newEprescription.id;

                updateState('consultations', consultations.map(c => c.id === consultationId ? { ...c, status: 'Completed' as const, notes, eprescriptionId } : c));
                addNotification(user.id, `Konsultasi dengan ${consultation.doctorName} selesai. Resep baru telah diterbitkan.`, 'success');
            
            } catch (error) {
                console.error("AI Prescription Generation Failed:", error);
                updateState('consultations', consultations.map(c => c.id === consultationId ? { ...c, status: 'Completed' as const, notes: chatSummary } : c));
                addNotification(user.id, `Konsultasi dengan ${consultation.doctorName} telah selesai.`, 'info');
            }
        } else {
            updateState('consultations', consultations.map(c => c.id === consultationId ? { ...c, status: 'Completed' as const, notes: chatSummary } : c));
            addNotification(user.id, `Konsultasi dengan ${consultation.doctorName} telah selesai.`, 'info');
        }
    }, [user, consultations, eprescriptions, updateState, addNotification]);
    
    const addMoodEntry = useCallback((mood: MoodHistory['mood']) => {
        if (!user) return;
        const newEntry = { date: new Date().toISOString().split('T')[0], mood };
        const updatedUser = {
            ...user,
            healthData: {
                ...user.healthData,
                moodHistory: [newEntry, ...user.healthData.moodHistory.slice(0, 29)] // Keep last 30 entries
            }
        };
        updateCurrentUser(updatedUser);
        showToast("Mood Anda hari ini telah dicatat.", "success");
    }, [user, updateCurrentUser, showToast]);
    
    const joinHealthChallenge = useCallback((challengeId: string) => {
        if (!user) return;
        const challenge = healthChallenges.find(c => c.id === challengeId);
        if (!challenge || challenge.participants.some(p => p.userId === user.id)) return;
        
        updateState('healthChallenges', healthChallenges.map(c => c.id === challengeId ? { ...c, participants: [...c.participants, { userId: user.id, progress: 0 }] } : c));
        
        const updatedUser = { ...user, healthData: { ...user.healthData, activeChallenges: [...user.healthData.activeChallenges, challengeId] } };
        updateCurrentUser(updatedUser);
        showToast(`Anda berhasil bergabung dengan tantangan "${challenge.title}"!`, 'success');
    }, [user, healthChallenges, updateState, updateCurrentUser, showToast]);

    const createHealthChallenge = useCallback(async (challengeData: { title: string; description: string; }) => {
        if (!user || user.role !== Role.HR) return;
        const newChallenge: HealthChallenge = {
            ...challengeData,
            id: `hc-${Date.now()}`,
            creator: { hrId: user.id, branch: user.profile.branch || 'N/A' },
            participants: []
        };
        updateState('healthChallenges', [newChallenge, ...healthChallenges]);
        showToast("Health challenge created successfully.", "success");
    }, [user, healthChallenges, updateState, showToast]);

    const addHealthDocument = useCallback(async (doc: { name: string; fileUrl: string }) => {
        if (!user) return;
        const newDoc: HealthDocument = { ...doc, id: `doc-${Date.now()}`, userId: user.id, uploadDate: new Date().toISOString() };
        updateState('healthDocuments', [newDoc, ...healthDocuments]);
        showToast("Dokumen berhasil diunggah.", "success");
    }, [user, healthDocuments, updateState, showToast]);
    
    const deleteHealthDocument = useCallback((docId: string) => { showToast("Core data deletion is permanently disabled.", 'warning'); }, [showToast]);

    const submitInsuranceClaim = useCallback(async (claimData: { type: InsuranceClaim['type']; amount: number; receiptUrl: string; }) => {
        if (!user) return;
        const newClaim: InsuranceClaim = { ...claimData, id: `claim-${Date.now()}`, userId: user.id, userName: user.profile.name, branch: user.profile.branch || 'N/A', status: 'Pending', submissionDate: new Date().toISOString() };
        updateState('insuranceClaims', [newClaim, ...insuranceClaims]);
        showToast("Klaim asuransi berhasil diajukan.", "success");
        // Notify HR
        const hrUser = users.find(u => u.role === Role.HR && u.profile.branch === user.profile.branch);
        if (hrUser) addNotification(hrUser.id, `${user.profile.name} mengajukan klaim asuransi baru.`, 'info');
    }, [user, insuranceClaims, users, updateState, showToast, addNotification]);

    const approveInsuranceClaim = useCallback(async (claimId: string) => {
        const claim = insuranceClaims.find(c => c.id === claimId);
        if (!claim) return;
        
        const txResult = await addTransaction({
            userId: claim.userId,
            type: 'Insurance Claim',
            amount: claim.amount,
            description: `Pencairan klaim asuransi ${claim.type}`,
            status: 'Completed',
            relatedId: claim.id
        });

        if (txResult.success) {
            updateState('insuranceClaims', insuranceClaims.map(c => c.id === claimId ? { ...c, status: 'Approved' as const } : c));
            addNotification(claim.userId, `Klaim asuransi Anda sebesar ${new Intl.NumberFormat('id-ID', { style:'currency', currency:'IDR'}).format(claim.amount)} telah disetujui dan dicairkan.`, 'success');
            showToast('Claim approved and funds disbursed.', 'success');
        } else {
            showToast(`Failed to disburse funds: ${txResult.message}`, 'error');
        }
    }, [insuranceClaims, updateState, addTransaction, addNotification, showToast]);
    
    const rejectInsuranceClaim = useCallback(async (claimId: string) => {
        const claim = insuranceClaims.find(c => c.id === claimId);
        if (!claim) return;
        updateState('insuranceClaims', insuranceClaims.map(c => c.id === claimId ? { ...c, status: 'Rejected' as const } : c));
        addNotification(claim.userId, `Klaim asuransi Anda untuk ${claim.type} telah ditolak.`, 'error');
        showToast('Claim rejected.', 'success');
    }, [insuranceClaims, updateState, addNotification, showToast]);
    
    const subscribeToHealthPlus = useCallback(async () => {
        if (!user) return;
        const cost = 50000;
        const txResult = await addTransaction({
            userId: user.id,
            type: 'Subscription', 
            amount: -cost,
            description: 'Health+ Subscription (1 Month)',
            status: 'Completed',
        });
        if (txResult.success) {
            const fullUser = vaultService.findUserByEmail(user.email);
            if(fullUser){
                const updatedUser = { ...fullUser, isPremium: true };
                vaultService.updateUser(updatedUser);
                updateCurrentUser({ ...user, isPremium: true });
            }
        }
    }, [user, addTransaction, updateCurrentUser]);
    
    const redeemEprescription = useCallback(async (eprescriptionId: string): Promise<{ success: boolean; message: string }> => {
        if (!user) return { success: false, message: 'User not logged in.' };
        const pres = eprescriptions.find(e => e.id === eprescriptionId);
        if (!pres) return { success: false, message: 'Resep tidak ditemukan.' };

        // Dummy price calculation
        const total = pres.items.length * 50000 + 2500; 

        const txResult = await addTransaction({
            userId: user.id,
            type: 'Obat & Resep',
            amount: -total,
            description: `Pembelian resep dari Dr. ${pres.doctorName}`,
            status: 'Completed',
            relatedId: pres.id
        });

        if (!txResult.success) {
            return { success: false, message: txResult.message };
        }
        
        updateState('eprescriptions', eprescriptions.map(e => e.id === eprescriptionId ? { ...e, status: 'Redeemed' as const } : e));
        return { success: true, message: 'Resep berhasil ditebus!' };
        
    }, [user, eprescriptions, updateState, addTransaction]);

    const value: HealthContextType = {
        doctors, consultations, eprescriptions, healthDocuments, healthChallenges, insuranceClaims,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        bookConsultation,
        endConsultation,
        addMoodEntry,
        joinHealthChallenge,
        createHealthChallenge,
        addHealthDocument,
        deleteHealthDocument,
        submitInsuranceClaim,
        approveInsuranceClaim,
        rejectInsuranceClaim,
        subscribeToHealthPlus,
        redeemEprescription,
    };

    return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
};

export const useHealth = (): HealthContextType => {
    const context = useContext(HealthContext);
    if (context === undefined) throw new Error('useHealth must be used within a HealthProvider');
    return context;
};