import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import { BanknotesIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/solid';

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    }).format(value).replace('Rp', 'Rp.').padEnd(15);
};

const formatValue = (value: string | number, length: number) => {
    return String(value).padEnd(length);
}

const PayslipView: React.FC<{ employee: User; period: string }> = ({ employee, period }) => {
    
    const payroll = useMemo(() => {
        if (!employee || !employee.profile.salary) return null;

        const grossSalary = employee.profile.salary;
        
        // PENDAPATAN (A)
        const gajiPokok = grossSalary;
        const insentifKinerja = 0; // Simulated
        const totalPendapatan = gajiPokok + insentifKinerja;

        // POTONGAN (B)
        const pajakPph21 = grossSalary * 0.025; // Tax (2.5%)
        const bpjsTkKaryawan2 = grossSalary * 0.02; // BPJS TK Kary. (2%)
        const bpjsTkKaryawan054 = grossSalary * 0.0054; // BPJS TK Kary. (0.54%)
        const bpjsPensiunKaryawan = grossSalary * 0.01; // BPJS Pensiun Kary (1%)
        const totalPotongan = pajakPph21 + bpjsTkKaryawan2 + bpjsTkKaryawan054 + bpjsPensiunKaryawan;
        
        // LAIN-LAIN (C) - Company contributions (for info)
        const bpjsPensiunPerusahaan = grossSalary * 0.02;
        const bpjsTkPerusahaan = grossSalary * 0.037;
        
        // FINAL
        const takeHomePay = totalPendapatan - totalPotongan;

        return {
            gajiPokok,
            insentifKinerja,
            totalPendapatan,
            pajakPph21,
            bpjsTkKaryawan2,
            bpjsTkKaryawan054,
            bpjsPensiunKaryawan,
            totalPotongan,
            bpjsPensiunPerusahaan,
            bpjsTkPerusahaan,
            takeHomePay,
            saldoPinjaman: 0 // Simulated
        };

    }, [employee]);

    if (!payroll) return null;

    return (
        <div id="payslip-to-print" className="bg-white text-black p-8 font-mono text-xs max-w-4xl mx-auto border border-gray-300">
            {/* Header */}
            <div className="flex justify-between items-start border-b-2 border-black pb-2">
                <h1 className="text-2xl font-bold">PT. Mitra Karyawan</h1>
                <p className="font-bold tracking-widest">CONFIDENTIAL</p>
            </div>

            {/* Info Section */}
            <div className="flex justify-between mt-4 text-sm">
                <pre className="p-0 m-0">
                    COST CENTER : {formatValue(employee.profile.branch || 'N/A', 20)}<br />
                    NIK         : {formatValue(employee.id, 20)}<br />
                    NAMA        : {formatValue(employee.profile.name, 20)}
                </pre>
                <pre className="p-0 m-0">
                    SLIP PEMBAYARAN - PT<br />
                    PERIODE : {formatValue(period, 20)}<br />
                    NPWP    : {formatValue('N/A', 20)}
                </pre>
            </div>

            {/* Main Body */}
            <div className="flex justify-between mt-6 text-sm">
                <pre className="p-0 m-0">
                    A. PENDAPATAN<br />
                       Basic Salary<br />
                       Performance Incentive<br />
                       BPJS TK (0.54%)
                </pre>
                <pre className="p-0 m-0 text-right">
                    <br />
                    {formatCurrency(payroll.gajiPokok)}<br />
                    {formatCurrency(payroll.insentifKinerja)}<br />
                    {formatCurrency(payroll.bpjsTkKaryawan054)}
                </pre>
                <pre className="p-0 m-0">
                    B. POTONGAN<br />
                       Tax<br />
                       BPJS TK Kary. (2%)<br />
                       BPJS TK (0.54%)<br />
                    <br />
                       BPJS Pensiun Kary (1%)
                </pre>
                <pre className="p-0 m-0 text-right">
                    <br />
                    {formatCurrency(payroll.pajakPph21)}<br />
                    {formatCurrency(payroll.bpjsTkKaryawan2)}<br />
                    {formatCurrency(payroll.bpjsTkKaryawan054)}<br />
                    <br />
                    {formatCurrency(payroll.bpjsPensiunKaryawan)}
                </pre>
            </div>
            
            <hr className="border-dashed border-black my-2" />
            
            <div className="flex justify-between text-sm">
                <pre className="p-0 m-0">TOTAL PENDAPATAN (A):</pre>
                <pre className="p-0 m-0 text-right">{formatCurrency(payroll.totalPendapatan)}</pre>
                <pre className="p-0 m-0">TOTAL POTONGAN (B):</pre>
                <pre className="p-0 m-0 text-right">{formatCurrency(payroll.totalPotongan)}</pre>
            </div>
            
            <hr className="border-dashed border-black my-2" />

            <div className="flex justify-between text-sm">
                 <pre className="p-0 m-0">
                    LAIN LAIN (C):<br />
                    BPJS Pensiun Persh (2%)<br />
                    BPJS TK Persh (3,7%)
                </pre>
                 <pre className="p-0 m-0 text-right">
                    <br />
                    {formatCurrency(payroll.bpjsPensiunPerusahaan)}<br />
                    {formatCurrency(payroll.bpjsTkPerusahaan)}
                </pre>
                <pre className="p-0 m-0">SALDO PINJAMAN</pre>
                <pre className="p-0 m-0 text-right">{formatCurrency(payroll.saldoPinjaman)}</pre>
            </div>

            <hr className="border-dashed border-black my-2" />

            <div className="flex justify-end text-sm">
                <pre className="p-0 m-0 text-right">YANG DIBAYARKAN (A - B) = {formatCurrency(payroll.takeHomePay)}</pre>
            </div>

            <hr className="border-dashed border-black my-2" />
            
            <pre className="text-sm p-0 m-0">
                BSM
            </pre>

            <div className="mt-8 text-center text-xs font-bold">
                #PAYSLIP INI DICETAK MELALUI SISTEM, TIDAK MEMERLUKAN STAMP ATAU TANDA TANGAN#
            </div>
        </div>
    );
};

