import React, { useEffect, useState } from 'react';
import { orderService, type Order, OrderStatus } from '../services/order'; // Fixed import to use types
import { Link } from 'react-router-dom';
import { CreditCard } from 'lucide-react';

const MyOrders: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

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
            
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                    {orders.length > 0 ? (
                        orders.map((order) => (
                            <li key={order.id}>
                                <div className="px-4 py-4 sm:px-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <div className="flex-shrink-0 h-16 w-16">
                                                <img 
                                                    className="h-16 w-16 rounded-md object-cover" 
                                                    src={order.productImage || 'https://via.placeholder.com/100'} 
                                                    alt={order.productTitle} 
                                                />
                                            </div>
                                            <div className="ml-4">
                                                <p className="text-lg font-medium text-indigo-600 truncate">{order.productTitle}</p>
                                                <p className="text-sm text-gray-500">Order #{order.id}</p>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(order.status)}`}>
                                                {order.status}
                                            </span>
                                            <p className="mt-1 text-sm text-gray-900 font-bold">
                                                {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        {order.status === OrderStatus.PENDING_PAYMENT && (
                                            <Link to={`/checkout/${order.id}`} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                                                <CreditCard className="w-4 h-4 mr-2" /> Pay Now
                                            </Link>
                                        )}
                                        {order.status === OrderStatus.DELIVERING && (
                                            <button className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                                                Track Order
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </li>
                        ))
                    ) : (
                        <li className="px-4 py-8 text-center text-gray-500">No orders found.</li>
                    )}
                </ul>
            </div>
        </div>
    );
};

export default MyOrders;
