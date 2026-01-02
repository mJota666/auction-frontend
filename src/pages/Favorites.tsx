import React, { useEffect, useState } from 'react';
import { authService } from '../services/auth';
import type { Product } from '../services/product';
import ProductCard from '../components/product/ProductCard';
import { Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                const data = await authService.getFavorites();
                setProducts(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch favorites', error);
            } finally {
                setLoading(false);
            }
        };

        fetchFavorites();
    }, []);

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="flex items-center justify-between mb-12">
                <div className="flex items-center">
                     <div className="w-12 h-12 rounded-full neu-extruded flex items-center justify-center text-pink-500 mr-4">
                        <Heart className="h-6 w-6 fill-current" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-extrabold text-[#3D4852] tracking-tight">Your Watchlist</h1>
                        <p className="text-sm font-medium text-[#6B7280] mt-1">Keep track of auctions you love</p>
                    </div>
                </div>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="h-full">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-24 neu-inset rounded-[3rem] border border-gray-100/50">
                    <div className="w-20 h-20 rounded-full neu-extruded flex items-center justify-center text-gray-300 mx-auto mb-6">
                        <Heart className="h-10 w-10 stroke-[1.5]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#3D4852] mb-3">No favorites yet</h2>
                    <p className="text-[#6B7280] font-medium max-w-md mx-auto mb-8">
                        Tap the heart icon on any auction to save it here for quick access later.
                    </p>
                    <Link to="/search" className="neu-btn neu-btn-primary px-8 py-3 rounded-xl font-bold tracking-wide">
                        Explore Auctions
                    </Link>
                </div>
            )}
        </div>
    );
};

export default Favorites;
