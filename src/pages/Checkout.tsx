import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { orderService, type Order } from '../services/order';
import { toast } from 'react-toastify';

// Replace with your public key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''); 

const CheckoutForm: React.FC<{ orderId: number, clientSecret: string }> = ({ orderId, clientSecret }) => {
    const stripe = useStripe();
    const elements = useElements();
    const navigate = useNavigate();
    const [processing, setProcessing] = useState(false);

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        if (!stripe || !elements) return;

        setProcessing(true);

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) return;

        const result = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
                billing_details: {
                     name: 'Buyer Name', // Should come from context or form
                },
            },
        });

        if (result.error) {
            toast.error(result.error.message || 'Payment failed');
            setProcessing(false);
        } else {
            if (result.paymentIntent.status === 'succeeded') {
                try {
                    // Update order status to PAID after successful payment
                    await orderService.updateOrderStatus(orderId, 'PAID' as any);
                    toast.success('Payment successful!');
                    navigate('/my-orders');
                } catch (error) {
                    console.error('Failed to update order status:', error);
                    toast.warning('Payment succeeded but failed to update order status. Please contact support.');
                    navigate('/my-orders');
                }
            }
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <div className="p-4 border border-gray-300 rounded-md">
                <CardElement options={{
                    style: {
                        base: {
                            fontSize: '16px',
                            color: '#424770',
                            '::placeholder': {
                                color: '#aab7c4',
                            },
                        },
                        invalid: {
                            color: '#9e2146',
                        },
                    },
                }} />
            </div>
            <button
                type="submit"
                disabled={!stripe || processing}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
                {processing ? 'Processing...' : 'Pay Now'}
            </button>
        </form>
    );
};

const Checkout: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const [order, setOrder] = useState<Order | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id) {
            fetchOrderAndPayment(id);
        }
    }, [id]);

    const fetchOrderAndPayment = async (orderId: string) => {
        try {
            console.log('Fetching order:', orderId);
            const orderData = await orderService.getOrder(orderId);
            console.log('Order data loaded:', orderData);
            setOrder(orderData);
            
            // Create payment intent
            console.log('Creating payment intent for order:', orderId);
            const paymentData = await orderService.createPaymentIntent(Number(orderId));
            console.log('Payment data received:', paymentData);
            
            if (!paymentData || !paymentData.clientSecret) {
                throw new Error('No client secret returned from backend');
            }
            setClientSecret(paymentData.clientSecret);
        } catch (error: any) {
            console.error('Failed to load checkout', error);
            const msg = error.response?.data?.message || error.message || 'Failed to load checkout';
            setError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20">Loading...</div>;
    
    if (error) return (
        <div className="text-center py-20">
            <h2 className="text-xl font-bold text-red-500 mb-2">Error Loading Checkout</h2>
            <p className="text-gray-600">{error}</p>
            <p className="text-sm text-gray-400 mt-4">Order ID: {id}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300">Retry</button>
        </div>
    );

    if (!order || !clientSecret) return <div className="text-center py-20">Order not found or Payment not initialized (Unknown State)</div>;

    return (
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>
            
            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-lg font-medium text-gray-900 mb-4">Order Summary</h2>
                <div className="flex justify-between py-2 border-b border-gray-200">
                    <span className="text-gray-600">{order.productTitle}</span>
                    <span className="font-medium">{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)}</span>
                </div>
                <div className="flex justify-between py-4 text-lg font-bold">
                    <span>Total</span>
                    <span>{new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(order.amount)}</span>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                 <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Details</h2>
                 <Elements stripe={stripePromise} options={{ clientSecret }}>
                    <CheckoutForm orderId={order.id} clientSecret={clientSecret} />
                 </Elements>
            </div>
        </div>
    );
};

export default Checkout;
