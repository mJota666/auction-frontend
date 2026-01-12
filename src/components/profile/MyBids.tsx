import React, { useEffect, useState } from 'react';
import { productService } from '../../services/product';
import { Link } from 'react-router-dom';
import { ExternalLink, ChevronDown, ChevronUp, Clock, Award, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

interface GroupedBid {
    productId: number;
    productTitle: string;
    productImage: string;
    status: 'WINNING' | 'OUTBID' | 'WON' | 'LOST' | 'PENDING';
    myMaxBid: number;
    currentPrice: number;
    endTime: string;
    bids: {
        id: number;
        amount: number;
        time: string;
    }[];
}

const MyBids: React.FC = () => {
    const { user } = useAuth();
    const [groupedBids, setGroupedBids] = useState<GroupedBid[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedProducts, setExpandedProducts] = useState<number[]>([]);

    useEffect(() => {
        const fetchBids = async () => {
            if (!user) return;
            try {
                const result = await productService.getMyBids();
                console.log('--- DEBUG: /bids/me response ---', result);
                let rawList: any[] = [];
                
                // Extract array from paginated response
                if (Array.isArray(result)) {
                    rawList = result;
                } else if (result && Array.isArray((result as any).content)) {
                    rawList = (result as any).content;
                } else if (result && Array.isArray((result as any).data)) {
                    rawList = (result as any).data;
                }

                // Group by Product
                const groups: { [key: number]: GroupedBid } = {};

                rawList.forEach((bid: any) => {
                    const prod = bid.product;
                    if (!prod) return;

                    if (!groups[prod.id]) {
                        // Determine Status
                        const isWinner = Number(prod.currentWinnerId) === Number(user.id);
                        let status: GroupedBid['status'] = 'PENDING';
                        
                        // Check if ends in future
                        const isEnded = prod.status !== 'ACTIVE'; 

                        if (isEnded) {
                            status = isWinner ? 'WON' : 'LOST';
                        } else {
                            status = isWinner ? 'WINNING' : 'OUTBID';
                        }

                        groups[prod.id] = {
                            productId: prod.id,
                            productTitle: prod.title,
                            productImage: prod.thumbnailUrl || prod.imageUrls?.[0],
                            status: status,
                            myMaxBid: 0,
                            currentPrice: prod.currentPrice || prod.startPrice,
                            endTime: prod.endAt,
                            bids: []
                        };
                    }

                    // Add bid to history
                    groups[prod.id].bids.push({
                        id: bid.id,
                        amount: bid.amount,
                        time: bid.time || bid.bidTime || bid.createdAt
                    });

                    // Update max bid
                    if (bid.amount > groups[prod.id].myMaxBid) {
                        groups[prod.id].myMaxBid = bid.amount;
                    }
                });

                // Sort groups by most recent activity
                const sortedGroups = Object.values(groups).sort((a, b) => {
                   const maxTimeA = Math.max(...a.bids.map(x => new Date(x.time || 0).getTime()));
                   const maxTimeB = Math.max(...b.bids.map(x => new Date(x.time || 0).getTime()));
                   return maxTimeB - maxTimeA;
                });

                setGroupedBids(sortedGroups);
            } catch (error) {
                console.error("Failed to fetch bids", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBids();
    }, [user]);

    const toggleExpand = (productId: number) => {
        setExpandedProducts(prev => 
            prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'WINNING': return 'bg-green-100 text-green-700 border-green-200';
            case 'WON': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case 'OUTBID': return 'bg-red-50 text-red-500 border-red-100';
            case 'LOST': return 'bg-gray-100 text-gray-500 border-gray-200';
            default: return 'bg-gray-100 text-gray-500';
        }
    };
    
    const getStatusIcon = (status: string) => {
         switch (status) {
            case 'WINNING': return <Clock className="w-3 h-3 mr-1" />;
            case 'WON': return <Award className="w-3 h-3 mr-1" />;
            case 'OUTBID': return <AlertCircle className="w-3 h-3 mr-1" />;
            default: return null;
        }
    };

    if (loading) return <div className="text-center py-10">Loading bids...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-[#3D4852]">My Bids</h2>
            </div>
            {groupedBids.length === 0 ? (
                <div className="neu-inset rounded-2xl p-12 text-center text-gray-400 font-medium">
                    You haven't placed any bids yet.
                </div>
            ) : (
                <div className="space-y-6">
                     {groupedBids.map((group) => (
                        <div key={group.productId} className="neu-extruded rounded-2xl p-6 transition-all hover:shadow-lg">
                             <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6 flex-1">
                                    <div className="w-20 h-20 rounded-xl neu-inset p-1.5 flex-shrink-0 relative">
                                        <img 
                                            src={group.productImage || 'https://placehold.co/600x400?text=No+Img'} 
                                            alt={group.productTitle} 
                                            className="w-full h-full object-cover rounded-lg"
                                        />
                                        <div className={`absolute -top-2 -right-2 px-2 py-0.5 rounded text-[10px] font-bold border uppercase flex items-center shadow-sm ${getStatusColor(group.status)}`}>
                                            {getStatusIcon(group.status)}
                                            {group.status}
                                        </div>
                                    </div>
                                    <div>
                                        <Link to={`/products/${group.productId}`} className="text-lg font-bold text-[#3D4852] hover:text-[#6C63FF] transition-colors flex items-center gap-2 group">
                                            {group.productTitle}
                                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                        <div className="flex flex-wrap gap-4 mt-2 text-sm">
                                            <div className="flex flex-col">
                                                 <span className="text-gray-400 text-xs font-bold uppercase">Your Max Bid</span>
                                                 <span className="font-bold text-[#6C63FF]">
                                                     {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(group.myMaxBid)}
                                                 </span>
                                            </div>
                                            <div className="w-px bg-gray-200"></div>
                                            <div className="flex flex-col">
                                                 <span className="text-gray-400 text-xs font-bold uppercase">Current Price</span>
                                                 <span className="font-bold text-[#3D4852]">
                                                     {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(group.currentPrice)}
                                                 </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-4 w-full md:w-auto mt-4 md:mt-0">
                                    <button 
                                        onClick={() => toggleExpand(group.productId)}
                                        className="neu-flat p-2 rounded-lg text-gray-500 hover:text-[#6C63FF] transition-colors flex items-center gap-2 text-sm font-bold w-full md:w-auto justify-center"
                                    >
                                        {expandedProducts.includes(group.productId) ? (
                                            <>Hide History <ChevronUp className="w-4 h-4" /></>
                                        ) : (
                                            <>View History ({group.bids.length}) <ChevronDown className="w-4 h-4" /></>
                                        )}
                                    </button>
                                </div>
                             </div>

                             {expandedProducts.includes(group.productId) && (
                                 <div className="mt-6 pt-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2">
                                     <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Your Bid History</h4>
                                     <div className="max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                         {group.bids.sort((a,b) => b.amount - a.amount).map((bid, idx) => (
                                             <div key={bid.id} className="flex justify-between items-center py-3 border-b border-gray-50 last:border-0 hover:bg-gray-50/50 px-2 rounded-lg transition-colors">
                                                 <span className="font-bold text-[#3D4852] text-sm">
                                                     {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bid.amount)}
                                                     {idx === 0 && group.myMaxBid === bid.amount && (
                                                         <span className="ml-2 text-[10px] bg-[#6C63FF]/10 text-[#6C63FF] px-1.5 py-0.5 rounded font-extrabold uppercase">Max</span>
                                                     )}
                                                 </span>
                                                 <span className="text-xs text-gray-400 font-medium">
                                                     {(() => {
                                                         try {
                                                             let t = String(bid.time);
                                                             if (!t.endsWith('Z') && !t.includes('+')) t += 'Z'; // Force UTC 
                                                             return new Date(t).toLocaleString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
                                                         } catch {
                                                             return bid.time;
                                                         }
                                                     })()}
                                                 </span>
                                             </div>
                                         ))}
                                     </div>
                                 </div>
                             )}
                        </div>
                     ))}
                </div>
            )}
        </div>
    );
};

export default MyBids;
