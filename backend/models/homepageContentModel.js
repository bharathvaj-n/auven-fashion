import mongoose from 'mongoose'

const homepageContentSchema = new mongoose.Schema({
    type: { 
        type: String, 
        required: true,
        enum: ['hero', 'promotional', 'featuredProducts', 'latestCollection']
    },
    title: { type: String, default: '' },
    subtitle: { type: String, default: '' },
    description: { type: String, default: '' },
    image: { type: String, default: '' },
    buttonText: { type: String, default: '' },
    buttonLink: { type: String, default: '' },
    productIds: [{ type: String }],
    active: { type: Boolean, default: true },
    sortOrder: { type: Number, default: 0 }
}, { timestamps: true })

const homepageContentModel = mongoose.models.homepageContent || mongoose.model('homepageContent', homepageContentSchema)

export default homepageContentModel;
