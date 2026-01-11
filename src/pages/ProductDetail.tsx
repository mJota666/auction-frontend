import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productService, type Product, type Bid, type Question } from '../services/product';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import { Clock, User as UserIcon, Star, MessageCircle, Send, Heart, XCircle, Edit, Ban, ChevronDown, ChevronUp } from 'lucide-react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';

import ConfirmationModal from '../components/ConfirmationModal';

const ProductDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const { isAuthenticated, user, favorites, toggleFavorite } = useAuth();
    const navigate = useNavigate();
    
    const [product, setProduct] = useState<Product | null>(null);
    const [bids, setBids] = useState<Bid[]>([]);
    const [questions, setQuestions] = useState<Question[]>([]);
    const [bidAmount, setBidAmount] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    // Slideshow state
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [isTransitioning, setIsTransitioning] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Description collapse state
    const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
    const [isDescriptionOverflowing, setIsDescriptionOverflowing] = useState(false);
    const descriptionRef = React.useRef<HTMLDivElement>(null);

    const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
    const [questionText, setQuestionText] = useState('');
    const [submittingQuestion, setSubmittingQuestion] = useState(false);
    
    // Seller Features State
    const [showAppendModal, setShowAppendModal] = useState(false);
    const [appendContent, setAppendContent] = useState('');
    const [replyText, setReplyText] = useState<{ [key: number]: string }>({}); // Map questionId -> reply
    const [submittingReply, setSubmittingReply] = useState<{ [key: number]: boolean }>({});

    // Bidding State
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    
    // Deny Bidder State
    const [showDenyModal, setShowDenyModal] = useState(false);
    const [bidderToDeny, setBidderToDeny] = useState<number | null>(null);

    const isSeller = user && product && Number(user.id) === Number(product.sellerId);
    
    const isFavorite = product ? favorites.includes(product.id) : false;

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!isAuthenticated) {
            toast.info('Login to add to favorites');
            navigate('/login');
            return;
        }
        if (!product) return;
        
        try {
            await toggleFavorite(product.id);
            toast.success(isFavorite ? 'Removed from Watchlist' : 'Added to Watchlist');
        } catch (err: any) {
            toast.error(err.response?.data?.message || 'Action failed');
        }
    };

    useEffect(() => {
        if (id) {
            setCurrentImageIndex(0);
            fetchProductData(id);

            // Real-time Updates via SSE
            // Use relative path to leverage Vite proxy (or same-origin in production)
            const eventSource = new EventSource(`/api/v1/streams/products/${id}`);
            
            eventSource.addEventListener('product-update', (event) => {
                const data = JSON.parse(event.data);
                console.log('Real-time update received:', data);
                // Refresh data to ensure price and bid history are in sync
                fetchProductData(id);
            });

            eventSource.onerror = (err) => {
                console.error('SSE connection error:', err);
                eventSource.close();
            };

            return () => {
                eventSource.close();
            };
        }
    }, [id]);

    useEffect(() => {
        if (product?.categoryId) {
            fetchRelatedProducts(product.categoryId);
        }
    }, [product?.categoryId]);

    useEffect(() => {
        if (descriptionRef.current) {
            setIsDescriptionOverflowing(descriptionRef.current.scrollHeight > 100);
        }
    }, [product?.description]);



    const handleImageChange = (newIndex: number) => {
        if (isTransitioning || newIndex === currentImageIndex) return;
        
        setIsTransitioning(true);
        // Wait for fade out
        setTimeout(() => {
            setCurrentImageIndex(newIndex);
            // Small delay to allow render before fading back in
            requestAnimationFrame(() => {
                 setIsTransitioning(false);
            });
        }, 300);
    };

    const nextImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!product?.imageUrls) return;
        const newIndex = (currentImageIndex + 1) % product.imageUrls.length;
        handleImageChange(newIndex);
    };

    const prevImage = (e?: React.MouseEvent) => {
        e?.stopPropagation();
        if (!product?.imageUrls) return;
        const newIndex = (currentImageIndex - 1 + product.imageUrls.length) % product.imageUrls.length;
        handleImageChange(newIndex);
    };

    // Auto-play slideshow
    useEffect(() => {
        if (!product?.imageUrls || product.imageUrls.length <= 1 || isHovering) return;

        const interval = setInterval(() => {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % (product.imageUrls?.length || 1));
        }, 5000);

        return () => clearInterval(interval);
    }, [product?.id, product?.imageUrls?.length, isHovering]);

    const fetchProductData = async (productId: string) => {
        setLoading(true);
        try {
            const [productData, bidsData, qaData] = await Promise.all([
                productService.getProduct(productId),
                productService.getBids(productId),
                productService.getProductQA(productId)
            ]);
            setProduct(productData);
            
            if (Array.isArray(qaData)) {
                setQuestions(qaData);
            } else if (qaData && Array.isArray((qaData as any).data)) {
                 setQuestions((qaData as any).data);
            } else if (qaData && Array.isArray((qaData as any).content)) {
                 setQuestions((qaData as any).content);
            }

            // Moved reset image index to useEffect on ID change
            
            let validBids: Bid[] = [];
            
            console.log('--- RAW BIDS DATA ---', bidsData);

            if (Array.isArray(bidsData)) {
                validBids = bidsData;
            } else if (bidsData && Array.isArray((bidsData as any).data)) {
                 validBids = (bidsData as any).data;
            } else if (bidsData && Array.isArray((bidsData as any).content)) {
                 validBids = (bidsData as any).content;
            }

            const sortedBids = validBids.sort((a: Bid, b: Bid) => b.amount - a.amount);
            
            if (sortedBids.length > 0) {
                console.log('--- CHECK BIDDER ID ---');
                console.log('First Bid Object:', JSON.stringify(sortedBids[0], null, 2));
            }

            setBids(sortedBids);
            
            const currentPrice = productData.currentPrice || productData.startPrice;
            setBidAmount(currentPrice + (productData.stepPrice || 0));
        } catch (error) {
            console.error('Error fetching product details:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchRelatedProducts = async (catId: number) => {
        try {
            const data = await productService.searchProducts({ categoryId: catId, size: 5 });
            const list = Array.isArray(data) ? data : data.content || [];
            setRelatedProducts(list.filter((p: Product) => p.id !== Number(id)).slice(0, 5));
        } catch (error) {
            console.error('Failed to fetch related products', error);
        }
    };

    // --- Seller Actions ---

    const handleAppendDescription = async () => {
        if (!id || !appendContent.trim()) return;
        try {
            const newDesc = appendContent;
            await productService.appendDescription(id, newDesc);
            toast.success('Description updated successfully');
            setShowAppendModal(false);
            setAppendContent('');
            fetchProductData(id);
        } catch (error: any) {
            toast.error('Failed to append description');
        }
    };

    const handleDenyBidder = (bidderId: number) => {
        if (!id) return;
        setBidderToDeny(bidderId);
        setShowDenyModal(true);
    };

    const confirmDenyBidder = async () => {
        if (!id || !bidderToDeny) return;
        
        try {
            await productService.denyBidder(id, bidderToDeny);
            toast.success('Bidder denied successfully');
            fetchProductData(id);
        } catch (error: any) {
             console.error('Deny Bidder Error:', error);
             toast.error(error.response?.data?.message || 'Failed to deny bidder');
        } finally {
            setShowDenyModal(false);
            setBidderToDeny(null);
        }
    };

    const handleAnswerQuestion = async (questionId: number) => {
        const answer = replyText[questionId];
        if (!answer?.trim()) return;

        setSubmittingReply(prev => ({ ...prev, [questionId]: true }));
        try {
            await productService.answerQuestion(questionId, answer);
            toast.success('Answer sent');
            setReplyText(prev => ({ ...prev, [questionId]: '' }));
             // Refresh Q&A
             const qaData = await productService.getProductQA(id!);
             if (Array.isArray(qaData)) {
                setQuestions(qaData);
            } else if (qaData && Array.isArray((qaData as any).data)) {
                 setQuestions((qaData as any).data);
            } else if (qaData && Array.isArray((qaData as any).content)) {
                 setQuestions((qaData as any).content);
            }
        } catch (error) {
            toast.error('Failed to send answer');
        } finally {
            setSubmittingReply(prev => ({ ...prev, [questionId]: false }));
        }
    };


    // --- Buyer Actions ---
    const handleAskQuestion = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated) {
            toast.info('Please login to ask a question');
            navigate('/login');
            return;
        }

        if (!questionText.trim()) {
            toast.warning('Please enter a question');
            return;
        }

        if (!id) return;

        setSubmittingQuestion(true);
        try {
            await productService.askQuestion(id, questionText);
            toast.success('Question sent successfully!');
            setQuestionText('');
            // Refresh Q&A
            const qaData = await productService.getProductQA(id);
             if (Array.isArray(qaData)) {
                setQuestions(qaData);
            } else if (qaData && Array.isArray((qaData as any).data)) {
                 setQuestions((qaData as any).data);
            } else if (qaData && Array.isArray((qaData as any).content)) {
                 setQuestions((qaData as any).content);
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to send question');
        } finally {
            setSubmittingQuestion(false);
        }
    };

    const getBidStatus = () => {
        if (!user) return { allowed: false, reason: 'Please login to bid.' };
        if (isSeller) return { allowed: false, reason: 'You cannot bid on your own product.' };

        const pos = user.ratingPositive || 0;
        const neg = user.ratingNegative || 0;
        const totalRating = pos + neg;

        if (totalRating > 0) {
            const ratingRatio = pos / totalRating;
            if (ratingRatio < 0.8) {
                return { allowed: false, reason: 'Your rating is too low (< 80%) to participate.' };
            }
        } else {
             // Check both camelCase and snake_case properties
             const isAllowed = product?.allowUnratedBidder ?? (product as any)?.allow_unrated_bidder;
             // Only block if explicitly FALSE. If undefined/null, default to TRUE (allow).
             if (isAllowed === false) {
                 return { allowed: false, reason: 'This seller does not allow unrated accounts.' };
             }
        }
        
        return { allowed: true, reason: '' };
    };

    const bidStatus = getBidStatus();

    const handlePlaceBid = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!isAuthenticated || !user) {
            toast.info('Please login to place a bid');
            navigate('/login');
            return;
        }
        
        if (!product || !id) return;
        
        if (!bidStatus.allowed) {
            toast.error(bidStatus.reason);
            return;
        }

        const currentPrice = product.currentPrice || product.startPrice;
        const minBid = currentPrice + (product.stepPrice || 0);

        if (bidAmount < minBid) {
            toast.error(`Bid must be at least ${new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(minBid)}`);
            return;
        }

        setShowConfirmModal(true);
    };

    const confirmBid = async () => {
        setShowConfirmModal(false);
        if (!id) return;

        try {
            await productService.placeBid(Number(id), bidAmount);
            toast.success('Bid placed successfully!');
            fetchProductData(id);
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
        if (diffDays > 3) return date.toLocaleString();
        if (diffDays > 0) return `${diffDays} days ${diffHours} hours left`;
        if (diffHours > 0) return `${diffHours} hours ${diffMinutes} minutes left`;
        return `${diffMinutes} minutes left`;
    };
    
    const getSellerRating = () => {
        if (!product) return 5.0;
        const pos = product.sellerRatingPositive || 0;
        const neg = product.sellerRatingNegative || 0;
        if (pos + neg === 0) return 5.0;
        return ((pos / (pos + neg)) * 5).toFixed(1);
    };

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;
    if (!product) return <div className="text-center py-20">Product not found</div>;

    const highestBidder = bids.length > 0 ? bids[0] : null;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                {/* Image Section */}
                <div className="neu-extruded p-6">
                     <div 
                        onMouseEnter={() => setIsHovering(true)}
                        onMouseLeave={() => setIsHovering(false)}
                        className="neu-inset rounded-2xl overflow-hidden h-[400px] flex items-center justify-center bg-[#E0E5EC] relative group"
                     >
                         <img 
                            src={product.imageUrls?.[currentImageIndex] || 'https://placehold.co/600x400?text=No+Image'} 
                            alt={product.title} 
                            className="w-full h-full object-contain mix-blend-multiply transition-opacity duration-300"
                         />
                         
                         <button
                            onClick={handleToggleFavorite}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:scale-110 active:scale-95 transition-all outline-none z-20"
                            title={isFavorite ? "Remove from Watchlist" : "Add to Watchlist"}
                         >
                            <Heart 
                                className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-500'}`} 
                            />
                         </button>
                         
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
                     <div className="mt-4 pt-4 border-t border-gray-200/50 relative">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="text-lg font-bold text-[#3D4852]">Description</h3>
                            {isSeller && (
                                <button
                                    onClick={() => setShowAppendModal(true)}
                                    className="flex items-center text-xs font-bold text-[#6C63FF] hover:underline"
                                >
                                    <Edit className="w-4 h-4 mr-1" /> Append Info
                                </button>
                            )}
                        </div>
                        <div 
                             ref={descriptionRef}
                             className={`text-[#6B7280] text-sm font-medium leading-relaxed break-words [&_img]:max-w-full [&_img]:rounded-xl [&_img]:h-auto [&_img]:mx-auto [&_*]:!bg-transparent relative transition-all duration-500 ease-in-out ${isDescriptionExpanded ? '' : 'max-h-[100px] overflow-hidden'}`} 
                             dangerouslySetInnerHTML={{ __html: product.description }} 
                        />
                         {(!isDescriptionExpanded && isDescriptionOverflowing) && (
                            <div className="absolute bottom-12 left-0 w-full h-24 bg-gradient-to-t from-[#E0E5EC] to-transparent pointer-events-none" />
                         )}
                         {isDescriptionOverflowing && (
                            <button 
                                onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
                                className="mt-4 text-[#6C63FF] text-sm font-bold hover:underline flex items-center justify-center w-full gap-1 z-10 relative"
                            >
                                {isDescriptionExpanded ? 'Show Less' : 'Read More'}
                                {isDescriptionExpanded ? <ChevronUp className="w-4 h-4"/> : <ChevronDown className="w-4 h-4"/>}
                            </button>
                         )}
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
                        <div className="neu-extruded p-6 flex flex-col justify-center">
                            <span className="text-sm font-medium text-[#6B7280] uppercase tracking-wide mb-1">Current Price</span>
                            <span className="text-3xl font-extrabold text-[#6C63FF]">
                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.currentPrice || product.startPrice)}
                            </span>
                            <span className="text-xs font-medium text-[#A0AEC0] mt-1">Start: {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(product.startPrice)}</span>
                        </div>
                        
                        <div className="neu-extruded p-6 space-y-3 text-sm font-medium">
                            <div className="flex flex-col">
                                <span className="text-[#6B7280] text-xs uppercase">Seller</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#3D4852] font-bold">{product.sellerName || `User #${product.sellerId || '?'}`}</span>
                                    <div className="flex items-center text-xs text-yellow-500 bg-yellow-100 px-1.5 py-0.5 rounded-md">
                                        <Star className="w-3 h-3 fill-current mr-0.5" />
                                        <span className="font-bold">{getSellerRating()}</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[#6B7280] text-xs uppercase">Highest Bidder</span>
                                <div className="flex items-center gap-2">
                                    <span className="text-[#6C63FF] font-bold">
                                        {highestBidder ? highestBidder.bidderName : (product.currentWinnerName || 'No bids yet')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="neu-extruded p-8">
                        {product.status === 'ACTIVE' ? (
                            isSeller ? (
                                <div className="text-center py-4 text-[#6B7280] font-medium">
                                    You are the seller of this product. You cannot bid.
                                </div>
                            ) : (
                                <form onSubmit={handlePlaceBid} className="space-y-6" noValidate>
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
                                                disabled={!bidStatus.allowed}
                                                className={`block w-full pl-8 pr-4 py-4 neu-inset-deep rounded-xl text-[#3D4852] font-bold focus:outline-none focus:ring-2 focus:ring-[#6C63FF] transition-all text-2xl tracking-wider ${!bidStatus.allowed ? 'opacity-50 cursor-not-allowed bg-gray-100' : ''}`}
                                                placeholder="0"
                                                value={new Intl.NumberFormat('vi-VN').format(bidAmount)}
                                                onChange={(e) => {
                                                    const rawValue = e.target.value.replace(/\D/g, '');
                                                    setBidAmount(Number(rawValue));
                                                }}
                                            />
                                        </div>
                                        {!bidStatus.allowed && (
                                            <p className="text-red-500 text-sm font-semibold flex items-center mt-2">
                                                <span className="mr-1">⚠</span> {bidStatus.reason}
                                            </p>
                                        )}
                                    </div>
                                    <button
                                        type="submit"
                                        disabled={!bidStatus.allowed}
                                        className={`w-full neu-btn neu-btn-primary py-4 rounded-xl text-lg font-bold tracking-wide uppercase shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all ${!bidStatus.allowed ? 'opacity-50 cursor-not-allowed hover:none hover:translate-y-0 filter grayscale' : ''}`}
                                    >
                                        Place Bid
                                    </button>
                                </form>
                            )
                        ) : (
                            <div className="text-center py-4 text-[#6B7280] font-medium">
                                This auction has ended.
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Questions & Answers */}
            <div className="mt-16">
                 <h2 className="text-2xl font-extrabold text-[#3D4852] mb-8 flex items-center">
                    <span className="w-2 h-8 bg-[#6C63FF] rounded-full mr-3"></span>
                    Questions & Answers
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Ask Question Form */}
                    <div className="lg:col-span-1">
                        <div className="neu-extruded p-6 sticky top-24">
                            <h3 className="text-lg font-bold text-[#3D4852] mb-4 flex items-center">
                                <MessageCircle className="w-5 h-5 mr-2 text-[#6C63FF]" />
                                Ask a Question
                            </h3>
                            
                            {isSeller ? (
                                <div className="neu-inset p-4 rounded-xl text-center">
                                    <p className="text-[#6B7280] font-medium text-sm">
                                        You are the seller. Reply to questions on the right.
                                    </p>
                                </div>
                            ) : (
                                <form onSubmit={handleAskQuestion}>
                                    <textarea 
                                        className="w-full neu-inset p-4 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#6C63FF]/50 transition-all resize-none mb-4"
                                        rows={4}
                                        placeholder="Type your question here..."
                                        value={questionText}
                                        onChange={(e) => setQuestionText(e.target.value)}
                                    ></textarea>
                                    <button type="submit" disabled={submittingQuestion} className="w-full neu-btn px-6 py-3 rounded-xl text-sm font-bold text-[#3D4852] flex items-center justify-center disabled:opacity-50">
                                        <Send className="w-4 h-4 mr-2" />
                                        {submittingQuestion ? 'Sending...' : 'Send Question'}
                                    </button>
                                </form>
                            )}
                        </div>
                    </div>

                    {/* Q&A List */}
                    <div className="lg:col-span-2 space-y-6">
                         {questions.length > 0 ? (
                             questions.map((qa) => (
                                 <div key={qa.id} className="neu-extruded p-6 transition-all hover:scale-[1.01]">
                                     <div className="flex items-start gap-4">
                                         <div className="w-10 h-10 rounded-full neu-inset flex items-center justify-center text-[#6B7280] flex-shrink-0">
                                             <UserIcon className="w-5 h-5" />
                                         </div>
                                         <div className="flex-1">
                                             <div className="flex justify-between items-start">
                                                 <h4 className="font-bold text-[#3D4852]">{qa.userName}</h4>
                                                 <span className="text-xs text-[#9CA3AF]">{new Date(qa.createAt).toLocaleDateString()}</span>
                                             </div>
                                             <p className="text-[#6B7280] text-sm mt-1 mb-3">{qa.question}</p>
                                             
                                             {/* Shop Response */}
                                             {qa.answer ? (
                                                <div className="bg-[#E0E5EC] neu-inset p-4 rounded-xl flex gap-3">
                                                    <div className="w-6 h-6 rounded-full bg-[#6C63FF] flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                                                        S
                                                    </div>
                                                    <div>
                                                        <p className="text-xs font-bold text-[#3D4852] mb-1">Seller Response</p>
                                                        <p className="text-sm text-[#4B5563]">{qa.answer}</p>
                                                    </div>
                                                </div>
                                             ) : isSeller && (
                                                <div className="mt-2">
                                                    <textarea 
                                                        className="w-full neu-inset p-2 rounded-lg text-sm mb-2"
                                                        rows={2}
                                                        placeholder="Write your answer..."
                                                        value={replyText[qa.id] || ''}
                                                        onChange={(e) => setReplyText(prev => ({...prev, [qa.id]: e.target.value}))}
                                                    />
                                                    <button 
                                                        onClick={() => handleAnswerQuestion(qa.id)}
                                                        disabled={submittingReply[qa.id]}
                                                        className="neu-btn px-4 py-1.5 rounded-lg text-xs font-bold text-[#6C63FF] disabled:opacity-50"
                                                    >
                                                        {submittingReply[qa.id] ? 'Sending...' : 'Reply'}
                                                    </button>
                                                </div>
                                             )}
                                         </div>
                                     </div>
                                 </div>
                             ))
                         ) : (
                            <div className="neu-extruded p-8 text-center text-[#6B7280]">
                                <p>No questions yet.</p>
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
                                <li key={bid.id} className="px-6 py-4 flex items-center justify-between hover:bg-[#F0F4F8] rounded-xl transition-colors group">
                                    <div className="flex items-center">
                                        <div className="flex-shrink-0">
                                            <div className="h-10 w-10 neu-icon-well bg-[#E0E5EC] text-[#6C63FF]">
                                                <UserIcon className="h-5 w-5" />
                                            </div>
                                        </div>
                                        <div className="ml-4">
                                            <div className="flex items-center gap-2">
                                                <p className="text-sm font-bold text-[#3D4852]">{bid.bidderName}</p>
                                                {/* Hidden bid ID info if needed */}
                                            </div>
                                            <p className="text-xs text-[#6B7280] font-medium">
                                                {(() => {
                                                    const time = bid.time || bid.bidTime || (bid as any).createdAt || (bid as any).createAt;
                                                    try {
                                                        if (!time) return 'Unknown time';
                                                        const d = new Date(time);
                                                        return isNaN(d.getTime()) ? String(time) : d.toLocaleString('vi-VN');
                                                    } catch (e) {
                                                        return String(time);
                                                    }
                                                })()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="text-sm font-extrabold text-[#6C63FF]">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bid.amount)}
                                        </div>
                                        {isSeller && product?.status === 'ACTIVE' && (
                                            <button
                                                onClick={() => handleDenyBidder(bid.bidderId)}
                                                className="text-red-500 hover:text-red-700 bg-red-100 p-2 rounded-full transition-colors"
                                                title={`Deny Bidder ID: ${bid.bidderId}`}
                                            >
                                                <Ban className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </li>
                            ))
                        ) : (
                            <li className="px-6 py-8 text-center text-[#6B7280] font-medium">No bids yet. Be the first!</li>
                        )}
                    </ul>
                </div>
            </div>

            {/* Confirmation Modal */}
            {showConfirmModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 neu-extruded animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-extrabold text-[#3D4852] mb-4">Confirm Your Bid</h3>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to place a bid of <span className="font-bold text-[#6C63FF] text-lg">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bidAmount)}</span> for <span className="font-semibold">{product?.title}</span>?
                        </p>
                        <div className="flex gap-4">
                            <button 
                                onClick={() => setShowConfirmModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={confirmBid}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[#6C63FF] hover:bg-[#5a52d5] shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                            >
                                Confirm Bid
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Deny Bidder Confirmation Modal */}
            <ConfirmationModal 
                isOpen={showDenyModal}
                onClose={() => setShowDenyModal(false)}
                onConfirm={confirmDenyBidder}
                title="Deny Bidder"
                message={`Are you sure you want to deny bidder #${bidderToDeny}? They will be blocked from this auction.`}
                confirmText="Deny Bidder"
                variant="danger"
            />

            {/* Append Description Modal */}
            {showAppendModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full p-6 neu-extruded animate-in fade-in zoom-in duration-200">
                        <h3 className="text-xl font-extrabold text-[#3D4852] mb-4">Append Description</h3>
                        <p className="text-sm text-gray-500 mb-4">Add new information to your product description. This will be appended with a timestamp.</p>
                        
                        <ReactQuill 
                            theme="snow"
                            value={appendContent}
                            onChange={setAppendContent}
                            className="h-64 mb-12"
                        />

                        <div className="flex gap-4 mt-8">
                            <button 
                                onClick={() => setShowAppendModal(false)}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleAppendDescription}
                                className="flex-1 py-3 px-4 rounded-xl font-bold text-white bg-[#6C63FF] hover:bg-[#5a52d5] shadow-lg shadow-indigo-500/30 transition-all hover:-translate-y-0.5"
                            >
                                Update Description
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProductDetail;
