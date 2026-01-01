import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { productService } from '../services/product';
import type { Category } from '../services/admin';

const CategoryMenu: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await productService.getCategories();
                setCategories(data.data && Array.isArray(data.data) ? data.data : []);
            } catch (error) {
                console.error("Failed to fetch categories", error);
            } finally {
                setLoading(false);
            }
        };
        fetchCategories();
    }, []);

    // Memoize grouped categories
    const groupedCategories = React.useMemo(() => {
        const groups: { parent: Category; children: Category[] }[] = [];
        const orphans: Category[] = [];

        const isNested = categories.some(c => c.children && c.children.length > 0);

        if (isNested) {
            categories.forEach(cat => {
                if (cat.children && cat.children.length > 0) {
                    groups.push({ parent: cat, children: cat.children });
                } else {
                    orphans.push(cat);
                }
            });
        } else {
            const roots = categories.filter(c => !c.parentId);
            roots.forEach(root => {
                const children = categories.filter(c => c.parentId === root.id);
                if (children.length > 0) {
                    groups.push({ parent: root, children });
                } else {
                    orphans.push(root);
                }
            });
        }
        return { groups, orphans };
    }, [categories]);

    if (loading) return null;

    return (
        <div className="relative group">
            <button className="flex items-center space-x-1 text-slate-700 hover:text-blue-600 transition-colors font-medium text-sm h-full">
                <span>Categories</span>
                <ChevronDown size={14} />
            </button>

            {/* Dropdown */}
            <div className="absolute top-full left-0 w-64 bg-white rounded-md shadow-xl py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform origin-top-left z-50 border border-gray-100">
                
                {/* Parents with Children */}
                {groupedCategories.groups.map(group => (
                    <div key={group.parent.id} className="relative group/sub">
                        <Link 
                            to={`/search?categoryId=${group.parent.id}`}
                            className="flex items-center justify-between px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                        >
                            <span>{group.parent.name}</span>
                            <ChevronRight size={14} className="text-gray-400" />
                        </Link>
                        
                        {/* Submenu */}
                        <div className="absolute top-0 left-full w-56 bg-white rounded-md shadow-xl py-2 invisible group-hover/sub:visible opacity-0 group-hover/sub:opacity-100 transition-all duration-200 -ml-1 border border-gray-100">
                             {group.children.map(child => (
                                <Link 
                                    key={child.id}
                                    to={`/search?categoryId=${child.id}`}
                                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                                >
                                    {child.name}
                                </Link>
                             ))}
                        </div>
                    </div>
                ))}

                {/* Vertical Divider if both types exist */}
                {(groupedCategories.groups.length > 0 && groupedCategories.orphans.length > 0) && (
                    <div className="border-t border-gray-100 my-1"></div>
                )}

                {/* Orphan Categories */}
                {groupedCategories.orphans.map(cat => (
                    <Link 
                        key={cat.id}
                        to={`/search?categoryId=${cat.id}`}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600"
                    >
                        {cat.name}
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default CategoryMenu;
