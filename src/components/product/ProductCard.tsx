import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../services/product';
import { Clock, Tag } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    // Treat as UTC
    const dateStr = product.endAt.endsWith('Z') ? product.endAt : `${product.endAt}Z`;
    const timeLeft = new Date(dateStr).getTime() - new Date().getTime();
    const isExpired = timeLeft <= 0;
    
    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    // Image source priority: thumbnailUrl -> imageUrls[0] -> placeholder
    // @ts-ignore
    const displayImage = product.thumbnailUrl || (product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : 'https://via.placeholder.com/400x400?text=No+Image');

    return (
        <div className="neu-extruded overflow-hidden group hover:z-10 relative">
            <Link to={`/products/${product.id}`} className="block p-4">
                <div className="relative h-48 w-full neu-inset rounded-2xl overflow-hidden">
                    <img 
                        src={displayImage} 
                        alt={product.title} 
                        className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=No+Image';
                        }}
                    />
                    {isExpired && (
                        <div className="absolute inset-0 bg-[#E0E5EC]/80 backdrop-blur-sm flex items-center justify-center">
                            <span className="text-[#3D4852] font-extrabold text-lg tracking-wider">ENDED</span>
                        </div>
                    )}
                </div>
            </Link>
            
            <div className="px-5 pb-6 pt-2">
                <Link to={`/products/${product.id}`}>
                    <h3 className="text-lg font-bold text-[#3D4852] hover:text-[#6C63FF] line-clamp-1 transition-colors">{product.title}</h3>
                </Link>
                
                <div className="mt-3 flex items-end justify-between">
                     <div className="flex flex-col">
                         <span className="text-xs font-medium text-[#6B7280] uppercase tracking-wide">Current Bid</span>
                         <span className="text-xl font-extrabold text-[#6C63FF]">
                             {formatCurrency(product.currentPrice || product.startPrice)}
                         </span>
                     </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-xs font-medium text-[#6B7280]">
                    <div className="flex items-center px-2 py-1 neu-inset rounded-lg">
                        <Tag className="w-3 h-3 mr-1" />
                        <span>Generic</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-3 h-3 mr-1" />
                        <span>{new Date(dateStr).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div className="mt-5">
                     <Link 
                        to={`/products/${product.id}`}
                        className="neu-btn neu-btn-primary w-full py-3 rounded-xl text-sm font-bold tracking-wide"
                     >
                        Place Bid
                     </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
