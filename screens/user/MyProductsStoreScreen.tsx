import React, { useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Link } from 'react-router-dom';
import { BuildingStorefrontIcon, PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { Product } from '../../types';
import ProductFormModal from '../../components/user/market/ProductFormModal';

const MyProductsStoreScreen: React.FC = () => {
    const { user } = useAuth();
    const { products, addProduct, editProduct, deleteProduct } = useData();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const myProducts = products.filter(p => p.sellerId === user?.id);

    const handleOpenModal = (product: Product | null = null) => {
        setSelectedProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'> | Product) => {
        const result = 'id' in productData ? await editProduct(productData) : await addProduct(productData);
        if (result.success) {
            setIsModalOpen(false);
        } else {
            alert("Gagal menyimpan produk.");
        }
    };

    const handleDelete = async (productId: string) => {
        if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
            await deleteProduct(productId);
        }
    };

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary flex items-center">
                    <BuildingStorefrontIcon className="h-7 w-7 mr-2" /> Toko Saya
                </h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-4 py-2 rounded-lg text-sm">
                    <PlusIcon className="h-5 w-5 mr-1" /> Tambah Produk
                </button>
            </div>

            {myProducts.length > 0 ? (
                <div className="space-y-4">
                    {myProducts.map(product => (
                         <div key={product.id} className="bg-surface p-4 rounded-lg border border-border-color flex items-center space-x-4">
                            <img src={product.imageUrl} alt={product.name} className="w-20 h-20 rounded-md object-cover" />
                            <div className="flex-grow">
                                <p className="font-semibold text-text-primary">{product.name}</p>
                                <p className="font-bold text-primary text-lg mt-1">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</p>
                                <p className="text-sm text-text-secondary">Stok: {product.stock}</p>
                            </div>
                            <div className="flex space-x-2">
                                <button onClick={() => handleOpenModal(product)} className="p-2 bg-surface-light rounded-full hover:bg-border-color">
                                    <PencilIcon className="h-5 w-5 text-yellow-400" />
                                </button>
                                <button onClick={() => handleDelete(product.id)} className="p-2 bg-surface-light rounded-full hover:bg-border-color">
                                    <TrashIcon className="h-5 w-5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-20">
                    <BuildingStorefrontIcon className="h-20 w-20 mx-auto text-text-secondary" />
                    <h2 className="mt-4 text-xl font-semibold text-text-primary">Anda Belum Punya Produk</h2>
                    <p className="text-text-secondary mt-2">Mulai jual barang pertama Anda dengan menekan tombol "Tambah Produk".</p>
                    <button onClick={() => handleOpenModal()} className="mt-6 inline-block btn-secondary px-6 py-2 rounded-lg font-bold">
                        Jual Barang Pertama Anda
                    </button>
                </div>
            )}
            
            <ProductFormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} product={selectedProduct} onSave={handleSaveProduct} />
        </div>
    );
};

export default MyProductsStoreScreen;
