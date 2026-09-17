import { v2 as cloudinary } from 'cloudinary';
import homepageContentModel from '../models/homepageContentModel.js';
import productModel from '../models/productModel.js';

// ---- PUBLIC API ----

// Get all active homepage content for the public frontend
const getPublicHomepageContent = async (req, res) => {
    try {
        const content = await homepageContentModel.find({ active: true }).sort({ sortOrder: 1, createdAt: -1 });
        
        // Group content by type
        const hero = content.filter(c => c.type === 'hero');
        const promotional = content.filter(c => c.type === 'promotional');
        const latestCollection = content.filter(c => c.type === 'latestCollection');
        
        // Fetch featured products dynamically
        const featuredProductsContent = content.filter(c => c.type === 'featuredProducts');
        let featuredProducts = [];
        
        if (featuredProductsContent.length > 0) {
            // Process each active featured products section
            for (const config of featuredProductsContent) {
                if (config.productIds && config.productIds.length > 0) {
                    const products = await productModel.find({ _id: { $in: config.productIds } });
                    
                    const orderedProducts = config.productIds
                        .map(id => products.find(p => p._id.toString() === id.toString()))
                        .filter(p => p !== undefined);
                        
                    featuredProducts.push({
                        _id: config._id,
                        title: config.title,
                        description: config.description,
                        products: orderedProducts
                    });
                }
            }
        }

        res.json({
            success: true,
            hero,
            promotionalBanners: promotional,
            latestCollection,
            featuredProducts
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ---- ADMIN APIs ----

// Get all content (active & inactive)
const getAllContent = async (req, res) => {
    try {
        const content = await homepageContentModel.find({}).sort({ type: 1, sortOrder: 1, createdAt: -1 });
        res.json({ success: true, content });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Create new homepage content
const createContent = async (req, res) => {
    try {
        const { type, title, subtitle, description, buttonText, buttonLink, productIds, active, sortOrder } = req.body;
        
        let imageUrl = '';
        
        // Handle Cloudinary Upload
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
            imageUrl = result.secure_url;
        }

        // Parse productIds if provided
        let parsedProductIds = [];
        if (productIds) {
            parsedProductIds = JSON.parse(productIds);
        }

        const contentData = {
            type,
            title: title || '',
            subtitle: subtitle || '',
            description: description || '',
            buttonText: buttonText || '',
            buttonLink: buttonLink || '',
            productIds: parsedProductIds,
            active: active === 'true' || active === true,
            sortOrder: Number(sortOrder) || 0,
            image: imageUrl
        };

        const newContent = new homepageContentModel(contentData);
        await newContent.save();

        res.json({ success: true, message: 'Content created successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update existing homepage content
const updateContent = async (req, res) => {
    try {
        const { id } = req.params;
        const { type, title, subtitle, description, buttonText, buttonLink, productIds, active, sortOrder, prevImage } = req.body;
        
        let imageUrl = prevImage || '';
        
        // Handle new image upload
        if (req.file) {
            const result = await cloudinary.uploader.upload(req.file.path, { resource_type: 'image' });
            imageUrl = result.secure_url;
        }

        // Parse productIds
        let parsedProductIds = [];
        if (productIds) {
            parsedProductIds = JSON.parse(productIds);
        }

        const updateData = {
            type,
            title: title || '',
            subtitle: subtitle || '',
            description: description || '',
            buttonText: buttonText || '',
            buttonLink: buttonLink || '',
            productIds: parsedProductIds,
            active: active === 'true' || active === true,
            sortOrder: Number(sortOrder) || 0,
            image: imageUrl
        };

        await homepageContentModel.findByIdAndUpdate(id, updateData);

        res.json({ success: true, message: 'Content updated successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Toggle Active Status
const toggleStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const content = await homepageContentModel.findById(id);
        if (!content) {
            return res.json({ success: false, message: 'Content not found' });
        }

        content.active = !content.active;
        await content.save();

        res.json({ success: true, message: `Content ${content.active ? 'activated' : 'deactivated'}` });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete content
const deleteContent = async (req, res) => {
    try {
        const { id } = req.params;
        await homepageContentModel.findByIdAndDelete(id);
        res.json({ success: true, message: 'Content deleted successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getPublicHomepageContent, getAllContent, createContent, updateContent, toggleStatus, deleteContent };
