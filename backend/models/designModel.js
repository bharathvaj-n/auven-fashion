import mongoose from "mongoose";

const designSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true },
    active: { type: Boolean, default: true }
});

const designModel = mongoose.models.design || mongoose.model("design", designSchema);

export default designModel;
