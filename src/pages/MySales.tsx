import React, { useEffect, useState } from 'react';
import { orderService, type Order, OrderStatus } from '../services/order';
import { toast } from 'react-toastify';
import { Truck, Check } from 'lucide-react';

const MySales: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

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

    const getStatusColor = (status: OrderStatus) => {
         switch (status) {
            case OrderStatus.PENDING_PAYMENT: return 'bg-yellow-100 text-yellow-800';
            case OrderStatus.PREPARING: return 'bg-blue-100 text-blue-800';
            case OrderStatus.DELIVERING: return 'bg-indigo-100 text-indigo-800';
            case OrderStatus.COMPLETED: return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">My Sales</h1>
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <li key={order.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="ml-4">
                                                <p className="text-lg font-medium text-indigo-600">{order.productTitle}</p>
                                                <p className="text-sm text-gray-500">Buyer ID: {order.buyerId}</p>
                                            </div>
                                        </div>
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                    <div className="mt-4 flex justify-end space-x-2">
                                        {/* Actions based on status */}
                                        {order.status === OrderStatus.PENDING_PAYMENT && (
                                            <span className="text-sm text-gray-500 italic">Waiting for payment</span>
                                        )}
                                        {order.status === OrderStatus.PREPARING && (
                                            <button 
                                                onClick={() => updateStatus(order.id, OrderStatus.DELIVERING)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                                            >
                                                <Truck className="w-3 h-3 mr-1" /> Start Delivery
                                            </button>
                                        )}
                                        {order.status === OrderStatus.DELIVERING && (
                                             <button 
                                                onClick={() => updateStatus(order.id, OrderStatus.COMPLETED)}
                                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                                            >
                                                <Check className="w-3 h-3 mr-1" /> Mark Delivered
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-8 text-center text-gray-500">No sales yet.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default MySales;
