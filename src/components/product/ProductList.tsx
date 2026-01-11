import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { productService } from '../../services/product';
import ProductCard from './ProductCard';
import { Search } from 'lucide-react';
import { useProduct } from '../../context/ProductContext';
import CategoryMenu from '../CategoryMenu';

const ProductList: React.FC = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const { state, dispatch } = useProduct();
    const { products, loading, totalPages, currentPage, filters, categories } = state;
    
    // Local state for search input to prevent excessive re-renders/dispatches while typing
    const [localQuery, setLocalQuery] = useState(filters.query);

    // Sync URL params to Context Filters on mount or URL change
    useEffect(() => {
        const query = searchParams.get('query') || '';
        const catId = searchParams.get('categoryId');
        const sortBy = searchParams.get('sortBy') || '';
        
        // Only dispatch if different to avoid loops
        if (filters.query !== query || filters.categoryId !== catId || filters.sortBy !== sortBy) {
             dispatch({ type: 'SET_FILTER', payload: { query, categoryId: catId, sortBy } });
             setLocalQuery(query);
        }
    }, [searchParams]);

    // Helper to find category path (Breadcrumbs)
    const getBreadcrumbs = (targetId: string | null): { id: number; name: string }[] => {
        if (!targetId || categories.length === 0) return [];
        const numId = Number(targetId);
        const path: { id: number; name: string }[] = [];

        let currentId: number | undefined = numId;
        while (currentId) {
            const category = categories.find((c: any) => c.id === currentId);
            if (category) {
                path.unshift({ id: category.id, name: category.name }); // Add to beginning
                currentId = category.parentId;
            } else {
                break;
            }
        }
        return path;
    };

    const breadcrumbs = getBreadcrumbs(filters.categoryId);

    // Helper to get all descendant IDs for a category (Using API)
    // NOTE: We still keep local recursion as a fallback or for initial rendering if needed, 
    // but the user explicitly requested API usage for fetching children.
    
    // ... breadcrumbs logic remains ...

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
                // User requirement: Call API to get children and use them for query
                let allIds: number[] = [Number(filters.categoryId)];
                
                try {
                    const childrenData = await productService.getCategoryChildren(filters.categoryId);
                    if (childrenData && Array.isArray(childrenData)) {
                        const childIds = childrenData.map((c: any) => c.id);
                        allIds = [...allIds, ...childIds];
                    }
                } catch (err) {
                    console.warn('Failed to fetch category children from API, falling back to single ID', err);
                    // Fallback to local state recursion if API fails? 
                    // For now, adhere to "use API" strictness but safe fail.
                }

                params.categoryId = Number(filters.categoryId);
                
                if (allIds.length > 1) {
                    params.categoryIds = allIds.join(',');
                }
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
                        <div className="text-center md:text-left flex flex-col md:block">
                            <div className="flex items-baseline gap-2 justify-center md:justify-start">
                                {/* Stacked Layout: Breadcrumbs Top, Title Bottom */}
                                <div className="flex flex-col gap-1 items-center md:items-start">
                                    {/* Breadcrumbs Row */}
                                    <div className="flex items-center gap-2 text-sm font-medium text-[#6B7280] flex-wrap justify-center md:justify-start">
                                        <span 
                                            className="hover:text-[#6C63FF] transition-colors cursor-pointer" 
                                            onClick={() => {
                                                dispatch({ type: 'SET_FILTER', payload: { categoryId: null } });
                                                setSearchParams({});
                                            }}
                                        >
                                            Store
                                        </span>
                                        {breadcrumbs.map((crumb) => (
                                            <React.Fragment key={crumb.id}>
                                                <span className="opacity-40">/</span>
                                                <span 
                                                    className="hover:text-[#6C63FF] transition-colors cursor-pointer"
                                                    onClick={() => {
                                                         dispatch({ type: 'SET_FILTER', payload: { categoryId: String(crumb.id) } });
                                                         const newParams = new URLSearchParams(searchParams);
                                                         newParams.set('categoryId', String(crumb.id));
                                                         setSearchParams(newParams);
                                                    }}
                                                >
                                                    {crumb.name}
                                                </span>
                                            </React.Fragment>
                                        ))}
                                    </div>

                                    {/* Title Row */}
                                    <h2 className="text-3xl font-extrabold text-[#3D4852] tracking-tight">
                                        {breadcrumbs.length > 0 ? breadcrumbs[breadcrumbs.length - 1].name : 'Store'}
                                    </h2>
                                </div>
                            </div>
                            <p className="text-[#6B7280] text-base mt-2 font-medium">
                                {breadcrumbs.length > 0 
                                    ? `Browse all ${breadcrumbs[breadcrumbs.length -1].name}` 
                                    : 'The best way to buy the products you love.'}
                            </p>
                        </div>
                        
                        <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto items-center">
                             {/* Category Menu */}
                             <CategoryMenu />

                             {/* Search Pill */}
                             {/* ... */}
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
                            {/* Sort Dropdown (Custom to match CategoryMenu style) */}
                            <div className="relative group w-full sm:w-auto z-40">
                                <button className="flex items-center justify-between w-full sm:w-48 px-4 py-3 neu-extruded rounded-2xl text-sm font-bold text-[#3D4852] hover:text-[#6C63FF] transition-all bg-[#E0E5EC]">
                                    <span>
                                        {filters.sortBy === 'end_at_asc' ? 'Ending Soon' : 
                                         filters.sortBy === 'price_asc' ? 'Price: Low to High' :
                                         filters.sortBy === 'price_desc' ? 'Price: High to Low' : 
                                         'Newest Arrivals'}
                                    </span>
                                    <svg className="h-4 w-4 fill-current ml-2" viewBox="0 0 20 20"><path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"/></svg>
                                </button>
                                
                                <div className="absolute top-full mt-2 right-0 w-full sm:w-56 bg-[#E0E5EC] rounded-2xl shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform origin-top-right border border-white/20 px-2">
                                    <div className="space-y-1">
                                         {[
                                            { label: 'Newest Arrivals', value: '' },
                                            { label: 'Ending Soon', value: 'end_at_asc' },
                                            { label: 'Price: Low to High', value: 'price_asc' },
                                            { label: 'Price: High to Low', value: 'price_desc' }
                                         ].map((option) => (
                                            <button
                                                key={option.value}
                                                onClick={() => dispatch({ type: 'SET_FILTER', payload: { sortBy: option.value } })}
                                                className={`w-full text-left px-4 py-3 text-sm font-medium rounded-xl transition-all ${
                                                    filters.sortBy === option.value 
                                                    ? 'neu-inset text-[#6C63FF]' 
                                                    : 'text-[#3D4852] hover:neu-inset hover:text-[#6C63FF]'
                                                }`}
                                            >
                                                {option.label}
                                            </button>
                                         ))}
                                    </div>
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
