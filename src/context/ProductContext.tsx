import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { Product } from '../services/product';

// 1. STATE INTERFACE
interface ProductState {
    products: Product[];
    categories: any[]; // Store categories globally
    loading: boolean;
    error: string | null;
    totalPages: number;
    currentPage: number;
    filters: {
        sortBy: string;
        query: string;
        categoryId: string | null;
    };
}

// 2. INITIAL STATE
const getInitialState = (): ProductState => {
    const params = new URLSearchParams(window.location.search);
    return {
        products: [],
        categories: [],
        loading: false,
        error: null,
        totalPages: 0,
        currentPage: 0,
        filters: {
            sortBy: '',
            query: params.get('query') || '',
            categoryId: params.get('categoryId'),
        },
    };
};

const initialState: ProductState = getInitialState();

// 3. ACTION TYPES
type ProductAction =
    | { type: 'FETCH_INIT' }
    | { type: 'FETCH_SUCCESS'; payload: { products: Product[]; totalPages: number } }
    | { type: 'FETCH_FAILURE'; payload: string }
    | { type: 'SET_FILTER'; payload: Partial<ProductState['filters']> }
    | { type: 'SET_PAGE'; payload: number }
    | { type: 'SET_CATEGORIES'; payload: any[] };

// 4. REDUCER
const productReducer = (state: ProductState, action: ProductAction): ProductState => {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, loading: true, error: null };
        case 'FETCH_SUCCESS':
            return {
                ...state,
                loading: false,
                products: action.payload.products,
                totalPages: action.payload.totalPages,
            };
        case 'FETCH_FAILURE':
            return { ...state, loading: false, error: action.payload };
        case 'SET_CATEGORIES':
             return { ...state, categories: action.payload };
        case 'SET_FILTER':
            return {
                ...state,
                filters: { ...state.filters, ...action.payload },
                currentPage: 0, // Reset page on filter change
            };
        case 'SET_PAGE':
            return { ...state, currentPage: action.payload };
        default:
            return state;
    }
};

// 5. CONTEXT creation
interface ProductContextType {
    state: ProductState;
    dispatch: React.Dispatch<ProductAction>;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);

import { productService } from '../services/product';

// ... imports

// 6. PROVIDER
export const ProductProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(productReducer, initialState);

    // Fetch categories on mount
    React.useEffect(() => {
        const loadCategories = async () => {
             try {
                 const data = await productService.getCategories();
                 const categories = data.data && Array.isArray(data.data) ? data.data : [];
                 dispatch({ type: 'SET_CATEGORIES', payload: categories });
             } catch (error) {
                 console.error('Failed to load categories', error);
             }
        };
        loadCategories();
    }, []);

    return (
        <ProductContext.Provider value={{ state, dispatch }}>
            {children}
        </ProductContext.Provider>
    );
};

// 7. HOOK
export const useProduct = () => {
    const context = useContext(ProductContext);
    if (!context) {
        throw new Error('useProduct must be used within a ProductProvider');
    }
    return context;
};
