import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"


// add products to user cart
const addToCart = async (req,res) => {
   try {
   const { userId, itemId, size, quantity = 1 } = req.body
   
   if (quantity < 1 || isNaN(quantity)) {
     return res.json({success: false, message: "Invalid quantity"})
   }

   const userData = await userModel.findById(userId)
   let cartData = await userData.cartData;
   
   let currentQuantity = 0;
   if(cartData[itemId] && cartData[itemId][size]) {
       currentQuantity = cartData[itemId][size];
   }
   const newQuantity = currentQuantity + quantity;

   const product = await productModel.findById(itemId);
   if (!product) {
       return res.json({success: false, message: "Product not found"});
   }
   if (!product.inventory || product.inventory.length === 0) {
       return res.json({success: false, message: "Stock information is unavailable."});
   }
   const inventoryItem = product.inventory.find(item => item.size === size);
   if (!inventoryItem) {
       return res.json({success: false, message: "Size is out of stock."});
   }
   if (newQuantity > inventoryItem.quantity) {
       return res.json({success: false, message: `Only ${inventoryItem.quantity} items are available for size ${size}.`});
   }

   if(cartData[itemId]) {
    cartData[itemId][size] = newQuantity;
   }else {
    cartData[itemId] = {}
    cartData[itemId][size] = newQuantity;
   }

   await userModel.findByIdAndUpdate(userId, {cartData})
   res.json({success: true, message: "Added To Cart"})

   } catch (error) {
      console.log(error)
      res.json({success: false, message: error.message})
   }

}


// update user cart
const updateCart = async (req,res) => {
   try {
    const { userId, itemId, size, quantity } = req.body
    const userData = await userModel.findById(userId)
    let cartData = await userData.cartData;

    const product = await productModel.findById(itemId);
    if (!product) {
        return res.json({success: false, message: "Product not found"});
    }
    if (!product.inventory || product.inventory.length === 0) {
        return res.json({success: false, message: "Stock information is unavailable."});
    }
    const inventoryItem = product.inventory.find(item => item.size === size);
    if (!inventoryItem) {
        return res.json({success: false, message: "Size is out of stock."});
    }
    if (quantity > inventoryItem.quantity) {
        return res.json({success: false, message: `Only ${inventoryItem.quantity} items are available for size ${size}.`});
    }

    cartData[itemId][size] = quantity

    await userModel.findByIdAndUpdate(userId, {cartData})
    res.json({success: true, message: "Cart Updated"})
   } catch (error) {
    console.log(error)
    res.json({ success: false, message: error.message })
   }

}



// get user cart data
const getUserCart = async (req,res) => {
   try {
   const { userId } = req.body

   const userData = await userModel.findById(userId)
   let cartData = await userData.cartData;

   res.json({success: true, cartData: userData.cartData })

   } catch (error) {
    console.log(error)
    res.json({success: false, message: error.message})

   }

}


export {addToCart, updateCart, getUserCart}