import mongoose from 'mongoose'

const userSchema = mongoose.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true, unique: true},
    password: { type: String, required: false}, // Made optional for Firebase
    firebaseUid: { type: String, required: false}, // Added for Firebase mapping
    cartData: { type: Object, default: {} },
    addresses: [{
        name: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String, default: "" },
        city: { type: String, required: true },
        state: { type: String, required: true },
        postalCode: { type: String, required: true },
        country: { type: String, required: true },
        isDefault: { type: Boolean, default: false }
    }]
},{minimize: false})

const userModel = mongoose.models.user || mongoose.model('user', userSchema)

export default userModel