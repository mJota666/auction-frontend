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

    useEffect(() => {
        if (id) {
            fetchProductData(id);
        }
    }, [id]);

    const fetchProductData = async (productId: string) => {
        setLoading(true);
        try {
            const [productData, bidsData] = await Promise.all([
                productService.getProduct(productId),
                productService.getBids(productId)
            ]);
            setProduct(productData);
            setBids(bidsData);
            
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

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Image Section */}
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                     {/* Simplified Carousel/Image Display */}
                     <img 
                        src={product.imageUrls?.[0] || 'https://via.placeholder.com/600'} 
                        alt={product.title} 
                        className="w-full h-96 object-contain bg-gray-100"
                     />
                     <div className="p-4 flex space-x-2 overflow-x-auto">
                        {product.imageUrls?.map((url, idx) => (
                            <img key={idx} src={url} alt={`Preview ${idx}`} className="w-20 h-20 object-cover rounded cursor-pointer border hover:border-indigo-500" />
                        ))}
                     </div>
                </div>

                {/* Info Section */}
                <div className="space-y-6">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">{product.title}</h1>
                         <div className="flex items-center mt-2 space-x-4">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${product.status === 'ACTIVE' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                {product.status}
                            </span>
                             <div className="flex items-center text-sm text-gray-500">
                                 <Clock className="w-4 h-4 mr-1" />
                                 Ends: {new Date(product.endAt).toLocaleString()}
                             </div>
                         </div>
                    </div>
                    
                    <div className="border-t border-b border-gray-200 py-4">
                        <div className="flex justify-between items-baseline">
                            <span className="text-sm text-gray-500">Current Price</span>
                            <span className="text-3xl font-bold text-indigo-600">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice || product.startPrice)}
                            </span>
                        </div>
                        <p className="text-sm text-gray-500 mt-1">Start Price: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.startPrice)}</p>
                    </div>

                    <div className="bg-gray-50 p-6 rounded-lg">
                        {product.status === 'ACTIVE' ? (
                            <form onSubmit={handlePlaceBid} className="space-y-4">
                                <div>
                                    <label htmlFor="bidAmount" className="block text-sm font-medium text-gray-700">Your Bid</label>
                                    <div className="mt-1 relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <span className="text-gray-500 sm:text-sm">₫</span>
                                        </div>
                                        <input
                                            type="number"
                                            name="bidAmount"
                                            id="bidAmount"
                                            className="focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md py-2 border"
                                            placeholder="0"
                                            value={bidAmount}
                                            onChange={(e) => setBidAmount(Number(e.target.value))}
                                            min={(product.currentPrice || product.startPrice) + product.stepPrice}
                                        />
                                    </div>
                                    <p className="mt-1 text-xs text-gray-500">
                                        Min bid: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format((product.currentPrice || product.startPrice) + product.stepPrice)}
                                    </p>
                                </div>
                                <button
                                    type="submit"
                                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                    Place Bid
                                </button>
                            </form>
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                This auction has ended.
                            </div>
                        )}
                    </div>

                    <div>
                        <h3 className="text-lg font-medium text-gray-900">Description</h3>
                        <div className="mt-2 text-gray-600 text-sm whitespace-pre-line">
                            {product.description}
                        </div>
                    </div>
                </div>
            </div>

            {/* Bid History */}
            <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Bid History</h2>
                <div className="bg-white shadow overflow-hidden rounded-md">
                    <ul className="divide-y divide-gray-200">
                        {bids.length > 0 ? (
                            bids.map((bid) => (
                                <li key={bid.id} className="px-6 py-4 flex items-center justify-between hover:bg-gray-50">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                                                <UserIcon className="h-5 w-5 text-indigo-600" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <p className="text-sm font-medium text-indigo-600">{bid.bidderName}</p>
                                            <p className="text-xs text-gray-500">{new Date(bid.bidTime).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-900">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bid.amount)}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-6 py-4 text-center text-gray-500">No bids yet. Be the first!</li>
                        )}
                    </ul>
                </div>
            </div>
            
            {/* Q&A Section Placeholder */}
             <div className="mt-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Questions & Answers</h2>
                 <div className="bg-gray-50 rounded-lg p-6 text-center text-gray-500">
                     <p>Q&A feature is coming soon.</p>
                 </div>
            </div>
        </div>
    );
};

export default ProductDetail;
