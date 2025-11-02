// FIX: The file content was placeholder text. Replaced it with the standard React application entry point code.
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
// Assuming a global CSS file exists for Tailwind directives.
import './index.css';

console.log('Mitra Karyawan App Version: 1.6.16');

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);