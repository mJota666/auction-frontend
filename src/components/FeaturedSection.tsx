import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import ProductCard from './product/ProductCard';
import { productService, type Product } from '../services/product';

interface FeaturedSectionProps {
    title: string;
    type: 'ending-soon' | 'most-bids' | 'high-price';
    linkTo?: string; // Optional "View All" link params
}

const FeaturedSection: React.FC<FeaturedSectionProps> = ({ title, type, linkTo }) => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                let data;
                if (type === 'most-bids') {
                    data = await productService.getTopMostBids();
                } else if (type === 'high-price') {
                    data = await productService.getTopHighestPrice();
                } else if (type === 'ending-soon') {
                    data = await productService.getTopEndingSoon();
                }
                
                // Handle various response data shapes
                setProducts(Array.isArray(data) ? data : data?.content || data?.data || []);
            } catch (error) {
                console.error(`Failed to fetch ${title}`, error);
            } finally {
                setLoading(false);
            }
        };

        fetchProducts();
    }, [type, title]);

    if (loading) return <div className="py-8 text-center">Loading {title}...</div>;
    
    // Always render section even if empty, to prove it exists
    if (!products || products.length === 0) {
        return (
            <section className="py-12 bg-[#E0E5EC]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">{title}</h2>
                     <div className="text-center py-10 neu-inset rounded-lg">
                        <p className="text-gray-500">No auctions found in this category yet.</p>
                     </div>
                </div>
            </section>
        );
    }

    return (
        <section className="py-12 bg-[#E0E5EC]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-end mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">{title}</h2>
                    {/* Determine sort param based on type */}
                    <Link 
                        to={`/search?sortBy=${
                            type === 'high-price' ? 'price_desc' : 
                            type === 'ending-soon' ? 'end_at_asc' : 
                            'bid_count_desc' // most-bids
                        }`} 
                        className="text-indigo-600 hover:text-indigo-800 text-sm font-medium flex items-center"
                    >
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
