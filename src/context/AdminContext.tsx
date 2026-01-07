import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import { adminService, type User, type Category, type AdminStats } from '../services/admin';
import type { Product } from '../services/product';
import { toast } from 'react-toastify';

// 1. State Interface
interface AdminState {
    users: User[];
    upgradeRequests: User[];
    products: Product[];
    categories: Category[];
    stats: AdminStats | null;
    loading: boolean;
    error: string | null;
}

// 2. Initial State
const initialState: AdminState = {
    users: [],
    upgradeRequests: [],
    products: [],
    categories: [],
    stats: null,
    loading: false,
    error: null,
};

// 3. Action Types
type Action =
    | { type: 'FETCH_INIT' }
    | { type: 'FETCH_USERS_SUCCESS'; payload: User[] }
    | { type: 'FETCH_REQUESTS_SUCCESS'; payload: User[] }
    | { type: 'FETCH_PRODUCTS_SUCCESS'; payload: Product[] }
    | { type: 'FETCH_CATEGORIES_SUCCESS'; payload: Category[] }
    | { type: 'FETCH_STATS_SUCCESS'; payload: AdminStats }
    | { type: 'TOGGLE_LOCK_SUCCESS'; payload: number } // userId
    | { type: 'APPROVE_UPGRADE_SUCCESS'; payload: number } // userId
    | { type: 'REJECT_UPGRADE_SUCCESS'; payload: number } // userId
    | { type: 'DELETE_PRODUCT_SUCCESS'; payload: number } // productId
    | { type: 'ADD_CATEGORY_SUCCESS'; payload: Category }
    | { type: 'UPDATE_CATEGORY_SUCCESS'; payload: Category }
    | { type: 'DELETE_CATEGORY_SUCCESS'; payload: number } // categoryId
    | { type: 'SET_ERROR'; payload: string };

// 4. Reducer
const adminReducer = (state: AdminState, action: Action): AdminState => {
    switch (action.type) {
        case 'FETCH_INIT':
            return { ...state, loading: true, error: null };
        case 'FETCH_USERS_SUCCESS':
            return { ...state, loading: false, users: action.payload };
        case 'FETCH_REQUESTS_SUCCESS':
            return { ...state, loading: false, upgradeRequests: action.payload };
        case 'FETCH_PRODUCTS_SUCCESS':
            return { ...state, loading: false, products: action.payload };
        case 'FETCH_CATEGORIES_SUCCESS':
            return { ...state, loading: false, categories: action.payload };
        case 'FETCH_STATS_SUCCESS':
            return { ...state, loading: false, stats: action.payload };
        case 'TOGGLE_LOCK_SUCCESS':
            return {
                ...state,
                users: state.users.map(u => u.id === action.payload ? { ...u, locked: !u.locked } : u)
            };
        case 'APPROVE_UPGRADE_SUCCESS': {
            // Find the user ID from the request being approved
            const legacyUserValues = state.upgradeRequests.find(u => u.upgradeRequestId === action.payload);
            const userIdToPromote = legacyUserValues ? legacyUserValues.id : null;
            
            return {
                ...state,
                // Remove by Upgrade Request ID
                upgradeRequests: state.upgradeRequests.filter(u => u.upgradeRequestId !== action.payload),
                // Update User Role in the main list
                users: userIdToPromote 
                    ? state.users.map(u => u.id === userIdToPromote ? { ...u, role: 'SELLER' } : u) 
                    : state.users
            };
        }
        case 'REJECT_UPGRADE_SUCCESS':
            return {
                ...state,
                upgradeRequests: state.upgradeRequests.filter(u => u.upgradeRequestId !== action.payload)
            };
        case 'DELETE_PRODUCT_SUCCESS':
            return {
                ...state,
                products: state.products.filter(p => p.id !== action.payload)
            };
        case 'ADD_CATEGORY_SUCCESS':
            return { ...state, categories: [...state.categories, action.payload] };
        case 'UPDATE_CATEGORY_SUCCESS':
            return {
                ...state,
                categories: state.categories.map(c => c.id === action.payload.id ? action.payload : c)
            };
        case 'DELETE_CATEGORY_SUCCESS':
            return {
                ...state,
                categories: state.categories.filter(c => c.id !== action.payload)
            };
        case 'SET_ERROR':
            return { ...state, loading: false, error: action.payload };
        default:
            return state;
    }
};

