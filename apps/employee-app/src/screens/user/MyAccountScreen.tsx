import React, { useState, useMemo } from 'react';
import { useAuth, useTheme, useData, Role, User } from '@mk/shared';
import { ChevronRightIcon, PencilSquareIcon, HeartIcon, BuildingStorefrontIcon, BanknotesIcon, ArrowRightOnRectangleIcon, BookmarkIcon, DocumentTextIcon, BriefcaseIcon, SunIcon, MoonIcon, CalendarDaysIcon, XMarkIcon, CreditCardIcon, KeyIcon, PrinterIcon, ClipboardDocumentListIcon, ClipboardDocumentCheckIcon, UserGroupIcon, TrophyIcon, StarIcon } from '@heroicons/react/24/solid';
import { Link } from 'react-router-dom';
import MyKpiModal from '../../components/user/MyKpiModal';
import DesktopLeftSidebar from '../../components/layout/DesktopLeftSidebar';


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
    }, [user.id, generatePayslipData]);

    const handlePrint = () => {
        const printContentNode = document.getElementById('payslip-to-print-container');
        if (!printContentNode) return;
        const printContent = printContentNode.innerHTML;
        const originalContents = document.body.innerHTML;
        const styles = `<style>body { background-color: #fff; color: #000; font-family: 'Courier New', monospace; font-size: 12px; } table { width: 100%; border-collapse: collapse; } td { padding: 2px 4px; } .text-right { text-align: right; } .font-bold { font-weight: bold; } hr { border: none; border-top: 1px solid #000; margin: 4px 0; }</style>`;
        document.body.innerHTML = `${styles}<div>${printContent}</div>`;
        window.print();
        document.body.innerHTML = originalContents;
        window.location.reload(); 
    };
    
    if (!isOpen) return null;
    if (!payroll) return null;

    const formatAmount = (value: number) => new Intl.NumberFormat('id-ID').format(value);
    const currentPeriod = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-4xl border border-border-color max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Slip Gaji - {currentPeriod}</h2>
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

                <div id="payslip-to-print-container" className="bg-white text-black p-4 font-mono text-xs mx-auto border border-gray-300">
                     <p className="font-bold">PT. Mitra Karyawan</p>
                    <hr />
                    <table className="w-full my-2">
                        <tbody>
                            <tr>
                                <td>COST CENTER : {user.profile.branch || 'N/A'}</td>
                                <td className="text-right font-bold">SLIP PEMBAYARAN</td>
                            </tr>
                             <tr>
                                <td>NIK : {user.id}</td>
                                <td className="text-right">PERIODE : {currentPeriod}</td>
                            </tr>
                             <tr>
                                <td>NAMA : {user.profile.name}</td>
                                <td className="text-right">NPWP : N/A</td>
                            </tr>
                             <tr>
                                <td>SKOR KINERJA: {payroll.performanceScore.toFixed(2)}</td>
                                <td className="text-right"></td>
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
                                    <table><tbody>
                                        <tr><td>Basic Salary</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payroll.gajiPokok)}</td></tr>
                                        <tr><td>Performance Incentive</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payroll.insentifKinerja)}</td></tr>
                                        <tr><td>BPJS TK (0.54%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payroll.bpjsTkNatura)}</td></tr>
                                    </tbody></table>
                                </td>
                                 <td className="align-top">
                                    <table><tbody>
                                        <tr><td>Tax</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payroll.pajakPph21)}</td></tr>
                                        <tr><td>BPJS TK Kary. (2%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payroll.bpjsTkKaryawan2)}</td></tr>
                                        <tr><td>BPJS TK (0.54%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payroll.bpjsTkKaryawan054)}</td></tr>
                                        <tr><td>BPJS Pensiun Kary (1%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payroll.bpjsPensiunKaryawan)}</td></tr>
                                    </tbody></table>
                                </td>
                            </tr>
                            <tr>
                                <td><hr/><table><tbody><tr><td className="font-bold">TOTAL PENDAPATAN (A):</td><td className="text-right font-bold">Rp.</td><td className="text-right font-bold">{formatAmount(payroll.totalPendapatan)}</td></tr></tbody></table></td>
                                <td><hr/><table><tbody><tr><td className="font-bold">TOTAL POTONGAN (B):</td><td className="text-right font-bold">Rp.</td><td className="text-right font-bold">{formatAmount(payroll.totalPotongan)}</td></tr></tbody></table></td>
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
                                    <table><tbody>
                                        <tr><td>BPJS Pensiun Persh (2%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payroll.bpjsPensiunPerusahaan)}</td></tr>
                                        <tr><td>BPJS TK Persh (3,7%)</td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payroll.bpjsTkPerusahaan)}</td></tr>
                                    </tbody></table>
                                </td>
                                 <td className="align-top">
                                     <table><tbody><tr><td></td><td className="text-right">Rp.</td><td className="text-right">{formatAmount(payroll.saldoPinjaman)}</td></tr></tbody></table>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                    <hr/><hr/>
                    <p className="text-right font-bold">YANG DIBAYARKAN (A - B) = Rp. {formatAmount(payroll.takeHomePay)}</p>
                    <hr/><hr/>
                    <br/>
                    <p>BSM</p>
                    <br/><br/>
                    <p className="text-center">#PAYSLIP INI DICETAK MELALUI SISTEM, TIDAK MEMERLUKAN STAMP ATAU TANDA TANGAN#</p>
                </div>
            </div>
        </div>
    );
};

