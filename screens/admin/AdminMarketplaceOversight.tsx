import React, { useMemo, useState } from 'react';
import { useMarketplace } from '../../hooks/useMarketplace';
import { Product } from '../../types';
import { BuildingStorefrontIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/solid';
import BulkUploadProductsModal from '../../components/admin/market/BulkUploadProductsModal';
import { ArrowUpTrayIcon } from '@heroicons/react/24/outline';

const AdminMarketplaceOversight: React.FC = () => {
    const { products, updateProductStatus } = useMarketplace();
    const [filter, setFilter] = useState<'All' | 'Needs Review'>('Needs Review');
    const [isBulkUploadModalOpen, setIsBulkUploadModalOpen] = useState(false);

    const filteredProducts = useMemo(() => {
        const sortedProducts = [...products].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        if (filter === 'Needs Review') {
            return sortedProducts.filter(p => p.status === 'Needs Review');
        }
        return sortedProducts;
    }, [products, filter]);

    const handleUpdateStatus = (productId: string, status: 'Listed' | 'Unlisted') => {
        updateProductStatus(productId, status);
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold text-primary flex items-center">
                    <BuildingStorefrontIcon className="h-8 w-8 mr-3" />
                    Marketplace Oversight
                </h1>
                 <button 
                    onClick={() => setIsBulkUploadModalOpen(true)}
                    className="btn-secondary flex items-center px-4 py-2 rounded-lg font-bold"
                >
                    <ArrowUpTrayIcon className="h-5 w-5 mr-2" />
                    Bulk Upload Products
                </button>
            </div>
            <p className="text-text-secondary">Review and manage products listed by employees.</p>

            <div className="bg-surface p-6 rounded-lg border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Product Review Queue</h2>
                    <div>
                        <button onClick={() => setFilter('Needs Review')} className={`px-3 py-1 rounded-l-lg text-sm ${filter === 'Needs Review' ? 'bg-primary text-black' : 'bg-surface-light'}`}>Needs Review</button>
                        <button onClick={() => setFilter('All')} className={`px-3 py-1 rounded-r-lg text-sm ${filter === 'All' ? 'bg-primary text-black' : 'bg-surface-light'}`}>All Products</button>
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-text-secondary">
                        <thead className="text-xs uppercase bg-surface-light">
                            <tr>
                                <th className="px-6 py-3">Product</th>
                                <th className="px-6 py-3">Seller</th>
                                <th className="px-6 py-3">Price</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.map(product => (
                                <tr key={product.id} className="border-b border-border-color">
                                    <td className="px-6 py-4 font-medium text-text-primary">
                                        <div className="flex items-center">
                                            <img src={product.imageUrl} alt={product.name} className="w-10 h-10 object-cover rounded mr-3"/>
                                            <div>
                                                <p>{product.name}</p>
                                                <p className="text-xs text-text-secondary">{product.category}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">{product.sellerName}</td>
                                    <td className="px-6 py-4 font-semibold">{new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                            product.status === 'Listed' ? 'bg-green-500/20 text-green-400' :
                                            product.status === 'Unlisted' ? 'bg-gray-500/20 text-gray-400' :
                                            'bg-yellow-500/20 text-yellow-400'
                                        }`}>{product.status}</span>
                                    </td>
                                    <td className="px-6 py-4 text-center">
                                        {product.status === 'Needs Review' && (
                                            <div className="flex justify-center space-x-2">
                                                <button onClick={() => handleUpdateStatus(product.id, 'Listed')} title="Approve" className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/40">
                                                    <CheckCircleIcon className="h-5 w-5 text-green-400" />
                                                </button>
                                                <button onClick={() => handleUpdateStatus(product.id, 'Unlisted')} title="Reject" className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40">
                                                    <XCircleIcon className="h-5 w-5 text-red-400" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {filteredProducts.length === 0 && <p className="text-center py-8">No products to review.</p>}
                </div>
            </div>
             <BulkUploadProductsModal isOpen={isBulkUploadModalOpen} onClose={() => setIsBulkUploadModalOpen(false)} />
        </div>
    );
};
