import couponModel from '../models/couponModel.js';

// Validate coupon from customer checkout/cart UI
// This accepts subtotal for preview purposes. Final authoritative calculation happens in orderController.
const validateCoupon = async (req, res) => {
    try {
        const { code, subtotal } = req.body;
        
        if (!code) {
            return res.json({ success: false, message: "Please enter a coupon code." });
        }

        const normalizedCode = code.trim().toUpperCase();
        
        const coupon = await couponModel.findOne({ code: normalizedCode });
        
        if (!coupon) {
            return res.json({ success: false, message: "Invalid coupon code." });
        }
        
        if (!coupon.active) {
            return res.json({ success: false, message: "This coupon is currently inactive." });
        }
        
        const currentDate = new Date();
        if (currentDate > coupon.expiryDate) {
            return res.json({ success: false, message: "This coupon has expired." });
        }
        
        const orderSubtotal = Number(subtotal);
        if (isNaN(orderSubtotal) || orderSubtotal < coupon.minimumOrderAmount) {
            return res.json({ success: false, message: `Minimum order value of Rs ${coupon.minimumOrderAmount} is required.` });
        }

        // Calculate discount
        const calculatedDiscount = (orderSubtotal * coupon.discountPercentage) / 100;
        const discountAmount = Math.min(calculatedDiscount, coupon.maximumDiscountAmount);

        res.json({
            success: true,
            message: "Coupon applied successfully!",
            discountAmount: Math.round(discountAmount),
            coupon: {
                code: coupon.code,
                discountPercentage: coupon.discountPercentage,
                maximumDiscountAmount: coupon.maximumDiscountAmount,
                minimumOrderAmount: coupon.minimumOrderAmount
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { validateCoupon };
