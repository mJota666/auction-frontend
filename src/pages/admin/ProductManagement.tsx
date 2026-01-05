import React, { useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Trash2, Package } from 'lucide-react';

const ProductManagement: React.FC = () => {
    const { products, loading, error, fetchProducts, deleteProduct } = useAdmin();

    useEffect(() => {
        fetchProducts();
    }, []);

    if (loading && products.length === 0) return <div className="flex justify-center py-20 text-[#3D4852] font-medium">Loading Products...</div>;
    if (error) return <div className="text-red-500 text-center py-20 font-bold">{error}</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-10">
                <h1 className="text-3xl font-bold text-[#3D4852]">Product Management</h1>
                <nav className="flex space-x-4">
                    <a href="/admin" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Overview</a>
                    <a href="/admin/users" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Users</a>
                    <a href="/admin/products" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6C63FF] neu-inset">Products</a>
                    <a href="/admin/categories" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Categories</a>
                </nav>
            </div>
            
            <div className="neu-extruded rounded-[2.5rem] p-8 md:p-10 bg-[#E0E5EC]">
                {products.length === 0 ? (
                    <div className="neu-inset rounded-[2rem] p-10 text-center text-gray-500 italic">No products found.</div>
                ) : (
                    <div className="space-y-4">
                         {/* Header Row (Desktop) */}
                        <div className="hidden md:grid grid-cols-12 gap-4 px-6 py-3 font-bold text-[#6B7280] text-sm tracking-wider uppercase">
                            <div className="col-span-1">ID</div>
                            <div className="col-span-5">Product Details</div>
                            <div className="col-span-3">Price</div>
                            <div className="col-span-2">Status</div>
                            <div className="col-span-1 text-right">Actions</div>
                        </div>

                        {products.map((product) => (
                            <div key={product.id} className="neu-flat rounded-2xl p-6 md:p-4 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-4 items-center group hover:bg-white/40 transition-colors">
                                <div className="col-span-1 font-mono text-gray-400 text-xs">#{product.id}</div>
                                
                                <div className="col-span-5 flex items-center gap-4">
                                    <div className="flex-shrink-0 w-16 h-16 rounded-xl neu-inset overflow-hidden p-1 bg-white/50">
                                        {product.thumbnailUrl || product.imageUrls?.[0] ? (
                                            <img className="w-full h-full object-cover rounded-lg" src={product.thumbnailUrl || product.imageUrls?.[0]} alt="" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <Package className="w-6 h-6" />
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <div className="font-bold text-[#3D4852] text-lg">{product.title}</div>
                                        <div className="text-xs text-gray-500 truncate max-w-xs">{product.description || 'No description'}</div>
                                    </div>
                                </div>

                                <div className="col-span-3 font-bold text-[#6C63FF]">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice || product.startPrice)}
                                </div>

                                <div className="col-span-2">
                                    <span className={`inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-bold neu-inset ${
                                        product.status === 'ACTIVE' ? 'text-green-600 bg-green-50/50' : 
                                        product.status === 'SOLD' ? 'text-blue-600 bg-blue-50/50' : 'text-gray-600 bg-gray-50/50'
                                    }`}>
                                        {product.status}
                                    </span>
                                </div>

                                <div className="col-span-1 flex justify-end">
                                    <button 
                                        onClick={() => deleteProduct(product.id)}
                                        className="w-10 h-10 rounded-xl neu-btn text-red-500 hover:text-red-600 flex items-center justify-center transition-all hover:scale-105"
                                        title="Delete Product"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductManagement;
