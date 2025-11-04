import React, { useEffect } from 'react';

const ScreenshotGuard: React.FC = () => {
    useEffect(() => {
        const guard = document.getElementById('screenshot-guard-overlay');
        if (!guard) return;

        const handleBlur = () => {
            guard.style.display = 'flex';
        };

        const handleFocus = () => {
            guard.style.display = 'none';
        };

        window.addEventListener('blur', handleBlur);
        window.addEventListener('focus', handleFocus);

        return () => {
            window.removeEventListener('blur', handleBlur);
            window.removeEventListener('focus', handleFocus);
        };
    }, []);

    const style = `
        #screenshot-guard-overlay {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background-color: var(--color-background, #121212);
            z-index: 99999;
            align-items: center;
            justify-content: center;
            text-align: center;
            color: var(--color-text-primary, #e0e0e0);
            font-family: 'Inter', sans-serif;
        }
        @media print {
            body > *:not(#screenshot-guard-overlay) {
                display: none !important;
                visibility: hidden !important;
            }
            #screenshot-guard-overlay {
                display: flex !important;
                visibility: visible !important;
            }
             body {
                background-color: var(--color-background, #121212) !important;
            }
        }
    `;

    return (
        <>
            <style>{style}</style>
            <div id="screenshot-guard-overlay">
                <div>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" style={{width: '4rem', height: '4rem', margin: '0 auto 1rem', color: 'var(--color-secondary)'}}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m0-10.036A11.959 11.959 0 0 1 3.598 6 11.99 11.99 0 0 0 3 9.75c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.75h-.152c-3.196 0-6.1-1.25-8.25-3.286Zm0 13.036h.008v.008H12v-.008Z" />
                    </svg>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Tangkapan Layar Dinonaktifkan</h1>
                    <p style={{ marginTop: '0.5rem', color: 'var(--color-text-secondary)' }}>Untuk alasan keamanan, tangkapan layar tidak diizinkan pada aplikasi ini.</p>
                </div>
            </div>
        </>
    );
};

export default ScreenshotGuard;
