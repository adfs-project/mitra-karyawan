import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import { BanknotesIcon, DocumentTextIcon } from '@heroicons/react/24/solid';

const HrPayroll: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users } = useData();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

    const branchEmployees = useMemo(() => {
        if (!hrUser || hrUser.role !== 'HR') return [];
        return users.filter(u => u.profile.branch === hrUser.profile.branch && u.role === 'User');
    }, [users, hrUser]);

    const selectedEmployee = users.find(u => u.id === selectedEmployeeId);

    const calculatePayroll = (employee: User | undefined) => {
        if (!employee || !employee.profile.salary) return null;
        
        const grossSalary = employee.profile.salary;
        // Simplified deductions for simulation
        const pph21 = grossSalary * 0.025;
        const bpjs = grossSalary * 0.01;
        const totalDeductions = pph21 + bpjs;
        const netSalary = grossSalary - totalDeductions;

        return { grossSalary, pph21, bpjs, totalDeductions, netSalary };
    };

    const payrollData = calculatePayroll(selectedEmployee);

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Simulasi Penggajian</h1>
            <p className="text-text-secondary">Pilih karyawan untuk melihat simulasi slip gaji berdasarkan data yang ada.</p>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <label htmlFor="employee-select" className="block text-sm font-bold text-text-secondary mb-2">Pilih Karyawan</label>
                <select 
                    id="employee-select" 
                    value={selectedEmployeeId}
                    onChange={(e) => setSelectedEmployeeId(e.target.value)}
                    className="w-full p-3 bg-surface-light rounded border border-border-color"
                >
                    <option value="">-- Pilih Karyawan --</option>
                    {branchEmployees.map(emp => (
                        <option key={emp.id} value={emp.id}>{emp.profile.name}</option>
                    ))}
                </select>
            </div>

            {selectedEmployee && payrollData && (
                <div className="bg-surface p-6 rounded-lg border border-border-color animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-center flex items-center justify-center mb-4"><DocumentTextIcon className="h-6 w-6 mr-2"/>Slip Gaji (Simulasi)</h2>
                    <div className="border-b border-border-color pb-2 mb-4">
                        <p className="font-bold text-xl">{selectedEmployee.profile.name}</p>
                        <p className="text-sm text-text-secondary">{selectedEmployee.email}</p>
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between items-center">
                            <p className="text-text-secondary">Gaji Pokok</p>
                            <p className="font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payrollData.grossSalary)}</p>
                        </div>
                         <div className="flex justify-between items-center text-red-400">
                            <p>Potongan PPh 21 (2.5%)</p>
                            <p className="font-semibold">-{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payrollData.pph21)}</p>
                        </div>
                         <div className="flex justify-between items-center text-red-400">
                            <p>Potongan BPJS (1%)</p>
                            <p className="font-semibold">-{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payrollData.bpjs)}</p>
                        </div>
                    </div>
                    <div className="border-t-2 border-primary pt-4 mt-4">
                         <div className="flex justify-between items-center text-primary font-bold text-xl">
                            <p>Gaji Bersih (Take-Home Pay)</p>
                            <p>{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(payrollData.netSalary)}</p>
                        </div>
                    </div>
                     <p className="text-xs text-center text-text-secondary mt-6">*Perhitungan ini adalah simulasi dan mungkin berbeda dengan slip gaji resmi.</p>
                </div>
            )}
             {!selectedEmployee && (
                <div className="text-center py-16">
                     <BanknotesIcon className="h-20 w-20 mx-auto text-text-secondary opacity-50"/>
                     <p className="mt-4 text-text-secondary">Pilih seorang karyawan untuk memulai simulasi.</p>
                </div>
            )}
        </div>
    );
};

export default HrPayroll;
