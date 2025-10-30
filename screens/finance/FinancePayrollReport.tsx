import React, { useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useApp } from '../../contexts/AppContext';
import { BanknotesIcon, ShieldCheckIcon } from '@heroicons/react/24/solid';

const StatCard: React.FC<{ title: string; value: string | number; description: string; }> = ({ title, value, description }) => (
    <div className="bg-surface p-6 rounded-lg border border-border-color">
        <p className="text-sm text-text-secondary">{title}</p>
        <p className="text-3xl font-bold text-primary my-1">{value}</p>
        <p className="text-xs text-text-secondary">{description}</p>
    </div>
);

const FinancePayrollReport: React.FC = () => {
    const { user: financeUser } = useAuth();
    // FIX: Replaced useCore with useApp
    const { users, generatePayslipData } = useApp();

    const payrollReport = useMemo(() => {
        if (!financeUser?.profile.branch) return null;

        const branchEmployees = users.filter(u => u.profile.branch === financeUser.profile.branch && u.role === 'User');
        
        let totalGajiKotor = 0;
        let totalKontribusiPerusahaan = 0;
        let totalBiayaPayroll = 0;

        branchEmployees.forEach(employee => {
            const payslip = generatePayslipData(employee.id);
            if (payslip) {
                const grossSalary = payslip.gajiPokok + payslip.insentifKinerja;
                const companyContribution = payslip.bpjsPensiunPerusahaan + payslip.bpjsTkPerusahaan;
                
                totalGajiKotor += grossSalary;
                totalKontribusiPerusahaan += companyContribution;
                totalBiayaPayroll += (grossSalary + companyContribution);
            }
        });

        return {
            totalGajiKotor,
            totalKontribusiPerusahaan,
            totalBiayaPayroll,
            employeeCount: branchEmployees.length,
        };
    }, [financeUser, users, generatePayslipData]);

    const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

    if (!payrollReport) {
        return <p>Tidak dapat memuat laporan. Informasi cabang tidak ditemukan.</p>;
    }

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary">Laporan Biaya Tenaga Kerja - {financeUser?.profile.branch}</h1>
            <p className="text-text-secondary">Ringkasan biaya tenaga kerja teragregasi untuk cabang Anda bulan ini. Data ini bersifat rahasia.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <StatCard 
                    title="Total Gaji Kotor" 
                    value={formatCurrency(payrollReport.totalGajiKotor)}
                    description={`Total gaji pokok & insentif untuk ${payrollReport.employeeCount} karyawan.`}
                />
                <StatCard 
                    title="Total Kontribusi Perusahaan" 
                    value={formatCurrency(payrollReport.totalKontribusiPerusahaan)}
                    description="Total iuran BPJS Ketenagakerjaan & Pensiun yang ditanggung perusahaan."
                />
                <StatCard 
                    title="Total Biaya Payroll" 
                    value={formatCurrency(payrollReport.totalBiayaPayroll)}
                    description="Keseluruhan biaya yang dikeluarkan perusahaan untuk gaji & kontribusi."
                />
            </div>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <h2 className="text-xl font-bold mb-4">Detail Komponen Biaya</h2>
                <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                        <p>Total Gaji Kotor (Gaji Pokok + Insentif)</p>
                        <p className="font-bold">{formatCurrency(payrollReport.totalGajiKotor)}</p>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-surface-light rounded-lg">
                        <p>Total Kontribusi Perusahaan (BPJS, dll.)</p>
                        <p className="font-bold">{formatCurrency(payrollReport.totalKontribusiPerusahaan)}</p>
                    </div>
                    <div className="flex justify-between items-center p-4 bg-surface-light rounded-lg border-t-2 border-primary">
                        <p className="font-bold text-lg text-primary">Total Biaya Keseluruhan</p>
                        <p className="font-bold text-lg text-primary">{formatCurrency(payrollReport.totalBiayaPayroll)}</p>
                    </div>
                </div>
            </div>

             <div className="bg-surface-light p-4 rounded-lg border border-border-color flex items-start">
                <ShieldCheckIcon className="h-8 w-8 text-primary mr-4 flex-shrink-0" />
                <div>
                    <h3 className="font-bold text-text-primary">Kerahasiaan Data</h3>
                    <p className="text-sm text-text-secondary">
                        Laporan ini hanya menampilkan data keuangan yang sudah dirangkum. Untuk menjaga privasi, tidak ada informasi gaji atau detail pribadi per karyawan yang ditampilkan.
                    </p>
                </div>
            </div>

        </div>
    );
};

export default FinancePayrollReport;