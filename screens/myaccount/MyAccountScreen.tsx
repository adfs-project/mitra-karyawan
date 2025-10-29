import React, { useState, useMemo } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { ChevronRightIcon, PencilSquareIcon, HeartIcon, BuildingStorefrontIcon, BanknotesIcon, ArrowRightOnRectangleIcon, BookmarkIcon, DocumentTextIcon, BriefcaseIcon, SunIcon, MoonIcon, CalendarDaysIcon, XMarkIcon, CreditCardIcon, KeyIcon, PrinterIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { Role, User } from '../../types';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';


const EditProfileModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User;
}> = ({ isOpen, onClose, user }) => {
    const { updateCurrentUser } = useAuth();
    const [name, setName] = useState(user.profile.name);
    const [phone, setPhone] = useState(user.profile.phone);
    
    const handleSave = () => {
        const updatedUser = { ...user, profile: { ...user.profile, name, phone } };
        updateCurrentUser(updatedUser);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-md border border-border-color">
                <h2 className="text-xl font-bold mb-4">Edit Profil</h2>
                <div className="space-y-4">
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Nama Lengkap</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Nomor Telepon</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                </div>
                 <div className="flex justify-end space-x-2 mt-6">
                    <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Batal</button>
                    <button onClick={handleSave} className="btn-primary px-4 py-2 rounded">Simpan</button>
                </div>
            </div>
        </div>
    );
};

const LeaveRequestModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { submitLeaveRequest } = useData();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async () => {
        if (!startDate || !endDate || !reason) {
            alert("Harap isi semua kolom.");
            return;
        }
        setIsLoading(true);
        await submitLeaveRequest({ startDate, endDate, reason });
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;
    
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Formulir Pengajuan Cuti</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-text-secondary">Tanggal Mulai</label>
                            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                        <div>
                            <label className="text-sm text-text-secondary">Tanggal Selesai</label>
                            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm text-text-secondary">Alasan Cuti</label>
                        <textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full p-2 bg-surface-light rounded border border-border-color"></textarea>
                    </div>
                     <div className="flex justify-end space-x-2">
                        <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Batal</button>
                        <button onClick={handleSubmit} disabled={isLoading} className="btn-primary px-4 py-2 rounded w-28 flex justify-center">{isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Ajukan'}</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

const PayLaterModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { applyForPayLater } = useData();
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async () => {
        setIsSubmitting(true);
        await applyForPayLater();
        setIsSubmitting(false);
        setIsSubmitted(true);
        setTimeout(() => {
            onClose();
            setIsSubmitted(false);
        }, 3000);
    };

    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-2xl font-bold">Pengajuan PayLater</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                {isSubmitted ? (
                    <div className="text-center p-8">
                        <h3 className="text-xl font-bold text-primary">Pengajuan Terkirim!</h3>
                        <p className="text-text-secondary mt-2">Terima kasih. Pengajuan Anda sedang kami proses. Anda akan menerima notifikasi jika ada pembaruan.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        <p className="text-sm text-text-secondary">Untuk mengajukan PayLater, kami memerlukan beberapa dokumen. Silakan unggah foto KTP dan foto selfie dengan KTP Anda.</p>
                        <div className="space-y-3">
                            <div>
                                <label className="text-sm font-bold text-text-secondary">Foto KTP</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-color border-dashed rounded-md">
                                    <button type="button" className="text-primary font-semibold">Unggah File (Simulasi)</button>
                                </div>
                            </div>
                             <div>
                                <label className="text-sm font-bold text-text-secondary">Foto Selfie dengan KTP</label>
                                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-border-color border-dashed rounded-md">
                                    <button type="button" className="text-primary font-semibold">Gunakan Kamera (Simulasi)</button>
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end space-x-2">
                            <button type="button" onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Batal</button>
                            <button onClick={handleSubmit} disabled={isSubmitting} className="btn-primary px-4 py-2 rounded w-36 flex justify-center">{isSubmitting ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Kirim Pengajuan'}</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

const ChangePasswordModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
}> = ({ isOpen, onClose }) => {
    const { changePassword } = useAuth();
    const { showToast } = useData();
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSave = async () => {
        setError('');
        if (newPassword !== confirmPassword) {
            setError('Password baru tidak cocok.');
            return;
        }
        if (newPassword.length < 6) {
            setError('Password baru minimal harus 6 karakter.');
            return;
        }

        setIsLoading(true);
        const result = await changePassword(currentPassword, newPassword);
        setIsLoading(false);

        if (result === 'success') {
            showToast('Password berhasil diubah.', 'success');
            handleClose();
        } else {
            setError('Password saat ini salah.');
        }
    };
    
    const handleClose = () => {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setError('');
        setIsLoading(false);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-md border border-border-color">
                <h2 className="text-xl font-bold mb-4">Ubah Password</h2>
                <div className="space-y-4">
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Password Saat Ini</label>
                        <input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Password Baru</label>
                        <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                     <div>
                        <label className="text-sm font-bold text-text-secondary">Konfirmasi Password Baru</label>
                        <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                </div>
                {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
                 <div className="flex justify-end space-x-2 mt-6">
                    <button type="button" onClick={handleClose} className="px-4 py-2 rounded bg-surface-light">Batal</button>
                    <button onClick={handleSave} disabled={isLoading} className="btn-primary px-4 py-2 rounded w-28 flex justify-center">
                         {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Simpan'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const PayslipModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    user: User;
}> = ({ isOpen, onClose, user }) => {
    const { generatePayslipData } = useData();

    const payroll = useMemo(() => {
        return generatePayslipData(user.id);
    }, [user, generatePayslipData]);

    const fullPayslipString = useMemo(() => {
        const currentUser = user;
        const currentPeriod = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });

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
    }, [payroll, user]);


    const handlePrint = () => {
        const printContents = document.getElementById('user-payslip-to-print')?.textContent;
        const originalContents = document.body.innerHTML;
        if (printContents) {
            document.body.innerHTML = `<pre style="font-family: 'Courier New', Courier, monospace; font-size: 12px; white-space: pre;">${printContents}</pre>`;
            window.print();
            document.body.innerHTML = originalContents;
            window.location.reload();
        }
    };
    
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-5xl border border-border-color max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Slip Gaji - {new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' })}</h2>
                    <div className="flex items-center space-x-2">
                        <button onClick={handlePrint} className="btn-secondary flex items-center px-3 py-1.5 rounded-lg text-sm font-bold">
                            <PrinterIcon className="h-4 w-4 mr-2" />
                            Cetak
                        </button>
                        <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light">
                            <XMarkIcon className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <div className="bg-white text-black p-4 font-mono text-xs mx-auto border border-gray-300">
                    <pre id="user-payslip-to-print" className="p-0 m-0 leading-relaxed whitespace-pre" style={{ fontFamily: "'Courier New', Courier, monospace", fontSize: '12px' }}>
                        {fullPayslipString}
                    </pre>
                </div>
            </div>
        </div>
    );
};


const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="flex justify-between items-center p-4 w-full text-left hover:bg-surface-light">
            <div className="flex items-center">
                {theme === 'dark' ? <MoonIcon className="h-6 w-6 text-primary mr-4" /> : <SunIcon className="h-6 w-6 text-primary mr-4" />}
                <span className="text-text-primary">Mode Tampilan</span>
            </div>
            <div className="flex items-center space-x-2">
                <span className="text-sm text-text-secondary">{theme === 'dark' ? 'Gelap' : 'Terang'}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                </label>
            </div>
        </div>
    );
};

const MyAccountScreen: React.FC = () => {
    const { user, logout } = useAuth();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
    const [isPayLaterModalOpen, setPayLaterModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);

    if (!user) return null;

    const menuItems = [
        { name: 'Riwayat Konsultasi', icon: DocumentTextIcon, path: '/my-consultations' },
        { name: 'Wishlist Saya', icon: HeartIcon, path: '/wishlist' },
        { name: 'Toko Saya', icon: BuildingStorefrontIcon, path: '/my-products' },
        { name: 'Artikel Tersimpan', icon: BookmarkIcon, path: '/bookmarked-articles' },
        { name: 'Ajukan Cuti', icon: CalendarDaysIcon, path: '#', action: () => setLeaveModalOpen(true) },
        { name: 'Aplikasi PayLater', icon: CreditCardIcon, path: '#', action: () => setPayLaterModalOpen(true) },
        { name: 'Ubah Password', icon: KeyIcon, path: '#', action: () => setChangePasswordModalOpen(true) },
        { name: 'Slip Gaji', icon: BanknotesIcon, path: '#', action: () => setIsPayslipModalOpen(true) },
    ];
    
    const hrMenuItem = { name: 'Portal HR', icon: BriefcaseIcon, path: '/hr-portal' };

    const MenuItem: React.FC<{ item: { name: string, icon: React.ElementType, path: string, action?: () => void } }> = ({ item }) => {
        const content = (
            <div className="flex justify-between items-center p-4 w-full text-left border-t border-border-color hover:bg-surface-light">
                <div className="flex items-center">
                    <item.icon className="h-6 w-6 text-primary mr-4" />
                    <span className="text-text-primary">{item.name}</span>
                </div>
                <ChevronRightIcon className="h-5 w-5 text-text-secondary" />
            </div>
        );

        return item.path === '#' ? <button onClick={item.action} className="w-full">{content}</button> : <Link to={item.path} className="block">{content}</Link>;
    };
    
    const payLaterStatusMap = {
        not_applied: { text: "Belum Aktif", color: "text-text-secondary" },
        pending: { text: "Menunggu Persetujuan", color: "text-yellow-400" },
        approved: { text: "Aktif", color: "text-green-400" },
        rejected: { text: "Ditolak", color: "text-red-400" },
    };
    const payLaterInfo = user.payLater ? payLaterStatusMap[user.payLater.status] : payLaterStatusMap['not_applied'];


    return (
        <div className="pb-4">
            <div className="bg-surface p-6">
                <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-4">
                        <img src={user.profile.photoUrl} alt="Profile" className="w-20 h-20 rounded-full border-2 border-primary" />
                        <div>
                            <h1 className="text-2xl font-bold text-text-primary">{user.profile.name}</h1>
                            <p className="text-text-secondary">{user.email}</p>
                            <p className="text-text-secondary text-sm">{user.profile.phone}</p>
                        </div>
                    </div>
                     <button onClick={() => setEditModalOpen(true)} className="p-2 bg-surface-light rounded-full hover:bg-border-color">
                        <PencilSquareIcon className="h-6 w-6 text-primary"/>
                    </button>
                </div>
                 <div className="mt-4 bg-surface-light p-3 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="text-xs font-bold text-text-secondary">STATUS PAYLATER</p>
                        <p className={`font-bold ${payLaterInfo.color}`}>{payLaterInfo.text}</p>
                    </div>
                    {user.payLater?.status === 'approved' && (
                        <div className="text-right">
                             <p className="text-xs font-bold text-text-secondary">LIMIT</p>
                             <p className="font-bold text-primary">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(user.payLater.limit)}</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="m-4 bg-surface rounded-lg border border-border-color p-4">
                <h2 className="text-lg font-bold text-primary mb-4 flex items-center">
                    <BriefcaseIcon className="h-5 w-5 mr-2" />
                    Informasi Kepegawaian
                </h2>
                <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                    <div>
                        <p className="text-text-secondary">Gaji Bulanan</p>
                        <p className="font-semibold text-text-primary">***RAHASIA***</p>
                    </div>
                     <div>
                        <p className="text-text-secondary">Status Kepegawaian</p>
                        <p className="font-semibold text-text-primary">{user.profile.employmentStatus || '-'}</p>
                    </div>
                    <div>
                        <p className="text-text-secondary">Nama Perusahaan</p>
                        <p className="font-semibold text-text-primary">{user.profile.companyName || '-'}</p>
                    </div>
                    <div>
                        <p className="text-text-secondary">Tanggal Mulai Bekerja</p>
                        <p className="font-semibold text-text-primary">{user.profile.joinDate ? new Date(user.profile.joinDate).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'}) : '-'}</p>
                    </div>
                    <div>
                        <p className="text-text-secondary">Tipe Karyawan</p>
                        <p className="font-semibold text-text-primary">{user.profile.employeeType || '-'}</p>
                    </div>
                     <div>
                        <p className="text-text-secondary">Tempat & Tanggal Lahir</p>
                        <p className="font-semibold text-text-primary">
                            {user.profile.placeOfBirth || '-'}, {user.profile.dateOfBirth ? new Date(user.profile.dateOfBirth).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric'}) : '-'}
                        </p>
                    </div>
                </div>
            </div>
            
            <div className="m-4 bg-surface rounded-lg border border-border-color">
                <ThemeToggle />
                {user.role === Role.HR && (
                     <Link to={hrMenuItem.path} key={hrMenuItem.name} className="flex justify-between items-center p-4 w-full text-left border-t border-border-color bg-primary/10 hover:bg-primary/20">
                        <div className="flex items-center">
                            <hrMenuItem.icon className="h-6 w-6 text-primary mr-4" />
                            <span className="text-primary font-bold">{hrMenuItem.name}</span>
                        </div>
                        <ChevronRightIcon className="h-5 w-5 text-primary" />
                    </Link>
                )}
                {menuItems.map((item) => <MenuItem key={item.name} item={item} />)}
            </div>

             <div className="m-4">
                <button 
                    onClick={logout} 
                    className="w-full flex items-center justify-center p-4 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-colors"
                >
                    <ArrowRightOnRectangleIcon className="h-6 w-6 mr-2" />
                    Logout
                </button>
            </div>
            
            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} user={user} />
            <LeaveRequestModal isOpen={isLeaveModalOpen} onClose={() => setLeaveModalOpen(false)} />
            <PayLaterModal isOpen={isPayLaterModalOpen} onClose={() => setPayLaterModalOpen(false)} />
            <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
            <PayslipModal isOpen={isPayslipModalOpen} onClose={() => setIsPayslipModalOpen(false)} user={user} />
        </div>
    );
};

export default MyAccountScreen;
