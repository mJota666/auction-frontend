import React, { useEffect, useState } from 'react';
import { authService } from '../services/auth';
import type { Product } from '../services/product';
import ProductCard from '../components/product/ProductCard';
import { Heart } from 'lucide-react';

const Favorites: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFavorites = async () => {
            try {
                // Assuming api returns array of products
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex items-center mb-8">
                <Heart className="h-8 w-8 text-pink-500 mr-3" />
                <h1 className="text-3xl font-bold text-gray-900">My Favorites</h1>
            </div>

            {products.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <ProductCard key={product.id} product={product} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-20 bg-gray-50 rounded-lg">
                    <p className="text-xl text-gray-500">You haven't liked any products yet.</p>
                </div>
            )}
        </div>
    );
};

export default Favorites;
