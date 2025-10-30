import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo } from 'react';
import { Doctor, Consultation, MoodHistory, HealthChallenge, HealthDocument, Eprescription, InsuranceClaim, Role, EprescriptionItem } from '../types';
import vaultService from '../services/vaultService';
import { useAuth } from './AuthContext';
import { useCore } from './DataContext';
import { useApp } from './AppContext';
import { getConsultationTemplatePrompt } from '../services/aiGuardrailService';
import { GoogleGenAI, Type } from '@google/genai';


type HealthData = {
    doctors: Doctor[];
    consultations: Consultation[];
    eprescriptions: Eprescription[];
    healthDocuments: HealthDocument[];
    healthChallenges: HealthChallenge[];
    insuranceClaims: InsuranceClaim[];
};

interface HealthContextType extends HealthData {
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
    const { addTransaction, addNotification, users, taxConfig } = useCore();
    const { showToast } = useApp();

    const [healthData, setHealthData] = useState<HealthData>({
        doctors: vaultService.getSanitizedData().doctors,
        consultations: vaultService.getSanitizedData().consultations,
        healthChallenges: vaultService.getSanitizedData().healthChallenges,
        healthDocuments: vaultService.getSanitizedData().healthDocuments,
        eprescriptions: vaultService.getSanitizedData().eprescriptions || [],
        insuranceClaims: vaultService.getSanitizedData().insuranceClaims || [],
    });

    const updateState = <K extends keyof HealthData>(key: K, value: HealthData[K]) => {
        vaultService.setData(key, value as any);
        setHealthData(prev => ({ ...prev, [key]: value }));
    };

    const addDoctor = useCallback((data: Omit<Doctor, 'id' | 'availableSlots'>) => {
        const newDoctor: Doctor = {
            ...data,
            id: `doc-${Date.now()}`,
            availableSlots: [{ time: '09:00', isBooked: false }, { time: '10:00', isBooked: false }, { time: '11:00', isBooked: false }, { time: '13:00', isBooked: false }, { time: '14:00', isBooked: false }],
        };
        updateState('doctors', [...healthData.doctors, newDoctor]);
        showToast('Doctor added successfully.', 'success');
    }, [healthData.doctors, showToast]);

    const updateDoctor = useCallback((data: Doctor) => {
        updateState('doctors', healthData.doctors.map(d => d.id === data.id ? data : d));
        showToast('Doctor updated successfully.', 'success');
    }, [healthData.doctors, showToast]);

    const deleteDoctor = useCallback((doctorId: string) => {
        updateState('doctors', healthData.doctors.filter(d => d.id !== doctorId));
        showToast('Doctor removed.', 'success');
    }, [healthData.doctors, showToast]);

    const bookConsultation = useCallback(async (doctorId: string, slotTime: string): Promise<{ success: boolean; message: string; consultationId?: string }> => {
        if (!user) return { success: false, message: 'User not logged in.' };
        const doctor = healthData.doctors.find(d => d.id === doctorId);
        if (!doctor) return { success: false, message: 'Doctor not found.' };

        // Transactional Block
        try {
            // Step 1: Debit user
            const txResult = await addTransaction({
                userId: user.id, type: 'Teleconsultation', amount: -doctor.consultationFee,
                description: `Consultation fee for Dr. ${doctor.name}`, status: 'Completed',
            });
            if (!txResult.success) throw new Error(txResult.message);
            
            // Step 2: Pay PPh 21 tax to admin
            const pph21Amount = doctor.consultationFee * taxConfig.pph21Rate;
            await addTransaction({
                userId: 'admin-001', type: 'Tax', amount: pph21Amount,
                description: `PPh 21 from Dr. ${doctor.name}'s fee`, status: 'Completed',
            });

            // Step 3: Pay doctor (simulated by transferring to admin cash wallet, representing external payment)
            await addTransaction({
                userId: 'admin-001', type: 'Internal Transfer', amount: -(doctor.consultationFee - pph21Amount),
                description: `Payout to Dr. ${doctor.name}`, status: 'Completed',
            });

            // If all transactions succeed, create the consultation
            const newConsultation: Consultation = {
                id: `cons-${Date.now()}`, userId: user.id, userName: user.profile.name,
                doctorId: doctor.id, doctorName: doctor.name, doctorSpecialty: doctor.specialty,
                scheduledTime: new Date().toISOString(), status: 'Scheduled',
            };
            updateState('consultations', [...healthData.consultations, newConsultation]);

            const newDoctors = healthData.doctors.map(d => d.id === doctorId ? { ...d, availableSlots: d.availableSlots.map(s => s.time === slotTime ? { ...s, isBooked: true } : s) } : d);
            updateState('doctors', newDoctors);

            addNotification(user.id, `Booking confirmed with Dr. ${doctor.name}.`, 'success');
            return { success: true, message: 'Booking successful!', consultationId: newConsultation.id };

        } catch (error) {
            // Reversal logic on failure
            await addTransaction({
                userId: user.id, type: 'Reversal', amount: doctor.consultationFee,
                description: 'Reversal for failed consultation booking', status: 'Completed',
            });
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            showToast(`Booking failed: ${message}. Your balance has been restored.`, 'error');
            return { success: false, message: `Booking failed: ${message}` };
        }
    }, [user, healthData.doctors, healthData.consultations, addTransaction, addNotification, taxConfig.pph21Rate, showToast]);

