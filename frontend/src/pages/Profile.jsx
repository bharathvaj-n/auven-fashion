import React, { useContext, useEffect, useState } from 'react';
import { ShopContext } from '../context/ShopContext';
import Title from '../components/Title';
import axios from 'axios';
import { toast } from 'react-toastify';

const Profile = () => {
    const { token, navigate, backendUrl } = useContext(ShopContext);
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Profile state
    const [profileData, setProfileData] = useState({ name: '', email: '' });
    const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);

    // Password state
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    // Address state
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [editingAddressId, setEditingAddressId] = useState(null);
    const [addressData, setAddressData] = useState({
        name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', isDefault: false
    });

    useEffect(() => {
        if (!token) {
            navigate('/login');
            return;
        }
        fetchProfile();
    }, [token]);

    const fetchProfile = async () => {
        try {
            const res = await axios.get(backendUrl + '/api/user/profile', { headers: { token } });
            if (res.data.success) {
                setUser(res.data.user);
                setProfileData({ name: res.data.user.name, email: res.data.user.email });
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

    const updateProfile = async (e) => {
        e.preventDefault();
        setIsUpdatingProfile(true);
        try {
            const res = await axios.put(backendUrl + '/api/user/profile', profileData, { headers: { token } });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchProfile();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setIsUpdatingProfile(false);
        }
    };

    const changePassword = async (e) => {
        e.preventDefault();
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("New passwords do not match");
        }
        setIsUpdatingPassword(true);
        try {
            const res = await axios.put(backendUrl + '/api/user/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            }, { headers: { token } });

            if (res.data.success) {
                toast.success(res.data.message);
                setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    // Address handlers
    const resetAddressForm = () => {
        setAddressData({ name: '', phone: '', addressLine1: '', addressLine2: '', city: '', state: '', postalCode: '', country: '', isDefault: false });
        setEditingAddressId(null);
        setShowAddressForm(false);
    };

    const openEditAddress = (addr) => {
        setAddressData(addr);
        setEditingAddressId(addr._id);
        setShowAddressForm(true);
    };

    const saveAddress = async (e) => {
        e.preventDefault();
        try {
            let res;
            if (editingAddressId) {
                res = await axios.put(`${backendUrl}/api/user/addresses/${editingAddressId}`, addressData, { headers: { token } });
            } else {
                res = await axios.post(`${backendUrl}/api/user/addresses`, addressData, { headers: { token } });
            }

            if (res.data.success) {
                toast.success(res.data.message);
                setUser({ ...user, addresses: res.data.addresses });
                resetAddressForm();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const deleteAddress = async (id) => {
        if (!confirm('Are you sure you want to delete this address?')) return;
        try {
            const res = await axios.delete(`${backendUrl}/api/user/addresses/${id}`, { headers: { token } });
            if (res.data.success) {
                toast.success(res.data.message);
                setUser({ ...user, addresses: res.data.addresses });
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const setDefaultAddress = async (id) => {
        try {
            const res = await axios.put(`${backendUrl}/api/user/addresses/${id}/default`, {}, { headers: { token } });
            if (res.data.success) {
                toast.success(res.data.message);
                setUser({ ...user, addresses: res.data.addresses });
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };


    if (loading) return <div className='my-20 text-center'>Loading profile...</div>;

    return (
        <div className='flex flex-col gap-10 pt-10 border-t'>
            
            {/* Top Bar with Order History link */}
            <div className='flex justify-between items-center'>
                <div className='text-2xl'>
                    <Title text1={'MY'} text2={'PROFILE'} />
                </div>
                <button type="button" onClick={() => navigate('/orders')} className='bg-black text-white px-6 py-2 text-sm'>
                    VIEW ORDER HISTORY
                </button>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 gap-12 mb-20'>
                
                {/* Left Column: Personal Info & Password */}
                <div className='flex flex-col gap-10'>
                    
                    {/* Personal Info */}
                    <div>
                        <h3 className='text-xl font-medium mb-4'>Personal Information</h3>
                        <form onSubmit={updateProfile} className='flex flex-col gap-4'>
                            <input 
                                required
                                type='text' 
                                value={profileData.name} 
                                onChange={(e) => setProfileData({...profileData, name: e.target.value})} 
                                className='border border-gray-300 rounded py-2 px-3.5 w-full' 
                                placeholder='Full Name'
                            />
                            <input 
                                required
                                type='email' 
                                value={profileData.email} 
                                onChange={(e) => setProfileData({...profileData, email: e.target.value})} 
                                className='border border-gray-300 rounded py-2 px-3.5 w-full' 
                                placeholder='Email Address'
                            />
                            <button disabled={isUpdatingProfile} type='submit' className='bg-black text-white px-8 py-2 text-sm self-start'>
                                {isUpdatingProfile ? 'SAVING...' : 'SAVE CHANGES'}
                            </button>
                        </form>
                    </div>

                    <hr className='border-gray-200' />

                    {/* Change Password */}
                    <div>
                        <h3 className='text-xl font-medium mb-4'>Change Password</h3>
                        <form onSubmit={changePassword} className='flex flex-col gap-4'>
                            <input 
                                required
                                type='password' 
                                value={passwordData.currentPassword} 
                                onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})} 
                                className='border border-gray-300 rounded py-2 px-3.5 w-full' 
                                placeholder='Current Password'
                            />
                            <input 
                                required
                                minLength={8}
                                type='password' 
                                value={passwordData.newPassword} 
                                onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})} 
                                className='border border-gray-300 rounded py-2 px-3.5 w-full' 
                                placeholder='New Password'
                            />
                            <input 
                                required
                                type='password' 
                                value={passwordData.confirmPassword} 
                                onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})} 
                                className='border border-gray-300 rounded py-2 px-3.5 w-full' 
                                placeholder='Confirm New Password'
                            />
                            <button disabled={isUpdatingPassword} type='submit' className='bg-black text-white px-8 py-2 text-sm self-start'>
                                {isUpdatingPassword ? 'UPDATING...' : 'UPDATE PASSWORD'}
                            </button>
                        </form>
                    </div>
                </div>

                {/* Right Column: Addresses */}
                <div>
                    <div className='flex justify-between items-center mb-4'>
                        <h3 className='text-xl font-medium'>Saved Addresses</h3>
                        {!showAddressForm && (
                            <button onClick={() => setShowAddressForm(true)} className='text-sm border border-black px-4 py-1'>+ Add New</button>
                        )}
                    </div>

                    {showAddressForm && (
                        <form onSubmit={saveAddress} className='flex flex-col gap-3 bg-gray-50 p-4 border mb-6'>
                            <h4 className='font-medium'>{editingAddressId ? 'Edit Address' : 'Add New Address'}</h4>
                            <div className='flex gap-3'>
                                <input required type='text' placeholder='Full Name' value={addressData.name} onChange={e=>setAddressData({...addressData, name: e.target.value})} className='border py-1.5 px-3 w-full'/>
                                <input required type='text' placeholder='Phone' value={addressData.phone} onChange={e=>setAddressData({...addressData, phone: e.target.value})} className='border py-1.5 px-3 w-full'/>
                            </div>
                            <input required type='text' placeholder='Address Line 1' value={addressData.addressLine1} onChange={e=>setAddressData({...addressData, addressLine1: e.target.value})} className='border py-1.5 px-3 w-full'/>
                            <input type='text' placeholder='Address Line 2 (Optional)' value={addressData.addressLine2} onChange={e=>setAddressData({...addressData, addressLine2: e.target.value})} className='border py-1.5 px-3 w-full'/>
                            <div className='flex gap-3'>
                                <input required type='text' placeholder='City' value={addressData.city} onChange={e=>setAddressData({...addressData, city: e.target.value})} className='border py-1.5 px-3 w-full'/>
                                <input required type='text' placeholder='State' value={addressData.state} onChange={e=>setAddressData({...addressData, state: e.target.value})} className='border py-1.5 px-3 w-full'/>
                            </div>
                            <div className='flex gap-3'>
                                <input required type='text' placeholder='Zip Code' value={addressData.postalCode} onChange={e=>setAddressData({...addressData, postalCode: e.target.value})} className='border py-1.5 px-3 w-full'/>
                                <input required type='text' placeholder='Country' value={addressData.country} onChange={e=>setAddressData({...addressData, country: e.target.value})} className='border py-1.5 px-3 w-full'/>
                            </div>
                            
                            {!editingAddressId && (
                                <div className='flex items-center gap-2 mt-2'>
                                    <input type='checkbox' id='isDefault' checked={addressData.isDefault} onChange={e=>setAddressData({...addressData, isDefault: e.target.checked})}/>
                                    <label htmlFor='isDefault' className='text-sm text-gray-600 cursor-pointer'>Set as default address</label>
                                </div>
                            )}

                            <div className='flex gap-3 mt-3'>
                                <button type='submit' className='bg-black text-white px-6 py-2 text-sm'>SAVE</button>
                                <button type='button' onClick={resetAddressForm} className='border border-gray-300 px-6 py-2 text-sm'>CANCEL</button>
                            </div>
                        </form>
                    )}

                    <div className='flex flex-col gap-4'>
                        {user?.addresses?.length === 0 ? (
                            <p className='text-gray-500 text-sm'>No saved addresses found.</p>
                        ) : (
                            user?.addresses?.map((addr) => (
                                <div key={addr._id} className={`border p-4 flex flex-col gap-2 relative ${addr.isDefault ? 'border-gray-800 bg-gray-50' : 'border-gray-200'}`}>
                                    {addr.isDefault && <span className='absolute top-4 right-4 bg-gray-800 text-white text-[10px] px-2 py-1 uppercase rounded'>Default</span>}
                                    <p className='font-medium'>{addr.name} <span className='text-gray-500 font-normal ml-2'>{addr.phone}</span></p>
                                    <p className='text-sm text-gray-600'>{addr.addressLine1} {addr.addressLine2 && `, ${addr.addressLine2}`}</p>
                                    <p className='text-sm text-gray-600'>{addr.city}, {addr.state} {addr.postalCode}</p>
                                    <p className='text-sm text-gray-600'>{addr.country}</p>
                                    
                                    <div className='flex gap-4 mt-2 text-sm'>
                                        <button onClick={() => openEditAddress(addr)} className='text-blue-600 hover:underline'>Edit</button>
                                        <button onClick={() => deleteAddress(addr._id)} className='text-red-600 hover:underline'>Delete</button>
                                        {!addr.isDefault && (
                                            <button onClick={() => setDefaultAddress(addr._id)} className='text-gray-600 hover:underline'>Set as Default</button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default Profile;
