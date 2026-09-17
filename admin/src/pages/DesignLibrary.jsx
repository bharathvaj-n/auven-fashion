import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { backendUrl } from '../App';
import { assets } from '../assets/assets';

const DesignLibrary = ({ token }) => {
    const [designs, setDesigns] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form States
    const [designId, setDesignId] = useState('');
    const [name, setName] = useState('');
    const [category, setCategory] = useState('');
    const [active, setActive] = useState(true);
    const [image, setImage] = useState(null);
    const [existingImage, setExistingImage] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchDesigns = async () => {
        try {
            setLoading(true);
            const response = await axios.get(backendUrl + '/api/customizer/admin/designs', { headers: { token } });
            if (response.data.success) {
                setDesigns(response.data.designs);
            } else {
                toast.error(response.data.message || 'Unable to load designs');
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
            fetchDesigns();
        }
    }, [token]);

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        
        if (!name || !category) {
            toast.error('Name and Category are required');
            return;
        }

        if (!isEditing && !image) {
            toast.error('Image is required when adding a new design');
            return;
        }

        try {
            setSubmitting(true);
            const formData = new FormData();
            formData.append('name', name);
            formData.append('category', category);
            formData.append('active', active);
            
            if (image) {
                formData.append('image', image);
            }

            let response;
            if (isEditing) {
                response = await axios.put(`${backendUrl}/api/customizer/admin/designs/${designId}`, formData, { headers: { token } });
            } else {
                response = await axios.post(`${backendUrl}/api/customizer/admin/designs`, formData, { headers: { token } });
            }

            if (response.data.success) {
                toast.success(response.data.message);
                setShowForm(false);
                resetForm();
                fetchDesigns();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Unable to save design');
        } finally {
            setSubmitting(false);
        }
    };

    const resetForm = () => {
        setDesignId('');
        setName('');
        setCategory('');
        setActive(true);
        setImage(null);
        setExistingImage('');
        setIsEditing(false);
    };

    const handleEditClick = (design) => {
        setDesignId(design._id);
        setName(design.name);
        setCategory(design.category);
        setActive(design.active);
        setExistingImage(design.image);
        setImage(null);
        setIsEditing(true);
        setShowForm(true);
    };

    const handleToggleActive = async (design) => {
        try {
            const formData = new FormData();
            formData.append('active', !design.active);
            
            const response = await axios.put(`${backendUrl}/api/customizer/admin/designs/${design._id}`, formData, { headers: { token } });
            
            if (response.data.success) {
                toast.success('Status updated');
                fetchDesigns();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Unable to update status');
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this design?")) {
            return;
        }

        try {
            const response = await axios.delete(`${backendUrl}/api/customizer/admin/designs/${id}`, { headers: { token } });
            if (response.data.success) {
                toast.success(response.data.message);
                fetchDesigns();
            } else {
                toast.error(response.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error('Unable to delete design');
        }
    };

    if (showForm) {
        return (
            <div className="bg-white p-6 rounded shadow-sm border max-w-2xl">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-800">{isEditing ? 'Edit Design' : 'Add New Design'}</h2>
                    <button 
                        onClick={() => { setShowForm(false); resetForm(); }}
                        className="text-gray-500 hover:text-black font-medium"
                    >
                        Cancel
                    </button>
                </div>
                
                <form onSubmit={handleFormSubmit} className="flex flex-col gap-5">
                    <div>
                        <p className="mb-2 font-medium">Design Image</p>
                        <label htmlFor="image">
                            <div className="w-32 h-32 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer rounded overflow-hidden">
                                {image ? (
                                    <img src={URL.createObjectURL(image)} alt="Preview" className="w-full h-full object-contain bg-gray-50" />
                                ) : existingImage ? (
                                    <img src={existingImage} alt="Existing" className="w-full h-full object-contain bg-gray-50" />
                                ) : (
                                    <div className="text-gray-400 text-sm text-center px-4">
                                        <img src={assets.upload_area} className="w-8 h-8 mx-auto mb-2 opacity-50" alt="" />
                                        Upload Image
                                    </div>
                                )}
                            </div>
                        </label>
                        <input onChange={(e) => setImage(e.target.files[0])} type="file" id="image" hidden accept="image/png, image/jpeg, image/webp" />
                    </div>

                    <div>
                        <p className="mb-2 font-medium">Design Name</p>
                        <input 
                            onChange={(e) => setName(e.target.value)} 
                            value={name} 
                            className="w-full max-w-[500px] px-3 py-2 border rounded" 
                            type="text" 
                            placeholder="e.g., Star" 
                            required 
                        />
                    </div>

                    <div>
                        <p className="mb-2 font-medium">Category</p>
                        <input 
                            onChange={(e) => setCategory(e.target.value)} 
                            value={category} 
                            className="w-full max-w-[500px] px-3 py-2 border rounded" 
                            type="text" 
                            placeholder="e.g., Symbols" 
                            required 
                        />
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                        <input 
                            type="checkbox" 
                            id="active" 
                            checked={active} 
                            onChange={(e) => setActive(e.target.checked)}
                            className="w-4 h-4 cursor-pointer"
                        />
                        <label htmlFor="active" className="cursor-pointer font-medium">Active (Visible to customers)</label>
                    </div>

                    <button 
                        type="submit" 
                        disabled={submitting}
                        className="bg-black text-white w-32 py-2 mt-4 rounded disabled:bg-gray-400 font-medium"
                    >
                        {submitting ? 'Saving...' : (isEditing ? 'Update Design' : 'Add Design')}
                    </button>
                </form>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Design Library</h2>
                <button 
                    onClick={() => { resetForm(); setShowForm(true); }}
                    className="bg-black text-white px-5 py-2 rounded font-medium shadow-sm hover:bg-gray-800 transition-all"
                >
                    + Add Design
                </button>
            </div>

            {loading ? (
                <div className="py-10 text-center text-gray-500">Loading designs...</div>
            ) : designs.length === 0 ? (
                <div className="py-10 text-center text-gray-500 bg-white border rounded">No designs found. Add one to get started.</div>
            ) : (
                <div className="bg-white border rounded shadow-sm overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50 border-b text-gray-800 uppercase text-xs">
                            <tr>
                                <th className="px-4 py-3 font-medium">Image</th>
                                <th className="px-4 py-3 font-medium">Name</th>
                                <th className="px-4 py-3 font-medium">Category</th>
                                <th className="px-4 py-3 font-medium">Status</th>
                                <th className="px-4 py-3 font-medium text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {designs.map((design) => (
                                <tr key={design._id} className="hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <img src={design.image} alt={design.name} className="w-12 h-12 object-contain bg-white border rounded p-1" />
                                    </td>
                                    <td className="px-4 py-3 font-medium text-gray-800">{design.name}</td>
                                    <td className="px-4 py-3">{design.category}</td>
                                    <td className="px-4 py-3">
                                        <button 
                                            onClick={() => handleToggleActive(design)}
                                            className={`px-3 py-1 rounded text-xs font-bold transition-all ${design.active ? 'bg-green-100 text-green-800 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                                            title="Click to toggle status"
                                        >
                                            {design.active ? 'Active' : 'Inactive'}
                                        </button>
                                    </td>
                                    <td className="px-4 py-3 text-right">
                                        <button 
                                            onClick={() => handleEditClick(design)}
                                            className="text-blue-600 hover:text-blue-800 px-2 py-1 font-medium"
                                        >
                                            Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(design._id)}
                                            className="text-red-600 hover:text-red-800 px-2 py-1 font-medium"
                                        >
                                            Delete
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

export default DesignLibrary;
