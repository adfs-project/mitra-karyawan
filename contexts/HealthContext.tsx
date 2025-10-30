import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { Doctor, Consultation, Eprescription, HealthDocument, HealthChallenge, InsuranceClaim, MoodHistory, EprescriptionItem } from '../types';
import { useAuth } from './AuthContext';
import { useCore } from './DataContext';
import { useApp } from './AppContext';
import vaultService from '../services/vaultService';
import { GoogleGenAI, Type } from "@google/genai";
import { getConsultationTemplatePrompt } from '../services/aiGuardrailService';

type HealthData = {
    doctors: Doctor[];
    consultations: Consultation[];
    eprescriptions: Eprescription[];
    healthDocuments: HealthDocument[];
    healthChallenges: HealthChallenge[];
    insuranceClaims: InsuranceClaim[];
}

interface HealthContextType extends HealthData {
    addMoodEntry: (mood: MoodHistory['mood']) => void;
    bookConsultation: (doctorId: string, slotTime: string) => Promise<{ success: boolean; message: string; consultationId?: string }>;
    endConsultation: (consultationId: string, notes: string, prescriptionItems: EprescriptionItem[]) => Promise<void>;
    addHealthDocument: (doc: Omit<HealthDocument, 'id' | 'userId' | 'uploadDate'>) => Promise<void>;
    deleteHealthDocument: (docId: string) => Promise<void>;
    joinHealthChallenge: (challengeId: string) => Promise<void>;
    submitInsuranceClaim: (claim: Omit<InsuranceClaim, 'id' | 'userId' | 'userName' | 'branch' | 'submissionDate' | 'status'>) => Promise<void>;
    subscribeToHealthPlus: () => Promise<void>;
    redeemPrescription: (eprescriptionId: string, totalCost: number) => Promise<{ success: boolean; message: string; }>;
    
    // Admin/HR Functions
    addDoctor: (doctor: Omit<Doctor, 'id' | 'availableSlots'>) => Promise<void>;
    updateDoctor: (doctor: Doctor) => Promise<void>;
    deleteDoctor: (doctorId: string) => Promise<void>;
    createHealthChallenge: (challenge: Omit<HealthChallenge, 'id' | 'creator' | 'participants'>) => Promise<void>;
    approveInsuranceClaim: (claimId: string) => Promise<void>;
    rejectInsuranceClaim: (claimId: string) => Promise<void>;
}

const HealthContext = createContext<HealthContextType | undefined>(undefined);

