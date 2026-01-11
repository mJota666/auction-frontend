import React, { useEffect, useState } from 'react';
import { productService, type Product } from '../../services/product';
import { Link } from 'react-router-dom';
import { Eye } from 'lucide-react';

const MyProducts: React.FC = () => {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const result = await productService.getMyProducts();
                // Handle both direct array and paginated response { content: [...] }
                let list: Product[] = [];
                if (Array.isArray(result)) {
                    list = result;
                } else if (result && Array.isArray((result as any).content)) {
                    list = (result as any).content;
                } else if (result && Array.isArray((result as any).data)) {
                    // Fallback in case wrapper is different
                    list = (result as any).data;
                }
                setProducts(list);
            } catch (error) {
                console.error("Failed to fetch my products", error);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    if (loading) return <div className="text-center py-10">Loading products...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                 <h2 className="text-2xl font-bold text-[#3D4852]">My Active Listings</h2>
            </div>
            {products.length === 0 ? (
                <div className="neu-inset rounded-2xl p-12 text-center text-gray-400 font-medium">
                    You don't have any active listings.
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {products.map((product) => (
                        <div key={product.id} className="neu-extruded rounded-2xl p-4 transition-all hover:scale-[1.02] duration-300 flex flex-col h-full">
                            <div className="h-48 rounded-xl neu-inset overflow-hidden relative mb-4">
                                <img 
                                    src={product.thumbnailUrl || product.imageUrls?.[0] || 'https://placehold.co/600x400?text=No+Image'} 
                                    alt={product.title} 
                                    className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
                                />
                                <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-3 py-1 rounded-full text-[10px] font-bold text-[#6C63FF] shadow-sm uppercase tracking-wide">
                                    {product.status}
                                </div>
                            </div>
                            <div className="flex-1 flex flex-col">
                                <h3 className="font-bold text-[#3D4852] truncate mb-1 text-lg">{product.title}</h3>
                                <p className="text-xs text-gray-500 mb-4 truncate">Posted on {new Date(product.createdAt || Date.now()).toLocaleDateString()}</p>
                                
                                <div className="mt-auto flex items-end justify-between bg-gray-50 rounded-xl p-3">
                                    <div>
                                        <p className="text-[10px] uppercase font-bold text-gray-400">Current Price</p>
                                        <p className="text-lg font-black text-[#6C63FF] leading-none mt-1">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice || product.startPrice)}
                                        </p>
                                    </div>
                                    <div className="flex gap-2">
                                        <Link to={`/products/${product.id}`} className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center text-gray-400 hover:text-[#6C63FF] hover:shadow-md transition-all">
                                            <Eye className="w-5 h-5" />
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyProducts;