const AccountRightSidebar: React.FC<{ user: User }> = ({ user }) => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="space-y-6">
            <div className="p-4 bg-surface rounded-lg border border-border-color">
                 <h3 className="font-bold text-text-secondary text-sm mb-2 flex items-center"><TrophyIcon className="h-4 w-4 mr-2"/> Poin & Pencapaian</h3>
                 <div className="text-center py-4">
                    <p className="text-text-secondary text-sm">Poin Loyalitas</p>
                    <div className="flex items-center justify-center space-x-1 my-1">
                        <StarIcon className="h-6 w-6 text-secondary" />
                        <p className="text-3xl font-bold text-secondary">{user.loyaltyPoints.toLocaleString('id-ID')}</p>
                    </div>
                 </div>
                 <h4 className="font-bold text-text-secondary text-xs mt-2 mb-1">Lencana:</h4>
                 <p className="text-xs text-text-primary">{user.achievements.join(', ') || 'Belum ada'}</p>
            </div>
             <div className="p-4 bg-surface rounded-lg border border-border-color">
                 <h3 className="font-bold text-text-secondary text-sm mb-2 flex items-center">
                    {theme === 'dark' ? <MoonIcon className="h-4 w-4 mr-2" /> : <SunIcon className="h-4 w-4 mr-2" />}
                    Mode Tampilan
                </h3>
                <div className="flex justify-between items-center">
                    <span className="text-text-primary text-sm">Mode {theme === 'dark' ? 'Gelap' : 'Terang'}</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={theme === 'dark'} onChange={toggleTheme} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gray-800"></div>
                    </label>
                </div>
            </div>
        </div>
    )
};

