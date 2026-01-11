import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../services/product';
import { Clock, Calendar, User, Gavel, Heart } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const { favorites, toggleFavorite, isAuthenticated } = useAuth();
    const isFavorite = favorites.includes(product.id);

    // Treat as UTC
    const dateStr = product.endAt.endsWith('Z') ? product.endAt : `${product.endAt}Z`;
    const timeLeft = new Date(dateStr).getTime() - new Date().getTime();
    const isExpired = timeLeft <= 0;
    
    // Format time left
    const formatTimeLeft = (ms: number) => {
        if (ms <= 0) return 'Ended';
        const days = Math.floor(ms / (1000 * 60 * 60 * 24));
        const hours = Math.floor((ms % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0) return `${days}d ${hours}h left`;
        if (hours > 0) return `${hours}h ${minutes}m left`;
        return `${minutes}m left`;
    };

    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.info('Login to add to favorites');
            return;
        }
        try {
            await toggleFavorite(product.id);
            toast.success(isFavorite ? 'Removed from Watchlist' : 'Added to Watchlist');
        } catch (err: any) {
            toast.error(err.response?.data?.message || `Error: ${err.response?.status}` || 'Action failed');
        }
    };

    // Image source priority: thumbnailUrl -> imageUrls[0] -> placeholder
    // @ts-ignore
    const displayImage = product.thumbnailUrl || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://placehold.co/400x400?text=No+Image');

    return (
        <div className="neu-extruded overflow-hidden group hover:z-10 relative flex flex-col h-full">
            <Link to={`/products/${product.id}`} className="block p-4">
                <div className="relative h-48 w-full neu-inset rounded-2xl overflow-hidden">
                    <img 
                        src={displayImage} 
                        alt={product.title} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            if (!target.src.includes('placehold.co')) {
                                target.src = 'https://placehold.co/400x400?text=No+Image';
                            }
                        }}
                    />
                    
                    {/* Watchlist Button */}
                    <button
                        onClick={handleToggleFavorite}
                        className="absolute top-2 right-2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all outline-none z-20"
                        title={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
                    >
                        <Heart 
                            className={`w-4 h-4 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                        />
                    </button>

                    {isExpired && (
                        <div className="absolute inset-0 bg-[#E0E5EC]/80 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-[#3D4852] font-extrabold text-lg tracking-wider">ENDED</span>
                        </div>
                    )}
                    {!isExpired && product.buyNowPrice && (
                        <div className="absolute top-2 left-2 bg-green-500/90 backdrop-blur-md text-white px-2 py-1 rounded-lg text-[10px] font-bold shadow-sm">
                            Buy Now
                        </div>
                    )}
                </div>
            </Link>
            
            <div className="px-5 pb-6 pt-2 flex-1 flex flex-col">
                <Link to={`/products/${product.id}`}>
                    <h3 className="text-lg font-bold text-[#3D4852] hover:text-[#6C63FF] line-clamp-1 transition-colors" title={product.title}>
                        {product.title}
                    </h3>
                </Link>
                
                {/* Price Section */}
                <div className="mt-3 flex flex-wrap items-end justify-between gap-x-1">
                     <div className="flex flex-col">
                         <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Current Price</span>
                         <span className="text-xl font-extrabold text-[#6C63FF] whitespace-nowrap">
                             {formatCurrency(product.currentPrice || product.startPrice)}
                         </span>
                     </div>
                     {product.buyNowPrice && (
                         <div className="flex flex-col items-start">
                            <span className="text-[10px] font-medium text-[#6B7280] whitespace-nowrap">Buy Now</span>
                            <span className="text-sm font-bold text-green-600 whitespace-nowrap">
                                {formatCurrency(product.buyNowPrice)}
                            </span>
                         </div>
                     )}
                </div>

                {/* Meta Info (Bidder & Count) */}
                <div className="mt-3 flex justify-between text-xs text-[#6B7280] font-medium bg-[#E0E5EC] p-2 rounded-xl border border-white/50">
                    <div className="flex items-center gap-1">
                        <User className="w-3 h-3 text-[#6C63FF]" />
                        <span className="truncate max-w-[80px]" title={product.currentWinnerName || 'No Bids'}>
                            {product.currentWinnerName || 'No Bids'}
                        </span>
                    </div>
                    <div className="flex items-center gap-1">
                        <Gavel className="w-3 h-3 text-[#6C63FF]" />
                        <span>{product.bidCount || 0} Bids</span>
                    </div>
                </div> 
                
                <div className="mt-auto pt-3 space-y-2">
                    {/* Time & Date */}
                    <div className="flex flex-wrap gap-y-2 items-center justify-between text-xs font-medium text-[#6B7280]">
                        <div className="flex items-center px-2 py-1 neu-inset rounded-lg" title={`Posted: ${new Date(product.createdAt || '').toLocaleDateString()}`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            <span>{new Date(product.createdAt || '').toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center text-[#6C63FF] font-bold">
                            <Clock className="w-3 h-3 mr-1" />
                            <span>{formatTimeLeft(timeLeft)}</span>
                        </div>
                    </div>

                    <Link 
                        to={`/products/${product.id}`}
                        className="neu-btn neu-btn-primary w-full py-3 rounded-xl text-sm font-bold tracking-wide mt-3 text-center"
                    >
                        Place Bid
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
