import React, { useState } from 'react';
// FIX: Replaced useCore with useApp as DataContext is deprecated.
import { useData } from '../../packages/shared/contexts/DataContext';

const DeactivatedAccountScreen: React.FC = () => {
    const { addNotification } = useData();
    const [email, setEmail] = useState('');
    const [whatsapp, setWhatsapp] = useState('');
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Send a notification to the admin user
        addNotification(
            'admin-001',
            `User ${email} requests account reactivation. Contact: ${whatsapp}`,
            'warning'
        );
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 text-center">
            <div className="w-full max-w-lg bg-surface p-8 rounded-lg shadow-lg border border-red-500">
                <h1 className="text-3xl font-bold text-red-500 mb-4">Akun Anda Dinonaktifkan</h1>
                <p className="text-text-secondary mb-8">
                    Akun anda sedang nonaktif. Segera hubungi admin atau kirim permintaan reaktivasi di bawah ini.
                </p>

                {submitted ? (
                    <div className="p-6 bg-surface-light rounded-lg">
                        <h2 className="text-2xl font-bold text-primary">Permintaan Terkirim</h2>
                        <p className="text-text-secondary mt-2">
                            Pesan Anda telah terkirim. Admin akan segera menghubungi Anda melalui WhatsApp.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4 text-left">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-secondary mb-1">
                                Email Anda
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="example@company.com"
                            />
                        </div>
                        <div>
                             <label htmlFor="whatsapp" className="block text-sm font-medium text-text-secondary mb-1">
                                Nomor WhatsApp Aktif
                            </label>
                            <input
                                type="tel"
                                id="whatsapp"
                                value={whatsapp}
                                onChange={(e) => setWhatsapp(e.target.value)}
                                required
                                className="w-full p-3 bg-surface-light rounded border border-border-color focus:outline-none focus:ring-2 focus:ring-primary"
                                placeholder="081234567890"
                            />
                        </div>
                        <button type="submit" className="w-full btn-secondary p-3 rounded font-bold mt-2">
                            Kirim Permintaan Reaktivasi
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default DeactivatedAccountScreen;