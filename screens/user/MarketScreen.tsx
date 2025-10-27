
import React, { useState, useEffect, useMemo } from 'react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Product } from '../../types';
import { MagnifyingGlassIcon, XMarkIcon, PlusIcon } from '@heroicons/react/24/outline';
import { useLocation } from 'react-router-dom';
import ProductFormModal from '../../components/user/market/ProductFormModal';
import AiRecommendations from '../../components/user/market/AiRecommendations';
import ProductCard from '../../components/user/market/ProductCard';

const PurchaseModal: React.FC<{
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
}> = ({ isOpen, onClose, product }) => {
    const { purchaseProduct, addReview } = useData();
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [result, setResult] = useState<{ success: boolean, message: string } | null>(null);
    const [showReview, setShowReview] = useState(false);
    const [rating, setRating] = useState(5);
    const [comment, setComment] = useState("");

    const handlePurchase = async () => {
        if (!product || !user) return;
        setIsLoading(true);
        setResult(null);
        const res = await purchaseProduct(user.id, product, 1); // Assume quantity is 1 for Buy Now
        setResult(res);
        if (res.success) {
            setShowReview(true);
        }
        setIsLoading(false);
    };

    const handleReviewSubmit = async () => {
        if (!product) return;
        await addReview(product.id, rating, comment);
        handleClose();
    };
    
    const handleClose = () => {
        setResult(null);
        setShowReview(false);
        setRating(5);
        setComment("");
        onClose();
    };

    if (!isOpen || !product) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-surface p-6 rounded-lg shadow-lg w-full max-w-sm border border-border-color relative">
                 <button onClick={handleClose} className="absolute top-3 right-3 p-1 rounded-full hover:bg-surface-light">
                    <XMarkIcon className="h-6 w-6 text-text-secondary" />
                </button>
                
                <h2 className="text-xl font-bold text-primary mb-4">Konfirmasi Pembelian</h2>
                
                {result ? (
                    showReview ? (
                        <div>
                            <h3 className="font-bold text-lg text-green-400 mb-2">Pembelian Berhasil!</h3>
                            <p className="text-sm text-text-secondary mb-4">Berikan ulasan untuk {product.name}:</p>
                             <div className="flex justify-center mb-4">
                                {[1, 2, 3, 4, 5].map((star) => (
                                    <button key={star} onClick={() => setRating(star)}>
                                        <StarSolidIcon className={`h-8 w-8 ${rating >= star ? 'text-yellow-400' : 'text-gray-600'}`} />
                                    </button>
                                ))}
                            </div>
                            <textarea value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Tulis komentar Anda..." rows={3} className="w-full p-2 bg-surface-light rounded border border-border-color"></textarea>
                            <div className="flex justify-end space-x-2 mt-4">
                                <button onClick={handleClose} className="text-sm text-text-secondary">Lewati</button>
                                <button onClick={handleReviewSubmit} className="btn-primary px-4 py-2 rounded text-sm">Kirim Ulasan</button>
                            </div>
                        </div>
                    ) : (
                    <div className={`text-center p-4 rounded-lg ${result.success ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                        <h3 className="font-bold text-lg">{result.success ? 'Berhasil!' : 'Gagal!'}</h3>
                        <p>{result.message}</p>
                        <button onClick={handleClose} className="mt-4 btn-primary px-4 py-2 rounded">Tutup</button>
                    </div>
                    )
                ) : (
                    <div>
                        <div className="flex items-center space-x-4 mb-4">
                            <img src={product.imageUrl} alt={product.name} className="w-16 h-16 rounded-lg object-cover" />
                            <div>
                                <h3 className="font-semibold text-text-primary">{product.name}</h3>
                                <p className="font-bold text-primary text-lg">
                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(product.price)}
                                </p>
                            </div>
                        </div>
                        <p className="text-sm text-text-secondary mb-6">Anda akan membeli produk ini. Dana akan dipotong dari saldo dompet Anda. Lanjutkan?</p>
                        
                        <div className="flex justify-end space-x-3">
                             <button onClick={handleClose} disabled={isLoading} className="px-4 py-2 rounded bg-surface-light hover:bg-border-color">Batal</button>
                             <button onClick={handlePurchase} disabled={isLoading} className="btn-primary px-6 py-2 rounded w-40 flex items-center justify-center">
                                {isLoading ? (
                                    <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                                ) : (
                                    'Beli Langsung'
                                )}
                             </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};
// Dummy Icon
const StarSolidIcon: React.FC<any> = (props) => <svg {...props} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" /></svg>;


const MarketScreen: React.FC = () => {
    const { products, addProduct, editProduct } = useData();
    const [isPurchaseModalOpen, setPurchaseModalOpen] = useState(false);
    const [isProductFormModalOpen, setProductFormModalOpen] = useState(false);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

    const location = useLocation();
    const [searchTerm, setSearchTerm] = useState(location.state?.searchQuery || '');
    const [filterCategory, setFilterCategory] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    
    const categories = useMemo(() => ['All', ...Array.from(new Set(products.map(p => p.category)))], [products]);

    useEffect(() => {
        if (location.state?.searchQuery) {
            setSearchTerm(location.state.searchQuery);
        }
    }, [location.state]);

    const handleBuyClick = (product: Product) => {
        setSelectedProduct(product);
        setPurchaseModalOpen(true);
    };

    const handleSaveProduct = async (productData: Omit<Product, 'id' | 'sellerId' | 'sellerName' | 'reviews' | 'rating' | 'reviewCount'> | Product) => {
        const result = 'id' in productData ? await editProduct(productData) : await addProduct(productData);
        if (result.success) {
            setProductFormModalOpen(false);
        } else {
            alert("Failed to save product.");
        }
    };

    const filteredAndSortedProducts = useMemo(() => {
        return products
            .filter(product => 
                (product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                 product.sellerName.toLowerCase().includes(searchTerm.toLowerCase())) &&
                (filterCategory === 'All' || product.category === filterCategory)
            )
            .sort((a, b) => {
                switch (sortBy) {
                    case 'price-asc': return a.price - b.price;
                    case 'price-desc': return b.price - a.price;
                    case 'newest':
                    default:
                        return parseInt((b.id.match(/\d+/) || ['0'])[0], 10) - parseInt((a.id.match(/\d+/) || ['0'])[0], 10);
                }
            });
    }, [products, searchTerm, filterCategory, sortBy]);

    return (
        <div className="p-4 space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-primary">Marketplace</h1>
                <button onClick={() => setProductFormModalOpen(true)} className="btn-primary flex items-center px-4 py-2 rounded-lg text-sm">
                    <PlusIcon className="h-5 w-5 mr-1" /> Jual Barang
                </button>
            </div>
            
            <AiRecommendations />

            <div className="space-y-3 p-4 bg-surface rounded-lg border border-border-color">
                <div className="relative">
                     <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-text-secondary" />
                     <input type="text" placeholder="Cari produk atau penjual..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-surface-light border border-border-color rounded-full py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary"/>
                </div>
                <div className="flex space-x-2 text-sm">
                     <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} className="flex-grow bg-surface-light border border-border-color rounded-full py-2 px-4 focus:outline-none appearance-none">
                        {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    </select>
                     <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="flex-grow bg-surface-light border border-border-color rounded-full py-2 px-4 focus:outline-none appearance-none">
                        <option value="newest">Terbaru</option>
                        <option value="price-asc">Harga Terendah</option>
                        <option value="price-desc">Harga Tertinggi</option>
                    </select>
                </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                {filteredAndSortedProducts.length > 0 ? (
                    filteredAndSortedProducts.map(product => (
                        <ProductCard 
                            key={product.id} 
                            product={product} 
                            onBuyClick={handleBuyClick}
                        />
                    ))
                ) : (
                    <div className="col-span-2 text-center py-12">
                        <p className="text-lg font-semibold text-text-primary">Hasil Tidak Ditemukan</p>
                        <p className="text-text-secondary">Tidak ada produk yang cocok dengan pencarian Anda.</p>
                    </div>
                )}
            </div>

            <PurchaseModal isOpen={isPurchaseModalOpen} onClose={() => setPurchaseModalOpen(false)} product={selectedProduct} />
            <ProductFormModal isOpen={isProductFormModalOpen} onClose={() => setProductFormModalOpen(false)} product={null} onSave={handleSaveProduct} />
        </div>
    );
};

export default MarketScreen;