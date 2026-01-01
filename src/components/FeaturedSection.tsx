import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from './product/ProductCard';
import { productService, type Product } from '../services/product';

interface FeaturedSectionProps {
    title: string;
    sortBy: string;
    sortDir: 'asc' | 'desc';
    linkTo?: string; // Optional "View All" link params
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ title, sortBy, sortDir, linkTo }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                // Fetch top 5
                const params = {
                    page: 0,
                    size: 5,
                    sortBy,
                    sortDir
                };
                const data = await productService.searchProducts(params);
                setProducts(Array.isArray(data) ? data : data.content || []);
            } catch (error) {
                console.error(`Failed to fetch ${title}`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [sortBy, sortDir, title]);

    if (loading) return <div className="py-8 text-center">Loading {title}...</div>;
    
    // Always render section even if empty, to prove it exists
    if (!products || products.length === 0) {
        return (
            <section className="py-12 bg-gray-50/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                     <div className="text-center py-10 bg-white rounded-lg shadow-sm">
                        <p className="text-gray-500">No auctions found in this category yet.</p>
                     </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-gray-50/50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    <Link to="/products" className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center">
                        View All <ArrowRight size={16} className="ml-1" />
                    </Link>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                    {products.map(product => (
                        <div key={product.id} className="min-w-0">
                            <ProductCard product={product} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default FeaturedSection;
