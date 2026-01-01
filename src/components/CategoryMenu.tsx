import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useProduct } from '../context/ProductContext';
import type { Category } from '../services/admin';

const CategoryMenu: React.FC = () => {
    const { state } = useProduct();
    const { categories } = state;
    // const [categories, setCategories] = useState<Category[]>([]);
    // const [loading, setLoading] = useState(true);

    // Categories are now fetched in ProductContext globally

    // Memoize grouped categories
    const groupedCategories = React.useMemo(() => {
        const groups: { parent: Category; children: Category[] }[] = [];
        const orphans: Category[] = [];

        // Simple check: do we have nested structure pre-defined?
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
            // Flattened list -> restructure
            // 1. Find roots
            const roots = categories.filter(c => !c.parentId);
            
            roots.forEach(root => {
                // Use loose equality in case of string/number mismatch
                const children = categories.filter(c => c.parentId == root.id); // eslint-disable-line eqeqeq
                if (children.length > 0) {
                    groups.push({ parent: root, children });
                } else {
                    orphans.push(root);
                }
            });
            
            // Collect any items that have a parentId but parent wasn't found in roots?
            // (Optional safety check, currently we only show roots + their children)
        }
        
        console.log('CategoryMenu Groups:', groups);
        return { groups, orphans };
    }, [categories]);



    return (
        <div className="relative group w-full sm:w-auto z-50">
             <button className="flex items-center justify-between w-full sm:w-48 px-4 py-3 neu-extruded rounded-2xl text-sm font-bold text-[#3D4852] hover:text-[#6C63FF] transition-all bg-[#E0E5EC]">
                <span>Categories</span>
                <ChevronDown size={14} />
            </button>

            {/* Dropdown */}
            <div className="absolute top-full mt-2 left-0 w-64 bg-[#E0E5EC] rounded-2xl shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] py-2 invisible group-hover:visible opacity-0 group-hover:opacity-100 transition-all duration-200 transform origin-top-left z-50 border border-white/20">
                
                {/* Parents with Children */}
                {groupedCategories.groups.map(group => (
                    <div key={group.parent.id} className="relative group/sub px-2">
                        <Link 
                            to={`/search?categoryId=${group.parent.id}`}
                            className="flex items-center justify-between px-4 py-3 text-sm font-medium text-[#3D4852] rounded-xl hover:neu-inset hover:text-[#6C63FF] transition-all"
                        >
                            <span>{group.parent.name}</span>
                            <ChevronRight size={14} className="text-[#6B7280]" />
                        </Link>
                        
                        {/* Submenu */}
                        <div className="absolute top-0 left-full ml-3 w-56 bg-[#E0E5EC] rounded-2xl shadow-[5px_5px_10px_#b8b9be,-5px_-5px_10px_#ffffff] py-2 invisible group-hover/sub:visible opacity-0 group-hover/sub:opacity-100 transition-all duration-200 border border-white/20 z-50 px-2">
                             {group.children.map(child => (
                                <Link 
                                    key={child.id}
                                    to={`/search?categoryId=${child.id}`}
                                    className="block px-4 py-3 text-sm font-medium text-[#3D4852] rounded-xl hover:neu-inset hover:text-[#6C63FF] transition-all"
                                >
                                    {child.name}
                                </Link>
                             ))}
                        </div>
                    </div>
                ))}

                {/* Vertical Divider if both types exist */}
                {(groupedCategories.groups.length > 0 && groupedCategories.orphans.length > 0) && (
                    <div className="border-t border-[#3D4852]/10 my-2 mx-4"></div>
                )}

                {/* Orphan Categories */}
                {groupedCategories.orphans.map(cat => (
                    <div key={cat.id} className="px-2">
                        <Link 
                            to={`/search?categoryId=${cat.id}`}
                            className="block px-4 py-3 text-sm font-medium text-[#3D4852] rounded-xl hover:neu-inset hover:text-[#6C63FF] transition-all"
                        >
                            {cat.name}
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CategoryMenu;
