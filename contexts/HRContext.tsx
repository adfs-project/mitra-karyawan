import React, { createContext, useContext, ReactNode, useState } from 'react';
import { LeaveRequest, HealthChallenge, AttendanceRecord, OpexRequest, Role, Coordinates, OpexRequestType } from '../types';
import { useAuth } from './AuthContext';
import { useCore } from './DataContext';
import { useApp } from './AppContext';
import vaultService from '../services/vaultService';
import { GoogleGenAI } from '@google/genai';

type HRData = {
    leaveRequests: LeaveRequest[];
    attendanceRecords: AttendanceRecord[];
    opexRequests: OpexRequest[];
}

interface HRContextType extends HRData {
    clockIn: (photoUrl: string) => Promise<{ success: boolean; message: string; }>;
    clockOut: (photoUrl: string) => Promise<{ success: boolean; message: string; }>;
    submitLeaveRequest: (req: { startDate: string, endDate: string, reason: string }) => Promise<void>;
    updateLeaveRequestStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
    getBranchMoodAnalytics: (branch: string) => Promise<{ summary: string; data: { mood: string; count: number }[] }>;
    submitOpexRequest: (requestData: Omit<OpexRequest, 'id' | 'userId' | 'userName' | 'branch' | 'status' | 'timestamp' | 'hrApproverId' | 'hrApprovalTimestamp' | 'financeApproverId' | 'financeApprovalTimestamp' | 'rejectionReason'>) => Promise<void>;
    approveOpexByHr: (id: string, amount?: number) => Promise<void>;
    rejectOpexByHr: (id: string, reason: string) => Promise<void>;
}

