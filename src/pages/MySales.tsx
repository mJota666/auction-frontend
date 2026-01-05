import React, { useEffect, useState } from 'react';
import { orderService, type Order, OrderStatus } from '../services/order';
import { toast } from 'react-toastify';
import { Truck, Check, Star, XCircle } from 'lucide-react';
import RatingModal from '../components/RatingModal';

const MySales: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [ratingData, setRatingData] = useState<{ isOpen: boolean; targetUserId: number; targetUserName: string; orderId: number; isCancellation?: boolean } | null>(null);

    useEffect(() => {
        fetchSales();
    }, []);

    const fetchSales = async () => {
        try {
            const data = await orderService.getMySales();
            setOrders(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error('Failed to fetch sales', error);
        } finally {
            setLoading(false);
        }
    };

    const updateStatus = async (orderId: number, status: OrderStatus) => {
        try {
            await orderService.updateOrderStatus(orderId, status);
            toast.success(`Order #${orderId} marked as ${status}`);
            fetchSales(); // Refresh
        } catch (error) {
            toast.error('Failed to update status');
        }
    };

    const handleCancelOrder = async (orderId: number) => {
        if (!window.confirm(`Are you sure you want to cancel Order #${orderId}? This will automatically penalize the buyer (-1 rating) and cannot be undone.`)) {
            return;
        }

        try {
            await orderService.cancelOrder(orderId);
            toast.success(`Order #${orderId} cancelled successfully.`);
            fetchSales();
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to cancel order');
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
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Sales</h1>
            
            <div className="space-y-6">
                {orders.length > 0 ? (
                    orders.map((order) => (
                        <div key={order.id} className="neu-extruded rounded-2xl p-6 transition-all hover:scale-[1.01] duration-300">
                            <div className="flex flex-col md:flex-row justify-between gap-6">
                                <div className="flex items-center gap-4">
                                     <div className="w-16 h-16 rounded-xl neu-inset flex items-center justify-center text-[#6C63FF] font-bold text-xl">
                                        #{order.id}
                                    </div>
                                    <div>
                                        <p className="text-lg font-bold text-[#3D4852]">{order.productTitle}</p>
                                        <p className="text-sm text-gray-500">Buyer ID: <span className="font-semibold text-[#6C63FF]">{order.buyerId}</span></p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-3">
                                    <span className={`px-4 py-1.5 rounded-full text-xs font-bold shadow-sm ${getStatusColor(order.status)}`}>
                                        {order.status}
                                    </span>

                                    <div className="flex gap-2 mt-2">
                                        {/* Actions based on status */}
                                        {order.status === OrderStatus.PENDING_PAYMENT && (
                                            <span className="text-sm text-gray-500 italic flex items-center bg-gray-100 px-3 py-1 rounded-full">
                                                Waiting for payment
                                            </span>
                                        )}
                                        {order.status === OrderStatus.PREPARING && (
                                            <button 
                                                onClick={() => updateStatus(order.id, OrderStatus.DELIVERING)}
                                                className="neu-btn px-4 py-2 rounded-xl text-white bg-[#6C63FF] text-xs font-bold flex items-center hover:bg-[#5a52d5]"
                                            >
                                                <Truck className="w-3 h-3 mr-1.5" /> Start Delivery
                                            </button>
                                        )}
                                        {order.status === OrderStatus.DELIVERING && (
                                             <button 
                                                onClick={() => updateStatus(order.id, OrderStatus.COMPLETED)}
                                                className="neu-btn px-4 py-2 rounded-xl text-white bg-green-500 text-xs font-bold flex items-center hover:bg-green-600"
                                            >
                                                <Check className="w-3 h-3 mr-1.5" /> Mark Delivered
                                            </button>
                                        )}
                                        {order.status === OrderStatus.COMPLETED && (
                                            <button 
                                                onClick={() => setRatingData({
                                                    isOpen: true,
                                                    targetUserId: order.buyerId || 0,
                                                    targetUserName: 'Buyer',
                                                    orderId: order.id
                                                })}
                                                className="neu-btn px-4 py-2 rounded-xl text-yellow-600 text-xs font-bold flex items-center"
                                            >
                                                <Star className="w-3 h-3 mr-1.5" /> Rate Buyer
                                            </button>
                                        )}
                                        {(order.status === OrderStatus.PENDING_PAYMENT || order.status === OrderStatus.PREPARING) && (
                                            <button 
                                                onClick={() => handleCancelOrder(order.id)}
                                                className="neu-btn px-4 py-2 rounded-xl text-red-500 text-xs font-bold flex items-center hover:text-red-700"
                                            >
                                                <XCircle className="w-3 h-3 mr-1.5" /> Cancel
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="neu-inset rounded-2xl p-12 text-center text-gray-400 font-medium">
                        No sales found.
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
                        fetchSales(); // Refresh list to see updated status
                        setRatingData(null);
                    }}
                />
            )}
        </div>
    );
};

export default MySales;
