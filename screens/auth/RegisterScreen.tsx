

import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, Link } from 'react-router-dom';

const RegisterScreen: React.FC = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [phone, setPhone] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        // FIX: Removed the 'wishlist' property. The type definition for the `register`
        // function's argument omits 'wishlist' because it's initialized within
        // the AuthContext, causing a type mismatch error here.
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
            setSuccess('Registration successful! Redirecting to login...');
            setTimeout(() => navigate('/login'), 2000);
        } else {
            setError('An account with this email already exists.');
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-surface p-8 rounded-lg shadow-lg border border-border-color">
                <h1 className="text-3xl font-bold text-center text-primary mb-8">Create Account</h1>
                
                <form onSubmit={handleRegister} className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary block mb-2">Full Name</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} required className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary block mb-2">Email</label>
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                     <div>
                        <label className="text-sm font-bold text-text-secondary block mb-2">Phone Number</label>
                        <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary block mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary" />
                    </div>
                    
                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}
                    
                    <button type="submit" disabled={loading} className="w-full btn-primary p-3 rounded font-bold mt-4">
                        {loading ? 'Creating Account...' : 'Register'}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <p className="text-text-secondary">
                        Already have an account?{' '}
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
