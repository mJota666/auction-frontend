import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, type Product, type Bid } from '../services/product';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Clock, User as UserIcon } from 'lucide-react';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated } = useAuth();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);

    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        if (id) {
            fetchProductData(id);
        }
    }, [id]);

    useEffect(() => {
        if (product?.categoryId) {
            fetchRelatedProducts(product.categoryId);
        }
    }, [product?.categoryId]);

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!product?.imageUrls) return;
        setCurrentImageIndex((prev) => (prev === product.imageUrls!.length - 1 ? 0 : prev + 1));
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!product?.imageUrls) return;
        setCurrentImageIndex((prev) => (prev === 0 ? product.imageUrls!.length - 1 : prev - 1));
    };

    const fetchProductData = async (productId: string) => {
        setLoading(true);
        try {
            const [productData, bidsData] = await Promise.all([
                productService.getProduct(productId),
                productService.getBids(productId)
            ]);
            setProduct(productData);
            setCurrentImageIndex(0); // Reset image index on new product load
            
            // Sort bids by amount desc to find highest
            let validBids: Bid[] = [];
            if (Array.isArray(bidsData)) {
                validBids = bidsData;
            } else if (bidsData && Array.isArray((bidsData as any).data)) {
                 // Handle wrapped response { data: [...] }
                 validBids = (bidsData as any).data;
            }

            const sortedBids = validBids.sort((a: Bid, b: Bid) => b.amount - a.amount);
            setBids(sortedBids);
            
            // Set default bid amount to current price + step or start price
            const currentPrice = productData.currentPrice || productData.startPrice;
            setBidAmount(currentPrice + (productData.stepPrice || 0));
        } catch (error) {
            console.error('Error fetching product details:', error);
            toast.error('Failed to load product details');
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (catId: number) => {
        try {
            // Fetch 5 related products
            const data = await productService.searchProducts({ categoryId: catId, size: 5 });
            const list = Array.isArray(data) ? data : data.content || [];
            // Filter out current product
            setRelatedProducts(list.filter((p: Product) => p.id !== Number(id)).slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch related products', error);
        }
    };

    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.info('Please login to place a bid');
            navigate('/login');
            return;
        }
        
        if (!product || !id) return;
        
        const currentPrice = product.currentPrice || product.startPrice;
        if (bidAmount <= currentPrice) {
            toast.error(`Bid must be higher than current price: ${currentPrice}`);
            return;
        }

        try {
            await productService.placeBid(Number(id), bidAmount);
            toast.success('Bid placed successfully!');
            fetchProductData(id); // Refresh data
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to place bid');
        }
    };

    const getRelativeTime = (isoDate: string) => {
        const date = new Date(isoDate);
        const now = new Date();
        const diffMs = date.getTime() - now.getTime();
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));

        if (diffMs < 0) return 'Ended';
        if (diffDays > 3) return date.toLocaleString(); // Absolute date if > 3 days
        if (diffDays > 0) return `${diffDays} days ${diffHours} hours left`;
        if (diffHours > 0) return `${diffHours} hours ${diffMinutes} minutes left`;
        return `${diffMinutes} minutes left`;
    };

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    const highestBidder = bids.length > 0 ? bids[0] : null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Section */}
                <div className="neu-extruded p-6">
                     <div className="neu-inset rounded-2xl overflow-hidden h-[400px] flex items-center justify-center bg-[#E0E5EC] relative group">
                         <img 
                            src={product.imageUrls?.[currentImageIndex] || 'https://via.placeholder.com/600'} 
                            alt={product.title} 
                            className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300"
                         />
                         
                         {/* Navigation Arrows */}
                         {product.imageUrls && product.imageUrls.length > 1 && (
                            <>
                                <button 
                                    onClick={prevImage}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full neu-extruded flex items-center justify-center text-[#6B7280] hover:text-[#3D4852] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 z-10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6"/></svg>
                                </button>
                                <button 
                                    onClick={nextImage}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full neu-extruded flex items-center justify-center text-[#6B7280] hover:text-[#3D4852] opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 active:scale-95 z-10"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                                </button>
                            </>
                         )}
                     </div>
                     <div className="mt-6 flex space-x-4 overflow-x-auto pb-2 scrollbar-hide">
                        {product.imageUrls?.map((url, idx) => (
                            <div 
                                key={idx} 
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-20 h-20 flex-shrink-0 neu-btn p-1 cursor-pointer transition-all ${currentImageIndex === idx ? 'border-[#6C63FF] border-2 ring-2 ring-[#6C63FF]/20' : 'border-2 border-transparent hover:border-[#6C63FF]'}`}
                            >
                                <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover rounded-lg" />
                            </div>
                        ))}
                     </div>
                     <div className="mt-4 pt-4 border-t border-gray-200/50">
                        <h3 className="text-lg font-bold text-[#3D4852] mb-4">Description</h3>
                        <div 
                            className="text-[#6B7280] text-sm font-medium leading-relaxed break-words [&_img]:max-w-full [&_img]:rounded-xl [&_img]:h-auto [&_img]:mx-auto [&_a]:text-[#6C63FF] [&_a]:underline [&_ul]:list-disc [&_ul]:pl-5 [&_ol]:list-decimal [&_ol]:pl-5 [&_h1]:text-xl [&_h1]:font-bold [&_h1]:text-[#3D4852] [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-[#3D4852] [&_*]:!bg-transparent space-y-2" 
                            dangerouslySetInnerHTML={{ __html: product.description }} 
                        />
                     </div>
                </div>

                {/* Info Section */}
                <div className="space-y-8">
                    <div>
                        <h1 className="text-4xl font-extrabold text-[#3D4852] tracking-tight leading-tight">{product.title}</h1>
                         <div className="flex items-center mt-4 space-x-4">
                            <div className={`px-4 py-2 rounded-full flex items-center gap-2 neu-extruded border ${product.status === 'ACTIVE' ? 'border-green-500/20' : 'border-red-500/20'}`}>
                                <span className={`relative flex h-3 w-3`}>
                                  <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${product.status === 'ACTIVE' ? 'bg-green-400' : 'bg-red-400'}`}></span>
                                  <span className={`relative inline-flex rounded-full h-3 w-3 ${product.status === 'ACTIVE' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                </span>
                                <span className={`text-xs font-extrabold tracking-wider uppercase ${product.status === 'ACTIVE' ? 'text-green-600' : 'text-red-600'}`}>
                                    {product.status}
                                </span>
                            </div>
                             <div className="flex items-center text-sm font-medium text-[#6B7280]">
                                 <Clock className="w-4 h-4 mr-2" />
                                 Ends: <span className="text-[#3D4852] ml-1">{getRelativeTime(product.endAt)}</span>
                             </div>
                         </div>
                    </div>
                    
                    <div className="batched-neu grid grid-cols-2 gap-6">
                         {/* Price Info */}
                        <div className="neu-extruded p-6 flex flex-col justify-center">
                            <span className="text-sm font-medium text-[#6B7280] uppercase tracking-wide mb-1">Current Price</span>
                            <span className="text-3xl font-extrabold text-[#6C63FF]">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice || product.startPrice)}
                            </span>
                            <span className="text-xs font-medium text-[#A0AEC0] mt-1">Start: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.startPrice)}</span>
                        </div>
                        
                        {/* Seller & Highest Bidder */}
                        <div className="neu-extruded p-6 space-y-3 text-sm font-medium">
                            <div className="flex flex-col">
                                <span className="text-[#6B7280] text-xs uppercase">Seller</span>
                                <span className="text-[#3D4852] font-bold">{product.sellerName || `User #${product.sellerId || '?'}`}</span>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#6B7280] text-xs uppercase">Highest Bidder</span>
                                <span className="text-[#6C63FF] font-bold">
                                    {highestBidder ? highestBidder.bidderName : 'No bids yet'}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="neu-extruded p-8">
                        {product.status === 'ACTIVE' ? (
                            <form onSubmit={handlePlaceBid} className="space-y-6">
                                <div>
                                    <label htmlFor="bidAmount" className="block text-sm font-bold text-[#3D4852] mb-2">
                                        Your Bid <span className="font-normal text-[#6B7280]">(Min: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((product.currentPrice || product.startPrice) + product.stepPrice)})</span>
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-[#6B7280] font-bold">₫</span>
                                        </div>
                                        <input
                                            type="text"
                                            name="bidAmount"
                                            id="bidAmount"
                                            className="block w-full pl-8 pr-4 py-4 neu-inset-deep rounded-xl text-[#3D4852] font-bold focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-2xl tracking-wider"
                                            placeholder="0"
                                            value={new Intl.NumberFormat('vi-VN').format(bidAmount)}
                                            onChange={(e) => {
                                                // Remove non-digit characters
                                                const rawValue = e.target.value.replace(/\D/g, '');
                                                setBidAmount(Number(rawValue));
                                            }}
                                        />
                                    </div>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full neu-btn neu-btn-primary py-4 rounded-xl text-lg font-bold tracking-wide uppercase shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all"
                                >
                                    Place Bid
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-4 text-[#6B7280] font-medium">
                                This auction has ended.
                            </div>
                        )}
                    </div>


                </div>
            </div>

            {/* Related Products */}
            {relatedProducts.length > 0 && (
                <div className="mt-20">
                    <h2 className="text-2xl font-extrabold text-[#3D4852] mb-8 flex items-center">
                        <span className="w-2 h-8 bg-[#6C63FF] rounded-full mr-3"></span>
                        Related Products
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                        {relatedProducts.map(p => (
                             <div key={p.id} onClick={() => navigate(`/products/${p.id}`)} className="cursor-pointer neu-extruded p-4 hover:neu-extruded-hover transition-all">
                                <div className="neu-inset rounded-xl p-2 mb-3 bg-[#E0E5EC]">
                                    <img src={p.imageUrls?.[0]} alt={p.title} className="w-full h-32 object-contain mix-blend-multiply" />
                                </div>
                                <h3 className="text-sm font-bold text-[#3D4852] truncate mb-1">{p.title}</h3>
                                <p className="text-[#6C63FF] font-extrabold text-sm">
                                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(p.currentPrice || p.startPrice)}
                                </p>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Bid History */}
            <div className="mt-16">
                <h2 className="text-2xl font-extrabold text-[#3D4852] mb-8 flex items-center">
                    <span className="w-2 h-8 bg-[#6C63FF] rounded-full mr-3"></span>
                    Bid History ({bids.length})
                </h2>
                <div className="neu-extruded overflow-hidden p-2 rounded-[24px]">
                    <ul className="divide-y divide-gray-200/50">
                        {bids.length > 0 ? (
                            bids.map((bid) => (
                                <li key={bid.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F0F4F8] rounded-xl transition-colors">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 neu-icon-well bg-[#E0E5EC] text-[#6C63FF]">
                                                <UserIcon className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-bold text-[#3D4852]">{bid.bidderName}</p>
                                            <p className="text-xs text-[#6B7280] font-medium">{new Date(bid.bidTime).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-extrabold text-[#6C63FF]">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bid.amount)}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-6 py-8 text-center text-[#6B7280] font-medium">No bids yet. Be the first!</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default ProductDetail;
