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
import { ImageUpload } from '../components/common/ImageUpload';

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
  autoExtendEnabled: z.boolean().default(false),
  allowUnratedBidder: z.boolean().default(true)
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
  const { register, control, handleSubmit, setValue, watch, formState: { errors, isSubmitting } } = useForm({
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
        autoExtendEnabled: false,
        allowUnratedBidder: true
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
        // Convert local datetime to ISO string (UTC)
        const endAtISO = new Date(data.endAt).toISOString();

        const payload = {
            ...data,
            endAt: endAtISO,
            imageUrls: [data.thumbnailUrl, ...data.imageUrls.map(img => img.url)], // Merge thumbnail + additional images
            buyNowPrice: data.buyNowPrice || undefined, // Ensure undefined if 0 or empty
            allow_unrated_bidder: data.allowUnratedBidder // Map to snake_case for Backend
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
    <div className="max-w-5xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-[#3D4852] tracking-tight mb-2">Create New Auction</h1>
        <p className="text-gray-500 font-medium">List your item and start receiving bids</p>
      </div>
      
      <form onSubmit={handleSubmit(onSubmit)} className="neu-extruded rounded-[2.5rem] p-8 md:p-12 space-y-10" noValidate>
        
        {/* Basic Info Section */}
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-[#3D4852] flex items-center gap-2 border-b border-gray-200/50 pb-2">
                <span className="w-1.5 h-6 bg-[#6C63FF] rounded-full"></span>
                Basic Information
            </h2>
            
            {/* Title */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-[#3D4852] ml-1">Product Title</label>
                <input 
                    {...register('title')} 
                    className={`w-full px-5 py-3.5 neu-inset rounded-xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all placeholder-gray-400 font-medium ${errors.title ? 'ring-2 ring-red-500/50' : ''}`}
                    placeholder="e.g. Vintage Camera Lens 50mm"
                />
                {errors.title && <p className="text-red-500 text-xs ml-1 font-semibold">{errors.title.message}</p>}
            </div>

            {/* Category */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-[#3D4852] ml-1">Category</label>
                <div className="relative">
                    <select 
                        {...register('categoryId')} 
                        className={`w-full px-5 py-3.5 neu-inset rounded-xl text-[#3D4852] focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all appearance-none cursor-pointer font-medium bg-transparent ${errors.categoryId ? 'ring-2 ring-red-500/50' : ''}`}
                    >
                        <option value="">Select a category...</option>
                        {groupedCategories.orphans.map(cat => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                        ))}
                        {groupedCategories.groups.map(group => (
                            <optgroup key={group.parent.id} label={group.parent.name}>
                                {group.children.map(child => (
                                    <option key={child.id} value={child.id}>{child.name}</option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"/></svg>
                    </div>
                </div>
                {errors.categoryId && <p className="text-red-500 text-xs ml-1 font-semibold">{errors.categoryId.message}</p>}
            </div>

            {/* Description */}
            <div className="space-y-2">
                <label className="text-sm font-bold text-[#3D4852] ml-1">Description</label>
                <div className="neu-inset rounded-xl p-2 bg-transparent">
                    <Controller
                        name="description"
                        control={control}
                        render={({ field }) => (
                        <ReactQuill 
                            theme="snow" 
                            value={field.value} 
                            onChange={field.onChange} 
                            className="h-64 mb-12"
                            modules={{
                                toolbar: [
                                    [{ 'header': [1, 2, false] }],
                                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                    [{'list': 'ordered'}, {'list': 'bullet'}],
                                    ['link'],
                                    ['clean']
                                ],
                            }}
                        />
                        )}
                    />
                </div>
                {errors.description && <p className="text-red-500 text-xs ml-1 font-semibold">{errors.description.message}</p>}
            </div>
        </div>

        {/* Pricing Section */}
        <div className="space-y-6 pt-4">
            <h2 className="text-xl font-bold text-[#3D4852] flex items-center gap-2 border-b border-gray-200/50 pb-2">
                <span className="w-1.5 h-6 bg-[#6C63FF] rounded-full"></span>
                Pricing & Timing
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#3D4852] ml-1">Start Price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</span>
                        <Controller
                            control={control}
                            name="startPrice"
                            render={({ field: { onChange, value } }) => (
                                <input
                                    type="text"
                                    className="w-full pl-8 pr-5 py-3.5 neu-inset rounded-xl text-[#3D4852] font-bold focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all text-right"
                                    placeholder="0"
                                    value={formatNumber(value as number | undefined)}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\./g, '').replace(/,/g, '');
                                        if (!isNaN(Number(rawValue))) onChange(Number(rawValue));
                                    }}
                                />
                            )}
                        />
                    </div>
                    {errors.startPrice && <p className="text-red-500 text-xs ml-1 font-semibold">{errors.startPrice.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#3D4852] ml-1">Step Price</label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</span>
                        <Controller
                            control={control}
                            name="stepPrice"
                            render={({ field: { onChange, value } }) => (
                                <input
                                    type="text"
                                    className="w-full pl-8 pr-5 py-3.5 neu-inset rounded-xl text-[#3D4852] font-bold focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all text-right"
                                    placeholder="0"
                                    value={formatNumber(value as number | undefined)}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\./g, '').replace(/,/g, '');
                                        if (!isNaN(Number(rawValue))) onChange(Number(rawValue));
                                    }}
                                />
                            )}
                        />
                    </div>
                    {errors.stepPrice && <p className="text-red-500 text-xs ml-1 font-semibold">{errors.stepPrice.message}</p>}
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#3D4852] ml-1">Buy Now Price <span className="text-gray-400 font-normal text-xs ml-1">(Optional)</span></label>
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold">₫</span>
                        <Controller
                            control={control}
                            name="buyNowPrice"
                            render={({ field: { onChange, value } }) => (
                                <input
                                    type="text"
                                    placeholder="Optional"
                                    className="w-full pl-8 pr-5 py-3.5 neu-inset rounded-xl text-[#3D4852] font-bold focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all text-right"
                                    value={formatNumber(value as number | undefined)}
                                    onChange={(e) => {
                                        const rawValue = e.target.value.replace(/\./g, '').replace(/,/g, '');
                                        if (!rawValue) onChange(undefined);
                                        else if (!isNaN(Number(rawValue))) onChange(Number(rawValue));
                                    }}
                                />
                            )}
                        />
                    </div>
                    {errors.buyNowPrice && <p className="text-red-500 text-xs ml-1 font-semibold">{errors.buyNowPrice.message}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#3D4852] ml-1">End Time</label>
                    <input 
                        type="datetime-local" 
                        {...register('endAt')} 
                        className="w-full px-5 py-3.5 neu-inset rounded-xl text-[#3D4852] font-medium focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/30 transition-all"
                    />
                    {errors.endAt && <p className="text-red-500 text-xs ml-1 font-semibold">{errors.endAt.message}</p>}
                </div>

                <div className="space-y-4 pt-8">
                    {/* Auto Extend Toggle */}
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => {
                        const current = watch('autoExtendEnabled');
                        setValue('autoExtendEnabled', !current);
                    }}>
                        <div className="relative flex items-center">
                            <input
                                id="autoExtendEnabled"
                                type="checkbox"
                                {...register('autoExtendEnabled')}
                                className="peer h-6 w-11 rounded-full bg-gray-200 border-none appearance-none cursor-pointer transition-colors checked:bg-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/30"
                            />
                            <div className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 peer-checked:translate-x-5"></div>
                        </div>
                        <div>
                            <label htmlFor="autoExtendEnabled" className="block text-sm font-bold text-[#3D4852] cursor-pointer group-hover:text-[#6C63FF] transition-colors">Auto-Extension</label>
                            <p className="text-xs text-gray-500 font-medium">Extend by 5 mins if bid placed near end.</p>
                        </div>
                    </div>

                    {/* Unrated Bidder Toggle */}
                    <div className="flex items-center gap-4 group cursor-pointer" onClick={() => {
                        const current = watch('allowUnratedBidder');
                        setValue('allowUnratedBidder', !current);
                    }}>
                        <div className="relative flex items-center">
                            <input
                                id="allowUnratedBidder"
                                type="checkbox"
                                {...register('allowUnratedBidder')}
                                className="peer h-6 w-11 rounded-full bg-gray-200 border-none appearance-none cursor-pointer transition-colors checked:bg-[#6C63FF] focus:ring-2 focus:ring-[#6C63FF]/30"
                            />
                            <div className="pointer-events-none absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-white shadow transform transition-transform duration-200 peer-checked:translate-x-5"></div>
                        </div>
                        <div>
                            <label htmlFor="allowUnratedBidder" className="block text-sm font-bold text-[#3D4852] cursor-pointer group-hover:text-[#6C63FF] transition-colors">Allow New Bidders</label>
                            <p className="text-xs text-gray-500 font-medium">Allow users with no rating history to bid.</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        {/* Media Section */}
        <div className="space-y-6 pt-4">
            <h2 className="text-xl font-bold text-[#3D4852] flex items-center gap-2 border-b border-gray-200/50 pb-2">
                <span className="w-1.5 h-6 bg-[#6C63FF] rounded-full"></span>
                Product Images
            </h2>

            <div className="space-y-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold text-[#3D4852] ml-1">Main Thumbnail</label>
                    <div className="neu-inset rounded-[1.5rem] p-4 bg-gray-50/50">
                        <Controller
                            control={control}
                            name="thumbnailUrl"
                            render={({ field: { onChange, value } }) => (
                                <ImageUpload
                                    value={value}
                                    onChange={onChange}
                                    placeholder="Upload Main Thumbnail"
                                    className="h-64"
                                />
                            )}
                        />
                    </div>
                    {errors.thumbnailUrl && <p className="text-red-500 text-xs ml-1 font-semibold">{errors.thumbnailUrl.message}</p>}
                </div>

                <div className="space-y-3">
                    <label className="text-sm font-bold text-[#3D4852] ml-1">Gallery Images <span className="text-gray-400 font-normal text-xs ml-1">(Min 3)</span></label>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {fields.map((field, index) => (
                            <div key={field.id} className="relative group animate-in fade-in zoom-in duration-300">
                                <Controller
                                    control={control}
                                    name={`imageUrls.${index}.url`}
                                    render={({ field: { onChange, value } }) => (
                                        <div className="h-40 w-full">
                                            <ImageUpload
                                                value={value}
                                                onChange={onChange}
                                                placeholder={`Image ${index + 1}`}
                                                className="h-full rounded-xl"
                                            />
                                        </div>
                                    )}
                                />
                                {index > 2 && (
                                    <button 
                                        type="button" 
                                        onClick={() => remove(index)} 
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-md hover:bg-red-600 transition-colors z-10"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" x2="6" y1="6" y2="18"/><line x1="6" x2="18" y1="6" y2="18"/></svg>
                                    </button>
                                )}
                            </div>
                        ))}
                        
                        <button
                            type="button"
                            onClick={() => append({ url: '' })}
                            className="h-40 neu-btn border-2 border-dashed border-[#6C63FF]/30 hover:border-[#6C63FF] rounded-xl flex flex-col items-center justify-center gap-2 text-[#6C63FF] transition-all hover:bg-[#6C63FF]/5"
                        >
                            <div className="p-2 bg-[#6C63FF]/10 rounded-full">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19"/><line x1="5" x2="19" y1="12" y2="12"/></svg>
                            </div>
                            <span className="text-sm font-bold">Add Image</span>
                        </button>
                    </div>
                    {errors.imageUrls && <p className="text-red-500 text-xs ml-1 font-semibold">{errors.imageUrls.message}</p>}
                </div>
            </div>
        </div>

        <div className="pt-8 border-t border-gray-200/50">
          <button 
            type="submit" 
            disabled={isSubmitting} 
            className="w-full neu-btn-primary py-4 rounded-xl text-white font-bold text-lg shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
          >
            {isSubmitting ? (
                <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Processing...
                </span>
            ) : 'Launch Auction'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateAuction;
