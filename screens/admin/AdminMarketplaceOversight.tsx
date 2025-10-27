import React, { useState, useEffect } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';
import { PlusIcon, PencilIcon, TrashIcon, StarIcon } from '@heroicons/react/24/outline';
import ProductFormModal from '../../components/user/market/ProductFormModal';


const ConfirmationModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    children: React.ReactNode;
    isLoading?: boolean;
}> = ({ isOpen, onClose, onConfirm, title, children, isLoading }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
            <div className="bg-surface p-6 rounded-lg shadow-lg w-full max-w-md border border-border-color">
                <h2 className="text-xl font-bold mb-4">{title}</h2>
                <div className="text-text-secondary mb-6">{children}</div>
                <div className="flex justify-end space-x-4">
                    <button onClick={onClose} disabled={isLoading} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color disabled:opacity-50">Cancel</button>
                    <button onClick={onConfirm} disabled={isLoading} className="px-4 py-2 rounded btn-secondary w-28 flex justify-center items-center">
                        {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div> : 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
};


const AdminMarketplaceOversight: React.FC = () => {
    const { products, addProduct, editProduct, deleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    const handleOpenModal = (product: Product | null = null) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (product: Product) => {
        setSelectedProduct(product);
        setIsDeleteModalOpen(true);
    };
    
    const confirmDelete = async () => {
        if(selectedProduct) {
            setIsDeleting(true);
            const result = await deleteProduct(selectedProduct.id);
            if (!result.success) {
                alert(`Failed to delete product "${selectedProduct.name}". Please try again.`);
            }
            setIsDeleting(false);
        }
        setIsDeleteModalOpen(false);
        setSelectedProduct(null);
    };

    const handleSave = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'> | Product) => {
        const result = 'id' in productData 
            ? await editProduct(productData) 
            : await addProduct(productData);

        if (!result.success) {
            alert("Failed to save the product. Please try again.");
            setIsModalOpen(true); 
        } else {
            setIsModalOpen(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Marketplace Oversight</h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-4 py-2 rounded">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add Official Product
                </button>
            </div>
            
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                {products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {products.map(product => (
                            <div key={product.id} className="bg-surface-light rounded-lg border border-border-color flex flex-col overflow-hidden">
                                <img src={product.imageUrl} alt={product.name} className="w-full h-40 object-cover" />
                                <div className="p-4 flex flex-col flex-grow">
                                    <h3 className="text-md font-bold text-text-primary">{product.name}</h3>
                                    <p className="text-xs text-text-secondary mt-1">By: {product.sellerName}</p>
                                    <div className="flex items-center text-xs text-yellow-400 mt-1">
                                        <StarIcon className="h-4 w-4 mr-1" />
                                        <span className="font-bold">{product.rating.toFixed(1)}</span>
                                        <span className="text-text-secondary ml-1">({product.reviewCount} reviews)</span>
                                    </div>
                                    <div className="mt-2 flex-grow">
                                        <p className="font-bold text-primary text-lg">
                                            {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}
                                        </p>
                                        <p className="text-sm text-text-secondary">Stock: {product.stock}</p>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        <button onClick={() => handleOpenModal(product)} className="p-2 rounded hover:bg-border-color"><PencilIcon className="h-5 w-5 text-yellow-400"/></button>
                                        <button onClick={() => handleDeleteClick(product)} className="p-2 rounded hover:bg-border-color"><TrashIcon className="h-5 w-5 text-red-400"/></button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                     <div className="text-center py-16">
                        <h2 className="text-xl font-semibold text-text-primary">Marketplace is Empty</h2>
                        <p className="text-text-secondary mt-2">No products have been added yet. Click "Add Official Product" to start.</p>
                    </div>
                )}
            </div>

            <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} onSave={handleSave} />
            <ConfirmationModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                onConfirm={confirmDelete}
                title="Confirm Deletion"
                isLoading={isDeleting}
            >
                Are you sure you want to delete the product "<span className="font-bold">{selectedProduct?.name}</span>"? This action cannot be undone.
            </ConfirmationModal>
        </div>
    );
};

export default AdminMarketplaceOversight;