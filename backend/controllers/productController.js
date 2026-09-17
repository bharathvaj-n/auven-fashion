import { v2 as cloudinary } from 'cloudinary';
import productModel from '../models/productModel.js'


// function for add product
const addProduct = async (req, res) => {
    try {        
      const { name, description, category, price, subcategory, bestseller, sizes, inventory } = req.body

      const image1 = req.files.image1 &&  req.files.image1[0]
      const image2 = req.files.image2 &&  req.files.image2[0]
      const image3 = req.files.image3 &&  req.files.image3[0]
      const image4 = req.files.image4 &&  req.files.image4[0]

      const  images = [image1, image2, image3, image4].filter((item) => item !== undefined )

      const imagesUrl = await Promise.all(
        images.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, {resource_type: 'image'});
          return result.secure_url
        })
      );
     
      const parsedSizes = JSON.parse(sizes);
      let parsedInventory = [];
      if (inventory) {
        try {
          const rawInventory = JSON.parse(inventory);
          parsedInventory = rawInventory.filter(item => 
            parsedSizes.includes(item.size) && Number.isInteger(item.quantity) && item.quantity >= 0
          );
        } catch (e) {
          console.log("Error parsing inventory", e);
        }
      }

      const productData = {
        name,
        description,
        category,
        price: Number(price),
        subcategory,
        bestseller: bestseller === "true" ? true : false,
        sizes: parsedSizes,
        inventory: parsedInventory,
        image: imagesUrl,
        date: Date.now()
      }

      console.log(productData);

      const product = new productModel(productData);
      await product.save()

      res.json({ success: true, message: 'Product Added successfully' });
      
    } catch (error) {
      console.log(error);
      res.json({success:false, message: error.message})
    }
 
}


// function for List product
const listProducts = async (req, res) => {
  try {
    const products = await productModel.find({});
    res.json({ success: true, products });
  } catch (error) {
    console.log(error);
    res.json({success:false, message: error.message})
  }
}



// function for removing product
const removeProduct = async (req,res) => {
   try {
    await productModel.findByIdAndDelete(req.body.id)
    res.json({ success: true, message: 'Product removed successfully' });
   } catch (error) {
    console.log(error);
    res.json({success:false, message: error.message})
  }
}




// function for single product info
const singleProduct = async (req,res) => {
  try {  
    const {productId} = req.body
    const product = await productModel.findById(productId)
    res.json({ success: true, product });
  } catch (error) {
    console.log(error);
    res.json({success:false, message: error.message})
  }
}

// function for updating product
const updateProduct = async (req, res) => {
  try {
    const { productId, name, description, category, price, subcategory, bestseller, sizes, inventory, prevImages } = req.body;

    const image1 = req.files.image1 && req.files.image1[0];
    const image2 = req.files.image2 && req.files.image2[0];
    const image3 = req.files.image3 && req.files.image3[0];
    const image4 = req.files.image4 && req.files.image4[0];

    const newImages = [image1, image2, image3, image4].filter((item) => item !== undefined);

    let imagesUrl = [];
    if (newImages.length > 0) {
      imagesUrl = await Promise.all(
        newImages.map(async (item) => {
          let result = await cloudinary.uploader.upload(item.path, { resource_type: 'image' });
          return result.secure_url;
        })
      );
    }

    // Parse prevImages (it will be sent as a JSON string array from frontend if it exists)
    let parsedPrevImages = [];
    if (prevImages) {
      parsedPrevImages = JSON.parse(prevImages);
    }

    // Combine previous images and new images
    const finalImages = [...parsedPrevImages, ...imagesUrl];

    const parsedSizes = JSON.parse(sizes);
    let parsedInventory = [];
    if (inventory) {
      try {
        const rawInventory = JSON.parse(inventory);
        parsedInventory = rawInventory.filter(item => 
          parsedSizes.includes(item.size) && Number.isInteger(item.quantity) && item.quantity >= 0
        );
      } catch (e) {
        console.log("Error parsing inventory", e);
      }
    }

    const updateData = {
      name,
      description,
      category,
      price: Number(price),
      subcategory,
      bestseller: bestseller === "true" ? true : false,
      sizes: parsedSizes,
      inventory: parsedInventory,
      image: finalImages,
    };

    await productModel.findByIdAndUpdate(productId, updateData);

    res.json({ success: true, message: 'Product Updated successfully' });
  } catch (error) {
    console.log(error);
    res.json({ success: false, message: error.message });
  }
};

export {listProducts, addProduct, removeProduct, singleProduct, updateProduct}