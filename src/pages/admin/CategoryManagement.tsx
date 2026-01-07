import React, { useEffect, useState } from 'react';
import { useAdmin } from '../../context/AdminContext';
import { Trash2, Plus, Edit2, Folder, CornerDownRight } from 'lucide-react';
import { useForm } from 'react-hook-form';
import ConfirmationModal from '../../components/ConfirmationModal';

const CategoryManagement: React.FC = () => {
    const { categories, loading, fetchCategories, addCategory, updateCategory, deleteCategory } = useAdmin();
    const { register, handleSubmit, reset, setValue, watch } = useForm<{ name: string, description: string, parentId?: number | string }>();
    const [editingId, setEditingId] = useState<number | null>(null);

    useEffect(() => {
        fetchCategories();
    }, []);

    const onSubmit = (data: { name: string, description: string, parentId?: number | string }) => {
        const payload = {
            ...data,
            parentId: data.parentId && data.parentId !== "" ? Number(data.parentId) : null
        };
        
        if (editingId) {
            updateCategory(editingId, payload);
            setEditingId(null);
        } else {
            addCategory(payload);
        }
        reset();
    };

    const handleEdit = (category: any) => {
        setEditingId(category.id);
        setValue('name', category.name);
        setValue('description', category.description);
        setValue('parentId', category.parentId || "");
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        reset();
    };

    // Filter potential parents: Only root categories, and (if editing) not the category itself.
    const potentialParents = categories.filter(c => !c.parentId && c.id !== editingId);

    // Organize for display: Roots + their Children
    // Assuming 'categories' is a flat list from API. If nested, logic simplifies.
    // Let's assume flat list based on 'admin.ts' implementation
    const rootCategories = categories.filter(c => !c.parentId);
    const getChildren = (parentId: number) => categories.filter(c => c.parentId === parentId);

    if (loading && categories.length === 0) return <div className="flex justify-center py-20">Loading...</div>;

    const [deleteModalOpen, setDeleteModalOpen] = React.useState(false);
    const [categoryToDelete, setCategoryToDelete] = React.useState<number | null>(null);

    const confirmDelete = (id: number) => {
        setCategoryToDelete(id);
        setDeleteModalOpen(true);
    };

    const handleDelete = () => {
        if (categoryToDelete) {
            deleteCategory(categoryToDelete);
            setCategoryToDelete(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-[#3D4852]">Category Management</h1>
                <nav className="flex space-x-4">
                    <a href="/admin" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Overview</a>
                    <a href="/admin/users" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Users</a>
                    <a href="/admin/products" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6B7280] hover:text-[#3D4852] hover:neu-extruded transition-all">Products</a>
                    <a href="/admin/categories" className="px-4 py-2 rounded-xl text-sm font-bold text-[#6C63FF] neu-inset">Categories</a>
                </nav>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form */}
                <div className="neu-extruded rounded-[2rem] p-8 h-fit bg-[#E0E5EC]">
                    <h2 className="text-xl font-bold text-[#3D4852] mb-6 flex items-center gap-2">
                        {editingId ? <><Edit2 className="w-5 h-5 text-[#6C63FF]" /> Edit Category</> : <><Plus className="w-5 h-5 text-[#6C63FF]" /> Add New Category</>}
                    </h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div>
                            <label className="block text-sm font-bold text-[#3D4852] mb-2 pl-2">Name</label>
                            <input {...register('name', { required: true })} className="w-full rounded-xl neu-inset border-none bg-transparent p-4 text-[#3D4852] focus:ring-0" placeholder="e.g. Electronics" />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#3D4852] mb-2 pl-2">Description</label>
                            <textarea {...register('description')} rows={3} className="w-full rounded-xl neu-inset border-none bg-transparent p-4 text-[#3D4852] focus:ring-0" placeholder="Optional description..." />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#3D4852] mb-2 pl-2">Parent Category (Optional)</label>
                            <div className="relative">
                                <select {...register('parentId')} className="w-full rounded-xl neu-inset border-none bg-transparent p-4 text-[#3D4852] focus:ring-0 appearance-none">
                                    <option value="">None (Root Category)</option>
                                    {potentialParents.map(parent => (
                                        <option key={parent.id} value={parent.id}>{parent.name}</option>
                                    ))}
                                </select>
                                <div className="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none">
                                    <Folder className="h-5 w-5 text-gray-500" />
                                </div>
                            </div>
                            <p className="text-xs text-gray-400 mt-2 pl-2">Select a parent to nest this category (1 level deep).</p>
                        </div>
                        
                        <div className="flex space-x-4 pt-2">
                           <button type="submit" className="flex-1 neu-btn-primary py-3 px-6 rounded-xl text-white font-bold flex justify-center items-center hover:scale-[0.98] transition-transform">
                                {editingId ? 'Update Category' : 'Create Category'}
                           </button>
                           {editingId && (
                               <button type="button" onClick={handleCancelEdit} className="neu-btn px-6 py-3 rounded-xl text-[#3D4852] font-bold hover:text-red-500">
                                   Cancel
                               </button>
                           )}
                        </div>
                    </form>
                </div>

                {/* List */}
                <div className="md:col-span-2 space-y-4">
                    {rootCategories.map(root => {
                        const children = getChildren(root.id);
                        return (
                            <div key={root.id} className="neu-flat rounded-[2rem] overflow-hidden bg-[#E0E5EC] p-2">
                                {/* Root Item */}
                                <div className="flex items-center justify-between p-4 pl-6 rounded-2xl hover:bg-white/40 transition-colors group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl neu-extruded flex items-center justify-center text-[#6C63FF]">
                                            <Folder className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-bold text-[#3D4852]">{root.name}</h3>
                                            <p className="text-sm text-gray-500">{root.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => handleEdit(root)} className="w-10 h-10 rounded-xl neu-btn text-indigo-500 hover:text-indigo-600 flex items-center justify-center">
                                            <Edit2 className="w-5 h-5" />
                                        </button>
                                        <button onClick={() => confirmDelete(root.id)} className="w-10 h-10 rounded-xl neu-btn text-red-500 hover:text-red-600 flex items-center justify-center">
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                {/* Children */}
                                {children.length > 0 && (
                                    <div className="mt-2 ml-10 space-y-2 border-l-2 border-[#D1D9E6] pl-6 pb-2">
                                        {children.map(child => (
                                            <div key={child.id} className="flex items-center justify-between p-3 rounded-xl hover:bg-white/40 transition-colors group">
                                                <div className="flex items-center gap-3">
                                                    <CornerDownRight className="w-5 h-5 text-gray-400" />
                                                    <div>
                                                        <h4 className="text-md font-semibold text-[#3D4852]">{child.name}</h4>
                                                        <p className="text-xs text-gray-500">{child.description}</p>
                                                    </div>
                                                </div>
                                                <div className="flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => handleEdit(child)} className="w-8 h-8 rounded-lg neu-btn text-indigo-500 hover:text-indigo-600 flex items-center justify-center">
                                                        <Edit2 className="w-4 h-4" />
                                                    </button>
                                                    <button onClick={() => confirmDelete(child.id)} className="w-8 h-8 rounded-lg neu-btn text-red-500 hover:text-red-600 flex items-center justify-center">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    
                    {categories.length === 0 && (
                        <div className="text-center py-20 text-gray-500 italic neu-inset rounded-[2rem]">
                            No categories found. Create one to get started.
                        </div>
                    )}
                </div>
            </div>

            <ConfirmationModal
                isOpen={deleteModalOpen}
                onClose={() => setDeleteModalOpen(false)}
                onConfirm={handleDelete}
                title="Delete Category"
                message="Are you sure you want to delete this category? Products in this category might be affected."
                confirmText="Delete"
                variant="danger"
            />
        </div>
    );
};

export default CategoryManagement;