// 5. Context
interface AdminContextType extends AdminState {
    dispatch: React.Dispatch<Action>;
    fetchUsers: () => Promise<void>;
    fetchUpgradeRequests: () => Promise<void>;
    fetchProducts: () => Promise<void>;
    fetchCategories: () => Promise<void>;
    fetchStats: () => Promise<void>;
    // Actions
    toggleUserLock: (id: number) => Promise<void>;
    approveUpgrade: (id: number) => Promise<void>;
    rejectUpgrade: (id: number, reason: string) => Promise<void>;
    deleteProduct: (id: number) => Promise<void>;
    addCategory: (data: { name: string; description: string; parentId?: number | null }) => Promise<void>;
    updateCategory: (id: number, data: { name: string; description: string; parentId?: number | null }) => Promise<void>;
    deleteCategory: (id: number) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [state, dispatch] = useReducer(adminReducer, initialState);

    // Thunks / Action Creators
    const fetchUsers = async () => {
        dispatch({ type: 'FETCH_INIT' });
        try {
            const data = await adminService.getUsers();
            dispatch({ type: 'FETCH_USERS_SUCCESS', payload: Array.isArray(data) ? data : [] });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch users' });
        }
    };

    const fetchUpgradeRequests = async () => {
        dispatch({ type: 'FETCH_INIT' });
        try {
            const data = await adminService.getUpgradeRequests();
            dispatch({ type: 'FETCH_REQUESTS_SUCCESS', payload: Array.isArray(data) ? data : [] });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch upgrade requests' });
        }
    };

    const fetchProducts = async () => {
        dispatch({ type: 'FETCH_INIT' });
        try {
            const data = await adminService.getProducts();
            dispatch({ type: 'FETCH_PRODUCTS_SUCCESS', payload: Array.isArray(data) ? data : [] });
        } catch (error) {
            dispatch({ type: 'SET_ERROR', payload: 'Failed to fetch products' });
        }
    };

    const fetchCategories = async () => {
        try {
             // Often we don't need full loading spinner for categories refresh
            const data = await adminService.getCategories();
            dispatch({ type: 'FETCH_CATEGORIES_SUCCESS', payload: Array.isArray(data) ? data : [] });
        } catch (error) {
            console.error(error);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await adminService.getDashboardStats();
            dispatch({ type: 'FETCH_STATS_SUCCESS', payload: data });
        } catch (error) {
            console.error(error);
        }
    };

    const toggleUserLock = async (id: number) => {
        try {
            await adminService.toggleUserLock(id);
            dispatch({ type: 'TOGGLE_LOCK_SUCCESS', payload: id });
            toast.success('User status updated');
        } catch (error) {
            toast.error('Failed to update user status');
        }
    };

    const approveUpgrade = async (id: number) => {
        try {
            await adminService.approveUpgradeRequest(id);
            dispatch({ type: 'APPROVE_UPGRADE_SUCCESS', payload: id });
            toast.success('Upgrade approved');
        } catch (error) {
            toast.error('Failed to approve upgrade');
        }
    };

    const rejectUpgrade = async (id: number, reason: string) => {
        try {
            await adminService.rejectUpgradeRequest(id, reason);
            dispatch({ type: 'REJECT_UPGRADE_SUCCESS', payload: id });
            toast.success('Upgrade rejected');
        } catch (error) {
            toast.error('Failed to reject upgrade');
        }
    };

    const deleteProduct = async (id: number) => {
        try {
            await adminService.deleteProduct(id);
            dispatch({ type: 'DELETE_PRODUCT_SUCCESS', payload: id });
            toast.success('Product deleted');
        } catch (error) {
            toast.error('Failed to delete product');
        }
    };

    const addCategory = async (data: { name: string; description: string; parentId?: number | null }) => {
        try {
            const newCat = await adminService.createCategory(data);
            dispatch({ type: 'ADD_CATEGORY_SUCCESS', payload: newCat });
            toast.success('Category created');
        } catch (error) {
            toast.error('Failed to create category');
        }
    };

    const updateCategory = async (id: number, data: { name: string; description: string; parentId?: number | null }) => {
        try {
            const updatedCat = await adminService.updateCategory(id, data);
            dispatch({ type: 'UPDATE_CATEGORY_SUCCESS', payload: updatedCat });
            toast.success('Category updated');
        } catch (error) {
            toast.error('Failed to update category');
        }
    };

    const deleteCategory = async (id: number) => {
        try {
            await adminService.deleteCategory(id);
            dispatch({ type: 'DELETE_CATEGORY_SUCCESS', payload: id });
            toast.success('Category deleted');
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    return (
        <AdminContext.Provider
            value={{
                ...state,
                dispatch,
                fetchUsers,
                fetchUpgradeRequests,
                fetchProducts,
                fetchCategories,
                fetchStats,
                toggleUserLock,
                approveUpgrade,
                rejectUpgrade,
                deleteProduct,
                addCategory,
                updateCategory,
                deleteCategory,
            }}
        >
            {children}
        </AdminContext.Provider>
    );
};

export const useAdmin = () => {
    const context = useContext(AdminContext);
    if (context === undefined) {
        throw new Error('useAdmin must be used within an AdminProvider');
    }
    return context;
};