     const endConsultation = useCallback(async (consultationId: string, chatSummary: string, prescriptionItems?: EprescriptionItem[]) => {
        if (!user) return;
        const consultation = healthData.consultations.find(c => c.id === consultationId);
        if (!consultation) return;

        // --- AI FEATURE DISABLED ---
        // The AI logic for generating notes and prescriptions has been turned off.
        // The system will now use the raw chat summary as the consultation note.
        console.log("AI prescription generation is disabled. Using manual summary.");
        const finalNotes = `Konsultasi selesai. Ringkasan: ${chatSummary}`;
        const finalPrescriptionItems: EprescriptionItem[] | undefined = prescriptionItems;

        let eprescriptionId: string | undefined = undefined;
        if (finalPrescriptionItems && finalPrescriptionItems.length > 0 && finalPrescriptionItems[0].drugName !== '[Nama Obat]') {
            const newEprescription: Eprescription = {
                id: `epres-${Date.now()}`, consultationId, patientId: user.id,
                doctorId: consultation.doctorId, doctorName: consultation.doctorName,
                issueDate: new Date().toISOString(), items: finalPrescriptionItems, status: 'New',
            };
            updateState('eprescriptions', [...healthData.eprescriptions, newEprescription]);
            eprescriptionId = newEprescription.id;
            addNotification(user.id, `Resep baru dari Dr. ${consultation.doctorName} telah diterbitkan.`, 'success');
        }

        const updatedConsultation: Consultation = { ...consultation, status: 'Completed', notes: finalNotes, eprescriptionId };
        updateState('consultations', healthData.consultations.map(c => c.id === consultationId ? updatedConsultation : c));
    }, [user, healthData.consultations, healthData.eprescriptions, addNotification]);

    const addMoodEntry = useCallback((mood: MoodHistory['mood']) => {
        if (!user) return;
        const newEntry: MoodHistory = { date: new Date().toISOString().split('T')[0], mood };
        const updatedUser = { ...user, healthData: { ...user.healthData, moodHistory: [...user.healthData.moodHistory, newEntry] } };
        updateCurrentUser(updatedUser);
        showToast('Mood for today recorded!', 'success');
    }, [user, updateCurrentUser, showToast]);

    const joinHealthChallenge = useCallback((challengeId: string) => {
        if (!user) return;
        const newChallenges = healthData.healthChallenges.map(c => c.id === challengeId && !c.participants.some(p => p.userId === user.id) ? { ...c, participants: [...c.participants, { userId: user.id, progress: 0 }] } : c);
        updateState('healthChallenges', newChallenges);
        showToast('You have joined the challenge!', 'success');
    }, [user, healthData.healthChallenges, showToast]);

    const createHealthChallenge = useCallback(async (challenge: { title: string; description: string }) => {
        if (!user || user.role !== Role.HR) return;
        const newChallenge: HealthChallenge = { id: `hc-${Date.now()}`, ...challenge, creator: { hrId: user.id, branch: user.profile.branch || 'N/A' }, participants: [] };
        updateState('healthChallenges', [...healthData.healthChallenges, newChallenge]);
        showToast('New challenge created!', 'success');
    }, [user, healthData.healthChallenges, showToast]);

    const addHealthDocument = useCallback(async (doc: { name: string; fileUrl: string }) => {
        if (!user) return;
        const newDoc: HealthDocument = { id: `doc-${Date.now()}`, userId: user.id, name: doc.name, uploadDate: new Date().toISOString(), fileUrl: doc.fileUrl };
        updateState('healthDocuments', [...healthData.healthDocuments, newDoc]);
        showToast('Document uploaded successfully.', 'success');
    }, [user, healthData.healthDocuments, showToast]);

    const deleteHealthDocument = useCallback((docId: string) => {
        showToast("Penghapusan data inti dinonaktifkan secara permanen untuk melindungi integritas sistem.", 'warning');
    }, [showToast]);

    const submitInsuranceClaim = useCallback(async (claimData: { type: InsuranceClaim['type']; amount: number; receiptUrl: string; }) => {
        if (!user) return;
        const newClaim: InsuranceClaim = {
            id: `claim-${Date.now()}`, userId: user.id, userName: user.profile.name,
            branch: user.profile.branch || 'N/A', status: 'Pending', submissionDate: new Date().toISOString(), ...claimData
        };
        updateState('insuranceClaims', [...healthData.insuranceClaims, newClaim]);
        showToast('Insurance claim submitted successfully.', 'success');
        const hrUser = users.find(u => u.role === Role.HR && u.profile.branch === user.profile.branch);
        if (hrUser) addNotification(hrUser.id, `New insurance claim from ${user.profile.name} requires review.`, 'info');
    }, [user, healthData.insuranceClaims, users, showToast, addNotification]);

