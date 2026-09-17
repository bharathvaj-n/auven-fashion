import mongoose from 'mongoose';
import 'dotenv/config';
import connectDB from './config/mongodb.js';
import { v2 as cloudinary } from 'cloudinary';
import { execSync } from 'child_process';
import fs from 'fs';

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET_KEY
});

const designSchema = new mongoose.Schema({
    name: { type: String, required: true },
    image: { type: String, required: true },
    category: { type: String, required: true }
});
const designModel = mongoose.models.design || mongoose.model('design', designSchema);

async function fixDesigns() {
    await connectDB();
    const designs = await designModel.find({});
    
    for (const design of designs) {
        console.log(`Processing: ${design.name}`);
        const tempInput = `temp_in_${design._id}.png`;
        const tempOutput = `temp_out_${design._id}.png`;
        
        // Download image
        execSync(`curl -s -L "${design.image}" -o ${tempInput}`);
        
        // Run python rembg
        const pyScript = `
from rembg import remove
from PIL import Image

try:
    input_image = Image.open("${tempInput}").convert("RGBA")
    
    max_size = 800
    if input_image.width > max_size or input_image.height > max_size:
        ratio = min(max_size/input_image.width, max_size/input_image.height)
        new_size = (int(input_image.width * ratio), int(input_image.height * ratio))
        input_image = input_image.resize(new_size, Image.Resampling.LANCZOS)
        
    output_image = remove(input_image)
    output_image.save("${tempOutput}")
except Exception as e:
    print("Error:", e)
`;
        fs.writeFileSync(`run_rembg_${design._id}.py`, pyScript);
        console.log("Running Python rembg...");
        execSync(`python run_rembg_${design._id}.py`);
        
        if (fs.existsSync(tempOutput)) {
            console.log(`Uploading fixed image for: ${design.name}`);
            const result = await cloudinary.uploader.upload(tempOutput, {
                folder: 'auven/customizer/uploads',
                resource_type: 'image'
            });
            design.image = result.secure_url;
            await design.save();
            console.log(`Updated DB for: ${design.name}`);
            
            // cleanup
            fs.unlinkSync(tempInput);
            fs.unlinkSync(tempOutput);
            fs.unlinkSync(`run_rembg_${design._id}.py`);
        } else {
            console.log(`Failed to process ${design.name}`);
        }
    }
    console.log("Done!");
    process.exit();
}

fixDesigns();
