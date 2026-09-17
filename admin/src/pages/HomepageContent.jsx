import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { backendUrl } from '../App';
import { toast } from 'react-toastify';
import { assets } from '../assets/assets';

const HomepageContent = ({ token }) => {
    const [contentList, setContentList] = useState([]);
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);

    const [formData, setFormData] = useState({
        type: 'hero',
        title: '',
        subtitle: '',
        description: '',
        buttonText: '',
        buttonLink: '',
        active: true,
        sortOrder: 0
    });
    
    const [image, setImage] = useState(false);
    const [prevImage, setPrevImage] = useState('');
    const [selectedProducts, setSelectedProducts] = useState([]);

    const fetchContent = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`${backendUrl}/api/admin/homepage`, { headers: { token } });
            if (res.data.success) {
                setContentList(res.data.content);
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

    const fetchProducts = async () => {
        try {
            const res = await axios.get(`${backendUrl}/api/product/list`);
            if (res.data.success) {
                setProducts(res.data.products);
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (token) {
            fetchContent();
            fetchProducts();
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
            type: 'hero',
            title: '',
            subtitle: '',
            description: '',
            buttonText: '',
            buttonLink: '',
            active: true,
            sortOrder: 0
        });
        setImage(false);
        setPrevImage('');
        setSelectedProducts([]);
        setEditingId(null);
        setShowForm(false);
    };

    const handleEdit = (item) => {
        setFormData({
            type: item.type,
            title: item.title,
            subtitle: item.subtitle,
            description: item.description,
            buttonText: item.buttonText,
            buttonLink: item.buttonLink,
            active: item.active,
            sortOrder: item.sortOrder
        });
        setPrevImage(item.image);
        setImage(false);
        setSelectedProducts(item.productIds || []);
        setEditingId(item._id);
        setShowForm(true);
    };

    const toggleProductSelection = (productId) => {
        if (selectedProducts.includes(productId)) {
            setSelectedProducts(selectedProducts.filter(id => id !== productId));
        } else {
            setSelectedProducts([...selectedProducts, productId]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const submitData = new FormData();
            submitData.append('type', formData.type);
            submitData.append('title', formData.title);
            submitData.append('subtitle', formData.subtitle);
            submitData.append('description', formData.description);
            submitData.append('buttonText', formData.buttonText);
            submitData.append('buttonLink', formData.buttonLink);
            submitData.append('active', formData.active);
            submitData.append('sortOrder', formData.sortOrder);
            
            if (formData.type === 'featuredProducts') {
                submitData.append('productIds', JSON.stringify(selectedProducts));
            }
            
            if (image) {
                submitData.append('image', image);
            } else if (prevImage) {
                submitData.append('prevImage', prevImage);
            }

            let res;
            if (editingId) {
                res = await axios.put(`${backendUrl}/api/admin/homepage/${editingId}`, submitData, { headers: { token } });
            } else {
                res = await axios.post(`${backendUrl}/api/admin/homepage`, submitData, { headers: { token } });
            }

            if (res.data.success) {
                toast.success(res.data.message);
                fetchContent();
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
            const res = await axios.put(`${backendUrl}/api/admin/homepage/${id}/toggle`, {}, { headers: { token } });
            if (res.data.success) {
                toast.success(res.data.message);
                fetchContent();
            } else {
                toast.error(res.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm("Are you sure you want to delete this content?")) {
            try {
                const res = await axios.delete(`${backendUrl}/api/admin/homepage/${id}`, { headers: { token } });
                if (res.data.success) {
                    toast.success(res.data.message);
                    fetchContent();
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
                <h2 className="text-2xl font-semibold text-gray-800">Homepage Content</h2>
                <button 
                    onClick={() => { resetForm(); setShowForm(!showForm); }} 
                    className="bg-black text-white px-4 py-2 rounded text-sm"
                >
                    {showForm ? 'Cancel' : '+ Add Content'}
                </button>
            </div>

            {/* Form */}
            {showForm && (
                <div className="bg-gray-50 border p-6 rounded shadow-sm">
                    <h3 className="text-lg font-medium mb-4">{editingId ? 'Edit Content' : 'Create New Content'}</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        
                        <div className="flex flex-col gap-1 md:col-span-2">
                            <label className="text-sm text-gray-600 font-medium">Content Type *</label>
                            <select 
                                name="type" 
                                value={formData.type} 
                                onChange={handleInputChange} 
                                required 
                                className="border p-2 rounded focus:outline-none focus:border-gray-500 max-w-sm"
                                disabled={editingId ? true : false}
                            >
                                <option value="hero">Hero Banner</option>
                                <option value="promotional">Promotional Banner</option>
                                <option value="featuredProducts">Featured Products</option>
                                <option value="latestCollection">Latest Collection (Text only)</option>
                            </select>
                        </div>

                        {/* Text Fields */}
                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600 font-medium">Title</label>
                            <input type="text" name="title" value={formData.title} onChange={handleInputChange} className="border p-2 rounded focus:outline-none focus:border-gray-500" placeholder="Main heading" />
                        </div>

                        {formData.type === 'hero' && (
                            <div className="flex flex-col gap-1">
                                <label className="text-sm text-gray-600 font-medium">Subtitle</label>
                                <input type="text" name="subtitle" value={formData.subtitle} onChange={handleInputChange} className="border p-2 rounded focus:outline-none focus:border-gray-500" placeholder="Small text above heading" />
                            </div>
                        )}

                        {(formData.type === 'promotional' || formData.type === 'latestCollection') && (
                            <div className="flex flex-col gap-1 md:col-span-2">
                                <label className="text-sm text-gray-600 font-medium">Description</label>
                                <textarea name="description" value={formData.description} onChange={handleInputChange} className="border p-2 rounded focus:outline-none focus:border-gray-500 h-20" placeholder="Description text" />
                            </div>
                        )}

                        {(formData.type === 'hero' || formData.type === 'promotional') && (
                            <>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-gray-600 font-medium">Button Text</label>
                                    <input type="text" name="buttonText" value={formData.buttonText} onChange={handleInputChange} className="border p-2 rounded focus:outline-none focus:border-gray-500" placeholder="e.g. SHOP NOW" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <label className="text-sm text-gray-600 font-medium">Button Link</label>
                                    <input type="text" name="buttonLink" value={formData.buttonLink} onChange={handleInputChange} className="border p-2 rounded focus:outline-none focus:border-gray-500" placeholder="e.g. /collection" />
                                </div>
                                
                                {/* Image Upload */}
                                <div className="flex flex-col gap-1 md:col-span-2 mt-2">
                                    <label className="text-sm text-gray-600 font-medium">Upload Image</label>
                                    <div className="flex gap-4 items-center">
                                        <label htmlFor="imageUpload" className="cursor-pointer">
                                            <img className="w-24 h-24 object-cover border-2 border-dashed border-gray-300 rounded" src={!image ? (prevImage || assets.upload_area) : URL.createObjectURL(image)} alt="" />
                                            <input onChange={(e) => setImage(e.target.files[0])} type="file" id="imageUpload" hidden />
                                        </label>
                                        <div className="text-xs text-gray-500">
                                            <p>Click image to upload.</p>
                                            <p>Recommended size: 1200x800px</p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}

                        {formData.type === 'featuredProducts' && (
                            <div className="flex flex-col gap-1 md:col-span-2 mt-2">
                                <label className="text-sm text-gray-600 font-medium">Select Products to Feature</label>
                                <div className="border rounded p-4 max-h-60 overflow-y-auto bg-white grid grid-cols-1 sm:grid-cols-2 gap-2">
                                    {products.map(product => (
                                        <div key={product._id} className="flex items-center gap-3 p-2 border rounded hover:bg-gray-50 cursor-pointer" onClick={() => toggleProductSelection(product._id)}>
                                            <input type="checkbox" checked={selectedProducts.includes(product._id)} readOnly className="accent-black" />
                                            <img src={product.image[0]} className="w-8 h-8 object-cover rounded" alt="" />
                                            <span className="text-sm truncate">{product.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div className="flex flex-col gap-1">
                            <label className="text-sm text-gray-600 font-medium">Sort Order</label>
                            <input type="number" name="sortOrder" value={formData.sortOrder} onChange={handleInputChange} className="border p-2 rounded focus:outline-none focus:border-gray-500 max-w-[100px]" placeholder="0" />
                        </div>

                        <div className="flex items-center gap-2 mt-6">
                            <input type="checkbox" name="active" checked={formData.active} onChange={handleInputChange} id="activeCheckbox" className="w-4 h-4 accent-black cursor-pointer" />
                            <label htmlFor="activeCheckbox" className="text-sm text-gray-600 font-medium cursor-pointer">Active / Visible</label>
                        </div>
                        
                        <div className="md:col-span-2 flex justify-end mt-4">
                            <button type="submit" className="bg-black text-white px-6 py-2 rounded text-sm hover:bg-gray-800 transition">
                                {editingId ? 'Update Content' : 'Save Content'}
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* List */}
            {loading ? (
                <div className="text-center py-20 text-gray-500">Loading content...</div>
            ) : contentList.length === 0 ? (
                <div className="text-center py-20 text-gray-500 border rounded bg-white">No homepage content found.</div>
            ) : (
                <div className="overflow-x-auto bg-white border border-gray-200 rounded shadow-sm">
                    <table className="w-full text-left border-collapse whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4 font-medium">Type</th>
                                <th className="px-6 py-4 font-medium">Title</th>
                                <th className="px-6 py-4 font-medium">Details</th>
                                <th className="px-6 py-4 font-medium">Sort Order</th>
                                <th className="px-6 py-4 font-medium">Status</th>
                                <th className="px-6 py-4 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 text-sm text-gray-800">
                            {contentList.map((item) => (
                                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-bold capitalize">{item.type.replace(/([A-Z])/g, ' $1').trim()}</td>
                                    <td className="px-6 py-4">{item.title || '-'}</td>
                                    <td className="px-6 py-4 text-gray-500 truncate max-w-[200px]">
                                        {item.type === 'featuredProducts' ? `${item.productIds?.length || 0} products selected` : (item.subtitle || item.description || '-')}
                                    </td>
                                    <td className="px-6 py-4">{item.sortOrder}</td>
                                    <td className="px-6 py-4">
                                        {item.active ? (
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-green-100 text-green-800">Active</span>
                                        ) : (
                                            <span className="px-2 py-1 rounded text-xs font-semibold bg-gray-100 text-gray-600">Inactive</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-3">
                                        <button onClick={() => handleEdit(item)} className="text-blue-600 hover:underline font-medium text-xs">Edit</button>
                                        <button onClick={() => handleToggleStatus(item._id)} className={`${item.active ? 'text-orange-600' : 'text-green-600'} hover:underline font-medium text-xs`}>
                                            {item.active ? 'Deactivate' : 'Activate'}
                                        </button>
                                        <button onClick={() => handleDelete(item._id)} className="text-red-600 hover:underline font-medium text-xs">Delete</button>
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

export default HomepageContent;
