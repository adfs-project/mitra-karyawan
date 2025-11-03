import React, { useState } from 'react';
import { useAuth, Product, useData } from '@mk/shared';
import { BuildingStorefrontIcon, PlusIcon, PencilIcon, TrashIcon, LockClosedIcon } from '@heroicons/react/24/outline';
import ProductFormModal from '../../components/user/market/ProductFormModal';

const MyProductsStoreScreen: React.FC = () => {
    const { user } = useAuth();
    const { products, addProduct, updateProduct, deleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const myProducts = products.filter(p => p.sellerId === user?.id);

    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'> | Product) => {
        if ('id' in productData) {
            await updateProduct(productData);
        } else {
            await addProduct(productData);
        }
    };

    const handleDeleteProduct = async (productId: string) => {
        if (window.confirm('Are you sure you want to delete this product? This action cannot be undone.')) {
            await deleteProduct(productId);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                    <BuildingStorefrontIcon className="h-7 w-7 mr-2" /> Toko Saya
                </h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-3 py-1.5 rounded-full text-sm font-semibold">
                    <PlusIcon className="h-4 w-4 mr-1"/> Jual Barang
                </button>
            </div>
            
            {myProducts.length > 0 ? (
                 <div className="space-y-4">
                    {myProducts.map(product => (
                         <div key={product.id} className="bg-surface p-4 rounded-lg border border-border-color flex items-center space-x-4">
                            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-md object-cover" />
                            <div className="flex-grow">
                                <p className="font-semibold text-text-primary">{product.name}</p>
                                <p className="text-sm text-text-secondary">Stok: {product.stock}</p>
                                <p className="font-bold text-primary text-lg mt-1">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
                            </div>
                            <div className="flex flex-col space-y-2">
                                <button onClick={() => handleOpenModal(product)} className="p-2 bg-surface-light rounded-full hover:bg-border-color">
                                    <PencilIcon className="h-5 w-5 text-yellow-400" />
                                </button>
                                <button
                                    onClick={() => handleDeleteProduct(product.id)}
                                    title="Delete Product"
                                    className="p-2 bg-surface-light rounded-full hover:bg-border-color"
                                >
                                    <TrashIcon className="h-5 w-5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <BuildingStorefrontIcon className="h-20 w-20 mx-auto text-text-secondary" />
                    <h2 className="mt-4 text-xl font-semibold text-text-primary">Anda belum menjual barang apapun.</h2>
                    <p className="text-text-secondary mt-2">Klik tombol "Jual Barang" untuk memulai.</p>
                </div>
            )}

            <ProductFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onSave={handleSaveProduct}
            />
        </div>
    );
};

export default MyProductsStoreScreen;