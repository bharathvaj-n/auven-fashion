import couponModel from '../models/couponModel.js';

// Get all coupons
const getCoupons = async (req, res) => {
    try {
        const coupons = await couponModel.find({}).sort({ createdAt: -1 });
        res.json({ success: true, coupons });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Create a new coupon
const createCoupon = async (req, res) => {
    try {
        const { code, discountPercentage, minimumOrderAmount, maximumDiscountAmount, expiryDate, active } = req.body;
        
        const normalizedCode = code.trim().toUpperCase();

        // Check for duplicates
        const existing = await couponModel.findOne({ code: normalizedCode });
        if (existing) {
            return res.json({ success: false, message: 'Coupon code already exists.' });
        }

        const coupon = new couponModel({
            code: normalizedCode,
            discountPercentage: Number(discountPercentage),
            minimumOrderAmount: Number(minimumOrderAmount),
            maximumDiscountAmount: Number(maximumDiscountAmount),
            expiryDate: new Date(expiryDate),
            active: Boolean(active)
        });

        await coupon.save();
        res.json({ success: true, message: 'Coupon created successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Update an existing coupon
const updateCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        const { code, discountPercentage, minimumOrderAmount, maximumDiscountAmount, expiryDate, active } = req.body;
        
        const normalizedCode = code.trim().toUpperCase();

        // Check for duplicate code in other coupons
        const existing = await couponModel.findOne({ code: normalizedCode, _id: { $ne: id } });
        if (existing) {
            return res.json({ success: false, message: 'Another coupon with this code already exists.' });
        }

        await couponModel.findByIdAndUpdate(id, {
            code: normalizedCode,
            discountPercentage: Number(discountPercentage),
            minimumOrderAmount: Number(minimumOrderAmount),
            maximumDiscountAmount: Number(maximumDiscountAmount),
            expiryDate: new Date(expiryDate),
            active: Boolean(active)
        });

        res.json({ success: true, message: 'Coupon updated successfully' });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Toggle active status
const toggleCouponStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const coupon = await couponModel.findById(id);
        if (!coupon) {
            return res.json({ success: false, message: 'Coupon not found' });
        }

        coupon.active = !coupon.active;
        await coupon.save();

        res.json({ success: true, message: `Coupon ${coupon.active ? 'activated' : 'deactivated'}` });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Delete a coupon
const deleteCoupon = async (req, res) => {
    try {
        const { id } = req.params;
        await couponModel.findByIdAndDelete(id);
        res.json({ success: true, message: 'Coupon deleted successfully' });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getCoupons, createCoupon, updateCoupon, toggleCouponStatus, deleteCoupon };
