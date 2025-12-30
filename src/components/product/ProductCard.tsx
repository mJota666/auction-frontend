import React from 'react';
import { Link } from 'react-router-dom';
import type { Product } from '../../services/product';
import { Clock, Tag } from 'lucide-react';

interface ProductCardProps {
    product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
    const timeLeft = new Date(product.endAt).getTime() - new Date().getTime();
    const isExpired = timeLeft <= 0;
    
    // Format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
    };

    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
            <Link to={`/products/${product.id}`}>
                <div className="relative h-48 w-full">
                    <img 
                        src={product.imageUrls?.[0] || 'https://via.placeholder.com/300'} 
                        alt={product.title} 
                        className="w-full h-full object-cover"
                    />
                    {isExpired && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <span className="text-white font-bold text-lg">ENDED</span>
                        </div>
                    )}
                </div>
            </Link>
            
            <div className="p-4">
                <Link to={`/products/${product.id}`}>
                    <h3 className="text-lg font-semibold text-gray-800 hover:text-indigo-600 line-clamp-1">{product.title}</h3>
                </Link>
                
                <div className="mt-2 flex items-center justify-between">
                     <div className="flex flex-col">
                         <span className="text-sm text-gray-500">Current Bid</span>
                         <span className="text-xl font-bold text-indigo-700">
                             {formatCurrency(product.currentPrice || product.startPrice)}
                         </span>
                     </div>
                </div>
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center">
                        <Tag className="w-4 h-4 mr-1" />
                        <span>Category</span>
                    </div>
                    <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-1" />
                        <span>{new Date(product.endAt).toLocaleDateString()}</span>
                    </div>
                </div>
                
                <div className="mt-4">
                     <Link 
                        to={`/products/${product.id}`}
                        className="block w-full text-center bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition"
                     >
                        Bid Now
                     </Link>
                </div>
            </div>
        </div>
    );
};

export default ProductCard;
