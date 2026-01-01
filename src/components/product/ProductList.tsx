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
                sortBy: filters.sortBy,
                sortDir: filters.sortDir
            };
            
            if (filters.query) params.query = filters.query;
            if (filters.categoryId) params.categoryId = Number(filters.categoryId);
            
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
        <div className="min-h-screen bg-[#F5F5F7]">
            {/* Header Section */}
            <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 sticky top-16 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                        <div className="text-center md:text-left">
                            <h2 className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">Store.</h2>
                            <p className="text-[#86868b] text-base mt-2 font-medium">The best way to buy the products you love.</p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                             {/* Search Pill */}
                             <div className="relative w-full md:w-64 group">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Search className="h-4 w-4 text-gray-500 group-focus-within:text-[#0071e3] transition-colors" />
                                </div>
                                <form onSubmit={handleSearch}>
                                    <input
                                        type="text"
                                        className="block w-full pl-10 pr-4 py-2 bg-[#F5F5F7] border-none rounded-full text-sm text-[#1d1d1f] placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#0071e3]/30 focus:bg-white transition-all shadow-inner"
                                        placeholder="Search"
                                        value={localQuery}
                                        onChange={(e) => setLocalQuery(e.target.value)}
                                    />
                                </form>
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative w-full sm:w-auto">
                                <select 
                                    value={`${filters.sortBy}-${filters.sortDir}`}
                                    onChange={(e) => {
                                        const [field, dir] = e.target.value.split('-');
                                        dispatch({ type: 'SET_FILTER', payload: { sortBy: field, sortDir: dir as 'asc'|'desc' } });
                                    }}
                                    className="appearance-none block w-full sm:w-48 pl-4 pr-10 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-[#1d1d1f] focus:ring-2 focus:ring-[#0071e3] focus:border-transparent transition-shadow cursor-pointer hover:border-[#0071e3]"
                                >
                                    <option value="createdAt-desc">Newest Arrivals</option>
                                    <option value="endAt-asc">Ending Soon</option>
                                    <option value="currentPrice-asc">Price: Low to High</option>
                                    <option value="currentPrice-desc">Price: High to Low</option>
                                </select>
                                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-gray-500">
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
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#1d1d1f]"></div>
                    </div>
                ) : products.length > 0 ? (
                    <>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {products.map((product) => (
                                <div key={product.id} className="relative fade-in-up h-full">
                                    {isNewProduct(product.createdAt) && (
                                        <span className="absolute top-4 right-4 z-20 inline-flex items-center px-2 py-1 rounded text-[10px] font-bold bg-[#0071e3] text-white shadow-lg uppercase tracking-wider">
                                            New
                                        </span>
                                    )}
                                    <ProductCard product={product} />
                                </div>
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="mt-16 flex justify-center items-center space-x-2">
                                <button
                                    onClick={() => dispatch({ type: 'SET_PAGE', payload: Math.max(0, currentPage - 1) })}
                                    disabled={currentPage === 0}
                                    className="px-6 py-2.5 border border-gray-200 text-sm font-medium rounded-full text-[#1d1d1f] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
                                >
                                    Previous
                                </button>
                                <span className="text-sm font-medium text-[#86868b] px-4">
                                    Page {currentPage + 1} of {totalPages}
                                </span>
                                <button
                                    onClick={() => dispatch({ type: 'SET_PAGE', payload: currentPage + 1 })}
                                    disabled={currentPage >= totalPages - 1}
                                    className="px-6 py-2.5 border border-gray-200 text-sm font-medium rounded-full text-[#1d1d1f] bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm"
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
