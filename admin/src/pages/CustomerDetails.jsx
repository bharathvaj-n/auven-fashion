import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useParams, useNavigate } from 'react-router-dom';

const CustomerDetails = ({ token }) => {
    const { id } = useParams();
    const navigate = useNavigate();
    
    const [data, setData] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token && id) {
            fetchCustomerData();
        }
    }, [token, id]);

    const fetchCustomerData = async () => {
        setLoading(true);
        try {
            // Fetch Details
            const detailsRes = await axios.get(`${backendUrl}/api/admin/customers/${id}`, { headers: { token } });
            
            if (detailsRes.data.success) {
                setData(detailsRes.data);
                
                // Fetch Orders if customer exists
                const ordersRes = await axios.get(`${backendUrl}/api/admin/customers/${id}/orders`, { headers: { token } });
                if (ordersRes.data.success) {
                    setOrders(ordersRes.data.orders);
                }
            } else {
                toast.error(detailsRes.data.message);
                // Wait briefly before redirecting
                setTimeout(() => navigate('/customers'), 1500);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading customer details...</div>;
    }

    if (!data || !data.customer) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p>Customer not found.</p>
                <button onClick={() => navigate('/customers')} className="mt-4 border border-black px-4 py-2 hover:bg-gray-50">Back to Customers</button>
            </div>
        );
    }

    const { customer, summary } = data;

    // Determine phone number to display in main info
    let mainPhone = 'N/A';
    if (customer.addresses && customer.addresses.length > 0) {
        const defaultAddr = customer.addresses.find(a => a.isDefault);
        mainPhone = defaultAddr ? defaultAddr.phone : customer.addresses[0].phone;
    }

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl pb-20">
            {/* Header */}
            <div className="flex items-center gap-4">
                <button onClick={() => navigate('/customers')} className="text-gray-500 hover:text-black">
                    &larr; Back to Customers
                </button>
            </div>

            <h2 className="text-2xl font-semibold text-gray-800 border-b pb-4">Customer Details</h2>

            {/* Top Row: Info & Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Customer Information Card */}
                <div className="bg-white border rounded shadow-sm p-6 flex flex-col gap-4">
                    <h3 className="text-lg font-medium text-gray-700">Account Information</h3>
                    <div className="flex flex-col gap-2 text-sm text-gray-800">
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500">Name</span>
                            <span className="font-medium">{customer.name}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500">Email</span>
                            <span>{customer.email}</span>
                        </div>
                        <div className="flex justify-between border-b border-gray-100 pb-2">
                            <span className="text-gray-500">Phone</span>
                            <span>{mainPhone}</span>
                        </div>
                        <div className="flex justify-between pb-1">
                            <span className="text-gray-500">Joined Date</span>
                            <span>{new Date(customer.joinedDate).toLocaleDateString()}</span>
                        </div>
                    </div>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white border rounded shadow-sm p-6 flex flex-col gap-4">
                    <h3 className="text-lg font-medium text-gray-700">Order Summary</h3>
                    <div className="grid grid-cols-3 gap-4 mt-2">
                        <div className="flex flex-col gap-1 border-r pr-2">
                            <span className="text-xs text-gray-500">TOTAL ORDERS</span>
                            <span className="text-2xl font-semibold">{summary.totalOrders}</span>
                        </div>
                        <div className="flex flex-col gap-1 border-r px-2">
                            <span className="text-xs text-gray-500">TOTAL SPENT</span>
                            <span className="text-2xl font-semibold text-green-600">{currency} {summary.totalSpent.toLocaleString()}</span>
                        </div>
                        <div className="flex flex-col gap-1 pl-2">
                            <span className="text-xs text-gray-500">LATEST ORDER</span>
                            <span className="text-sm font-medium mt-1">
                                {summary.latestOrderDate ? new Date(summary.latestOrderDate).toLocaleDateString() : 'None'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Saved Addresses Section */}
            <div className="flex flex-col gap-4 mt-4">
                <h3 className="text-lg font-medium text-gray-700 border-b pb-2">Saved Addresses</h3>
                
                {customer.addresses && customer.addresses.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {customer.addresses.map((addr) => (
                            <div key={addr._id} className={`border p-4 flex flex-col gap-2 relative rounded shadow-sm ${addr.isDefault ? 'border-black bg-gray-50' : 'border-gray-200 bg-white'}`}>
                                {addr.isDefault && <span className='absolute top-4 right-4 bg-black text-white text-[10px] px-2 py-1 uppercase rounded'>Default</span>}
                                <p className='font-medium text-gray-800'>{addr.name}</p>
                                <p className='text-sm text-gray-500'>{addr.phone}</p>
                                <div className='text-sm text-gray-600 mt-2'>
                                    <p>{addr.addressLine1}</p>
                                    {addr.addressLine2 && <p>{addr.addressLine2}</p>}
                                    <p>{addr.city}, {addr.state} {addr.postalCode}</p>
                                    <p>{addr.country}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-500 text-sm bg-white border rounded p-4">This customer has no saved addresses.</p>
                )}
            </div>

            {/* Customer Orders Section */}
            <div className="flex flex-col gap-4 mt-4">
                <div className="flex justify-between items-end border-b pb-2">
                    <h3 className="text-lg font-medium text-gray-700">Customer Orders</h3>
                    <button onClick={() => navigate('/orders')} className="text-sm text-blue-600 hover:underline">Manage all orders</button>
                </div>
                
                {orders.length === 0 ? (
                    <p className="text-gray-500 text-sm bg-white border rounded p-4">This customer has no orders yet.</p>
                ) : (
                    <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-sm">
                        <table className="w-full text-left border-collapse whitespace-nowrap">
                            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Order ID</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Items</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Payment</th>
                                    <th className="px-6 py-4 font-medium text-right">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
                                {orders.map((order) => (
                                    <tr key={order._id} className="hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => navigate('/orders')}>
                                        <td className="px-6 py-4 font-medium">#{order._id.slice(-6)}</td>
                                        <td className="px-6 py-4 text-gray-500">{new Date(order.date).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 text-gray-500">{order.items.length} item(s)</td>
                                        <td className="px-6 py-4 font-medium">{currency} {order.amount.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-gray-500">{order.paymentMethod}</td>
                                        <td className="px-6 py-4 text-right">
                                            <span className={`px-2 py-1 rounded text-[10px] uppercase font-semibold ${
                                                order.status === 'Delivered' ? 'bg-green-100 text-green-800' 
                                                : order.status === 'Order Placed' ? 'bg-orange-100 text-orange-800' 
                                                : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {order.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

        </div>
    );
};

export default CustomerDetails;