const MyAccountScreen: React.FC = () => {
    const { user, logout } = useAuth();
    const { applyForPayLater, users } = useData();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isPayslipModalOpen, setIsPayslipModalOpen] = useState(false);
    const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);

    const isManager = useMemo(() => {
        if (!user) return false;
        return users.some(u => u.profile.managerId === user.id);
    }, [users, user]);

    if (!user || !user.profile) return null;
    
    const activityItems = [
        { name: 'Riwayat Konsultasi', icon: DocumentTextIcon, path: '/my-consultations' },
        { name: 'Artikel Tersimpan', icon: BookmarkIcon, path: '/bookmarked-articles' },
        { name: 'Riwayat Absensi', icon: ClipboardDocumentListIcon, path: '/attendance-history' },
        { name: 'Kinerja & KPI', icon: ClipboardDocumentCheckIcon, path: '#', action: () => setIsKpiModalOpen(true) },
    ];
    
    const marketplaceItems = [
        { name: 'Wishlist Saya', icon: HeartIcon, path: '/wishlist' },
        { name: 'Toko Saya', icon: BuildingStorefrontIcon, path: '/my-products' },
    ];
    
    const settingsItems = [
         { name: 'Ajukan Cuti', icon: CalendarDaysIcon, path: '#', action: () => setLeaveModalOpen(true) },
         { name: 'Pengajuan Dana Opex', icon: CreditCardIcon, path: '/opex' },
         { name: 'Ubah Password', icon: KeyIcon, path: '#', action: () => setChangePasswordModalOpen(true) },
         { name: 'Slip Gaji', icon: BanknotesIcon, path: '#', action: () => setIsPayslipModalOpen(true) },
    ];
    
    const portalItems = [
        ...(user.role === Role.HR ? [{ name: 'Portal HR', icon: BriefcaseIcon, path: 'http://localhost:3001/#/hr/dashboard' }] : []),
        ...(isManager ? [{ name: 'Portal Manajer', icon: UserGroupIcon, path: 'http://localhost:3001/#/manager/dashboard' }] : []),
    ];

    const MenuItem: React.FC<{ item: { name: string, icon: React.ElementType, path: string, action?: () => void }, isPortal?: boolean }> = ({ item, isPortal = false }) => {
        const content = (
            <div className={`flex justify-between items-center p-4 w-full text-left hover:bg-surface-light ${isPortal ? 'bg-primary/10 hover:bg-primary/20' : 'border-t border-border-color'}`}>
                <div className="flex items-center">
                    <item.icon className={`h-6 w-6 mr-4 ${isPortal ? 'text-primary' : 'text-primary'}`} />
                    <span className={isPortal ? 'font-bold text-primary' : 'text-text-primary'}>{item.name}</span>
                </div>
                <ChevronRightIcon className={`h-5 w-5 ${isPortal ? 'text-primary' : 'text-text-secondary'}`} />
            </div>
        );
        if (isPortal) return <a href={item.path} className="block">{content}</a>;
        return item.path === '#' ? <button onClick={item.action} className="w-full">{content}</button> : <Link to={item.path} className="block">{content}</Link>;
    };
    
    return (
        <div className="lg:grid lg:grid-cols-12 lg:gap-8">
            <DesktopLeftSidebar />
            <main className="lg:col-span-6 p-4 lg:p-0 space-y-6">
                <div className="bg-surface rounded-lg border border-border-color lg:hidden">
                    <div className="p-4 flex items-center space-x-4">
                        <img src={user.profile.photoUrl} alt="Profile" className="w-16 h-16 rounded-full border-2 border-primary" />
                        <div>
                            <h1 className="text-xl font-bold">{user.profile.name}</h1>
                            <p className="text-sm text-text-secondary">{user.email}</p>
                        </div>
                    </div>
                </div>
            
                <div className="bg-surface rounded-lg border border-border-color">
                    <h2 className="p-4 text-lg font-bold">Aktivitas Saya</h2>
                    {activityItems.map(item => <MenuItem key={item.name} item={item} />)}
                </div>

                <div className="bg-surface rounded-lg border border-border-color">
                    <h2 className="p-4 text-lg font-bold">Marketplace</h2>
                    {marketplaceItems.map(item => <MenuItem key={item.name} item={item} />)}
                </div>

                <div className="bg-surface rounded-lg border border-border-color">
                    <h2 className="p-4 text-lg font-bold">Pengaturan & Lainnya</h2>
                    {settingsItems.map(item => <MenuItem key={item.name} item={item} />)}
                    {portalItems.map(item => <MenuItem key={item.name} item={item} isPortal />)}
                </div>
                
                <button onClick={logout} className="w-full flex items-center justify-center p-4 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-colors">
                    <ArrowRightOnRectangleIcon className="h-6 w-6 mr-2" /> Logout
                </button>
            </main>

            <aside className="hidden lg:block lg:col-span-3">
                <div className="sticky top-20">
                    <AccountRightSidebar user={user}/>
                </div>
            </aside>
            
            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} user={user} />
            <LeaveRequestModal isOpen={isLeaveModalOpen} onClose={() => setLeaveModalOpen(false)} />
            <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
            <PayslipModal isOpen={isPayslipModalOpen} onClose={() => setIsPayslipModalOpen(false)} user={user} />
            <MyKpiModal isOpen={isKpiModalOpen} onClose={() => setIsKpiModalOpen(false)} user={user} />
        </div>
    );
};

export default MyAccountScreen;
