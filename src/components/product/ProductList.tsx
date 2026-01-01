import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/product';
import ProductCard from './ProductCard';
import { Search } from 'lucide-react';
import { useProduct } from '../../context/ProductContext';

const ProductList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { state, dispatch } = useProduct();
    const { products, loading, totalPages, currentPage, filters } = state;
    
    // Local state for search input to prevent excessive re-renders/dispatches while typing
    const [localQuery, setLocalQuery] = useState(filters.query);

    // Sync URL params to Context Filters on mount or URL change
    useEffect(() => {
        const query = searchParams.get('query') || '';
        const catId = searchParams.get('categoryId');
        
        // Only dispatch if different to avoid loops
        if (filters.query !== query || filters.categoryId !== catId) {
             dispatch({ type: 'SET_FILTER', payload: { query, categoryId: catId } });
             setLocalQuery(query);
        }
    }, [searchParams]);

    const fetchProducts = async () => {
        dispatch({ type: 'FETCH_INIT' });
        try {
            const params: any = {
                page: currentPage,
                size: 12,
            };

            // Backend specific sort logic
            if (filters.sortBy) {
                params.sortBy = filters.sortBy;
            }
            
            if (filters.query) {
                params.query = filters.query;
                params.keyword = filters.query;
            }
            if (filters.categoryId) {
                params.categoryId = Number(filters.categoryId);
                params.category_id = Number(filters.categoryId);
                params.category = Number(filters.categoryId);
            }
            
            console.log('Fetching products with params:', params); // DEBUG Log

            const data = await productService.searchProducts(params);
            
            let content = [];
            let total = 0;

            if (data.content) {
                content = data.content;
                total = data.totalPages || 0;
            } else if (Array.isArray(data)) {
                content = data;
            } else if (data.data && Array.isArray(data.data)) {
                 content = data.data; 
            }

            dispatch({ 
                type: 'FETCH_SUCCESS', 
                payload: { products: content, totalPages: total } 
            });
            
        } catch (error) {
            console.error('Failed to fetch products', error);
            dispatch({ type: 'FETCH_FAILURE', payload: 'Failed to load products.' });
        }
    };

    // Trigger fetch when dependencies change
    useEffect(() => {
        fetchProducts();
    }, [filters, currentPage]); 

    // Handlers
    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        dispatch({ type: 'SET_FILTER', payload: { query: localQuery } });
        
        // Update URL to match
        const newParams = new URLSearchParams(searchParams);
        if (localQuery) newParams.set('query', localQuery);
        else newParams.delete('query');
        setSearchParams(newParams);
    };
    
    const isNewProduct = (createdAt?: string) => {
        if (!createdAt) return false;
        const dateStr = createdAt.endsWith('Z') ? createdAt : `${createdAt}Z`;
        const diffMinutes = (new Date().getTime() - new Date(dateStr).getTime()) / (1000 * 60);
        return diffMinutes < 60;
    };

    return (
        <div className="min-h-screen">
            {/* Header Section */}
            <div className="bg-[#E0E5EC]/90 backdrop-blur-md border-b border-white/20 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-extrabold text-[#3D4852] tracking-tight">Store.</h2>
                            <p className="text-[#6B7280] text-base mt-2 font-medium">The best way to buy the products you love.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                             {/* Search Pill */}
                             <div className="relative w-full md:w-72 group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-[#6B7280] group-focus-within:text-[#6C63FF] transition-colors" />
                                </div>
                                <form onSubmit={handleSearch}>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-4 py-3 neu-inset-deep rounded-2xl text-sm text-[#3D4852] placeholder-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all font-medium"
                                        placeholder="Search products..."
                                        value={localQuery}
                                        onChange={(e) => setLocalQuery(e.target.value)}
                                    />
                                </form>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative w-full sm:w-auto">
                                    <select 
                                        value={filters.sortBy || ''}
                                        onChange={(e) => {
                                            dispatch({ type: 'SET_FILTER', payload: { sortBy: e.target.value } });
                                        }}
                                        className="appearance-none block w-full sm:w-48 pl-4 pr-10 py-3 neu-extruded rounded-2xl text-sm font-bold text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 cursor-pointer hover:text-[#6C63FF] transition-colors"
                                    >
                                        <option value="">Newest Arrivals</option>
                                        <option value="end_at_asc">Ending Soon</option>
                                        <option value="price_asc">Price: Low to High</option>
                                        <option value="price_desc">Price: High to Low</option>
                                    </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-[#6B7280]">
                                    <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <div className="flex justify-center h-64 items-center">
                        <div className="w-16 h-16 rounded-full neu-extruded flex items-center justify-center animate-spin">
                            <div className="w-8 h-8 rounded-full border-4 border-[#6C63FF] border-t-transparent"></div>
                        </div>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {products.map((product) => (
                                <div key={product.id} className="relative fade-in-up h-full">
                                    {isNewProduct(product.createdAt) && (
                                        <span className="absolute -top-2 -right-2 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-[#6C63FF] text-white text-[10px] font-bold shadow-lg animate-bounce">
                                            NEW
                                        </span>
                                    )}
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex justify-center items-center space-x-6">
                                <button
                                    onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.max(0, currentPage - 1) })}
                                    disabled={currentPage === 0}
                                    className="neu-btn px-8 py-3 rounded-2xl text-sm font-bold text-[#3D4852] disabled:opacity-50 disabled:shadow-none transition-all"
                                >
                                    Previous
                                </button>
                                <span className="neu-inset px-6 py-2 rounded-xl text-sm font-bold text-[#6C63FF]">
                                    Page {currentPage + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => dispatch({ type: 'SET_PAGE', payload: currentPage + 1 })}
                                    disabled={currentPage >= totalPages - 1}
                                    className="neu-btn px-8 py-3 rounded-2xl text-sm font-bold text-[#3D4852] disabled:opacity-50 disabled:shadow-none transition-all"
                                >
                                    Next
                                </button>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-32 bg-white rounded-3xl mx-auto max-w-2xl shadow-sm">
                        <div className="mx-auto h-20 w-20 text-gray-200 mb-6 bg-gray-50 rounded-full flex items-center justify-center">
                            <Search className="h-10 w-10" />
                        </div>
                        <h3 className="text-2xl font-semibold text-[#1d1d1f]">No auctions found</h3>
                        <p className="mt-2 text-[#86868b]">We couldn't find any matches for your search.</p>
                        <button 
                            onClick={() => {
                                setLocalQuery('');
                                dispatch({ type: 'SET_FILTER', payload: { query: '' } });
                                setSearchParams({});
                                window.location.reload();
                            }}
                            className="mt-8 text-[#0071e3] hover:underline font-medium text-lg"
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProductList;
