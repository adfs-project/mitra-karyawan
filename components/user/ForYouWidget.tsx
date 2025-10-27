import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { Link } from 'react-router-dom';
import { Article, Product, Achievement } from '../../types';
import { TrophyIcon, NewspaperIcon } from '@heroicons/react/24/solid';

const totalAchievements: Achievement[] = ['First Purchase', 'Punctual Payer', 'Top Spender'];

// Card for Loyalty
const LoyaltyCard: React.FC<{ onClick: () => void }> = ({ onClick }) => {
    const { user } = useAuth();
    if (!user) return null;
    
    const achievementsCount = user.achievements.length;
    const progress = (achievementsCount / totalAchievements.length) * 100;

    return (
        <div className="flex-shrink-0 w-80 bg-surface rounded-lg p-4 border border-border-color flex flex-col justify-between" onClick={onClick}>
            <div>
                <div className="flex items-center mb-3">
                    <TrophyIcon className="h-6 w-6 text-secondary mr-2" />
                    <h3 className="font-bold text-text-primary">Poin & Pencapaian</h3>
                </div>
                <div className="flex justify-between items-center">
                    <div>
                        <p className="text-xs text-text-secondary">Poin Loyalitas</p>
                        <p className="font-bold text-xl text-secondary">{user.loyaltyPoints.toLocaleString('id-ID')}</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-text-secondary">Pencapaian</p>
                        <p className="font-bold text-xl">{achievementsCount} / {totalAchievements.length}</p>
                    </div>
                </div>
                <div className="w-full bg-surface-light rounded-full h-2 mt-3">
                    <div className="bg-secondary h-2 rounded-full" style={{ width: `${progress}%` }}></div>
                </div>
            </div>
            <Link to="/account" className="text-sm font-semibold text-primary mt-4 block text-right">Lihat Detail →</Link>
        </div>
    );
}

// Card for News
const NewsCard: React.FC<{ article: Article; onClick: () => void }> = ({ article, onClick }) => {
    return (
        <Link to="/news" onClick={onClick} className="flex-shrink-0 w-80 bg-surface rounded-lg border border-border-color overflow-hidden">
            <img src={article.imageUrl} alt={article.title} className="w-full h-32 object-cover" />
            <div className="p-4">
                <div className="flex items-center mb-2">
                    <NewspaperIcon className="h-6 w-6 text-primary mr-2" />
                    <h3 className="font-bold text-text-primary">Info Terbaru</h3>
                </div>
                <p className="font-semibold text-sm text-text-primary truncate">{article.title}</p>
                <p className="text-xs text-text-secondary truncate mt-1">{article.summary}</p>
            </div>
        </Link>
    );
}

// Card for Product
const ProductCard: React.FC<{ product: Product; onClick: () => void }> = ({ product, onClick }) => {
    return (
        <Link to="/market" onClick={onClick} className="flex-shrink-0 w-48 bg-surface rounded-lg border border-border-color overflow-hidden">
             <img src={product.imageUrl} alt={product.name} className="w-full h-24 object-cover" />
             <div className="p-3">
                 <h3 className="font-semibold text-xs text-text-primary truncate">{product.name}</h3>
                 <p className="font-bold text-primary text-sm mt-1">
                      {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(product.price)}
                 </p>
             </div>
        </Link>
    )
}


const ForYouWidget: React.FC = () => {
    const { articles, products, transactions, homePageConfig, logEngagementEvent } = useData();
    const { user } = useAuth();
    
    // Logic to build the dynamic card list
    let cardList: { id: string, type: 'loyalty' | 'news' | 'product' | 'welcome', component: React.ReactNode }[] = [];

    // Card 1: Pinned Item from Admin
    const pinnedId = homePageConfig.pinnedItemId;
    if (pinnedId) {
        const pinnedProduct = products.find(p => p.id === pinnedId);
        const pinnedArticle = articles.find(a => a.id === pinnedId);
        if (pinnedProduct) {
             cardList.push({
                id: pinnedProduct.id,
                type: 'product',
                component: <ProductCard key={pinnedProduct.id} product={pinnedProduct} onClick={() => logEngagementEvent('forYouClicks', `product:${pinnedProduct.id}`)}/>
            });
        } else if (pinnedArticle) {
             cardList.push({
                id: pinnedArticle.id,
                type: 'news',
                component: <NewsCard key={pinnedArticle.id} article={pinnedArticle} onClick={() => logEngagementEvent('forYouClicks', `article:${pinnedArticle.id}`)}/>
            });
        }
    }

    // Card 2: Loyalty is always good to show
    if (!cardList.some(c => c.type === 'loyalty')) {
        cardList.push({ id: 'loyalty', type: 'loyalty', component: <LoyaltyCard key="loyalty" onClick={() => logEngagementEvent('forYouClicks', `loyalty:loyalty`)} /> });
    }

    // Card 3: Latest News Article
    const latestArticle = articles.filter(a => a.status === 'Published' && a.category !== 'Banner' && a.id !== pinnedId).sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())[0];
    if(latestArticle && !cardList.some(c => c.id === latestArticle.id)) {
        cardList.push({ id: latestArticle.id, type: 'news', component: <NewsCard key={latestArticle.id} article={latestArticle} onClick={() => logEngagementEvent('forYouClicks', `article:${latestArticle.id}`)} /> })
    }

    // Card 4 & 5: Product Recommendations
    const recommendedProducts = products.filter(p => p.id !== pinnedId).slice(0, 2);
    recommendedProducts.forEach(p => {
        if (!cardList.some(c => c.id === p.id)) {
            cardList.push({ id: p.id, type: 'product', component: <ProductCard key={p.id} product={p} onClick={() => logEngagementEvent('forYouClicks', `product:${p.id}`)} /> });
        }
    })
    
    // Welcome card logic
    const hasTransactions = transactions.some(tx => tx.userId === user?.id);
    if(!hasTransactions && user) {
        const WelcomeCard = (
            <div key="welcome" className="flex-shrink-0 w-80 bg-surface rounded-lg p-4 border border-primary flex flex-col justify-between">
                <div>
                     <h3 className="font-bold text-primary text-lg">Selamat Datang, {user.profile.name.split(' ')[0]}!</h3>
                     <p className="text-text-secondary text-sm mt-2">Jelajahi semua fitur yang kami siapkan untuk Anda. Coba lakukan Top-Up pertama Anda atau lihat produk di Marketplace.</p>
                </div>
                <Link to="/wallet" className="text-sm font-semibold text-primary mt-4 block text-right">Mulai Top-Up →</Link>
            </div>
        );
        cardList.unshift({ id: 'welcome', type: 'welcome', component: WelcomeCard });
    }


    if (cardList.length === 0) return null;

    return (
        <div>
            <h2 className="text-lg font-bold text-text-primary mb-4">Untuk Anda</h2>
            <div className="flex overflow-x-auto space-x-4 pb-4 snap-x snap-mandatory">
                {cardList.map((card) => (
                    <div key={card.id} className="snap-center">
                        {card.component}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ForYouWidget;