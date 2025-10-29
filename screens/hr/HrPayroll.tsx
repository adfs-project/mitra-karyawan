import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import { BanknotesIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/solid';

const PayslipView: React.FC<{ employee: User; period: string, payrollData: any }> = ({ employee, period, payrollData }) => {
    
    const fullPayslipString = useMemo(() => {
        const currentUser = employee;
        const currentPeriod = period;
        const payroll = payrollData;

        if (!payroll) return 'Informasi gaji tidak tersedia untuk akun ini.';

        const totalWidth = 96;
        const colWidth = 43;
        const gapWidth = 10;
        const labelWidth = 25;
        const currencyWidth = 5;
        const amountWidth = 13;
        
        const formatAmount = (value: number) => new Intl.NumberFormat('id-ID').format(value);

        const formatLine = (label: string, value: number | null) => {
            if (value === null) return ''.padEnd(colWidth);
            const formattedValue = formatAmount(value);
            return `${label.padEnd(labelWidth)}${'Rp.'.padStart(currencyWidth)}${formattedValue.padStart(amountWidth)}`;
        };

        let lines: string[] = [];
        const itemSeparator = ''.padStart(labelWidth) + ''.padStart(currencyWidth + amountWidth, '-');
        const fullSeparator = ''.padStart(totalWidth, '-');

        lines.push('PT. Mitra Karyawan'.padEnd(totalWidth - 'CONFIDENTIAL'.length) + 'CONFIDENTIAL');
        lines.push('-'.repeat('PT. Mitra Karyawan'.length));
        lines.push('');

        lines.push(`COST CENTER : ${currentUser.profile.branch || 'N/A'}`.padEnd(colWidth + gapWidth) + 'SLIP PEMBAYARAN');
        lines.push(`NIK         : ${currentUser.id}`.padEnd(colWidth + gapWidth) + `PERIODE : ${currentPeriod}`);
        lines.push(`NAMA        : ${currentUser.profile.name}`.padEnd(colWidth + gapWidth) + 'NPWP    : N/A');
        lines.push('');

        const pendapatanItems = [{ label: 'Basic Salary', value: payroll.gajiPokok }, { label: 'Performance Incentive', value: payroll.insentifKinerja }, { label: 'BPJS TK (0.54%)', value: payroll.bpjsTkNatura }];
        const potonganItems = [{ label: 'Tax', value: payroll.pajakPph21 }, { label: 'BPJS TK Kary. (2%)', value: payroll.bpjsTkKaryawan2 }, { label: 'BPJS TK (0.54%)', value: payroll.bpjsTkKaryawan054 }, { label: 'BPJS Pensiun Kary (1%)', value: payroll.bpjsPensiunKaryawan }];
        const lainLainItems = [{ label: 'BPJS Pensiun Persh (2%)', value: payroll.bpjsPensiunPerusahaan }, { label: 'BPJS TK Persh (3,7%)', value: payroll.bpjsTkPerusahaan }];

        lines.push('A. PENDAPATAN'.padEnd(colWidth + gapWidth) + 'B. POTONGAN');
        const maxRows = Math.max(pendapatanItems.length, potonganItems.length);
        for (let i = 0; i < maxRows; i++) {
            const left = pendapatanItems[i] ? formatLine(pendapatanItems[i].label, pendapatanItems[i].value) : ''.padEnd(colWidth);
            const right = potonganItems[i] ? formatLine(potonganItems[i].label, potonganItems[i].value) : ''.padEnd(colWidth);
            lines.push(left + ''.padEnd(gapWidth) + right);
        }
        
        lines.push(itemSeparator.padEnd(colWidth + gapWidth) + itemSeparator);
        lines.push(formatLine('TOTAL PENDAPATAN (A):', payroll.totalPendapatan).padEnd(colWidth + gapWidth) + formatLine('TOTAL POTONGAN (B):', payroll.totalPotongan));
        lines.push('');

        lines.push('LAIN LAIN (C):'.padEnd(colWidth + gapWidth) + 'SALDO PINJAMAN');
        lines.push(formatLine(lainLainItems[0].label, lainLainItems[0].value).padEnd(colWidth + gapWidth) + formatLine('', payroll.saldoPinjaman));
        lines.push(formatLine(lainLainItems[1].label, lainLainItems[1].value));
        
        lines.push(fullSeparator);
        const takeHomeLine = `YANG DIBAYARKAN (A - B) = Rp. ${formatAmount(payroll.takeHomePay).padStart(amountWidth)}`;
        lines.push(''.padEnd(colWidth + gapWidth) + takeHomeLine);
        lines.push(fullSeparator);
        lines.push('');
        lines.push('BSM');
        lines.push('');
        
        const footerText = '#PAYSLIP INI DICETAK MELALUI SISTEM, TIDAK MEMERLUKAN STAMP ATAU TANDA TANGAN#';
        const padding = Math.floor((totalWidth - footerText.length) / 2);
        lines.push(''.padStart(padding) + footerText);

        return lines.join('\n');
    }, [payrollData, employee, period]);

    if (!payrollData) return null;

    return (
        <div className="bg-white text-black p-4 font-mono text-xs max-w-5xl mx-auto border border-gray-300">
             <pre id="payslip-to-print" className="p-0 m-0 leading-relaxed whitespace-pre" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '12px' }}>
                {fullPayslipString}
            </pre>
        </div>
    );
};

const HrPayroll: React.FC = () => {
    const { user: hrUser } = useAuth();
    const { users, generatePayslipData } = useData();
    const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');

    const branchEmployees = useMemo(() => {
        if (!hrUser || hrUser.role !== 'HR') return [];
        return users.filter(u => u.profile.branch === hrUser.profile.branch && u.role === 'User');
    }, [users, hrUser]);

    const selectedEmployee = users.find(u => u.id === selectedEmployeeId);
    const payrollDataForSelected = useMemo(() => {
        if (selectedEmployeeId) {
            return generatePayslipData(selectedEmployeeId);
        }
        return null;
    }, [selectedEmployeeId, generatePayslipData]);
    
    const handlePrint = () => {
        const printContentNode = document.getElementById('payslip-to-print');
        if (!printContentNode) return;
        
        const printContent = printContentNode.textContent;
        const originalContents = document.body.innerHTML;

        if (printContent) {
            document.body.innerHTML = `<pre style="font-family: 'Courier New', Courier, monospace; font-size: 12px; white-space: pre;">${printContent}</pre>`;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload(); 
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

            {selectedEmployee && payrollDataForSelected ? (
                <div className="animate-fade-in-up">
                    <PayslipView 
                        employee={selectedEmployee} 
                        period={new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })} 
                        payrollData={payrollDataForSelected}
                    />
                </div>
            ) : (
                <div className="text-center py-16">
                     <BanknotesIcon className="h-20 w-20 mx-auto text-text-secondary opacity-50"/>
                     <p className="mt-4 text-text-secondary">{selectedEmployeeId ? 'Loading data...' : 'Pilih seorang karyawan untuk memulai.'}</p>
                </div>
            )}
        </div>
    );
};

export default HrPayroll;
