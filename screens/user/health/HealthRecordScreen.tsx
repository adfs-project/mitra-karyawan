import React, { useState } from 'react';
import { useData } from '../../../contexts/DataContext';
import { useAuth } from '../../../contexts/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, DocumentPlusIcon, DocumentTextIcon, TrashIcon, XMarkIcon, SparklesIcon } from '@heroicons/react/24/solid';

const UploadModal: React.FC<{ isOpen: boolean; onClose: () => void; }> = ({ isOpen, onClose }) => {
    const { addHealthDocument, showToast } = useData();
    const [documentName, setDocumentName] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!documentName || !file) {
            showToast("Nama dokumen dan file harus diisi.", "warning");
            return;
        }
        setIsUploading(true);
        // Simulate file upload to base64
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
            const fileUrl = reader.result as string;
            await addHealthDocument({ name: documentName, fileUrl });
            setIsUploading(false);
            onClose();
        };
        reader.onerror = () => {
            showToast("Gagal membaca file.", "error");
            setIsUploading(false);
        };
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-md border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Unggah Dokumen Baru</h2>
                    <button onClick={onClose}><XMarkIcon className="h-6 w-6" /></button>
                </div>
                <div className="space-y-4">
                    <input type="text" placeholder="Nama Dokumen (e.g., Hasil Lab Darah 2023)" value={documentName} onChange={e => setDocumentName(e.target.value)} className="w-full p-2 bg-surface-light rounded border border-border-color" />
                    <input type="file" onChange={handleFileChange} className="w-full text-sm text-text-secondary file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-black hover:file:bg-primary/80"/>
                </div>
                 <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="px-4 py-2 rounded bg-surface-light">Batal</button>
                    <button onClick={handleUpload} disabled={isUploading} className="btn-primary px-4 py-2 rounded w-28 flex justify-center">
                        {isUploading ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Unggah'}
                    </button>
                </div>
            </div>
        </div>
    );
};

const DOCUMENT_LIMIT = 3;

const HealthRecordScreen: React.FC = () => {
    const { user } = useAuth();
    const { healthDocuments, deleteHealthDocument } = useData();
    const navigate = useNavigate();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const userDocuments = healthDocuments.filter(doc => doc.userId === user?.id);
    const isLimitReached = !user?.isPremium && userDocuments.length >= DOCUMENT_LIMIT;

    const handleDelete = (docId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus dokumen ini?")) {
            deleteHealthDocument(docId);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex items-center">
                <button onClick={() => navigate(-1)} className="p-2 rounded-full hover:bg-surface-light mr-2">
                    <ArrowLeftIcon className="h-6 w-6"/>
                </button>
                <h1 className="text-2xl font-bold text-primary">Rekam Medis Saya</h1>
            </div>

            <div className="flex justify-end">
                <button onClick={() => setIsModalOpen(true)} disabled={isLimitReached} className="btn-primary flex items-center px-4 py-2 rounded-lg font-bold disabled:bg-gray-600 disabled:cursor-not-allowed">
                    <DocumentPlusIcon className="h-5 w-5 mr-2" />
                    Unggah Dokumen
                </button>
            </div>
            
            {isLimitReached && (
                 <div className="bg-secondary/20 border border-secondary text-secondary p-4 rounded-lg text-center">
                    <p className="font-bold">Batas Unggah Tercapai</p>
                    <p className="text-sm mt-1">Upgrade ke Health+ untuk dapat mengunggah dokumen tanpa batas.</p>
                    <Link to="/subscribe-health-plus" className="inline-block mt-2 font-bold underline">Upgrade Sekarang</Link>
                </div>
            )}


            <div className="bg-surface p-4 rounded-lg border border-border-color">
                {userDocuments.length > 0 ? (
                    <div className="space-y-3">
                        {userDocuments.map(doc => (
                            <div key={doc.id} className="bg-surface-light p-3 rounded-lg flex justify-between items-center">
                                <div className="flex items-center">
                                    <DocumentTextIcon className="h-6 w-6 text-primary mr-3"/>
                                    <div>
                                        <p className="font-semibold text-text-primary">{doc.name}</p>
                                        <p className="text-xs text-text-secondary">Diunggah pada: {new Date(doc.uploadDate).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <div className="flex items-center space-x-2">
                                     <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-semibold text-primary hover:underline">Lihat</a>
                                     <button onClick={() => handleDelete(doc.id)} className="p-1 text-red-500 hover:text-red-400">
                                        <TrashIcon className="h-5 w-5"/>
                                     </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <DocumentTextIcon className="h-16 w-16 mx-auto text-text-secondary opacity-50"/>
                        <p className="mt-4 text-text-secondary">Anda belum mengunggah dokumen apapun.</p>
                        <p className="text-sm text-text-secondary">Gunakan tombol "Unggah Dokumen" untuk memulai.</p>
                    </div>
                )}
            </div>

            <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
        </div>
    );
};

export default HealthRecordScreen;