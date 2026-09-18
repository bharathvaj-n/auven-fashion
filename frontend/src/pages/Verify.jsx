import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';

const Verify = () => {
    const { navigate, token, setCartItems, backendUrl, getCartAmount, delivery_fee } = useContext(ShopContext);
    const [searchParams] = useSearchParams();
    
    const success = searchParams.get('success');
    const orderId = searchParams.get('orderId');
    
    const [isVerifying, setIsVerifying] = useState(true);

    const verifyPayment = async () => {
        try {
            if(!token) {
                return null;
            }
            
            const response = await axios.post(backendUrl + '/api/order/verifyStripe', {success, orderId}, { headers: { Authorization: `Bearer ${token}` } });
            
            if (response.data.success) {
                setCartItems({});
                toast.success(response.data.message || "Payment Successful!");
                navigate('/order-success', { 
                    state: { 
                        orderId: orderId, 
                        amount: getCartAmount() + delivery_fee, 
                        paymentMethod: 'Stripe' 
                    }
                });
            } else {
                toast.error(response.data.message || "Payment cancelled or failed");
                navigate('/cart');
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
            navigate('/cart');
        } finally {
            setIsVerifying(false);
        }
    }

    useEffect(() => {
        verifyPayment();
    }, [token]);

    return (
        <div className='min-h-[60vh] flex justify-center items-center'>
            {isVerifying ? (
                <div className='flex flex-col items-center gap-4'>
                    <div className='w-12 h-12 border-4 border-gray-300 border-t-black rounded-full animate-spin'></div>
                    <p className='text-lg font-medium text-gray-600'>Verifying Payment...</p>
                </div>
            ) : null}
        </div>
    );
};

export default Verify;