    const approveInsuranceClaim = useCallback(async (claimId: string) => {
        const claim = healthData.insuranceClaims.find(c => c.id === claimId);
        if (!claim) return;
        try {
            const txResult = await addTransaction({
                userId: claim.userId, type: 'Insurance Claim', amount: claim.amount,
                description: `Reimbursement for ${claim.type} claim`, status: 'Completed'
            });
            if (!txResult.success) throw new Error(txResult.message);
            updateState('insuranceClaims', healthData.insuranceClaims.map(c => c.id === claimId ? { ...c, status: 'Approved' } : c));
            addNotification(claim.userId, `Your insurance claim for ${claim.type} has been approved.`, 'success');
            showToast('Claim approved and funds disbursed.', 'success');
        } catch(error) {
            const message = error instanceof Error ? error.message : "Failed to disburse funds.";
            showToast(message, 'error');
        }
    }, [healthData.insuranceClaims, addTransaction, addNotification, showToast]);

    const rejectInsuranceClaim = useCallback(async (claimId: string) => {
        const claim = healthData.insuranceClaims.find(c => c.id === claimId);
        if (!claim) return;
        updateState('insuranceClaims', healthData.insuranceClaims.map(c => c.id === claimId ? { ...c, status: 'Rejected' } : c));
        addNotification(claim.userId, `Your insurance claim for ${claim.type} has been rejected.`, 'error');
        showToast('Claim rejected.', 'success');
    }, [healthData.insuranceClaims, addNotification, showToast]);

    const subscribeToHealthPlus = useCallback(async () => {
        if (!user) return;
        const txResult = await addTransaction({
            userId: user.id, type: 'Marketplace', amount: -50000,
            description: 'Health+ Monthly Subscription', status: 'Completed'
        });
        if (txResult.success) updateCurrentUser({ ...user, isPremium: true });
        else showToast(`Subscription failed: ${txResult.message}`, 'error');
    }, [user, addTransaction, updateCurrentUser, showToast]);

    const redeemEprescription = useCallback(async (eprescriptionId: string): Promise<{ success: boolean; message: string; }> => {
        if (!user) return { success: false, message: "User not logged in." };
        const prescription = healthData.eprescriptions.find(e => e.id === eprescriptionId);
        if (!prescription) return { success: false, message: "Prescription not found." };
        const total = prescription.items.reduce((sum, item) => sum + (getSimulatedPrice(item.drugName) || 50000), 0);

        try {
            const txResult = await addTransaction({
                userId: user.id, type: 'Obat & Resep', amount: -total,
                description: `Pembelian resep #${eprescriptionId}`, status: 'Completed'
            });
            if (!txResult.success) throw new Error(txResult.message);

            // Simulate paying the pharmacy
            const commission = total * 0.10; // 10% commission
            await addTransaction({
                userId: 'admin-001', type: 'Commission', amount: commission,
                description: `Komisi dari resep #${eprescriptionId}`, status: 'Completed'
            });
            await addTransaction({
                userId: 'admin-001', type: 'Internal Transfer', amount: -(total - commission),
                description: `Pembayaran ke pemasok farmasi untuk resep #${eprescriptionId}`, status: 'Completed'
            });

            updateState('eprescriptions', healthData.eprescriptions.map(e => e.id === eprescriptionId ? { ...e, status: 'Redeemed' } : e));
            return { success: true, message: "Resep berhasil ditebus!" };
        } catch (error) {
            await addTransaction({
                userId: user.id, type: 'Reversal', amount: total,
                description: `Reversal for failed prescription purchase #${eprescriptionId}`, status: 'Completed'
            });
            const message = error instanceof Error ? error.message : "An unknown error occurred.";
            showToast(`Redemption failed: ${message}. Your balance has been restored.`, 'error');
            return { success: false, message };
        }
    }, [user, healthData.eprescriptions, addTransaction, showToast]);
    
    const getSimulatedPrice = (drugName: string) => {
        return (drugName.length * 5000) % 150000 + 25000;
    };

    const value: HealthContextType = {
        ...healthData,
        addDoctor, updateDoctor, deleteDoctor, bookConsultation, endConsultation,
        addMoodEntry, joinHealthChallenge, createHealthChallenge,
        addHealthDocument, deleteHealthDocument, submitInsuranceClaim,
        approveInsuranceClaim, rejectInsuranceClaim, subscribeToHealthPlus,
        redeemEprescription,
    };

    return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>;
};

export const useHealth = (): HealthContextType => {
    const context = useContext(HealthContext);
    if (context === undefined) throw new Error('useHealth must be used within a HealthProvider');
    return context;
};