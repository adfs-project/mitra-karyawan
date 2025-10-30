import React, { useState, useEffect } from 'react';
import { Product } from '../../../types';
import { SparklesIcon, XMarkIcon } from '@heroicons/react/24/solid';
import { GoogleGenAI } from "@google/genai";
import { buildSecurePrompt } from '../../../services/aiGuardrailService';
import { useApp } from '../../../contexts/AppContext';

const AILoadingSpinner: React.FC = () => (
    <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
);

const ProductFormModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    onSave: (product: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'> | Product) => Promise<any>;
}> = ({ isOpen, onClose, product, onSave }) => {
    const { showToast } = useApp();
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        price: 0,
        stock: 0,
        category: '',
        imageUrl: '',
    });
    const [isGenerating, setIsGenerating] = useState({ description: false });
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsSaving(false);
            if (product) {
                setFormData({
                    name: product.name,
                    description: product.description,
                    price: product.price,
                    stock: product.stock,
                    category: product.category,
                    imageUrl: product.imageUrl,
                });
            } else {
                setFormData({
                    name: '',
                    description: '',
                    price: 0,
                    stock: 1,
                    category: '',
                    imageUrl: 'https://picsum.photos/seed/' + Date.now() + '/400/400',
                });
            }
        }
    }, [product, isOpen]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: name === 'price' || name === 'stock' ? Number(value) : value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (loadEvent) => {
                const result = loadEvent.target?.result;
                if (typeof result === 'string') {
                    setFormData(prev => ({ ...prev, imageUrl: result }));
                }
            };
            reader.readAsDataURL(file);
        }
    };
    
    const callGemini = async (prompt: string): Promise<string | null> => {
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });
            return response.text;
        } catch (error) {
            console.error("Gemini API call failed:", error);
            showToast("An error occurred while contacting the AI.", "error");
            return null;
        }
    };
    
    const handleGenerateDescription = async () => {
        if (!formData.name) {
            showToast("Please provide a product name first.", "warning");
            return;
        }
        setIsGenerating(prev => ({ ...prev, description: true }));
        const securePrompt = buildSecurePrompt(
            formData.name,
            `Your ONLY function is to teach users how to write good product descriptions. You MUST NOT write the description for them. Give 3 short, actionable tips on how to write a compelling description for a product with the given name/topic. You MUST politely refuse to answer any other type of question. Your response must be only the tips, formatted nicely.`
        );
        const result = await callGemini(securePrompt);
        if (result) {
            // Using alert here is okay as it's showing advice, not an error
            alert(`Saran Deskripsi dari AI:\n\n${result}`);
        }
        setIsGenerating(prev => ({ ...prev, description: false }));
    };

    const handleSave = async () => {
        if (!formData.name || formData.price <= 0 || formData.stock < 0 || !formData.category) {
            showToast("Name, category, price, and stock must be filled correctly.", "error");
            return;
        }
        setIsSaving(true);
        const dataToSave = product ? { ...product, ...formData } : formData;
        
        await onSave(dataToSave);
        
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg w-full max-w-lg border border-border-color max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                     <h2 className="text-2xl font-bold">{product ? 'Edit Produk' : 'Jual Produk Baru'}</h2>
                     <button onClick={onClose} className="p-1 rounded-full hover:bg-surface-light">
                        <XMarkIcon className="h-6 w-6 text-text-secondary" />
                    </button>
                </div>
                <div className="space-y-4">
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Nama Produk*</label>
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary flex justify-between items-center">Deskripsi
                            <button onClick={handleGenerateDescription} disabled={isGenerating.description || !formData.name} className="btn-secondary px-2 py-1 rounded flex items-center space-x-1 text-xs disabled:opacity-50">
                                {isGenerating.description ? <AILoadingSpinner /> : <SparklesIcon className="h-4 w-4" />}
                                <span>Minta Saran AI</span>
                            </button>
                        </label>
                        <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color"></textarea>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-bold text-text-secondary">Harga (IDR)*</label>
                            <input type="number" name="price" value={formData.price} onChange={handleChange} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                        <div>
                             <label className="text-sm font-bold text-text-secondary">Stok*</label>
                            <input type="number" name="stock" value={formData.stock} onChange={handleChange} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                        </div>
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Kategori*</label>
                        <input type="text" name="category" placeholder="Contoh: Elektronik, Fashion, Hobi" value={formData.category} onChange={handleChange} className="w-full mt-1 p-2 bg-surface-light rounded border border-border-color" />
                    </div>
                    <div>
                        <label className="text-sm font-bold text-text-secondary">Gambar Produk</label>
                        <div className="mt-1 flex items-center space-x-2">
                            <input 
                                type="text" 
                                name="imageUrl" 
                                placeholder="Paste URL or upload file"
                                value={formData.imageUrl} 
                                onChange={handleChange} 
                                className="flex-grow p-2 bg-surface-light rounded border border-border-color" 
                            />
                            <input 
                                type="file"
                                id="product-image-upload"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <label htmlFor="product-image-upload" className="cursor-pointer px-4 py-2 text-sm font-semibold text-primary bg-primary/20 rounded-lg hover:bg-primary/30">
                                Upload
                            </label>
                        </div>
                        {formData.imageUrl && (
                            <div className="mt-2">
                                <img src={formData.imageUrl} alt="Product Preview" className="w-32 h-32 object-cover rounded-lg border border-border-color" />
                            </div>
                        )}
                    </div>
                     <div className="flex justify-end space-x-4 pt-4">
                        <button onClick={onClose} disabled={isSaving} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color disabled:opacity-50">Batal</button>
                        <button onClick={handleSave} disabled={isSaving} className="btn-primary px-4 py-2 rounded w-32 flex justify-center items-center">
                            {isSaving ? <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div> : 'Simpan Produk'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProductFormModal;