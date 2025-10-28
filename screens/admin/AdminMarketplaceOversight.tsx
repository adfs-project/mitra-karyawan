import React, { useMemo, useState } from 'react';
import { useData } from '../../contexts/DataContext';
import { Product } from '../../types';
import { ShoppingCartIcon, BanknotesIcon, ShieldExclamationIcon, LockClosedIcon, TrashIcon, PlusIcon, PencilIcon } from '@heroicons/react/24/solid';
import ProductFormModal from '../../components/user/market/ProductFormModal';

const StatCard: React.FC<{ title: string; value: string | number; icon: React.ElementType }> = ({ title, value, icon: Icon }) => (
    <div className="bg-surface p-6 rounded-lg border border-border-color">
        <div className="flex items-center">
            <div className="p-3 rounded-full bg-primary/20 text-primary mr-4">
                <Icon className="h-6 w-6" />
            </div>
            <div>
                <p className="text-sm text-text-secondary">{title}</p>
                <p className="text-2xl font-bold text-text-primary">{value}</p>
            </div>
        </div>
    </div>
);

const AdminMarketplaceOversight: React.FC = () => {
    const { products, transactions, disputes, deleteProduct, isDeletionLocked, addProduct, updateProduct } = useData();
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const gmv = useMemo(() => transactions
        .filter(tx => tx.type === 'Marketplace' && tx.status === 'Completed')
        .reduce((sum, tx) => sum + Math.abs(tx.amount), 0), [transactions]);
    
    const uniqueSellers = useMemo(() => new Set(products.map(p => p.sellerId)).size, [products]);

    const filteredProducts = useMemo(() => products.filter(p => 
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.sellerName.toLowerCase().includes(searchTerm.toLowerCase())
    ), [products, searchTerm]);

    const handleDelete = (productId: string) => {
        if (window.confirm("Are you sure you want to delist this product? This action cannot be undone.")) {
            deleteProduct(productId);
        }
    };
    
    const handleOpenModal = (product: Product | null = null) => {
        setEditingProduct(product);
        setIsModalOpen(true);
    };

    const handleSaveProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'> | Product) => {
        if ('id' in productData) {
            await updateProduct(productData);
        } else {
            // When admin adds a product, they are the seller. `addProduct` handles this.
            await addProduct(productData);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary">Marketplace Oversight</h1>
                <button onClick={() => handleOpenModal()} className="btn-primary flex items-center px-4 py-2 rounded">
                    <PlusIcon className="h-5 w-5 mr-2" /> Add New Product
                </button>
            </div>


            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard title="Total GMV" value={new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(gmv)} icon={BanknotesIcon} />
                <StatCard title="Total Products Listed" value={products.length} icon={ShoppingCartIcon} />
                <StatCard title="Open Disputes" value={disputes.filter(d => d.status === 'Open').length} icon={ShieldExclamationIcon} />
            </div>
            
            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">All Products</h2>
                    <input 
                        type="text"
                        placeholder="Search by product or seller..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-1/3 p-2 bg-surface-light rounded border border-border-color"
                    />
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface-light">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Seller</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Stock</th>
                                <th className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(p => (
                                <tr key={p.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary">{p.name}</td>
                                    <td className="px-6 py-4">{p.sellerName}</td>
                                    <td className="px-6 py-4">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(p.price)}</td>
                                    <td className="px-6 py-4">{p.stock}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center space-x-2">
                                            <button onClick={() => handleOpenModal(p)} className="p-2 rounded hover:bg-surface-light" title="Edit Product">
                                                <PencilIcon className="h-4 w-4 text-yellow-400"/>
                                            </button>
                                            <button
                                                onClick={() => handleDelete(p.id)}
                                                disabled={isDeletionLocked}
                                                title={isDeletionLocked ? "Deletion is locked in System Controls." : "Delist Product"}
                                                className={`p-2 rounded ${isDeletionLocked ? 'cursor-not-allowed' : 'hover:bg-surface-light'}`}
                                            >
                                                {isDeletionLocked ? <LockClosedIcon className="h-4 w-4 text-gray-500"/> : <TrashIcon className="h-4 w-4 text-red-500"/>} 
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <ProductFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                product={editingProduct}
                onSave={handleSaveProduct}
            />
        </div>
    );
};

export default AdminMarketplaceOversight;