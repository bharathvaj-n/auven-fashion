import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ token }) => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const res = await axios.get(backendUrl + '/api/admin/dashboard', { headers: { token } });
            if (res.data.success) {
                setDashboardData(res.data.dashboard);
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            fetchDashboardData();
        }
    }, [token]);

    if (loading) {
        return <div className="text-center py-20 text-gray-500">Loading dashboard...</div>;
    }

    if (!dashboardData) {
        return (
            <div className="text-center py-20 text-gray-500">
                <p>Unable to load dashboard data.</p>
                <button onClick={fetchDashboardData} className="mt-4 border border-black px-4 py-2">Retry</button>
            </div>
        );
    }

    const { statistics, orderStatus, recentOrders, lowStockProducts } = dashboardData;

    return (
        <div className="flex flex-col gap-8 w-full max-w-6xl">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Admin Dashboard</h2>
                <button onClick={fetchDashboardData} className="bg-black text-white px-4 py-2 text-sm rounded">Refresh</button>
            </div>

            {/* Statistics Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-white border rounded p-5 flex flex-col items-center justify-center shadow-sm">
                    <p className="text-gray-500 text-sm mb-1">Total Products</p>
                    <p className="text-3xl font-semibold text-gray-800">{statistics.totalProducts}</p>
                </div>
                <div className="bg-white border rounded p-5 flex flex-col items-center justify-center shadow-sm">
                    <p className="text-gray-500 text-sm mb-1">Total Customers</p>
                    <p className="text-3xl font-semibold text-gray-800">{statistics.totalCustomers}</p>
                </div>
                <div className="bg-white border rounded p-5 flex flex-col items-center justify-center shadow-sm">
                    <p className="text-gray-500 text-sm mb-1">Total Orders</p>
                    <p className="text-3xl font-semibold text-gray-800">{statistics.totalOrders}</p>
                </div>
                <div className="bg-white border rounded p-5 flex flex-col items-center justify-center shadow-sm">
                    <p className="text-gray-500 text-sm mb-1">Total Revenue</p>
                    <p className="text-3xl font-semibold text-green-600">{currency} {statistics.totalRevenue.toLocaleString()}</p>
                </div>
            </div>

            {/* Order Statuses Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white border border-gray-200 rounded p-4 flex justify-between items-center shadow-sm">
                    <p className="text-gray-700 font-medium">Pending Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{orderStatus.pending}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded p-4 flex justify-between items-center shadow-sm">
                    <p className="text-gray-700 font-medium">Processing Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{orderStatus.processing}</p>
                </div>
                <div className="bg-white border border-gray-200 rounded p-4 flex justify-between items-center shadow-sm">
                    <p className="text-gray-700 font-medium">Delivered Orders</p>
                    <p className="text-2xl font-bold text-gray-800">{orderStatus.delivered}</p>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Recent Orders */}
                <div className="flex flex-col gap-4">
                    <div className="flex justify-between items-end border-b pb-2">
                        <h3 className="text-lg font-medium text-gray-700">Recent Orders</h3>
                        <button onClick={() => navigate('/orders')} className="text-sm text-blue-600 hover:underline">View All Orders</button>
                    </div>
                    {recentOrders.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">No orders yet.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {recentOrders.map(order => (
                                <div key={order._id} className="border p-3 rounded flex flex-col sm:flex-row justify-between sm:items-center bg-white shadow-sm hover:shadow transition-shadow cursor-pointer" onClick={() => navigate('/orders')}>
                                    <div className="flex flex-col gap-1">
                                        <p className="font-semibold text-sm">#{order._id.slice(-6)}</p>
                                        <p className="text-sm text-gray-600">{order.address.firstName} {order.address.lastName}</p>
                                        <p className="text-xs text-gray-400">{new Date(order.date).toLocaleDateString()}</p>
                                    </div>
                                    <div className="flex flex-col sm:items-end gap-1 mt-2 sm:mt-0">
                                        <p className="font-medium text-sm">{currency} {order.amount}</p>
                                        <p className="text-xs text-gray-500">{order.paymentMethod}</p>
                                        <span className={`text-[10px] px-2 py-0.5 rounded uppercase font-semibold w-fit ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : order.status === 'Order Placed' ? 'bg-orange-100 text-orange-800' : 'bg-blue-100 text-blue-800'}`}>
                                            {order.status}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Low Stock Products */}
                <div className="flex flex-col gap-4">
                    <div className="border-b pb-2">
                        <h3 className="text-lg font-medium text-gray-700">Low Stock Alerts</h3>
                    </div>
                    {lowStockProducts.length === 0 ? (
                        <p className="text-gray-500 text-sm py-4">All products are sufficiently stocked.</p>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {lowStockProducts.map((item, index) => (
                                <div key={index} className={`border p-3 rounded flex justify-between items-center bg-white border-gray-200 shadow-sm`}>
                                    <div className="flex flex-col">
                                        <p className="font-medium text-sm text-gray-800 line-clamp-1">{item.name}</p>
                                        <p className="text-xs text-gray-600 mt-1">
                                            Size: {item.size} {item.colour && `| Colour: ${item.colour}`}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className={`text-xl font-bold ${item.stock <= 0 ? 'text-red-600' : 'text-orange-500'}`}>{item.stock}</span>
                                        <span className={`text-[10px] uppercase font-semibold ${item.stock <= 0 ? 'text-red-500' : 'text-orange-500'}`}>
                                            {item.stock <= 0 ? 'Out of Stock' : 'Left'}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default Dashboard;
