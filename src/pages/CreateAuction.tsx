import React from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { productService } from '../services/product';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';

const createAuctionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  startPrice: z.coerce.number().min(1000, 'Start price too low'),
  stepPrice: z.coerce.number().min(1000, 'Step price too low'),
  endAt: z.string().refine((val) => new Date(val) > new Date(), {
      message: 'End date must be in the future'
  }),
  imageUrls: z.string().url('Must be a valid URL'), // Simplified for now, just ONE url
  categoryId: z.coerce.number().min(1, 'Category is required')
});

type CreateAuctionInputs = z.infer<typeof createAuctionSchema>;

const CreateAuction: React.FC = () => {
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<CreateAuctionInputs>({
    resolver: zodResolver(createAuctionSchema)
  });

  const onSubmit = async (data: CreateAuctionInputs) => {
    try {
        await productService.createProduct({
            ...data,
            imageUrls: [data.imageUrls] // Convert string to array
        });
        toast.success('Auction created successfully!');
        navigate('/');
    } catch (error: any) {
        console.error(error);
        toast.error('Failed to create auction');
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Create New Auction</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow">
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input {...register('title')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea {...register('description')} rows={4} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Price</label>
              <input type="number" {...register('startPrice')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
              {errors.startPrice && <p className="text-red-500 text-xs mt-1">{errors.startPrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Step Price</label>
              <input type="number" {...register('stepPrice')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
              {errors.stepPrice && <p className="text-red-500 text-xs mt-1">{errors.stepPrice.message}</p>}
            </div>
        </div>

        <div>
           <label className="block text-sm font-medium text-gray-700">Category ID</label>
           <input type="number" {...register('categoryId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
           {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
        </div>

         <div>
           <label className="block text-sm font-medium text-gray-700">End Date</label>
           <input type="datetime-local" {...register('endAt')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
           {errors.endAt && <p className="text-red-500 text-xs mt-1">{errors.endAt.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Image URL</label>
          <input {...register('imageUrls')} placeholder="https://example.com/image.jpg" className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
          {errors.imageUrls && <p className="text-red-500 text-xs mt-1">{errors.imageUrls.message}</p>}
        </div>

        <div className="pt-4">
          <button type="submit" disabled={isSubmitting} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            {isSubmitting ? 'Creating...' : 'Create Auction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAuction;
