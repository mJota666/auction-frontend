import React, { useEffect, useState } from 'react';
import { productService } from '../../services/product';
import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';

interface UserBid {
    id: number;
    amount: number;
    bidTime: string;
    productId: number;
    productTitle: string;
    productImage?: string;
    status: 'WINNING' | 'LOSING' | 'WON' | 'LOST'; // Hypothetical status
}

const MyBids: React.FC = () => {
    const [bids, setBids] = useState<UserBid[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const data = await productService.getMyBids();
                setBids(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Failed to fetch bids", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBids();
    }, []);

    if (loading) return <div className="text-center py-10">Loading bids...</div>;

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
                <h2 className="text-2xl font-bold text-[#3D4852]">My Active Bids</h2>
            </div>
            {bids.length === 0 ? (
                <div className="neu-inset rounded-2xl p-12 text-center text-gray-400 font-medium">
                    You haven't placed any bids yet.
                </div>
            ) : (
                <div className="space-y-4">
                     {bids.map((bid) => (
                        <div key={bid.id} className="neu-extruded rounded-2xl p-6 transition-all hover:scale-[1.01] duration-300">
                             <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-6">
                                    <div className="w-20 h-20 rounded-xl neu-inset p-1.5 flex-shrink-0">
                                        {bid.productImage ? (
                                            <img src={bid.productImage} alt={bid.productTitle} className="w-full h-full object-cover rounded-lg"/>
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">No Img</div>
                                        )}
                                    </div>
                                    <div>
                                        <Link to={`/products/${bid.productId}`} className="text-lg font-bold text-[#3D4852] hover:text-[#6C63FF] transition-colors flex items-center gap-2 group">
                                            {bid.productTitle || `Product #${bid.productId}`}
                                            <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </Link>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Bid Time: <span className="font-medium">{new Date(bid.bidTime).toLocaleString()}</span>
                                        </p>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <p className="text-2xl font-bold text-[#6C63FF]">
                                        {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(bid.amount)}
                                    </p>
                                    <span className={`inline-flex items-center px-4 py-1.5 mt-2 rounded-full text-xs font-bold shadow-sm ${
                                        bid.status === 'WINNING' || bid.status === 'WON' 
                                            ? 'bg-green-100 text-green-700' 
                                            : 'bg-red-50 text-red-500'
                                    }`}>
                                        {bid.status || 'Active'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MyBids;
