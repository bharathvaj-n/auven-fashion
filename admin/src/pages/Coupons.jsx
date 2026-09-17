import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl, currency } from '../App';
import { toast } from 'react-toastify';

const Coupons = ({ token }) => {
    const [coupons, setCoupons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        code: '',
        discountPercentage: '',
        minimumOrderAmount: '',
        maximumDiscountAmount: '',
        expiryDate: '',
        active: true
    });

    const fetchCoupons = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/admin/coupons`, { headers: { token } });
            if (res.data.success) {
                setCoupons(res.data.coupons);
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
            fetchCoupons();
        }
    }, [token]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData({
            ...formData,
            [name]: type === 'checkbox' ? checked : value
        });
    };

    const resetForm = () => {
        setFormData({
            code: '',
            discountPercentage: '',
            minimumOrderAmount: '',
            maximumDiscountAmount: '',
            expiryDate: '',
            active: true
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (coupon) => {
        setFormData({
            code: coupon.code,
            discountPercentage: coupon.discountPercentage,
            minimumOrderAmount: coupon.minimumOrderAmount,
            maximumDiscountAmount: coupon.maximumDiscountAmount,
            expiryDate: new Date(coupon.expiryDate).toISOString().split('T')[0],
            active: coupon.active
        });
        setEditingId(coupon._id);
        setShowForm(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingId) {
                res = await axios.put(`${backendUrl}/api/admin/coupons/${editingId}`, formData, { headers: { token } });
            } else {
                res = await axios.post(`${backendUrl}/api/admin/coupons`, formData, { headers: { token } });
            }

            if (res.data.success) {
                toast.success(res.data.message);
                fetchCoupons();
                resetForm();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleToggleStatus = async (id) => {
        try {
            const res = await axios.put(`${backendUrl}/api/admin/coupons/${id}/toggle`, {}, { headers: { token } });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchCoupons();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this coupon?")) {
            try {
                const res = await axios.delete(`${backendUrl}/api/admin/coupons/${id}`, { headers: { token } });
                if (res.data.success) {
                    toast.success(res.data.message);
                    fetchCoupons();
                } else {
                    toast.error(res.data.message);
                }
            } catch (error) {
                console.log(error);
                toast.error(error.message);
            }
        }
    };

    return (
        <div className="flex flex-col gap-6 w-full max-w-6xl pb-20">
            <div className="flex justify-between items-center border-b pb-4">
                <h2 className="text-2xl font-semibold text-gray-800">Coupons</h2>
                <button 
                    onClick={() => { resetForm(); setShowForm(!showForm); }} 
                    className="bg-black text-white px-4 py-2 rounded text-sm"
                >
                    {showForm ? 'Cancel' : '+ Create Coupon'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-gray-50 border p-6 rounded shadow-sm">
                    <h3 className="text-lg font-medium mb-4">{editingId ? 'Edit Coupon' : 'Create New Coupon'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600 font-medium">Coupon Code *</label>
                            <input type="text" name="code" value={formData.code} onChange={handleInputChange} required className="border p-2 rounded focus:outline-none focus:border-gray-500 uppercase" placeholder="e.g. SAVE20" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600 font-medium">Discount Percentage *</label>
                            <input type="number" min="1" max="100" name="discountPercentage" value={formData.discountPercentage} onChange={handleInputChange} required className="border p-2 rounded focus:outline-none focus:border-gray-500" placeholder="e.g. 20" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600 font-medium">Minimum Order Amount ({currency}) *</label>
                            <input type="number" min="0" name="minimumOrderAmount" value={formData.minimumOrderAmount} onChange={handleInputChange} required className="border p-2 rounded focus:outline-none focus:border-gray-500" placeholder="e.g. 1000" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600 font-medium">Maximum Discount ({currency}) *</label>
                            <input type="number" min="0" name="maximumDiscountAmount" value={formData.maximumDiscountAmount} onChange={handleInputChange} required className="border p-2 rounded focus:outline-none focus:border-gray-500" placeholder="e.g. 500" />
                        </div>
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600 font-medium">Expiry Date *</label>
                            <input type="date" name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} required className="border p-2 rounded focus:outline-none focus:border-gray-500" />
                        </div>
                        <div className="flex items-center gap-2 mt-6">
                            <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} id="activeCheckbox" className="w-4 h-4 accent-black cursor-pointer" />
                            <label htmlFor="activeCheckbox" className="text-sm text-gray-600 font-medium cursor-pointer">Active</label>
                        </div>
                        
                        <div className="md:col-span-2 lg:col-span-3 flex justify-end mt-2">
                            <button type="submit" className="bg-black text-white px-6 py-2 rounded text-sm hover:bg-gray-800 transition">
                                {editingId ? 'Update Coupon' : 'Create Coupon'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading coupons...</div>
            ) : coupons.length === 0 ? (
                <div className="text-center py-20 text-gray-500 border rounded bg-white">No coupons found.</div>
            ) : (
                <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-sm">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Code</th>
                                <th className="px-6 py-4 font-medium">Discount</th>
                                <th className="px-6 py-4 font-medium">Min Order</th>
                                <th className="px-6 py-4 font-medium">Max Discount</th>
                                <th className="px-6 py-4 font-medium">Expiry</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
                            {coupons.map((coupon) => {
                                const isExpired = new Date() > new Date(coupon.expiryDate);
                                return (
                                <tr key={coupon._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold">{coupon.code}</td>
                                    <td className="px-6 py-4 font-medium">{coupon.discountPercentage}%</td>
                                    <td className="px-6 py-4 text-gray-500">{currency} {coupon.minimumOrderAmount}</td>
                                    <td className="px-6 py-4 text-gray-500">{currency} {coupon.maximumDiscountAmount}</td>
                                    <td className={`px-6 py-4 ${isExpired ? 'text-red-500' : 'text-gray-500'}`}>
                                        {new Date(coupon.expiryDate).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4">
                                        {isExpired ? (
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">Expired</span>
                                        ) : coupon.active ? (
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Active</span>
                                        ) : (
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                                        <button onClick={() => handleEdit(coupon)} className="text-blue-600 hover:underline font-medium text-xs">Edit</button>
                                        <button onClick={() => handleToggleStatus(coupon._id)} className={`${coupon.active ? 'text-orange-600' : 'text-green-600'} hover:underline font-medium text-xs`}>
                                            {coupon.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => handleDelete(coupon._id)} className="text-red-600 hover:underline font-medium text-xs">Delete</button>
                                    </td>
                                </tr>
                            )})}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default Coupons;
