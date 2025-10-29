import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { AttendanceRecord } from '../../types';

const HrAttendanceManagement: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users, attendanceRecords } = useData();
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

    const branchEmployees = useMemo(() => {
        if (!hrUser) return [];
        return users.filter(u => u.profile.branch === hrUser.profile.branch && u.role === 'User');
    }, [users, hrUser]);

    const attendanceData = useMemo(() => {
        return branchEmployees.map(employee => {
            const record = attendanceRecords.find(r => r.userId === employee.id && r.date === selectedDate);
            return {
                employee,
                record,
            };
        });
    }, [branchEmployees, attendanceRecords, selectedDate]);

    const getStatus = (record?: AttendanceRecord) => {
        if (!record?.clockInTime) {
            return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-gray-500/20 text-gray-400">Absen</span>;
        }
        const clockInHour = new Date(record.clockInTime).getHours();
        if (clockInHour >= 9) {
            return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-yellow-500/20 text-yellow-400">Terlambat</span>;
        }
        return <span className="px-2 py-1 rounded-full text-xs font-semibold bg-green-500/20 text-green-400">Hadir</span>;
    };
    
    const formatTime = (timeString?: string) => {
        if (!timeString) return '-';
        return new Date(timeString).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Manajemen Absensi</h1>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <div className="flex items-center mb-4">
                    <label htmlFor="date-filter" className="font-bold mr-2">Tanggal:</label>
                    <input
                        type="date"
                        id="date-filter"
                        value={selectedDate}
                        onChange={e => setSelectedDate(e.target.value)}
                        className="p-2 bg-surface-light rounded border border-border-color"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface-light">
                            <tr>
                                <th className="px-6 py-3">Karyawan</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Jam Masuk</th>
                                <th className="px-6 py-3">Jam Keluar</th>
                            </tr>
                        </thead>
                        <tbody>
                            {attendanceData.map(({ employee, record }) => (
                                <tr key={employee.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary">{employee.profile.name}</td>
                                    <td className="px-6 py-4">{getStatus(record)}</td>
                                    <td className="px-6 py-4">{formatTime(record?.clockInTime)}</td>
                                    <td className="px-6 py-4">{formatTime(record?.clockOutTime)}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default HrAttendanceManagement;