const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { users, addNotification, addTransaction } = useCore();
    const { showToast } = useApp();

    const [hrData, setHrData] = useState<HRData>({
        leaveRequests: vaultService.getSanitizedData().leaveRequests,
        attendanceRecords: vaultService.getSanitizedData().attendanceRecords,
        opexRequests: vaultService.getSanitizedData().opexRequests,
    });

    const updateState = <K extends keyof HRData>(key: K, value: HRData[K]) => {
        vaultService.setData(key, value as any);
        setHrData(prev => ({...prev, [key]: value}));
    };

    const clockIn = (photoUrl: string): Promise<{ success: boolean; message: string; }> => {
        return new Promise((resolve) => {
            if (!user) return resolve({ success: false, message: "User not logged in." });
            
            const openRecord = hrData.attendanceRecords.find(r => r.userId === user.id && r.clockInTime && !r.clockOutTime);
            if (openRecord) return resolve({ success: false, message: "Anda harus melakukan clock-out terlebih dahulu." });

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newRecord: AttendanceRecord = {
                        id: `att-${Date.now()}`, userId: user.id, userName: user.profile.name, branch: user.profile.branch || 'N/A',
                        date: new Date().toISOString().split('T')[0], clockInTime: new Date().toISOString(),
                        clockInLocation: { latitude, longitude }, clockInPhotoUrl: photoUrl,
                    };
                    updateState('attendanceRecords', [...hrData.attendanceRecords, newRecord]);
                    resolve({ success: true, message: `Berhasil Clock In pada ${new Date().toLocaleTimeString('id-ID')}` });
                },
                (error) => {
                    resolve({ success: false, message: `Gagal mendapatkan lokasi: ${error.message}` });
                },
                { enableHighAccuracy: true, maximumAge: 0 }
            );
        });
    };
    
    const clockOut = (photoUrl: string): Promise<{ success: boolean; message: string; }> => {
        return new Promise((resolve) => {
            if (!user) return resolve({ success: false, message: "User not logged in." });
            
            const recordToClockOut = [...hrData.attendanceRecords].filter(r => r.userId === user.id && r.clockInTime && !r.clockOutTime).sort((a, b) => new Date(b.clockInTime!).getTime() - new Date(a.clockInTime!).getTime())[0];
            if (!recordToClockOut) return resolve({ success: false, message: "Tidak ada sesi absen aktif." });
    
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const updatedRecord = { ...recordToClockOut, clockOutTime: new Date().toISOString(), clockOutLocation: { latitude, longitude }, clockOutPhotoUrl: photoUrl };
                    updateState('attendanceRecords', hrData.attendanceRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r));
                    resolve({ success: true, message: `Berhasil Clock Out pada ${new Date().toLocaleTimeString('id-ID')}` });
                },
                (error) => {
                    resolve({ success: false, message: `Gagal mendapatkan lokasi: ${error.message}` });
                },
                { enableHighAccuracy: true, maximumAge: 0 }
            );
        });
    };

    const submitLeaveRequest = async (req: { startDate: string, endDate: string, reason: string }) => {
        if (!user) return;
        const newReq: LeaveRequest = { id: `lr-${Date.now()}`, userId: user.id, userName: user.profile.name, branch: user.profile.branch || 'N/A', status: 'Pending', ...req };
        updateState('leaveRequests', [...hrData.leaveRequests, newReq]);
        showToast('Leave request submitted.', 'success');
        const hrUser = users.find(u => u.role === 'HR' && u.profile.branch === user.profile.branch);
        if(hrUser) addNotification(hrUser.id, `${user.profile.name} submitted a leave request.`, 'info');
    };
    
    const updateLeaveRequestStatus = async (id: string, status: 'Approved' | 'Rejected') => {
        const request = hrData.leaveRequests.find(r => r.id === id);
        if(!request) return;
        updateState('leaveRequests', hrData.leaveRequests.map(r => r.id === id ? { ...r, status } : r));
        addNotification(request.userId, `Your leave request for ${request.startDate} has been ${status}.`, status === 'Approved' ? 'success' : 'error');
    };

    const getBranchMoodAnalytics = async (branch: string): Promise<{ summary: string; data: { mood: string; count: number }[] }> => {
        const branchUsers = users.filter(u => u.profile.branch === branch && u.role === 'User');
        const moodData: { [key: string]: number } = {};
        let totalEntries = 0;
        branchUsers.forEach(user => { user.healthData.moodHistory.forEach(entry => { moodData[entry.mood] = (moodData[entry.mood] || 0) + 1; totalEntries++; }); });
        if (totalEntries === 0) return { summary: "No mood data available for this branch yet.", data: [] };
        const aggregatedData = Object.entries(moodData).map(([mood, count]) => ({ mood, count }));
        const prompt = `You are an expert HR analyst. Based on the following aggregated and anonymous employee mood data for a company branch, provide a one-sentence summary of the general morale. Be concise and professional. Respond in Indonesian. Data: ${JSON.stringify(aggregatedData)}. Total entries: ${totalEntries}.`;
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({ model: 'gemini-2.5-flash', contents: prompt });
            return { summary: response.text, data: aggregatedData };
        } catch (error) {
            console.error("AI mood analysis failed:", error);
            showToast("Failed to get AI-powered mood summary.", "error");
            return { summary: "Could not analyze mood data at this time.", data: aggregatedData };
        }
    };

    const submitOpexRequest = async (requestData: Omit<OpexRequest, 'id' | 'userId' | 'userName' | 'branch' | 'status' | 'timestamp' | 'hrApproverId' | 'hrApprovalTimestamp' | 'financeApproverId' | 'financeApprovalTimestamp' | 'rejectionReason'>) => {
        if (!user) return;
        const newRequest: OpexRequest = {
            ...requestData, id: `opex-${Date.now()}`, userId: user.id, userName: user.profile.name, branch: user.profile.branch || 'N/A',
            status: 'Pending HR Verification', timestamp: new Date().toISOString(),
        };
        updateState('opexRequests', [...hrData.opexRequests, newRequest]);
        showToast('Opex request submitted.', 'success');
        const hrUser = users.find(u => u.role === Role.HR && u.profile.branch === user.profile.branch);
        if (hrUser) addNotification(hrUser.id, `${user.profile.name} submitted a new Opex request.`, 'info');
    };
    
    const approveOpexByHr = async (id: string, amount?: number) => {
        const request = hrData.opexRequests.find(r => r.id === id);
        if (!user || !request) { showToast("Request not found.", "error"); return; }

        const updatedRequest: OpexRequest = { ...request, status: 'Pending Finance Approval', hrApproverId: user.id, hrApprovalTimestamp: new Date().toISOString() };
        if (request.type === 'Biaya Makan Perjalanan Dinas') {
            if (amount && amount > 0) { updatedRequest.amount = amount; } 
            else { showToast("Please set the meal allowance amount before approving.", "error"); return; }
        }
        
        updateState('opexRequests', hrData.opexRequests.map(r => r.id === id ? updatedRequest : r));
        
        const financeUser = users.find(u => u.role === Role.Finance && u.profile.branch === request.branch);
        if (financeUser) addNotification(financeUser.id, `An opex request from ${request.userName} needs your approval.`, 'info');
        
        addNotification(request.userId, `Your opex request for ${request.type} has been verified by HR.`, 'info');
        showToast("Opex request has been forwarded to Finance for final approval.", "success");
    };

    const rejectOpexByHr = async (id: string, reason: string) => {
        const request = hrData.opexRequests.find(r => r.id === id);
        if (!user || !request) return;
        const updatedRequest: OpexRequest = { ...request, status: 'Rejected', hrApproverId: user.id, hrApprovalTimestamp: new Date().toISOString(), rejectionReason: `Rejected by HR: ${reason}` };
        updateState('opexRequests', hrData.opexRequests.map(r => (r.id === id ? updatedRequest : r)));
        addNotification(request.userId, `Your opex request for ${request.type} has been rejected by HR.`, 'warning');
        showToast("Opex request has been rejected.", "success");
    };


    const value: HRContextType = {
        ...hrData,
        clockIn,
        clockOut,
        submitLeaveRequest,
        updateLeaveRequestStatus,
        getBranchMoodAnalytics,
        submitOpexRequest,
        approveOpexByHr,
        rejectOpexByHr,
    };

    return (
        <HRContext.Provider value={value}>
            {children}
        </HRContext.Provider>
    );
};

export const useHR = (): HRContextType => {
    const context = useContext(HRContext);
    if (context === undefined) {
        throw new Error('useHR must be used within a HRProvider');
    }
    return context;
};