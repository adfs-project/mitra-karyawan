import React, { createContext, useContext, ReactNode, useCallback } from 'react';
import { LeaveRequest, AttendanceRecord, OpexRequest, Role, Coordinates } from '../types';
import { useAuth } from './AuthContext';
import { useApp } from './AppContext';
import { GoogleGenAI } from '@google/genai';

export interface HRContextType {
    leaveRequests: LeaveRequest[];
    attendanceRecords: AttendanceRecord[];
    opexRequests: OpexRequest[];
    clockIn: (photoUrl: string) => Promise<{ success: boolean; message: string; }>;
    clockOut: (photoUrl: string) => Promise<{ success: boolean; message: string; }>;
    submitLeaveRequest: (req: { startDate: string, endDate: string, reason: string }) => Promise<void>;
    updateLeaveRequestStatus: (id: string, status: 'Approved' | 'Rejected') => Promise<void>;
    getBranchMoodAnalytics: (branch: string) => Promise<{ summary: string; data: { mood: string; count: number }[] }>;
    submitOpexRequest: (requestData: Omit<OpexRequest, 'id'|'userId'|'userName'|'branch'|'status'|'timestamp'|'hrApproverId'|'hrApprovalTimestamp'|'financeApproverId'|'financeApprovalTimestamp'|'rejectionReason'>) => Promise<void>;
    approveOpexByHr: (id: string, amount?: number) => Promise<void>;
    rejectOpexByHr: (id: string, reason: string) => Promise<void>;
}

export const HRContext = createContext<HRContextType | undefined>(undefined);

