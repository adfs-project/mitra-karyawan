import React from 'react';
import { DocumentArrowDownIcon } from '@heroicons/react/24/solid';
import { useData } from '../../../contexts/DataContext';

const ReportGenerator: React.FC = () => {
    const { transactions, users, articles, taxConfig } = useData();

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
    
    const handleExportPandL = () => {
        const revenue = transactions
            .filter(tx => tx.type === 'Commission')
            .map(tx => ({ date: tx.timestamp.split('T')[0], description: tx.description, revenue: tx.amount, expense: 0, net: tx.amount }));
            
        const adRevenue = articles
            .filter(a => a.monetization?.enabled)
            .map(a => ({ date: a.timestamp.split('T')[0], description: `Ad revenue from "${a.title}"`, revenue: a.monetization?.revenueGenerated || 0, expense: 0, net: a.monetization?.revenueGenerated || 0 }));

        // Simulated expenses
        const expenses = [
            { date: new Date().toISOString().split('T')[0], description: 'Server Costs', revenue: 0, expense: 5000000, net: -5000000 },
            { date: new Date().toISOString().split('T')[0], description: 'API Usage Fees', revenue: 0, expense: 1500000, net: -1500000 },
        ];
        
        const data = [...revenue, ...adRevenue, ...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
        generateCSV(data, 'profit_and_loss.csv');
    };

    const handleExportTax = () => {
        const data = transactions
            .filter(tx => tx.type === 'Tax')
            .map(tx => ({ 
                date: tx.timestamp.split('T')[0],
                transactionId: tx.id,
                relatedTransactionId: tx.relatedId,
                description: tx.description,
                taxCollected: tx.amount,
            }));
        generateCSV(data, 'tax_report.csv');
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
                <button onClick={handleExportPandL} className="w-full p-3 bg-surface-light rounded-lg hover:bg-border-color text-left font-semibold">
                    Export Profit & Loss Report
                </button>
                 <button onClick={handleExportTax} className="w-full p-3 bg-surface-light rounded-lg hover:bg-border-color text-left font-semibold">
                    Export Tax Report
                </button>
            </div>
        </div>
    );
};

export default ReportGenerator;