const HrPayroll: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users } = useData();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

    const branchEmployees = useMemo(() => {
        if (!hrUser || hrUser.role !== 'HR') return [];
        return users.filter(u => u.profile.branch === hrUser.profile.branch && u.role === 'User');
    }, [users, hrUser]);

    const selectedEmployee = users.find(u => u.id === selectedEmployeeId);
    
    const handlePrint = () => {
        const printContents = document.getElementById('payslip-to-print')?.innerHTML;
        const originalContents = document.body.innerHTML;
        if(printContents) {
            document.body.innerHTML = printContents;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); // To re-initialize the React app
        }
    };

    return (
        <div className="p-4 space-y-6">
            <h1 className="text-3xl font-bold text-primary">Penggajian</h1>
            <p className="text-text-secondary">Pilih karyawan untuk membuat dan melihat slip gaji mereka.</p>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <div className="flex items-end space-x-4">
                    <div className="flex-grow">
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
                     <button 
                        onClick={handlePrint} 
                        disabled={!selectedEmployee}
                        className="btn-secondary flex items-center px-4 py-3 rounded-lg font-bold disabled:bg-gray-600 disabled:cursor-not-allowed"
                    >
                        <PrinterIcon className="h-5 w-5 mr-2" />
                        Cetak Slip Gaji
                    </button>
                </div>
            </div>

            {selectedEmployee ? (
                <div className="animate-fade-in-up">
                    <PayslipView 
                        employee={selectedEmployee} 
                        period={new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })} 
                    />
                </div>
            ) : (
                <div className="text-center py-16">
                     <BanknotesIcon className="h-20 w-20 mx-auto text-text-secondary opacity-50"/>
                     <p className="mt-4 text-text-secondary">Pilih seorang karyawan untuk memulai.</p>
                </div>
            )}
        </div>
    );
};

export default HrPayroll;