export const HealthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user, updateCurrentUser } = useAuth();
    const { addTransaction, addNotification, taxConfig, adminWallets } = useCore();
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
        setHealthData(prev => ({...prev, [key]: value}));
    };

    const addMoodEntry = (mood: MoodHistory['mood']) => {
        if (!user) return;
        const newEntry: MoodHistory = { date: new Date().toISOString().split('T')[0], mood };
        const updatedUser = { ...user, healthData: { ...user.healthData, moodHistory: [...user.healthData.moodHistory.filter(h => h.date !== newEntry.date), newEntry] } };
        updateCurrentUser(updatedUser);
        showToast(`Mood for today recorded: ${mood}`, 'success');
    };

    const bookConsultation = async (doctorId: string, slotTime: string): Promise<{ success: boolean; message: string; consultationId?: string }> => {
        const doctor = healthData.doctors.find(d => d.id === doctorId);
        if (!user || !doctor) return { success: false, message: 'Doctor not found.' };
        if (user.wallet.balance < doctor.consultationFee) return { success: false, message: 'Insufficient balance.' };
        
        const txResult = await addTransaction({ userId: user.id, type: 'Teleconsultation', amount: -doctor.consultationFee, description: `Consultation with ${doctor.name}`, status: 'Completed' });
        if (!txResult.success) return { success: false, message: 'Payment failed.' };

        const pph21Amount = doctor.consultationFee * taxConfig.pph21Rate;
        
        vaultService.setData('adminWallets', { ...adminWallets, tax: adminWallets.tax + pph21Amount });
        await addTransaction({ userId: 'admin-001', type: 'Tax', amount: pph21Amount, description: `Potongan PPh 21 ${taxConfig.pph21Rate * 100}% untuk ${doctor.name}`, status: 'Completed' });

        const newConsultation: Consultation = { id: `consult-${Date.now()}`, userId: user.id, userName: user.profile.name, doctorId: doctor.id, doctorName: doctor.name, doctorSpecialty: doctor.specialty, scheduledTime: new Date().toISOString(), status: 'Scheduled' };
        updateState('consultations', [...healthData.consultations, newConsultation]);
        updateState('doctors', healthData.doctors.map(d => d.id === doctorId ? { ...d, availableSlots: d.availableSlots.map(s => s.time === slotTime ? {...s, isBooked: true} : s)} : d));

        addNotification(user.id, `Booking with ${doctor.name} confirmed.`, 'success');
        return { success: true, message: 'Booking confirmed!', consultationId: newConsultation.id };
    };
    
    const endConsultation = async (consultationId: string, notes: string, prescriptionItems: EprescriptionItem[]) => {
        const consultation = healthData.consultations.find(c => c.id === consultationId);
        if (!consultation) return;
        let eprescriptionId: string | undefined = undefined;
        let prescriptionText = "Tidak ada resep.";

        if (prescriptionItems && prescriptionItems.length > 0 && prescriptionItems.some(p => p.drugName)) {
            const newEprescription: Eprescription = { id: `epres-${Date.now()}`, consultationId, patientId: consultation.userId, doctorId: consultation.doctorId, doctorName: consultation.doctorName, issueDate: new Date().toISOString(), items: prescriptionItems, status: 'New' };
            updateState('eprescriptions', [...healthData.eprescriptions, newEprescription]);
            eprescriptionId = newEprescription.id;
            prescriptionText = prescriptionItems.map(p => `${p.drugName} (${p.dosage})`).join(', ');
        }
        updateState('consultations', healthData.consultations.map(c => c.id === consultationId ? { ...c, status: 'Completed', notes, eprescriptionId, prescription: prescriptionText } : c));
    };

    const subscribeToHealthPlus = async () => {
        if (!user) return;
        updateCurrentUser({ ...user, isPremium: true });
    };

    const redeemPrescription = async (eprescriptionId: string, totalCost: number): Promise<{ success: boolean; message: string; }> => {
        const prescription = healthData.eprescriptions.find(e => e.id === eprescriptionId);
        if (!user || !prescription) return { success: false, message: "Resep tidak ditemukan." };
        if (user.wallet.balance < totalCost) return { success: false, message: "Saldo tidak cukup." };
        const txResult = await addTransaction({ userId: user.id, type: 'Obat & Resep', amount: -totalCost, description: `Pembelian obat dari resep #${eprescriptionId.slice(-6)}`, status: 'Completed' });
        if (txResult.success) {
            updateState('eprescriptions', healthData.eprescriptions.map(e => e.id === eprescriptionId ? { ...e, status: 'Redeemed' } : e));
            
            const commission = totalCost * 0.03; // 3% commission for pharmacy
            vaultService.setData('adminWallets', { ...adminWallets, profit: adminWallets.profit + commission });
            return { success: true, message: "Pembayaran berhasil!" };
        } else {
            return { success: false, message: "Gagal memproses pembayaran." };
        }
    };

    const addHealthDocument = async (doc: Omit<HealthDocument, 'id' | 'userId' | 'uploadDate'>) => {
        if (!user) return;
        const newDoc: HealthDocument = { ...doc, id: `doc-${Date.now()}`, userId: user.id, uploadDate: new Date().toISOString() };
        updateState('healthDocuments', [newDoc, ...healthData.healthDocuments]);
        showToast("Document uploaded successfully.", "success");
    };

    const deleteHealthDocument = async (docId: string) => {
        showToast("Penghapusan data inti dinonaktifkan secara permanen untuk melindungi integritas sistem.", 'warning');
    };

    const joinHealthChallenge = async (challengeId: string) => {
        if (!user) return;
        const newChallenges = healthData.healthChallenges.map(c => {
            if (c.id === challengeId && !c.participants.some(p => p.userId === user.id)) {
                return { ...c, participants: [...c.participants, { userId: user.id, progress: 0 }] };
            }
            return c;
        });
        updateState('healthChallenges', newChallenges);
        showToast("You have joined the challenge!", "success");
    };
    
    const submitInsuranceClaim = async (claimData: Omit<InsuranceClaim, 'id' | 'userId' | 'userName' | 'branch' | 'submissionDate' | 'status'>) => {
        if (!user) return;
        const newClaim: InsuranceClaim = { ...claimData, id: `ic-${Date.now()}`, userId: user.id, userName: user.profile.name, branch: user.profile.branch || 'N/A', submissionDate: new Date().toISOString(), status: 'Pending' };
        updateState('insuranceClaims', [newClaim, ...healthData.insuranceClaims]);
        showToast("Insurance claim submitted.", "success");
    };

    const addDoctor = async (doctorData: Omit<Doctor, 'id' | 'availableSlots'>) => {
        const newDoctor: Doctor = { ...doctorData, id: `doc-${Date.now()}`, availableSlots: [{ time: '09:00', isBooked: false }, { time: '10:00', isBooked: false }, { time: '11:00', isBooked: false }, { time: '13:00', isBooked: false }, { time: '14:00', isBooked: false }, { time: '15:00', isBooked: false }] };
        updateState('doctors', [newDoctor, ...healthData.doctors]);
        showToast("New health provider added.", "success");
    };

    const updateDoctor = async (doctor: Doctor) => {
        updateState('doctors', healthData.doctors.map(d => d.id === doctor.id ? doctor : d));
        showToast("Health provider updated.", "success");
    };

    const deleteDoctor = async (doctorId: string) => {
        updateState('doctors', healthData.doctors.filter(d => d.id !== doctorId));
        showToast("Health provider removed successfully.", "success");
    };
    
    const createHealthChallenge = async (challenge: Omit<HealthChallenge, 'id' | 'creator' | 'participants'>) => {
        if (!user || user.role !== 'HR') return;
        const newChallenge: HealthChallenge = { ...challenge, id: `hc-${Date.now()}`, creator: { hrId: user.id, branch: user.profile.branch || 'N/A' }, participants: [] };
        updateState('healthChallenges', [newChallenge, ...healthData.healthChallenges]);
        showToast("New wellness challenge created!", "success");
    };

    const approveInsuranceClaim = async (claimId: string) => {
        const claim = healthData.insuranceClaims.find(c => c.id === claimId);
        if (!claim) { showToast("Claim not found.", "error"); return; }
        
        vaultService.setData('adminWallets', { ...adminWallets, cash: adminWallets.cash - claim.amount });
        const txResult = await addTransaction({ userId: claim.userId, type: 'Insurance Claim', amount: claim.amount, description: `Reimbursement for ${claim.type} claim`, status: 'Completed' });

        if (txResult.success) {
            updateState('insuranceClaims', healthData.insuranceClaims.map(c => c.id === claimId ? { ...c, status: 'Approved' } : c));
            addNotification(claim.userId, `Your insurance claim for ${claim.type} amounting to ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(claim.amount)} has been approved.`, 'success');
            showToast("Claim approved and funds disbursed.", "success");
        } else {
            vaultService.setData('adminWallets', { ...adminWallets, cash: adminWallets.cash + claim.amount }); // Revert cash
            showToast("Failed to disburse funds. Please check user wallet.", "error");
        }
    };

    const rejectInsuranceClaim = async (claimId: string) => {
        const claim = healthData.insuranceClaims.find(c => c.id === claimId);
        if (!claim) { showToast("Claim not found.", "error"); return; }
        updateState('insuranceClaims', healthData.insuranceClaims.map(c => c.id === claimId ? { ...c, status: 'Rejected' } : c));
        addNotification(claim.userId, `Your insurance claim for ${claim.type} has been rejected. Please contact HR for details.`, 'warning');
        showToast("Claim has been rejected.", "success");
    };


    const value: HealthContextType = {
        ...healthData,
        addMoodEntry,
        bookConsultation,
        endConsultation,
        addHealthDocument,
        deleteHealthDocument,
        joinHealthChallenge,
        submitInsuranceClaim,
        subscribeToHealthPlus,
        redeemPrescription,
        addDoctor,
        updateDoctor,
        deleteDoctor,
        createHealthChallenge,
        approveInsuranceClaim,
        rejectInsuranceClaim,
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