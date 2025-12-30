import React, { useEffect, useState } from 'react';
import { adminService, type Category } from '../../services/admin';
import { toast } from 'react-toastify';
import { Trash2, Plus } from 'lucide-react';
import { useForm } from 'react-hook-form';

const CategoryManagement: React.FC = () => {
    const [categories, setCategories] = useState<Category[]>([]);
    const [loading, setLoading] = useState(true);
    const { register, handleSubmit, reset } = useForm<{ name: string, description: string }>();

    useEffect(() => {
        fetchCategories();
    }, []);

    const fetchCategories = async () => {
        try {
            const data = await adminService.getCategories();
            setCategories(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch categories', error);
        } finally {
            setLoading(false);
        }
    };

    const onSubmit = async (data: { name: string, description: string }) => {
        try {
            await adminService.createCategory(data);
            toast.success('Category created');
            reset();
            fetchCategories();
        } catch (error) {
            toast.error('Failed to create category');
        }
    };

    const handleDelete = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this category?')) return;
        try {
            await adminService.deleteCategory(id);
            toast.success('Category deleted');
            fetchCategories();
        } catch (error) {
            toast.error('Failed to delete category');
        }
    };

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Category Management</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Form */}
                <div className="bg-white p-6 rounded-lg shadow h-fit">
                    <h2 className="text-lg font-medium text-gray-900 mb-4">Add New Category</h2>
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Name</label>
                            <input {...register('name', { required: true })} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Description</label>
                            <textarea {...register('description')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
                        </div>
                        <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700">
                            <Plus className="w-4 h-4 mr-2" /> Add Category
                        </button>
                    </form>
                </div>

                {/* List */}
                <div className="md:col-span-2 bg-white shadow overflow-hidden sm:rounded-md">
                     <ul className="divide-y divide-gray-200">
                        {categories.map((category) => (
                            <li key={category.id} className="px-4 py-4 flex items-center justify-between hover:bg-gray-50">
                                <div>
                                    <p className="text-lg font-medium text-indigo-600">{category.name}</p>
                                    <p className="text-sm text-gray-500">{category.description}</p>
                                </div>
                                <button onClick={() => handleDelete(category.id)} className="text-red-600 hover:text-red-800">
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default CategoryManagement;
