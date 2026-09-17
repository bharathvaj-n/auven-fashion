import mongoose from 'mongoose'

const couponSchema = new mongoose.Schema({
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discountPercentage: { type: Number, required: true, min: 1, max: 100 },
    minimumOrderAmount: { type: Number, required: true, min: 0 },
    maximumDiscountAmount: { type: Number, required: true, min: 0 },
    expiryDate: { type: Date, required: true },
    active: { type: Boolean, default: true }
}, { timestamps: true })

const couponModel = mongoose.models.coupon || mongoose.model('coupon', couponSchema)

export default couponModel;