export const HRProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const { user } = useAuth();
    const { users, leaveRequests, attendanceRecords, opexRequests, updateState, addNotification, showToast } = useApp();

    const clockIn = useCallback((photoUrl: string): Promise<{ success: boolean; message: string; }> => {
        return new Promise((resolve) => {
            if (!user) return resolve({ success: false, message: "User not logged in." });
            if (attendanceRecords.some(r => r.userId === user.id && r.clockInTime && !r.clockOutTime)) {
                return resolve({ success: false, message: "Anda harus melakukan clock-out terlebih dahulu." });
            }
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newRecord: AttendanceRecord = { id: `att-${Date.now()}`, userId: user.id, userName: user.profile.name, branch: user.profile.branch || 'N/A', date: new Date().toISOString().split('T')[0], clockInTime: new Date().toISOString(), clockInLocation: { latitude, longitude }, clockInPhotoUrl: photoUrl };
                    updateState('attendanceRecords', [...attendanceRecords, newRecord]);
                    resolve({ success: true, message: `Berhasil Clock In pada ${new Date().toLocaleTimeString('id-ID')}` });
                },
                (error) => resolve({ success: false, message: `Gagal mendapatkan lokasi: ${error.message}` }),
                { enableHighAccuracy: true, maximumAge: 0 }
            );
        });
    }, [user, attendanceRecords, updateState]);

    const clockOut = useCallback((photoUrl: string): Promise<{ success: boolean; message: string; }> => {
        return new Promise((resolve) => {
            if (!user) return resolve({ success: false, message: "User not logged in." });
            const recordToClockOut = [...attendanceRecords].filter(r => r.userId === user.id && r.clockInTime && !r.clockOutTime).sort((a, b) => new Date(b.clockInTime!).getTime() - new Date(a.clockInTime!).getTime())[0];
            if (!recordToClockOut) return resolve({ success: false, message: "Tidak ada sesi absen aktif." });
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const updatedRecord = { ...recordToClockOut, clockOutTime: new Date().toISOString(), clockOutLocation: { latitude, longitude }, clockOutPhotoUrl: photoUrl };
                    updateState('attendanceRecords', attendanceRecords.map(r => r.id === updatedRecord.id ? updatedRecord : r));
                    resolve({ success: true, message: `Berhasil Clock Out pada ${new Date().toLocaleTimeString('id-ID')}` });
                },
                (error) => resolve({ success: false, message: `Gagal mendapatkan lokasi: ${error.message}` }),
                { enableHighAccuracy: true, maximumAge: 0 }
            );
        });
    }, [user, attendanceRecords, updateState]);

    const submitLeaveRequest = useCallback(async (req: { startDate: string, endDate: string, reason: string }) => {
        if (!user) return;
        const newReq: LeaveRequest = { id: `lr-${Date.now()}`, userId: user.id, userName: user.profile.name, branch: user.profile.branch || 'N/A', status: 'Pending', ...req };
        updateState('leaveRequests', [...leaveRequests, newReq]);
        showToast('Leave request submitted.', 'success');
        const hrUser = users.find(u => u.role === 'HR' && u.profile.branch === user.profile.branch);
        if (hrUser) addNotification(hrUser.id, `${user.profile.name} submitted a leave request.`, 'info');
    }, [user, leaveRequests, users, updateState, showToast, addNotification]);
    
    const updateLeaveRequestStatus = useCallback(async (id: string, status: 'Approved' | 'Rejected') => {
        const request = leaveRequests.find(r => r.id === id);
        if (!request) return;
        updateState('leaveRequests', leaveRequests.map(r => r.id === id ? { ...r, status } : r));
        addNotification(request.userId, `Your leave request for ${request.startDate} has been ${status}.`, status === 'Approved' ? 'success' : 'error');
    }, [leaveRequests, updateState, addNotification]);

    const getBranchMoodAnalytics = useCallback(async (branch: string): Promise<{ summary: string; data: { mood: string; count: number }[] }> => {
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
    }, [users, showToast]);

    const submitOpexRequest = useCallback(async (requestData: Omit<OpexRequest, 'id'|'userId'|'userName'|'branch'|'status'|'timestamp'|'hrApproverId'|'hrApprovalTimestamp'|'financeApproverId'|'financeApprovalTimestamp'|'rejectionReason'>) => {
        if (!user) return;
        const newRequest: OpexRequest = { ...requestData, id: `opex-${Date.now()}`, userId: user.id, userName: user.profile.name, branch: user.profile.branch || 'N/A', status: 'Pending HR Verification', timestamp: new Date().toISOString() };
        updateState('opexRequests', [...opexRequests, newRequest]);
        showToast('Opex request submitted.', 'success');
        const hrUser = users.find(u => u.role === Role.HR && u.profile.branch === user.profile.branch);
        if (hrUser) addNotification(hrUser.id, `${user.profile.name} submitted a new Opex request.`, 'info');
    }, [user, opexRequests, users, updateState, showToast, addNotification]);
    
    const approveOpexByHr = useCallback(async (id: string, amount?: number) => {
        const request = opexRequests.find(r => r.id === id);
        if (!user || !request) { showToast("Request not found.", "error"); return; }
        const updatedRequest: OpexRequest = { ...request, status: 'Pending Finance Approval', hrApproverId: user.id, hrApprovalTimestamp: new Date().toISOString() };
        if (request.type === 'Biaya Makan Perjalanan Dinas') {
            if (amount && amount > 0) { updatedRequest.amount = amount; } 
            else { showToast("Please set the meal allowance amount before approving.", "error"); return; }
        }
        updateState('opexRequests', opexRequests.map(r => r.id === id ? updatedRequest : r));
        const financeUser = users.find(u => u.role === Role.Finance && u.profile.branch === request.branch);
        if (financeUser) addNotification(financeUser.id, `An opex request from ${request.userName} needs your approval.`, 'info');
        addNotification(request.userId, `Your opex request for ${request.type} has been verified by HR.`, 'info');
        showToast("Opex request forwarded to Finance.", "success");
    }, [user, opexRequests, users, updateState, showToast, addNotification]);

    const rejectOpexByHr = useCallback(async (id: string, reason: string) => {
        const request = opexRequests.find(r => r.id === id);
        if (!user || !request) return;
        const updatedRequest: OpexRequest = { ...request, status: 'Rejected', hrApproverId: user.id, hrApprovalTimestamp: new Date().toISOString(), rejectionReason: `Rejected by HR: ${reason}` };
        updateState('opexRequests', opexRequests.map(r => (r.id === id ? updatedRequest : r)));
        addNotification(request.userId, `Your opex request for ${request.type} has been rejected by HR.`, 'warning');
        showToast("Opex request has been rejected.", "success");
    }, [user, opexRequests, updateState, showToast, addNotification]);
    
    const value: HRContextType = {
        leaveRequests, attendanceRecords, opexRequests,
        clockIn, clockOut, submitLeaveRequest, updateLeaveRequestStatus,
        getBranchMoodAnalytics, submitOpexRequest, approveOpexByHr, rejectOpexByHr,
    };

    return <HRContext.Provider value={value}>{children}</HRContext.Provider>;
};

export const useHR = (): HRContextType => {
    const context = useContext(HRContext);
    if (context === undefined) {
        throw new Error('useHR must be used within an HRProvider');
    }
    return context;
};