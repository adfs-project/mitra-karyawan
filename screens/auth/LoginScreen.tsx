import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useData } from '../../contexts/DataContext';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    
    const [showOtpInput, setShowOtpInput] = useState(false);

    const { login, verifyOtp } = useAuth();
    const { showToast } = useData();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        switch (result.result) {
            case 'otp_required':
                showToast(`(For Demo) Your OTP is: ${result.otp}`, 'info');
                setShowOtpInput(true);
                break;
            case 'inactive':
                navigate('/deactivated');
                break;
            case 'not_found':
                setError('No account found with this email.');
                break;
            case 'incorrect_password':
                setError('Incorrect password.');
                break;
            default:
                setError('An unexpected error occurred.');
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await verifyOtp(email, otp);
        setLoading(false);

        if (result === 'success') {
            // App.tsx routing will handle the redirect
        } else {
            setError('Incorrect OTP. Please try again.');
            setOtp('');
        }
    };

    const handleDisabledRegisterClick = () => {
        showToast("Pendaftaran akun baru dinonaktifkan untuk sementara.", "warning");
    };

    const renderLoginForm = () => (
        <>
            <form onSubmit={handleLogin} className="space-y-6" autoComplete="off">
                <div>
                    <label className="text-sm font-bold text-text-secondary block mb-2">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary"
                        autoComplete="off"
                    />
                </div>
                <div>
                    <label className="text-sm font-bold text-text-secondary block mb-2">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary"
                        autoComplete="off"
                    />
                </div>
                {error && <p className="text-red-500 text-sm">{error}</p>}
                <button type="submit" disabled={loading} className="w-full btn-primary p-3 rounded font-bold">
                    {loading ? 'Logging in...' : 'Login'}
                </button>
            </form>
            <div className="text-center mt-6">
                <p className="text-text-secondary text-sm">
                    Belum punya akun?{' '}
                    <button onClick={handleDisabledRegisterClick} className="font-bold text-primary hover:underline">
                        Daftar
                    </button>
                </p>
            </div>
        </>
    );

    const renderOtpForm = () => (
        <>
            <div className="text-center mb-6">
                <h2 className="text-xl font-bold text-text-primary">Masukkan Kode Verifikasi</h2>
                <p className="text-sm text-text-secondary mt-2">
                    Cek notifikasi untuk kode OTP Anda.
                </p>
            </div>
            <form onSubmit={handleOtpSubmit} className="space-y-6">
                <div>
                    <label className="text-sm font-bold text-text-secondary block mb-2">OTP 4 Angka</label>
                    <input
                        type="text"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                        required
                        maxLength={4}
                        className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary text-center text-3xl tracking-[1.5rem] font-mono"
                        autoComplete="one-time-code"
                        inputMode="numeric"
                        pattern="\d{4}"
                    />
                </div>
                {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                <button type="submit" disabled={loading} className="w-full btn-primary p-3 rounded font-bold">
                    {loading ? 'Memverifikasi...' : 'Verifikasi'}
                </button>
            </form>
            <div className="text-center mt-4">
                <button
                    onClick={() => {
                        setShowOtpInput(false);
                        setError('');
                        setPassword('');
                        setOtp('');
                    }}
                    className="text-sm text-text-secondary hover:underline"
                >
                    Kembali ke Login
                </button>
            </div>
        </>
    );

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface p-8 rounded-lg shadow-lg border border-border-color">
                <div className="text-center mb-8">
                    <h1 className="text-[28px] font-bold text-primary tracking-wider">MITRA KARYAWAN</h1>
                    <p className="text-sm text-text-secondary tracking-widest uppercase">Super App</p>
                </div>

                {showOtpInput ? renderOtpForm() : renderLoginForm()}
                
            </div>
        </div>
    );
};

export default LoginScreen;