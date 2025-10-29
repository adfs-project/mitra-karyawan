import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import { BanknotesIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/solid';

const PayslipView: React.FC<{ employee: User; period: string }> = ({ employee, period }) => {
    
    const payroll = useMemo(() => {
        if (!employee || !employee.profile.salary) return null;

        const grossSalary = employee.profile.salary;
        
        const gajiPokok = grossSalary;
        const insentifKinerja = 0;
        const bpjsTkNatura = grossSalary * 0.0054; // Shown as income for tax purposes, but not cash.
        const totalPendapatan = gajiPokok + insentifKinerja + bpjsTkNatura;

        const pajakPph21 = grossSalary * 0.025;
        const bpjsTkKaryawan2 = grossSalary * 0.02;
        const bpjsTkKaryawan054 = grossSalary * 0.0054;
        const bpjsPensiunKaryawan = grossSalary * 0.01;
        const totalPotongan = pajakPph21 + bpjsTkKaryawan2 + bpjsTkKaryawan054 + bpjsPensiunKaryawan;
        
        const bpjsPensiunPerusahaan = grossSalary * 0.02;
        const bpjsTkPerusahaan = grossSalary * 0.037;
        
        // Take home pay is cash income minus deductions.
        const takeHomePay = (gajiPokok + insentifKinerja) - totalPotongan;

        return {
            gajiPokok, insentifKinerja, totalPendapatan, pajakPph21,
            bpjsTkKaryawan2, bpjsTkKaryawan054, bpjsPensiunKaryawan, totalPotongan,
            bpjsPensiunPerusahaan, bpjsTkPerusahaan, takeHomePay, saldoPinjaman: 0,
            bpjsTkNatura
        };
    }, [employee]);

    const payslipContent = useMemo(() => {
        if (!payroll) return null;
        
        const LABEL_WIDTH = 28;
        const VALUE_WIDTH = 15;
        const TOTAL_COLUMN_WIDTH = LABEL_WIDTH + 4 + VALUE_WIDTH;
        const SEPARATOR = ' '.repeat(4);
        const LINE_SEPARATOR = '-'.repeat(TOTAL_COLUMN_WIDTH * 2 + SEPARATOR.length);

        const formatLine = (label: string, value: number | null): string => {
            const paddedLabel = label.padEnd(LABEL_WIDTH);
            if (value === null || isNaN(value)) {
                return ''.padEnd(TOTAL_COLUMN_WIDTH);
            }
            const formattedValue = new Intl.NumberFormat('id-ID').format(value);
            return `${paddedLabel}Rp. ${formattedValue.padStart(VALUE_WIDTH)}`;
        };

        let content = '';
        content += `A. PENDAPATAN`.padEnd(TOTAL_COLUMN_WIDTH) + SEPARATOR + `B. POTONGAN\n`;
        content += `${formatLine('   Basic Salary', payroll.gajiPokok)}${SEPARATOR}${formatLine('   Tax', payroll.pajakPph21)}\n`;
        content += `${formatLine('   Performance Incentive', payroll.insentifKinerja)}${SEPARATOR}${formatLine('   BPJS TK Kary. (2%)', payroll.bpjsTkKaryawan2)}\n`;
        content += `${formatLine('   BPJS TK (0.54%)', payroll.bpjsTkNatura)}${SEPARATOR}${formatLine('   BPJS TK (0.54%)', payroll.bpjsTkKaryawan054)}\n`;
        content += `${formatLine('', null)}${SEPARATOR}${formatLine('   BPJS Pensiun Kary (1%)', payroll.bpjsPensiunKaryawan)}\n`;
        content += LINE_SEPARATOR + '\n';
        content += `${formatLine('TOTAL PENDAPATAN (A):', payroll.totalPendapatan)}${SEPARATOR}${formatLine('TOTAL POTONGAN (B):', payroll.totalPotongan)}\n`;
        content += LINE_SEPARATOR + '\n';
        content += `LAIN LAIN (C):`.padEnd(TOTAL_COLUMN_WIDTH) + SEPARATOR + `SALDO PINJAMAN\n`;
        content += `${formatLine('   BPJS Pensiun Persh (2%)', payroll.bpjsPensiunPerusahaan)}${SEPARATOR}${formatLine('', payroll.saldoPinjaman)}\n`;
        content += `${formatLine('   BPJS TK Persh (3,7%)', payroll.bpjsTkPerusahaan)}\n`;
        content += LINE_SEPARATOR + '\n';
        content += ' '.repeat(TOTAL_COLUMN_WIDTH + SEPARATOR.length) + `YANG DIBAYARKAN (A - B) = Rp. ${new Intl.NumberFormat('id-ID').format(payroll.takeHomePay).padStart(VALUE_WIDTH)}\n`;
        content += LINE_SEPARATOR + '\n';
        content += 'BSM';
        return content;
    }, [payroll]);

    if (!payroll) return null;

    return (
        <div className="bg-white text-black p-8 font-mono text-xs max-w-4xl mx-auto border border-gray-300">
             <div className="flex justify-between items-start border-b-2 border-black pb-2">
                <h1 className="text-2xl font-bold">PT. Mitra Karyawan</h1>
                <p className="font-bold tracking-widest">CONFIDENTIAL</p>
            </div>
             <div className="flex justify-between mt-4 text-sm">
                <pre className="p-0 m-0">
                    {`COST CENTER : ${employee.profile.branch || 'N/A'}\n`}
                    {`NIK         : ${employee.id}\n`}
                    {`NAMA        : ${employee.profile.name}`}
                </pre>
                 <pre className="p-0 m-0 text-right">
                    {`SLIP PEMBAYARAN\n`}
                    {`PERIODE : ${period}\n`}
                    {`NPWP    : N/A`}
                </pre>
            </div>
            <div className="mt-6" id="payslip-to-print">
                 <pre className="text-sm p-0 m-0 leading-relaxed whitespace-pre">{payslipContent}</pre>
            </div>
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
        const printContentNode = document.getElementById('payslip-to-print');
        if (!printContentNode) return;
        
        const printContent = printContentNode.innerHTML;
        const originalContents = document.body.innerHTML;

        document.body.innerHTML = `<pre style="font-family: monospace; font-size: 10px; white-space: pre;">${printContent.replace(/<br\s*\/?>/gi, '\n')}</pre>`;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); 
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