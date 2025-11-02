import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const LoginScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(email, password);
        setLoading(false);

        switch (result.result) {
            case 'success':
                // The declarative routing in App.tsx will handle the redirect.
                // No navigation needed here.
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

    // Fungsi untuk menguji GlobalErrorCatcher dari halaman login
    const testAsyncError = () => {
        console.log('Testing async error from LoginScreen...');
        setTimeout(() => {
            // Error ini akan dilempar di luar siklus render React
            throw new Error("Async Error Test from LoginScreen.");
        }, 100);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface p-8 rounded-lg shadow-lg border border-border-color">
                <div className="text-center mb-8">
                    <h1 className="text-[28px] font-bold text-primary tracking-wider">MITRA KARYAWAN</h1>
                    <p className="text-sm text-text-secondary tracking-widest uppercase">Super App</p>
                </div>

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
                    <p className="text-text-secondary">
                        Don't have an account?{' '}
                        <Link to="/register" className="font-bold text-primary hover:underline">
                            Register
                        </Link>
                    </p>
                </div>

                <div className="mt-4">
                    <button
                        onClick={testAsyncError}
                        className="w-full flex items-center justify-center p-3 bg-yellow-500/10 text-yellow-500 rounded-lg font-bold hover:bg-yellow-500/20 transition-colors text-sm"
                    >
                        <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                        Test Error Boundary (Async)
                    </button>
                </div>
            </div>
        </div>
    );
};

export default LoginScreen;