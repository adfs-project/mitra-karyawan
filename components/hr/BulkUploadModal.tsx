import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useCore } from '../../contexts/DataContext';
import { useApp } from '../../contexts/AppContext';
import { XMarkIcon, DocumentArrowDownIcon, ArrowUpTrayIcon, CheckCircleIcon, ExclamationCircleIcon, ArrowPathIcon } from '@heroicons/react/24/solid';
import * as XLSX from 'xlsx';

type PreviewRow = {
    data: any;
    status: 'valid' | 'invalid';
    error?: string;
};

const BulkUploadModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const { createMultipleEmployeesByHr } = useAuth();
    const { users } = useCore();
    const { showToast } = useApp();
    const [step, setStep] = useState(1); // 1: Upload, 2: Preview, 3: Result
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
        const headers = ['name', 'email', 'phone', 'password', 'salary', 'joinDate (YYYY-MM-DD)', 'employmentStatus', 'companyName', 'employeeType', 'placeOfBirth', 'dateOfBirth'];
        const ws = XLSX.utils.json_to_sheet([{}], { header: headers });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Template Karyawan");
        XLSX.writeFile(wb, "template_karyawan_baru.xlsx");
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
                showToast("Gagal memproses file. Pastikan formatnya benar.", "error");
                resetState();
            }
        };
        reader.readAsArrayBuffer(file);
    };

    const validateData = (data: any[]) => {
        const existingEmails = new Set(users.map(u => u.email.toLowerCase()));
        const emailsInFile = new Set<string>();
        const validatedRows: PreviewRow[] = [];

        for (const row of data) {
            const email = row.email?.trim().toLowerCase();
            if (!row.name || !email || !row.password) {
                validatedRows.push({ data: row, status: 'invalid', error: 'Kolom name, email, dan password wajib diisi.' });
                continue;
            }
            if (existingEmails.has(email) || emailsInFile.has(email)) {
                validatedRows.push({ data: row, status: 'invalid', error: 'Email sudah terdaftar.' });
                continue;
            }
            emailsInFile.add(email);
            validatedRows.push({ data: row, status: 'valid' });
        }
        setPreviewData(validatedRows);
        setStep(2);
        setIsProcessing(false);
    };

    const handleImport = async () => {
        const validRows = previewData.filter(row => row.status === 'valid').map(row => row.data);
        if (validRows.length === 0) {
            showToast("Tidak ada data valid untuk diimpor.", "warning");
            return;
        }

        setIsProcessing(true);
        const employeesToCreate = validRows.map(row => ({
            email: row.email,
            password: String(row.password),
            profile: {
                name: row.name,
                phone: row.phone || '',
                salary: Number(row.salary) || 0,
                joinDate: row['joinDate (YYYY-MM-DD)'] || new Date().toISOString().split('T')[0],
                employmentStatus: row.employmentStatus || 'Private Employee',
                companyName: row.companyName || 'Mitra Karyawan',
                employeeType: row.employeeType || 'Contract',
                placeOfBirth: row.placeOfBirth || '',
                dateOfBirth: row.dateOfBirth || '',
            }
        }));

        const result = await createMultipleEmployeesByHr(employeesToCreate);
        setImportResult(result);
        setStep(3);
        setIsProcessing(false);
    };

    const renderStep1 = () => (
        <>
            <h2 className="text-2xl font-bold text-primary mb-4">Unggah Karyawan Massal</h2>
            <div className="space-y-4">
                <p className="text-text-secondary">1. Unduh templat Excel untuk memastikan format data yang benar.</p>
                <button onClick={handleDownloadTemplate} className="w-full flex items-center justify-center p-3 bg-surface-light rounded-lg border border-border-color font-semibold hover:bg-border-color">
                    <DocumentArrowDownIcon className="h-5 w-5 mr-2" /> Unduh Templat
                </button>
                <p className="text-text-secondary">2. Isi data karyawan pada templat, lalu unggah file di sini.</p>
                <div className="relative">
                    <input type="file" id="bulk-upload-input" className="absolute w-0 h-0 opacity-0" onChange={handleFileChange} accept=".xlsx, .xls" />
                    <label htmlFor="bulk-upload-input" className="w-full flex items-center justify-center p-3 btn-secondary rounded-lg font-bold cursor-pointer">
                        <ArrowUpTrayIcon className="h-5 w-5 mr-2" /> {isProcessing ? "Memproses..." : "Pilih File Excel"}
                    </label>
                </div>
            </div>
        </>
    );

    const renderStep2 = () => {
        const validCount = previewData.filter(r => r.status === 'valid').length;
        const invalidCount = previewData.length - validCount;
        return (
            <>
                <h2 className="text-2xl font-bold text-primary mb-4">Pratinjau Data</h2>
                <div className="bg-surface-light p-3 rounded-lg mb-4 text-center">
                    <p>File: <span className="font-semibold">{fileName}</span></p>
                    <p><span className="font-bold text-green-400">{validCount}</span> baris valid, <span className="font-bold text-red-400">{invalidCount}</span> baris tidak valid.</p>
                </div>
                <div className="max-h-60 overflow-y-auto border border-border-color rounded-lg">
                    <table className="w-full text-xs text-left">
                        <thead className="bg-surface-light sticky top-0"><tr><th className="p-2">Nama</th><th className="p-2">Email</th><th className="p-2">Status</th></tr></thead>
                        <tbody>
                            {previewData.map((row, i) => (
                                <tr key={i} className={row.status === 'invalid' ? 'bg-red-500/10' : ''}>
                                    <td className="p-2 border-t border-border-color">{row.data.name}</td>
                                    <td className="p-2 border-t border-border-color">{row.data.email}</td>
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
    };

    const renderStep3 = () => (
        <div className="text-center">
            <h2 className="text-2xl font-bold text-primary mb-4">Hasil Impor</h2>
            <p className="text-xl"><span className="font-bold text-green-400">{importResult?.success || 0}</span> karyawan berhasil dibuat.</p>
            <p className="text-xl"><span className="font-bold text-red-400">{importResult?.failed || 0}</span> data gagal diimpor.</p>
            {importResult && importResult.errors.length > 0 && (
                <div className="mt-4 text-left text-xs bg-surface-light p-2 rounded max-h-32 overflow-y-auto">
                    <p className="font-bold">Detail Kegagalan:</p>
                    {importResult.errors.map((err, i) => <p key={i}>- {err}</p>)}
                </div>
            )}
        </div>
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-2xl border border-border-color">
                <button onClick={handleClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-surface-light"><XMarkIcon className="h-6 w-6" /></button>
                
                {isProcessing && step === 1 && <div className="flex justify-center items-center h-48"><ArrowPathIcon className="h-10 w-10 text-primary animate-spin" /></div>}
                {!isProcessing && step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                
                <div className="flex justify-end space-x-4 pt-4 mt-6 border-t border-border-color">
                    {step === 2 && (
                        <>
                            <button onClick={resetState} className="px-6 py-2 rounded bg-surface-light">Batal</button>
                            <button onClick={handleImport} disabled={isProcessing} className="btn-primary px-6 py-2 rounded font-bold w-36 flex justify-center">
                                {isProcessing ? <ArrowPathIcon className="h-5 w-5 animate-spin" /> : 'Impor Data Valid'}
                            </button>
                        </>
                    )}
                    {step === 3 && <button onClick={handleClose} className="btn-primary px-6 py-2 rounded font-bold">Selesai</button>}
                </div>
            </div>
        </div>
    );
};

export default BulkUploadModal;