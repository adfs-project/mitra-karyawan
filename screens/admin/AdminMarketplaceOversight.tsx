import React, { useMemo, useState } from 'react';
import { BuildingStorefrontIcon, CheckCircleIcon, XCircleIcon, EyeIcon, MagnifyingGlassIcon } from '@heroicons/react/24/solid';
import { useMarketplace } from '../../hooks/useMarketplace';
import { Product } from '../../types';

const AdminMarketplaceOversight: React.FC = () => {
    const { products, updateProductStatus } = useMarketplace();
    const [filter, setFilter] = useState<'All' | 'Needs Review'>('Needs Review');
    const [searchTerm, setSearchTerm] = useState('');
    const [processingId, setProcessingId] = useState<string | null>(null);

    const filteredProducts = useMemo(() => {
        return products.filter(p => {
            const matchesFilter = filter === 'All' || p.status === filter;
            
            const searchLower = searchTerm.toLowerCase();
            const matchesSearch = searchTerm === '' ||
                p.name.toLowerCase().includes(searchLower) ||
                p.description.toLowerCase().includes(searchLower) ||
                p.sellerName.toLowerCase().includes(searchLower);

            return matchesFilter && matchesSearch;
        }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }, [products, filter, searchTerm]);

    const handleUpdateStatus = async (productId: string, status: 'Listed' | 'Unlisted') => {
        setProcessingId(productId);
        await updateProductStatus(productId, status);
        setProcessingId(null);
    };

    const formatCurrency = (value: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(value);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold text-primary flex items-center">
                <BuildingStorefrontIcon className="h-8 w-8 mr-2"/>
                Marketplace Oversight
            </h1>
            <p className="text-text-secondary">Tinjau dan kelola produk yang dijual oleh karyawan di marketplace.</p>

            <div className="bg-surface p-4 rounded-lg border border-border-color">
                <div className="flex justify-between items-center mb-4">
                    <div className="flex space-x-2 border-b border-border-color">
                        <button onClick={() => setFilter('Needs Review')} className={`px-4 py-2 font-semibold ${filter === 'Needs Review' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                            Needs Review ({products.filter(p => p.status === 'Needs Review').length})
                        </button>
                        <button onClick={() => setFilter('All')} className={`px-4 py-2 font-semibold ${filter === 'All' ? 'text-primary border-b-2 border-primary' : 'text-text-secondary'}`}>
                            All Products
                        </button>
                    </div>
                     <div className="relative w-full max-w-xs">
                        <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                        <input 
                            type="text"
                            placeholder="Cari produk, penjual..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full p-2 pl-10 bg-surface-light border border-border-color rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                    </div>
                </div>
            
                <div className="overflow-x-auto">
                    {filteredProducts.length > 0 ? (
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
                                {filteredProducts.map(p => (
                                    <tr key={p.id} className="border-b border-border-color">
                                        <td className="px-6 py-4 font-medium text-text-primary">
                                            <div className="flex items-center space-x-3">
                                                <img src={p.imageUrl} alt={p.name} className="w-12 h-12 rounded object-cover"/>
                                                <div>
                                                    <p className="font-bold">{p.name}</p>
                                                    <p className="text-xs text-text-secondary truncate max-w-xs">{p.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">{p.sellerName}</td>
                                        <td className="px-6 py-4 font-semibold">{formatCurrency(p.price)}</td>
                                        <td className="px-6 py-4">
                                             <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                                 p.status === 'Listed' ? 'bg-green-500/20 text-green-400' : 
                                                 p.status === 'Unlisted' ? 'bg-gray-500/20 text-gray-400' : 
                                                 'bg-yellow-500/20 text-yellow-400'}`
                                             }>{p.status}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {processingId === p.id ? (
                                                <div className="flex justify-center"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div></div>
                                            ) : (
                                                <div className="flex justify-center space-x-2">
                                                    {p.status === 'Needs Review' && (
                                                        <>
                                                            <button onClick={() => handleUpdateStatus(p.id, 'Listed')} className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/40" title="Approve"><CheckCircleIcon className="h-5 w-5 text-green-400" /></button>
                                                            <button onClick={() => handleUpdateStatus(p.id, 'Unlisted')} className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40" title="Reject"><XCircleIcon className="h-5 w-5 text-red-400" /></button>
                                                        </>
                                                    )}
                                                    {p.status === 'Listed' && <button onClick={() => handleUpdateStatus(p.id, 'Unlisted')} className="p-2 rounded-full bg-red-500/20 hover:bg-red-500/40" title="Unlist"><EyeIcon className="h-5 w-5 text-red-400" /></button>}
                                                    {p.status === 'Unlisted' && <button onClick={() => handleUpdateStatus(p.id, 'Listed')} className="p-2 rounded-full bg-green-500/20 hover:bg-green-500/40" title="Relist"><EyeIcon className="h-5 w-5 text-green-400" /></button>}
                                                </div>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : <p className="text-center py-8">No products match the filter.</p>}
                </div>
            </div>
        </div>
    );
};

export default AdminMarketplaceOversight;
