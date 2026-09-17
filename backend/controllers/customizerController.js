import { v2 as cloudinary } from 'cloudinary';
import designModel from '../models/designModel.js';
import productModel from '../models/productModel.js';

const uploadCustomizerImage = async (req, res) => {
    try {
        const imageFile = req.file;
        
        if (!imageFile) {
            return res.json({ success: false, message: 'Please select an image.' });
        }
        
        const allowedMimeTypes = ['image/png', 'image/jpeg', 'image/jpg', 'image/webp'];
        if (!allowedMimeTypes.includes(imageFile.mimetype)) {
            return res.json({ success: false, message: 'Unsupported image format. Use PNG, JPG, or WEBP.' });
        }
        
        // 5 MB limit
        if (imageFile.size > 5 * 1024 * 1024) {
            return res.json({ success: false, message: 'Image must be 5 MB or smaller.' });
        }
        
        const result = await cloudinary.uploader.upload(imageFile.path, {
            folder: 'auven/customizer/uploads',
            resource_type: 'image'
        });
        
        res.json({ success: true, imageUrl: result.secure_url });
        
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Unable to upload design. Please try again.' });
    }
}

const getDesigns = async (req, res) => {
    try {
        const designs = await designModel.find({ active: true });
        res.json({ success: true, designs });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Unable to load designs' });
    }
}



// Admin APIs

const getAdminDesigns = async (req, res) => {
    try {
        const designs = await designModel.find({});
        res.json({ success: true, designs });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: 'Unable to load designs' });
    }
}

const addAdminDesign = async (req, res) => {
    try {
        const { name, category, active } = req.body;
        const imageFile = req.file;

        if (!name || !category || !imageFile) {
            return res.json({ success: false, message: "Missing required fields" });
        }

        const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });

        const designData = {
            name,
            category,
            active: active === 'true' || active === true,
            image: imageUpload.secure_url
        }

        const design = new designModel(designData);
        await design.save();

        res.json({ success: true, message: "Design added successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to add design" });
    }
}

const updateAdminDesign = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, category, active } = req.body;
        const imageFile = req.file;

        const design = await designModel.findById(id);
        if (!design) return res.json({ success: false, message: "Design not found" });

        design.name = name || design.name;
        design.category = category || design.category;
        if (active !== undefined) {
            design.active = active === 'true' || active === true;
        }

        if (imageFile) {
            const imageUpload = await cloudinary.uploader.upload(imageFile.path, { resource_type: "image" });
            design.image = imageUpload.secure_url;
        }

        await design.save();
        res.json({ success: true, message: "Design updated successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to update design" });
    }
}

const deleteAdminDesign = async (req, res) => {
    try {
        const { id } = req.params;
        await designModel.findByIdAndDelete(id);
        res.json({ success: true, message: "Design deleted successfully" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: "Failed to delete design" });
    }
}

export { uploadCustomizerImage, getDesigns, getAdminDesigns, addAdminDesign,    updateAdminDesign,
    deleteAdminDesign
};
