import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [show2FA, setShow2FA] = useState(false);
    const [loading, setLoading] = useState(false);
    const { login, verify2FA } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        switch (result) {
            case 'success':
                navigate('/');
                break;
            case '2fa_required':
                setShow2FA(true);
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
    
    const handle2FA = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await verify2FA(otp);
        setLoading(false);
        if (result === 'success') {
            navigate('/');
        } else {
            setError('Invalid OTP. Please try again.');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface p-8 rounded-lg shadow-lg border border-border-color">
                <div className="text-center mb-8">
                    <h1 className="text-[28px] font-bold text-primary tracking-wider">MITRA KARYAWAN</h1>
                    <p className="text-sm text-text-secondary tracking-widest uppercase">Super App</p>
                </div>

                {!show2FA ? (
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
                ) : (
                     <form onSubmit={handle2FA} className="space-y-6">
                        <h2 className="text-xl font-bold text-center text-text-primary">Verifikasi Login</h2>
                        <p className="text-center text-text-secondary">Kami telah mengirimkan kode 6 digit ke email Anda. Masukkan kode tersebut untuk melanjutkan.</p>
                         <div>
                            <label className="text-sm font-bold text-text-secondary block mb-2">Kode Verifikasi</label>
                            <input
                                type="text"
                                value={otp}
                                onChange={(e) => setOtp(e.target.value)}
                                required
                                maxLength={6}
                                className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary text-center text-2xl tracking-[.5em]"
                            />
                        </div>
                        {error && <p className="text-red-500 text-sm">{error}</p>}
                        <button type="submit" disabled={loading} className="w-full btn-primary p-3 rounded font-bold">
                            {loading ? 'Verifying...' : 'Verify'}
                        </button>
                    </form>
                )}

                 <div className="text-center mt-6">
                    <p className="text-text-secondary">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-primary hover:underline">
                            Register
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;