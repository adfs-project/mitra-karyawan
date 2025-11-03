import React, { useState } from 'react';
import { useAuth, verifyEmailIsActive } from '@mk/shared';
import { useNavigate, Link } from 'react-router-dom';
import { CheckCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';

const RegisterScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    
    const [isVerifyingEmail, setIsVerifyingEmail] = useState(false);
    const [isEmailVerified, setIsEmailVerified] = useState(false);
    const [emailError, setEmailError] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleVerifyEmail = async () => {
        setIsVerifyingEmail(true);
        setEmailError('');
        const result = await verifyEmailIsActive(email);
        if (result.success) {
            setIsEmailVerified(true);
        } else {
            setEmailError(result.message);
        }
        setIsVerifyingEmail(false);
    };
    
    const resetEmailVerification = () => {
        setIsEmailVerified(false);
        setEmailError('');
        setEmail('');
    };

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!isEmailVerified) {
            setError('Harap verifikasi alamat email Anda terlebih dahulu.');
            return;
        }

        setError('');
        setSuccess('');
        setLoading(true);

        const result = await register({
            email,
            password,
            profile: {
                name,
                phone,
                photoUrl: `https://i.pravatar.cc/150?u=${email}`,
            },
        });

        setLoading(false);

        if (result === 'success') {
            setSuccess('Registrasi berhasil! Mengarahkan ke login...');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError('Akun dengan email ini sudah terdaftar.');
            // Reset email verification as the email is invalid for new registration
            setIsEmailVerified(false);
            setEmailError('Email ini sudah terdaftar.');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface p-8 rounded-lg shadow-lg border border-border-color">
                <h1 className="text-3xl font-bold text-center text-primary mb-8">Buat Akun</h1>
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary block mb-2">Email</label>
                        <div className="relative">
                            <input 
                                type="email" 
                                value={email} 
                                onChange={(e) => setEmail(e.target.value)} 
                                required 
                                readOnly={isEmailVerified}
                                className={`w-full p-3 bg-surface-light rounded border ${emailError ? 'border-red-500' : 'border-border-color'} focus:outline-none focus:ring-2 focus:ring-primary pr-28`} 
                            />
                            {isEmailVerified ? (
                                <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                                     <span className="text-green-400 font-bold text-sm flex items-center"><CheckCircleIcon className="h-5 w-5 mr-1"/> Terverifikasi</span>
                                </div>
                            ) : (
                                <button type="button" onClick={handleVerifyEmail} disabled={isVerifyingEmail || !email} className="absolute inset-y-0 right-0 flex items-center px-3 bg-secondary text-black rounded-r font-bold text-sm disabled:opacity-50">
                                    {isVerifyingEmail ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Verifikasi'}
                                </button>
                            )}
                        </div>
                         {emailError && <p className="text-red-500 text-xs mt-1">{emailError}</p>}
                         {isEmailVerified && <button type="button" onClick={resetEmailVerification} className="text-xs text-text-secondary hover:underline mt-1">Ganti email</button>}
                    </div>

                    <fieldset disabled={!isEmailVerified} className="space-y-4 disabled:opacity-50">
                        <div>
                            <label className="text-sm font-bold text-text-secondary block mb-2">Nama Lengkap</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text-secondary block mb-2">Nomor Telepon</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                        <div>
                            <label className="text-sm font-bold text-text-secondary block mb-2">Password</label>
                            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary" />
                        </div>
                    </fieldset>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                    
                    <button type="submit" disabled={loading || !isEmailVerified} className="w-full btn-primary p-3 rounded font-bold mt-4 disabled:bg-gray-600 disabled:cursor-not-allowed">
                        {loading ? 'Membuat Akun...' : 'Daftar'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-text-secondary">
                        Sudah punya akun?{' '}
                        <Link to="/login" className="font-bold text-primary hover:underline">
                            Login
                        </Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegisterScreen;
