import React, { useState } from 'react';
import { useApp } from '../../../contexts/AppContext';
import { XMarkIcon, DocumentArrowDownIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import * as XLSX from 'xlsx';
import { useMarketplace } from '../../../hooks/useMarketplace';

type PreviewRow = {
    data: any;
    status: 'valid' | 'invalid';
    error?: string;
};

const BulkUploadProductsModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { showToast } = useApp();
    const { addMultipleProductsByAdmin } = useMarketplace();
    const [step, setStep] = useState(1);
    const [previewData, setPreviewData] = useState<PreviewRow[]>([]);
    const [isProcessing, setIsProcessing] = useState(false);
    const [fileName, setFileName] = useState('');
    const [importResult, setImportResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);

    const resetState = () => {
        setStep(1);
        setPreviewData([]);
        setIsProcessing(false);
        setFileName('');
        setImportResult(null);
    };

    const handleClose = () => {
        resetState();
        onClose();
    };

    const handleDownloadTemplate = () => {
        const headers = ['name', 'description', 'price', 'stock', 'category', 'imageUrl'];
        const ws = XLSX.utils.json_to_sheet([{}], { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template Produk");
        XLSX.writeFile(wb, "template_produk_koperasi.xlsx");
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setFileName(file.name);
        setIsProcessing(true);

        const reader = new FileReader();
        reader.onload = (event) => {
            try {
                const data = new Uint8Array(event.target?.result as ArrayBuffer);
                const workbook = XLSX.read(data, { type: 'array' });
                const sheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[sheetName];
                const jsonData = XLSX.utils.sheet_to_json(worksheet, { raw: false });
                validateData(jsonData);
            } catch (error) {
                showToast("Failed to process file. Ensure it's a valid Excel format.", "error");
                resetState();
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const validateData = (data: any[]) => {
        const validatedRows: PreviewRow[] = [];

        for (const row of data) {
            if (!row.name || !row.price || !row.stock || !row.category) {
                validatedRows.push({ data: row, status: 'invalid', error: 'Required fields (name, price, stock, category) are missing.' });
                continue;
            }
            if (isNaN(Number(row.price)) || isNaN(Number(row.stock))) {
                 validatedRows.push({ data: row, status: 'invalid', error: 'Price and stock must be numbers.' });
                continue;
            }
            validatedRows.push({ data: row, status: 'valid' });
        }
        setPreviewData(validatedRows);
        setStep(2);
        setIsProcessing(false);
    };

    const handleImport = async () => {
        const validRows = previewData.filter(row => row.status === 'valid').map(row => row.data);
        if (validRows.length === 0) {
            showToast("No valid data to import.", "warning");
            return;
        }

        setIsProcessing(true);
        const result = await addMultipleProductsByAdmin(validRows);
        setImportResult(result);
        setStep(3);
        setIsProcessing(false);
    };

    const renderStepContent = () => {
        switch(step) {
            case 2:
                const validCount = previewData.filter(r => r.status === 'valid').length;
                const invalidCount = previewData.length - validCount;
                return (
                     <>
                        <h2 className="text-2xl font-bold text-primary mb-4">Preview Product Data</h2>
                        <div className="bg-surface-light p-3 rounded-lg mb-4 text-center">
                            <p>File: <span className="font-semibold">{fileName}</span></p>
                            <p><span className="font-bold text-green-400">{validCount}</span> valid rows, <span className="font-bold text-red-400">{invalidCount}</span> invalid rows.</p>
                        </div>
                        <div className="max-h-60 overflow-y-auto border border-border-color rounded-lg">
                            <table className="w-full text-xs text-left">
                                <thead className="bg-surface-light sticky top-0"><tr><th className="p-2">Name</th><th className="p-2">Category</th><th className="p-2">Price</th><th className="p-2">Status</th></tr></thead>
                                <tbody>
                                    {previewData.map((row, i) => (
                                        <tr key={i} className={row.status === 'invalid' ? 'bg-red-500/10' : ''}>
                                            <td className="p-2 border-t border-border-color">{row.data.name}</td>
                                            <td className="p-2 border-t border-border-color">{row.data.category}</td>
                                            <td className="p-2 border-t border-border-color">{row.data.price}</td>
                                            <td className="p-2 border-t border-border-color">
                                                {row.status === 'valid' ? <CheckCircleIcon className="h-4 w-4 text-green-500" /> : <ExclamationCircleIcon className="h-4 w-4 text-red-500" title={row.error} />}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </>
                );
            case 3:
                return (
                    <div className="text-center">
                        <h2 className="text-2xl font-bold text-primary mb-4">Import Result</h2>
                        <p className="text-xl"><span className="font-bold text-green-400">{importResult?.success || 0}</span> products created successfully.</p>
                        <p className="text-xl"><span className="font-bold text-red-400">{importResult?.failed || 0}</span> rows failed to import.</p>
                    </div>
                );
            default:
                 return (
                    <>
                        <h2 className="text-2xl font-bold text-primary mb-4">Bulk Upload Products</h2>
                        <div className="space-y-4">
                            <p className="text-text-secondary">1. Download the Excel template to ensure correct data format.</p>
                            <button onClick={handleDownloadTemplate} className="w-full flex items-center justify-center p-3 bg-surface-light rounded-lg border border-border-color font-semibold hover:bg-border-color">
                                <DocumentArrowDownIcon className="h-5 w-5 mr-2" /> Download Template
                            </button>
                            <p className="text-text-secondary">2. Fill in the product data, then upload the file here.</p>
                            <div className="relative">
                                <input type="file" id="bulk-product-upload-input" className="absolute w-0 h-0 opacity-0" onChange={handleFileChange} accept=".xlsx, .xls" />
                                <label htmlFor="bulk-product-upload-input" className="w-full flex items-center justify-center p-3 btn-secondary rounded-lg font-bold cursor-pointer">
                                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" /> {isProcessing ? "Processing..." : "Choose Excel File"}
                                </label>
                            </div>
                        </div>
                    </>
                );
        }
    };
    
    if (!isOpen) return null;

    return (
         <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-2xl border border-border-color">
                <button onClick={handleClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-surface-light"><XMarkIcon className="h-6 w-6" /></button>
                
                {isProcessing && step === 1 ? <div className="flex justify-center items-center h-48"><ArrowPathIcon className="h-10 w-10 text-primary animate-spin" /></div> : renderStepContent()}
                
                <div className="flex justify-end space-x-4 pt-4 mt-6 border-t border-border-color">
                    {step === 2 && (
                        <>
                            <button onClick={resetState} className="px-6 py-2 rounded bg-surface-light">Cancel</button>
                            <button onClick={handleImport} disabled={isProcessing} className="btn-primary px-6 py-2 rounded font-bold w-40 flex justify-center">
                                {isProcessing ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Import Valid Data'}
                            </button>
                        </>
                    )}
                    {step === 3 && <button onClick={handleClose} className="btn-primary px-6 py-2 rounded font-bold">Done</button>}
                </div>
            </div>
        </div>
    );
};

export default BulkUploadProductsModal;
