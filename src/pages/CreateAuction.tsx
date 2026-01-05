import React from 'react'; // Removed unused useState
import { useForm, useFieldArray, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { productService } from '../services/product';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import type { Category } from '../services/admin';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css'; // Import styles

const createAuctionSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  startPrice: z.coerce.number().min(1000, 'Start price too low'),
  stepPrice: z.coerce.number().min(1000, 'Step price too low'),
  buyNowPrice: z.coerce.number().optional().refine(val => !val || val >= 1000, {
      message: 'Buy now price must be valid'
  }),
  endAt: z.string().refine((val) => new Date(val) > new Date(), {
      message: 'End date must be in the future'
  }),
  thumbnailUrl: z.string().url('Must be a valid URL'),
  imageUrls: z.array(
      z.object({
          url: z.string().url('Must be a valid URL')
      })
  ).min(3, 'At least 3 additional images are required'),
  categoryId: z.coerce.number().min(1, 'Category is required'),
  autoExtendEnabled: z.boolean().default(false)
}).refine((data) => {
    if (data.buyNowPrice && data.buyNowPrice <= data.startPrice) {
        return false;
    }
    return true;
}, {
    message: "Buy now price must be greater than start price",
    path: ["buyNowPrice"]
});

type CreateAuctionInputs = z.infer<typeof createAuctionSchema>;

