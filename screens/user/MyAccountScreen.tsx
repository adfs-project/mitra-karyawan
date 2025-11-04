import React, { useState, useMemo } from 'react';
import ReactDOM from 'react-dom/client';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useData } from '../../contexts/DataContext';
import { Role, User } from '../../types';
import { ChevronRightIcon, PencilSquareIcon, HeartIcon, BuildingStorefrontIcon, BanknotesIcon, ArrowRightOnRectangleIcon, BookmarkIcon, DocumentTextIcon, BriefcaseIcon, SunIcon, MoonIcon, CalendarDaysIcon, XMarkIcon, CreditCardIcon, KeyIcon, PrinterIcon, ClipboardDocumentListIcon, ClipboardDocumentCheckIcon, UserGroupIcon, StarIcon, TrophyIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import MyKpiModal from '../../components/user/MyKpiModal';


const EditProfileModal: React.FC<{isOpen: boolean; onClose: () => void; user: User;}> = ({ isOpen, onClose, user }) => { const { updateCurrentUser } = useAuth(); const [name, setName] = useState(user.profile.name); const [phone, setPhone] = useState(user.profile.phone); const handleSave = () => { updateCurrentUser({ ...user, profile: { ...user.profile, name, phone } }); onClose(); }; if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"> <div className="bg-surface p-6 rounded-lg w-full max-w-md border border-border-color"> <h2 className="text-xl font-bold mb-4">Edit Profil</h2> <div className="space-y-4"> <div><label className="text-sm font-bold text-text-secondary">Nama Lengkap</label><input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" /></div> <div><label className="text-sm font-bold text-text-secondary">Nomor Telepon</label><input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" /></div> </div> <div className="flex justify-end space-x-2 mt-6"><button type="button" onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Batal</button><button onClick={handleSave} className="btn-primary px-4 py-2 rounded">Simpan</button></div> </div> </div> ); };
const LeaveRequestModal: React.FC<{isOpen: boolean; onClose: () => void;}> = ({ isOpen, onClose }) => { const { submitLeaveRequest } = useData(); const [startDate, setStartDate] = useState(''); const [endDate, setEndDate] = useState(''); const [reason, setReason] = useState(''); const [isLoading, setIsLoading] = useState(false); const handleSubmit = async () => { if (!startDate || !endDate || !reason) { alert("Harap isi semua kolom."); return; } setIsLoading(true); await submitLeaveRequest({ startDate, endDate, reason }); setIsLoading(false); onClose(); }; if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"> <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color"> <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold">Formulir Pengajuan Cuti</h2><button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button></div> <div className="space-y-4"> <div className="grid grid-cols-2 gap-4"> <div><label className="text-sm text-text-secondary">Tanggal Mulai</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="w-full p-2 bg-surface-light rounded border border-border-color" /></div> <div><label className="text-sm text-text-secondary">Tanggal Selesai</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="w-full p-2 bg-surface-light rounded border border-border-color" /></div> </div> <div><label className="text-sm text-text-secondary">Alasan Cuti</label><textarea value={reason} onChange={e => setReason(e.target.value)} rows={3} className="w-full p-2 bg-surface-light rounded border border-border-color"></textarea></div> <div className="flex justify-end space-x-2"><button type="button" onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Batal</button><button onClick={handleSubmit} disabled={isLoading} className="btn-primary px-4 py-2 rounded w-28 flex justify-center">{isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Ajukan'}</button></div> </div> </div> </div> ); };
const ChangePasswordModal: React.FC<{isOpen: boolean; onClose: () => void;}> = ({ isOpen, onClose }) => { const { changePassword } = useAuth(); const { showToast } = useData(); const [currentPassword, setCurrentPassword] = useState(''); const [newPassword, setNewPassword] = useState(''); const [confirmPassword, setConfirmPassword] = useState(''); const [error, setError] = useState(''); const [isLoading, setIsLoading] = useState(false); const handleSave = async () => { setError(''); if (newPassword !== confirmPassword) { setError('Password baru tidak cocok.'); return; } if (newPassword.length < 6) { setError('Password baru minimal harus 6 karakter.'); return; } setIsLoading(true); const result = await changePassword(currentPassword, newPassword); setIsLoading(false); if (result === 'success') { showToast('Password berhasil diubah.', 'success'); handleClose(); } else { setError('Password saat ini salah.'); } }; const handleClose = () => { setCurrentPassword(''); setNewPassword(''); setConfirmPassword(''); setError(''); setIsLoading(false); onClose(); }; if (!isOpen) return null; return ( <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4"> <div className="bg-surface p-6 rounded-lg w-full max-w-md border border-border-color"> <h2 className="text-xl font-bold mb-4">Ubah Password</h2> <div className="space-y-4"> <div><label className="text-sm font-bold text-text-secondary">Password Saat Ini</label><input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" /></div> <div><label className="text-sm font-bold text-text-secondary">Password Baru</label><input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" /></div> <div><label className="text-sm font-bold text-text-secondary">Konfirmasi Password Baru</label><input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" /></div> </div> {error && <p className="text-red-500 text-sm mt-3">{error}</p>} <div className="flex justify-end space-x-2 mt-6"><button type="button" onClick={handleClose} className="px-4 py-2 rounded bg-surface-light">Batal</button><button onClick={handleSave} disabled={isLoading} className="btn-primary px-4 py-2 rounded w-28 flex justify-center"> {isLoading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Simpan'} </button></div> </div> </div> ); };

const PayslipView: React.FC<{ employee: User; period: string, payrollData: any }> = ({ employee, period, payrollData }) => {
    
    if (!payrollData) return null;
    
    const formatAmount = (value: number) => new Intl.NumberFormat('id-ID').format(value);

    // Using inline styles for print-specific rendering
    const styles = {
        container: { backgroundColor: '#fff', color: '#000', fontFamily: "'Courier New', monospace", fontSize: '10px', maxWidth: '800px', margin: 'auto', padding: '16px', border: '1px solid #ccc' },
        hr: { border: 'none', borderTop: '1px solid #000', margin: '4px 0' },
        bold: { fontWeight: 'bold' },
        textRight: { textAlign: 'right' },
        table: { width: '100%', borderCollapse: 'collapse', margin: '8px 0' },
        td: { padding: '2px 4px' },
    } as const;

    return (
        <div style={styles.container}>
            <p style={styles.bold}>PT. Mitra Karyawan</p>
            <hr style={styles.hr}/>
             <table style={styles.table}> <tbody>
                <tr> <td style={styles.td}>COST CENTER : {employee.profile.branch || 'N/A'}</td> <td style={{...styles.td, ...styles.textRight, ...styles.bold}}>SLIP PEMBAYARAN</td> </tr>
                <tr> <td style={styles.td}>NIK : {employee.id}</td> <td style={{...styles.td, ...styles.textRight}}>PERIODE : {period}</td> </tr>
                <tr> <td style={styles.td}>NAMA : {employee.profile.name}</td> <td style={{...styles.td, ...styles.textRight}}>NPWP : N/A</td> </tr>
                <tr> <td style={styles.td}>SKOR KINERJA: {payrollData.performanceScore.toFixed(2)}</td> <td style={{...styles.td, ...styles.textRight}}></td> </tr>
            </tbody> </table>
             <table style={styles.table}> <tbody>
                <tr> <td style={{...styles.td, ...styles.bold, width: '50%', verticalAlign: 'top'}}>A. PENDAPATAN</td> <td style={{...styles.td, ...styles.bold, width: '50%', verticalAlign: 'top'}}>B. POTONGAN</td> </tr>
                <tr> <td style={{...styles.td, verticalAlign: 'top'}}> <table style={{width: '100%'}}><tbody> <tr><td style={styles.td}>Basic Salary</td><td style={{...styles.td, ...styles.textRight}}>Rp.</td><td style={{...styles.td, ...styles.textRight}}>{formatAmount(payrollData.gajiPokok)}</td></tr> <tr><td style={styles.td}>Performance Incentive</td><td style={{...styles.td, ...styles.textRight}}>Rp.</td><td style={{...styles.td, ...styles.textRight}}>{formatAmount(payrollData.insentifKinerja)}</td></tr> <tr><td style={styles.td}>BPJS TK (0.54%)</td><td style={{...styles.td, ...styles.textRight}}>Rp.</td><td style={{...styles.td, ...styles.textRight}}>{formatAmount(payrollData.bpjsTkNatura)}</td></tr> </tbody></table> </td> <td style={{...styles.td, verticalAlign: 'top'}}> <table style={{width: '100%'}}><tbody> <tr><td style={styles.td}>Tax</td><td style={{...styles.td, ...styles.textRight}}>Rp.</td><td style={{...styles.td, ...styles.textRight}}>{formatAmount(payrollData.pajakPph21)}</td></tr> <tr><td style={styles.td}>BPJS TK Kary. (2%)</td><td style={{...styles.td, ...styles.textRight}}>Rp.</td><td style={{...styles.td, ...styles.textRight}}>{formatAmount(payrollData.bpjsTkKaryawan2)}</td></tr> <tr><td style={styles.td}>BPJS TK (0.54%)</td><td style={{...styles.td, ...styles.textRight}}>Rp.</td><td style={{...styles.td, ...styles.textRight}}>{formatAmount(payrollData.bpjsTkKaryawan054)}</td></tr> <tr><td style={styles.td}>BPJS Pensiun Kary (1%)</td><td style={{...styles.td, ...styles.textRight}}>Rp.</td><td style={{...styles.td, ...styles.textRight}}>{formatAmount(payrollData.bpjsPensiunKaryawan)}</td></tr> </tbody></table> </td> </tr>
                <tr> <td style={styles.td}><hr style={styles.hr}/> <table style={{width: '100%'}}><tbody> <tr><td style={{...styles.td, ...styles.bold}}>TOTAL PENDAPATAN (A):</td><td style={{...styles.td, ...styles.textRight, ...styles.bold}}>Rp.</td><td style={{...styles.td, ...styles.textRight, ...styles.bold}}>{formatAmount(payrollData.totalPendapatan)}</td></tr> </tbody></table> </td> <td style={styles.td}><hr style={styles.hr}/> <table style={{width: '100%'}}><tbody> <tr><td style={{...styles.td, ...styles.bold}}>TOTAL POTONGAN (B):</td><td style={{...styles.td, ...styles.textRight, ...styles.bold}}>Rp.</td><td style={{...styles.td, ...styles.textRight, ...styles.bold}}>{formatAmount(payrollData.totalPotongan)}</td></tr> </tbody></table> </td> </tr>
            </tbody> </table>
            <table style={styles.table}> <tbody>
                <tr> <td style={{...styles.td, ...styles.bold, width: '50%', verticalAlign: 'top'}}>LAIN LAIN (C):</td> <td style={{...styles.td, ...styles.bold, width: '50%', verticalAlign: 'top'}}>SALDO PINJAMAN</td> </tr>
                <tr> <td style={{...styles.td, verticalAlign: 'top'}}> <table style={{width: '100%'}}><tbody> <tr><td style={styles.td}>BPJS Pensiun Persh (2%)</td><td style={{...styles.td, ...styles.textRight}}>Rp.</td><td style={{...styles.td, ...styles.textRight}}>{formatAmount(payrollData.bpjsPensiunPerusahaan)}</td></tr> <tr><td style={styles.td}>BPJS TK Persh (3,7%)</td><td style={{...styles.td, ...styles.textRight}}>Rp.</td><td style={{...styles.td, ...styles.textRight}}>{formatAmount(payrollData.bpjsTkPerusahaan)}</td></tr> </tbody></table> </td> <td style={{...styles.td, verticalAlign: 'top'}}> <table style={{width: '100%'}}><tbody><tr><td style={styles.td}></td><td style={{...styles.td, ...styles.textRight}}>Rp.</td><td style={{...styles.td, ...styles.textRight}}>{formatAmount(payrollData.saldoPinjaman)}</td></tr></tbody></table> </td> </tr>
            </tbody> </table>
            <hr style={styles.hr}/><hr style={{...styles.hr, marginTop: '1px', marginBottom: '8px'}}/>
            <p style={{...styles.textRight, ...styles.bold}}>YANG DIBAYARKAN (A - B) = Rp. {formatAmount(payrollData.takeHomePay)}</p>
            <hr style={{...styles.hr, marginTop: '8px', marginBottom: '4px'}}/><hr style={{...styles.hr, marginBottom: '8px'}}/>
            <br/> <p>BSM</p> <br/><br/>
            <p style={{textAlign: 'center'}}>#PAYSLIP INI DICETAK MELALUI SISTEM, TIDAK MEMERLUKAN STAMP ATAU TANDA TANGAN#</p>
        </div>
    );
};


const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();
    return (
        <div className="flex justify-between items-center p-4 w-full text-left">
            <div className="flex items-center">
                {theme === 'dark' ? <MoonIcon className="h-6 w-6 text-primary mr-4" /> : <SunIcon className="h-6 w-6 text-primary mr-4" />}
                <span className="text-text-primary font-semibold">Mode Tampilan</span>
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

const RightSidebar: React.FC = () => {
    const { user } = useAuth();
    if (!user) return null;
    return (
        <div className="sticky top-20 space-y-6">
            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <h3 className="font-bold text-text-primary mb-2 flex items-center"><StarIcon className="h-4 w-4 mr-2" /> Poin & Pencapaian</h3>
                <div className="text-center">
                    <p className="text-3xl font-bold text-secondary">{user.loyaltyPoints}</p>
                    <p className="text-xs text-text-secondary">Poin Loyalitas</p>
                    <div className="flex justify-center space-x-2 mt-2">
                        {user.achievements.map(ach => <TrophyIcon key={ach} className="h-6 w-6 text-yellow-400" title={ach} />)}
                    </div>
                </div>
            </div>
             <div className="bg-surface rounded-lg border border-border-color">
                <ThemeToggle />
            </div>
        </div>
    );
};

const MyAccountScreen: React.FC = () => {
    const { user, logout } = useAuth();
    const { applyForPayLater, users, generatePayslipData } = useData();
    const [isEditModalOpen, setEditModalOpen] = useState(false);
    const [isLeaveModalOpen, setLeaveModalOpen] = useState(false);
    const [isChangePasswordModalOpen, setChangePasswordModalOpen] = useState(false);
    const [isKpiModalOpen, setIsKpiModalOpen] = useState(false);
    const isManager = useMemo(() => { if (!user) return false; return users.some(u => u.profile.managerId === user.id); }, [users, user]);
    
    if (!user || !user.profile) return null;

    const handlePrintPayslip = () => {
        const payrollData = generatePayslipData(user.id);
        const period = new Date().toLocaleString('id-ID', { month: 'long', year: 'numeric' });

        const printWindow = window.open('', '_blank');
        if (printWindow) {
            const tempDiv = document.createElement('div');
            // Use the modern createRoot API
            const root = ReactDOM.createRoot(tempDiv);
            root.render(<PayslipView employee={user} period={period} payrollData={payrollData} />);
            
            setTimeout(() => {
                printWindow.document.write('<html><head><title>Slip Gaji</title></head><body>');
                printWindow.document.write(tempDiv.innerHTML);
                printWindow.document.write('</body></html>');
                
                printWindow.document.close();
                printWindow.focus();
                printWindow.print();
                printWindow.close();
            }, 500); // Small delay to ensure React renders
        } else {
            alert("Harap izinkan pop-up untuk situs ini agar dapat mencetak slip gaji Anda.");
        }
    };


    const menuGroup1 = [ { name: 'Riwayat Konsultasi', icon: DocumentTextIcon, path: '/my-consultations' }, { name: 'Artikel Tersimpan', icon: BookmarkIcon, path: '/bookmarked-articles' }, { name: 'Riwayat Absensi', icon: ClipboardDocumentListIcon, path: '/attendance-history' }, { name: 'Kinerja & KPI', icon: ClipboardDocumentCheckIcon, path: '#', action: () => setIsKpiModalOpen(true) },];
    const menuGroup2 = [ { name: 'Wishlist Saya', icon: HeartIcon, path: '/wishlist' }, { name: 'Toko Saya', icon: BuildingStorefrontIcon, path: '/my-products' },];
    const menuGroup3 = [ { name: 'Pengajuan Dana Opex', icon: CreditCardIcon, path: '/opex' }, { name: 'Ajukan Cuti', icon: CalendarDaysIcon, path: '#', action: () => setLeaveModalOpen(true) }, { name: 'Slip Gaji', icon: BanknotesIcon, path: '#', action: handlePrintPayslip },];
    const menuGroup4 = [ { name: 'Aplikasi PayLater', icon: CreditCardIcon, path: '#', action: () => applyForPayLater() }, { name: 'Ubah Password', icon: KeyIcon, path: '#', action: () => setChangePasswordModalOpen(true) },];
    const hrMenuItem = { name: 'Portal HR', icon: BriefcaseIcon, path: '/hr-portal' };
    const managerMenuItem = { name: 'Portal Manajer', icon: UserGroupIcon, path: '/manager/dashboard' };
    const MenuItem: React.FC<{ item: { name: string, icon: React.ElementType, path: string, action?: () => void } }> = ({ item }) => { const content = ( <div className="flex justify-between items-center p-4 w-full text-left hover:bg-surface-light"> <div className="flex items-center"><item.icon className="h-6 w-6 text-primary mr-4" /><span className="text-text-primary">{item.name}</span></div> <ChevronRightIcon className="h-5 w-5 text-text-secondary" /> </div> ); return item.path === '#' ? <button onClick={item.action} className="w-full">{content}</button> : <Link to={item.path} className="block">{content}</Link>; };
    
    return (
        <div className="py-6 grid grid-cols-10 gap-8">
            <main className="col-span-10 lg:col-span-7 space-y-4">
                <div className="bg-surface p-6 rounded-lg border border-border-color">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center space-x-4">
                            <img src={user.profile.photoUrl} alt="Profile" className="w-20 h-20 rounded-full border-2 border-primary" />
                            <div><h1 className="text-2xl font-bold text-text-primary">{user.profile.name}</h1><p className="text-text-secondary">{user.email}</p><p className="text-text-secondary text-sm">{user.profile.phone}</p></div>
                        </div>
                        <button onClick={() => setEditModalOpen(true)} className="p-2 bg-surface-light rounded-full hover:bg-border-color"><PencilSquareIcon className="h-6 w-6 text-primary"/></button>
                    </div>
                </div>
                <div className="space-y-4">
                    <div className="bg-surface rounded-lg border border-border-color">
                        <div className="p-4"><h2 className="text-lg font-bold text-primary flex items-center"><BriefcaseIcon className="h-5 w-5 mr-2" />Informasi Kepegawaian</h2></div>
                        <div className="p-4 border-t border-border-color grid grid-cols-2 gap-y-4 gap-x-2 text-sm">
                            <div><p className="text-text-secondary">Cabang</p><p className="font-semibold text-text-primary">{user.profile.branch || '-'}</p></div>
                            <div><p className="text-text-secondary">Tipe Karyawan</p><p className="font-semibold text-text-primary">{user.profile.employeeType || '-'}</p></div>
                            <div><p className="text-text-secondary">Tanggal Mulai Bekerja</p><p className="font-semibold text-text-primary">{user.profile.joinDate ? new Date(user.profile.joinDate).toLocaleDateString('id-ID') : '-'}</p></div>
                        </div>
                    </div>
                    {(user.role === Role.HR || isManager) && (<div className="bg-surface rounded-lg border border-border-color"> {user.role === Role.HR && (<Link to={'/hr/dashboard'} key={hrMenuItem.name} className="flex justify-between items-center p-4 w-full text-left bg-primary/10 hover:bg-primary/20"><div className="flex items-center"><hrMenuItem.icon className="h-6 w-6 text-primary mr-4" /><span className="text-primary font-bold">{hrMenuItem.name}</span></div><ChevronRightIcon className="h-5 w-5 text-primary" /></Link>)} {isManager && (<Link to={managerMenuItem.path} key={managerMenuItem.name} className="flex justify-between items-center p-4 w-full text-left border-t border-border-color bg-secondary/10 hover:bg-secondary/20"><div className="flex items-center"><managerMenuItem.icon className="h-6 w-6 text-secondary mr-4" /><span className="text-secondary font-bold">{managerMenuItem.name}</span></div><ChevronRightIcon className="h-5 w-5 text-secondary" /></Link>)} </div>)}
                    <div className="bg-surface rounded-lg border border-border-color divide-y divide-border-color">{menuGroup1.map((item) => <MenuItem key={item.name} item={item} />)}</div>
                    <div className="bg-surface rounded-lg border border-border-color divide-y divide-border-color">{menuGroup2.map((item) => <MenuItem key={item.name} item={item} />)}</div>
                    <div className="bg-surface rounded-lg border border-border-color divide-y divide-border-color">{menuGroup3.map((item) => <MenuItem key={item.name} item={item} />)}</div>
                    <div className="bg-surface rounded-lg border border-border-color divide-y divide-border-color">{menuGroup4.map((item) => <MenuItem key={item.name} item={item} />)}</div>
                    <button onClick={logout} className="w-full flex items-center justify-center p-4 bg-red-500/10 text-red-500 rounded-lg font-bold hover:bg-red-500/20 transition-colors"><ArrowRightOnRectangleIcon className="h-6 w-6 mr-2" />Logout</button>
                </div>
            </main>
            <aside className="hidden lg:block col-span-3"> <RightSidebar /> </aside>
            <EditProfileModal isOpen={isEditModalOpen} onClose={() => setEditModalOpen(false)} user={user} />
            <LeaveRequestModal isOpen={isLeaveModalOpen} onClose={() => setLeaveModalOpen(false)} />
            <ChangePasswordModal isOpen={isChangePasswordModalOpen} onClose={() => setChangePasswordModalOpen(false)} />
            <MyKpiModal isOpen={isKpiModalOpen} onClose={() => setIsKpiModalOpen(false)} user={user} />
        </div>
    );
};

export default MyAccountScreen;