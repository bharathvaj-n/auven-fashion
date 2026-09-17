import mongoose from "mongoose";

const productSchema = mongoose.Schema({
    name: { type: String, required: true},
    description: { type: String, required: true},
    price: { type: Number, required: true},
    image: {type: Array, required: true},
    category: { type: String, required: true},
    subcategory: { type: String, required: true},
    sizes: {type: Array, required: true},
    inventory: {
        type: [{
            size: { type: String, required: true },
            quantity: { type: Number, required: true, min: 0 }
        }],
        default: []
    },
    bestseller: {type: Boolean},
    date: { type: Number, required: true},
})

const productModel = mongoose.models.product || mongoose.model('product', productSchema);

export default productModel;