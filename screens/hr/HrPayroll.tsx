import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import { BanknotesIcon, DocumentTextIcon, PrinterIcon } from '@heroicons/react/24/solid';

const PayslipView: React.FC<{ employee: User; period: string, payrollData: any }> = ({ employee, period, payrollData }) => {
    
    if (!payrollData) return null;
    
    const formatAmount = (value: number) => new Intl.NumberFormat('id-ID').format(value);

    return (
        <div id="payslip-to-print" className="bg-white text-black p-4 font-mono text-xs max-w-4xl mx-auto border border-gray-300">
            <p className="font-bold">PT. Mitra Karyawan</p>
            <hr className="border-black my-1"/>
             <table className="w-full my-2">
                <tbody>
                    <tr>
                        <td>COST CENTER : {employee.profile.branch || 'N/A'}</td>
                        <td className="text-right font-bold">SLIP PEMBAYARAN</td>
                    </tr>
                     <tr>
                        <td>NIK : {employee.id}</td>
                        <td className="text-right">PERIODE : {period}</td>
                    </tr>
                     <tr>
                        <td>NAMA : {employee.profile.name}</td>
                        <td className="text-right">NPWP : N/A</td>
                    </tr>
                </tbody>
            </table>
             <table className="w-full my-2">
                 <tbody>
                    <tr>
                        <td className="font-bold w-1/2 align-top">A. PENDAPATAN</td>
                        <td className="font-bold w-1/2 align-top">B. POTONGAN</td>
                    </tr>
                    <tr>
                        <td className="align-top">
                            <table className="w-full"><tbody>
                                <tr><td>Basic Salary</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payrollData.gajiPokok)}</td></tr>
                                <tr><td>Performance Incentive</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payrollData.insentifKinerja)}</td></tr>
                                <tr><td>BPJS TK (0.54%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payrollData.bpjsTkNatura)}</td></tr>
                            </tbody></table>
                        </td>
                         <td className="align-top">
                             <table className="w-full"><tbody>
                                <tr><td>Tax</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payrollData.pajakPph21)}</td></tr>
                                <tr><td>BPJS TK Kary. (2%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payrollData.bpjsTkKaryawan2)}</td></tr>
                                <tr><td>BPJS TK (0.54%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payrollData.bpjsTkKaryawan054)}</td></tr>
                                <tr><td>BPJS Pensiun Kary (1%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payrollData.bpjsPensiunKaryawan)}</td></tr>
                            </tbody></table>
                        </td>
                    </tr>
                    <tr>
                        <td><hr className="border-black my-1"/>
                            <table className="w-full"><tbody>
                                <tr><td className="font-bold">TOTAL PENDAPATAN (A):</td><td className="text-right font-bold">Rp.</td><td className="text-right font-bold">{formatAmount(payrollData.totalPendapatan)}</td></tr>
                            </tbody></table>
                        </td>
                        <td><hr className="border-black my-1"/>
                             <table className="w-full"><tbody>
                                <tr><td className="font-bold">TOTAL POTONGAN (B):</td><td className="text-right font-bold">Rp.</td><td className="text-right font-bold">{formatAmount(payrollData.totalPotongan)}</td></tr>
                            </tbody></table>
                        </td>
                    </tr>
                </tbody>
            </table>
            <table className="w-full my-2">
                 <tbody>
                     <tr>
                        <td className="font-bold w-1/2 align-top">LAIN LAIN (C):</td>
                        <td className="font-bold w-1/2 align-top">SALDO PINJAMAN</td>
                    </tr>
                    <tr>
                         <td className="align-top">
                             <table className="w-full"><tbody>
                                <tr><td>BPJS Pensiun Persh (2%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payrollData.bpjsPensiunPerusahaan)}</td></tr>
                                <tr><td>BPJS TK Persh (3,7%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payrollData.bpjsTkPerusahaan)}</td></tr>
                            </tbody></table>
                        </td>
                         <td className="align-top">
                             <table className="w-full"><tbody><tr><td></td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payrollData.saldoPinjaman)}</td></tr></tbody></table>
                        </td>
                    </tr>
                </tbody>
            </table>
            <hr className="border-black my-1"/><hr className="border-black mt-1 mb-2"/>
            <p className="text-right font-bold">YANG DIBAYARKAN (A - B) = Rp. {formatAmount(payrollData.takeHomePay)}</p>
             <hr className="border-black mt-2 mb-1"/><hr className="border-black mb-2"/>
            <br/>
            <p>BSM</p>
            <br/><br/>
            <p className="text-center">#PAYSLIP INI DICETAK MELALUI SISTEM, TIDAK MEMERLUKAN STAMP ATAU TANDA TANGAN#</p>
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
        
        const printContent = printContentNode.innerHTML;
        const originalContents = document.body.innerHTML;
        
        const styles = `<style>body { background-color: #fff; color: #000; font-family: 'Courier New', monospace; font-size: 12px; } table { width: 100%; border-collapse: collapse; } td { padding: 2px 4px; } .text-right { text-align: right; } .font-bold { font-weight: bold; } hr { border: none; border-top: 1px solid #000; margin: 4px 0; }</style>`;

        document.body.innerHTML = `${styles}<div>${printContent}</div>`;
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