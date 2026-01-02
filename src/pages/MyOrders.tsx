import React, { useEffect, useState } from 'react';
import { orderService, type Order, OrderStatus } from '../services/order'; // Fixed import to use types
import { Link } from 'react-router-dom';
import { CreditCard, Star } from 'lucide-react';
import RatingModal from '../components/RatingModal';

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [ratingData, setRatingData] = useState<{ isOpen: boolean; targetUserId: number; targetUserName: string; orderId: number } | null>(null);

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const data = await orderService.getMyOrders();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch orders', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: OrderStatus) => {
        switch (status) {
            case OrderStatus.PENDING_PAYMENT: return 'bg-yellow-100 text-yellow-800';
            case OrderStatus.PREPARING: return 'bg-blue-100 text-blue-800';
            case OrderStatus.DELIVERING: return 'bg-indigo-100 text-indigo-800';
            case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800';
            case OrderStatus.CANCELLED: return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Orders</h1>
            
            <div className="space-y-6">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div key={order.id} className="neu-extruded rounded-2xl p-6 transition-all hover:scale-[1.01] duration-300">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-24 h-24 rounded-xl neu-inset p-2 flex-shrink-0">
                                        <img 
                                            className="w-full h-full object-cover rounded-lg" 
                                            src={order.productImage || 'https://placehold.co/100x100?text=No+Image'} 
                                            alt={order.productTitle} 
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-[#3D4852] truncate max-w-xs">{order.productTitle}</h3>
                                        <p className="text-sm text-gray-500 mt-1">Order #{order.id}</p>
                                        <p className="text-xl font-bold text-[#6C63FF] mt-2">
                                            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>
                                    
                                    <div className="flex gap-3 mt-auto">
                                        {order.status === OrderStatus.PENDING_PAYMENT && (
                                            <Link to={`/checkout/${order.id}`} className="neu-btn px-6 py-2 rounded-xl text-white bg-[#6C63FF] font-bold text-sm flex items-center">
                                                <CreditCard className="w-4 h-4 mr-2" /> Pay Now
                                            </Link>
                                        )}
                                        {order.status === OrderStatus.DELIVERING && (
                                            <button className="neu-btn px-6 py-2 rounded-xl text-[#3D4852] font-bold text-sm">
                                                Track Order
                                            </button>
                                        )}
                                        {order.status === OrderStatus.COMPLETED && (
                                            <button 
                                                onClick={() => setRatingData({
                                                    isOpen: true,
                                                    targetUserId: order.sellerId || 0,
                                                    targetUserName: 'Seller',
                                                    orderId: order.id
                                                })}
                                                className="neu-btn px-6 py-2 rounded-xl text-yellow-600 font-bold text-sm flex items-center"
                                            >
                                                <Star className="w-4 h-4 mr-2" /> Rate Seller
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="neu-inset rounded-2xl p-12 text-center text-gray-400 font-medium">
                        No orders found.
                    </div>
                )}
            </div>

            {ratingData && (
                <RatingModal
                    isOpen={ratingData.isOpen}
                    onClose={() => setRatingData(null)}
                    targetUserId={ratingData.targetUserId}
                    targetUserName={ratingData.targetUserName}
                    orderId={ratingData.orderId}
                    onSuccess={() => {
                        // Optionally refresh orders or just close
                        setRatingData(null);
                    }}
                />
            )}
        </div>
    );
};

export default MyOrders;
