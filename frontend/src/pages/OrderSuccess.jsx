import React, { useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Title from '../components/Title';
import { ShopContext } from '../context/ShopContext';

const OrderSuccess = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { currency } = useContext(ShopContext);

    // Read state passed from PlaceOrder
    const { orderId, amount, paymentMethod } = location.state || {
        orderId: 'Unknown',
        amount: 0,
        paymentMethod: 'Online Payment'
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] py-10 px-4 text-center">
            <div className="mb-6">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <div className='text-2xl sm:text-3xl'>
                    <Title text1={'ORDER'} text2={'PLACED SUCCESSFULLY'} />
                </div>
                <p className="text-gray-500 mt-2 text-lg">Payment Successful</p>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 w-full max-w-md text-left mb-8 shadow-sm">
                <div className="flex justify-between mb-3 border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-medium">Order ID:</span>
                    <span className="font-semibold text-gray-800">#{orderId.substring(orderId.length - 8).toUpperCase()}</span>
                </div>
                <div className="flex justify-between mb-3 border-b border-gray-200 pb-3">
                    <span className="text-gray-500 font-medium">Payment Method:</span>
                    <span className="font-semibold text-gray-800">{paymentMethod}</span>
                </div>
                <div className="flex justify-between pt-1">
                    <span className="text-gray-500 font-medium">Amount Paid:</span>
                    <span className="font-bold text-lg text-gray-900">{currency}{amount}</span>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
                <button 
                    onClick={() => navigate('/orders')}
                    className="flex-1 bg-black text-white px-6 py-3 font-medium hover:bg-gray-800 transition-colors"
                >
                    VIEW MY ORDERS
                </button>
                <button 
                    onClick={() => navigate('/collection')}
                    className="flex-1 bg-white text-black border border-black px-6 py-3 font-medium hover:bg-gray-50 transition-colors"
                >
                    CONTINUE SHOPPING
                </button>
            </div>
        </div>
    );
};

export default OrderSuccess;