const CreateAuction: React.FC = () => {
  const navigate = useNavigate();
  // Removed explicit generic <CreateAuctionInputs> to let Zod resolver infer correct types for coerced fields
  const { register, control, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(createAuctionSchema),
    defaultValues: {
        title: '',
        description: '',
        thumbnailUrl: '',
        imageUrls: [{ url: '' }, { url: '' }, { url: '' }],
        startPrice: 0,
        stepPrice: 0,
        buyNowPrice: undefined, // Explicitly undefined
        categoryId: 0,
        endAt: '', 
        autoExtendEnabled: false
    }
  });

  const { fields, append, remove } = useFieldArray({
      control,
      name: "imageUrls"
  });

  // State for raw categories and grouped structure
  const [categories, setCategories] = React.useState<Category[]>([]);
  
  // Memoize grouped categories to avoid recalculation on every render
  const groupedCategories = React.useMemo(() => {
      const groups: { parent: Category; children: Category[] }[] = [];
      const orphans: Category[] = [];

      // Check if the API returns an already nested structure
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
          // Flattened list strategy
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

  React.useEffect(() => {
      const fetchCategories = async () => {
          try {
              const data = await productService.getCategories();
              console.log('Fetched Categories:', data);
              if (data.data && data.data.length > 0) console.log('First Category Sample:', data.data[0]);
              setCategories(data.data && Array.isArray(data.data) ? data.data : []);
          } catch (error) {
              console.error("Failed to fetch categories", error);
          }
      };
      fetchCategories();
  }, []);

  const onSubmit = async (data: CreateAuctionInputs) => {
    try {
        const payload = {
            ...data,
            ...data,
            imageUrls: [data.thumbnailUrl, ...data.imageUrls.map(img => img.url)], // Merge thumbnail + additional images
            buyNowPrice: data.buyNowPrice || undefined // Ensure undefined if 0 or empty
        };
        // Remove thumbnailUrl from payload as backend expects just imageUrls
        delete (payload as any).thumbnailUrl;

        await productService.createProduct(payload);
        toast.success('Auction created successfully!');
        navigate('/');
    } catch (error: any) {
        console.error(error);
        toast.error('Failed to create auction');
    }
  };

  const formatNumber = (value: number | undefined) => {
      if (!value) return '';
      return new Intl.NumberFormat('vi-VN').format(value);
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8 text-gray-900">Create New Auction</h1>
      
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 bg-white p-8 rounded-lg shadow">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-gray-700">Title</label>
          <input {...register('title')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
          {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
        </div>

        {/* Category */}
        <div>
           <label className="block text-sm font-medium text-gray-700">Category</label>
           <select {...register('categoryId')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2 bg-white">
                <option value="">Select a category</option>
                
                {/* Render Standalone Categories */}
                {groupedCategories.orphans.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}

                {/* Render Grouped Categories */}
                {groupedCategories.groups.map(group => (
                    <optgroup key={group.parent.id} label={group.parent.name}>
                        {group.children.map(child => (
                            <option key={child.id} value={child.id}>
                                {child.name}
                            </option>
                        ))}
                    </optgroup>
                ))}
           </select>
           {errors.categoryId && <p className="text-red-500 text-xs mt-1">{errors.categoryId.message}</p>}
        </div>

        {/* Description - WYSIWYG */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <ReactQuill 
                theme="snow" 
                value={field.value} 
                onChange={field.onChange} 
                className="h-64 mb-12" // Add margin bottom for toolbar
              />
            )}
          />
          {errors.description && <p className="text-red-500 text-xs mt-1">{errors.description.message}</p>}
        </div>

        {/* Prices Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Start Price</label>
              <Controller
                control={control}
                name="startPrice"
                render={({ field: { onChange, value } }) => (
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={formatNumber(value as number | undefined)}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\./g, '').replace(/,/g, '');
                            if (!isNaN(Number(rawValue))) {
                                onChange(Number(rawValue));
                            }
                        }}
                    />
                )}
              />
              {errors.startPrice && <p className="text-red-500 text-xs mt-1">{errors.startPrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Step Price</label>
               <Controller
                control={control}
                name="stepPrice"
                render={({ field: { onChange, value } }) => (
                    <input
                        type="text"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={formatNumber(value as number | undefined)}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\./g, '').replace(/,/g, '');
                            if (!isNaN(Number(rawValue))) {
                                onChange(Number(rawValue));
                            }
                        }}
                    />
                )}
              />
              {errors.stepPrice && <p className="text-red-500 text-xs mt-1">{errors.stepPrice.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Buy Now Price (Optional)</label>
               <Controller
                control={control}
                name="buyNowPrice"
                render={({ field: { onChange, value } }) => (
                    <input
                        type="text"
                        placeholder="Optional"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                        value={formatNumber(value as number | undefined)}
                        onChange={(e) => {
                            const rawValue = e.target.value.replace(/\./g, '').replace(/,/g, '');
                            if (!rawValue) onChange(undefined);
                            else if (!isNaN(Number(rawValue))) {
                                onChange(Number(rawValue));
                            }
                        }}
                    />
                )}
              />
              {errors.buyNowPrice && <p className="text-red-500 text-xs mt-1">{errors.buyNowPrice.message}</p>}
            </div>
        </div>

        {/* Images Section */}
        <div className="space-y-6 border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900">Product Images</h3>
            
            {/* Main Image (Thumbnail) */}
            <div>
                <label className="block text-sm font-medium text-gray-700">Main Image (Thumbnail)</label>
                <input 
                    {...register('thumbnailUrl')} 
                    placeholder="Enter URL for the main display image"
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" 
                />
                {errors.thumbnailUrl && <p className="text-red-500 text-xs mt-1">{errors.thumbnailUrl.message}</p>}
                {/* Preview Thumbnail */}
                {/* We won't implement preview logic complexly here, but just input for now. */}
            </div>

            {/* Additional Images */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Additional Images (Min 3)</label>
                <div className="space-y-2">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-2">
                            <input
                                {...register(`imageUrls.${index}.url`)}
                                placeholder={`Additional Image URL ${index + 1}`}
                                className="flex-1 block w-full rounded-md border-gray-300 shadow-sm border p-2"
                            />
                            {index > 2 && (
                                <button type="button" onClick={() => remove(index)} className="text-red-600 hover:text-red-800">
                                    Remove
                                </button>
                            )}
                        </div>
                    ))}
                </div>
                <button
                    type="button"
                    onClick={() => append({ url: '' })}
                    className="mt-2 text-sm text-indigo-600 hover:text-indigo-800"
                >
                    + Add another image
                </button>
                {errors.imageUrls && <p className="text-red-500 text-xs mt-1">{errors.imageUrls.message}</p>}
                {errors.imageUrls?.root && <p className="text-red-500 text-xs mt-1">{errors.imageUrls.root.message}</p>}
            </div>
        </div>

        {/* End Date & Auto Extend */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
             <div>
               <label className="block text-sm font-medium text-gray-700">End Date</label>
               <input type="datetime-local" {...register('endAt')} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm border p-2" />
               {errors.endAt && <p className="text-red-500 text-xs mt-1">{errors.endAt.message}</p>}
            </div>
            
            <div className="flex items-center pb-3">
                <input
                    id="autoExtendEnabled"
                    type="checkbox"
                    {...register('autoExtendEnabled')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                />
                <label htmlFor="autoExtendEnabled" className="ml-2 block text-sm text-gray-900">
                    Auto-extend auction if bid placed in last 5 mins?
                </label>
            </div>
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
