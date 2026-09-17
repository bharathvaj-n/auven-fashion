import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Customers = ({ token }) => {
    const navigate = useNavigate();
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchCustomers = async (search = '') => {
        setLoading(true);
        try {
            const url = search 
                ? `${backendUrl}/api/admin/customers?search=${encodeURIComponent(search)}` 
                : `${backendUrl}/api/admin/customers`;
                
            const res = await axios.get(url, { headers: { token } });
            if (res.data.success) {
                setCustomers(res.data.customers);
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
            fetchCustomers();
        }
    }, [token]);

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCustomers(searchTerm);
    };

    const handleClearSearch = () => {
        setSearchTerm('');
        fetchCustomers('');
    };

    return (
        <div className="flex flex-col gap-8 w-full max-w-6xl">
            {/* Header */}
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-semibold text-gray-800">Customers</h2>
                <p className="text-gray-600">Total Customers: <span className="font-bold text-gray-800">{customers.length}</span></p>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearch} className="flex gap-2 w-full max-w-md">
                <input 
                    type="text" 
                    placeholder="Search customers by name or email..." 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="border border-gray-300 rounded px-4 py-2 w-full focus:outline-none focus:border-gray-500"
                />
                <button type="submit" className="bg-black text-white px-4 py-2 rounded text-sm hover:bg-gray-800 transition">Search</button>
                {searchTerm && (
                    <button type="button" onClick={handleClearSearch} className="border border-gray-300 px-4 py-2 rounded text-sm hover:bg-gray-100 transition">Clear</button>
                )}
            </form>

            {/* Customers Table */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading customers...</div>
            ) : customers.length === 0 ? (
                <div className="text-center py-20 text-gray-500 border rounded bg-white">No customers found.</div>
            ) : (
                <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-sm">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Customer</th>
                                <th className="px-6 py-4 font-medium">Email</th>
                                <th className="px-6 py-4 font-medium">Phone</th>
                                <th className="px-6 py-4 font-medium">Orders</th>
                                <th className="px-6 py-4 font-medium">Joined</th>
                                <th className="px-6 py-4 font-medium text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
                            {customers.map((customer) => (
                                <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-medium">{customer.name}</td>
                                    <td className="px-6 py-4">{customer.email}</td>
                                    <td className="px-6 py-4 text-gray-500">{customer.phone}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${customer.ordersCount > 0 ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                                            {customer.ordersCount}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-gray-500">
                                        {new Date(customer.joinedDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button 
                                            onClick={() => navigate(`/customers/${customer.id}`)}
                                            className="text-blue-600 hover:text-blue-800 hover:underline font-medium"
                                        >
                                            View Details
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Customers;
