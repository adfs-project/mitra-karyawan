import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { useData } from '../../../contexts/DataContext';

const ReportGenerator: React.FC = () => {
    const { transactions, users } = useData();

    const generateCSV = (data: any[], filename: string) => {
        if (data.length === 0) {
            alert("No data to export.");
            return;
        }
        const headers = Object.keys(data[0]);
        const csvRows = [
            headers.join(','),
            ...data.map(row => 
                headers.map(header => JSON.stringify(row[header])).join(',')
            )
        ];
        
        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        a.click();
        URL.revokeObjectURL(url);
    };

    const handleExportTransactions = () => {
        const data = transactions.map(({ id, timestamp, userName, type, amount, status, description }) => 
            ({ id, timestamp, userName, type, amount, status, description }));
        generateCSV(data, 'all_transactions.csv');
    };

    const handleExportUserBalances = () => {
        const data = users.map(u => ({
            userId: u.id,
            name: u.profile.name,
            email: u.email,
            balance: u.wallet.balance,
            status: u.status,
            isFrozen: u.wallet.isFrozen
        }));
        generateCSV(data, 'user_balances.csv');
    };


    return (
        <div className="bg-surface p-6 rounded-lg border border-border-color">
            <h2 className="text-xl font-bold mb-4 flex items-center">
                <DocumentArrowDownIcon className="h-5 w-5 mr-2" /> Report Generator
            </h2>
            <p className="text-sm text-text-secondary mb-4">Export financial data for accounting and analysis.</p>
            <div className="space-y-3">
                <button onClick={handleExportTransactions} className="w-full p-3 bg-surface-light rounded-lg hover:bg-border-color text-left font-semibold">
                    Export All Transactions (CSV)
                </button>
                 <button onClick={handleExportUserBalances} className="w-full p-3 bg-surface-light rounded-lg hover:bg-border-color text-left font-semibold">
                    Export User Balances (CSV)
                </button>
                <button className="w-full p-3 bg-surface-light rounded-lg hover:bg-border-color text-left font-semibold disabled:opacity-50" disabled>
                    Export Profit & Loss Report (Coming Soon)
                </button>
                 <button className="w-full p-3 bg-surface-light rounded-lg hover:bg-border-color text-left font-semibold disabled:opacity-50" disabled>
                    Export Tax Report (Coming Soon)
                </button>
            </div>
        </div>
    );
};

export default ReportGenerator;