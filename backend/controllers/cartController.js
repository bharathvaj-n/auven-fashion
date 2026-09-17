import userModel from "../models/userModel.js"
import productModel from "../models/productModel.js"
import designModel from "../models/designModel.js"
import { STANDALONE_CUSTOM_BASE_PRICE, STANDALONE_CUSTOM_OBJECT_PRICE } from "../config/constants.js"

// Helper to calculate total used quantity for a specific variant across the cart
const getCartVariantUsage = (cartData, itemId, targetSize, targetColour, skipCustomKey = null) => {
    let total = 0;
    const itemData = cartData[itemId] || {};
    const tCol = targetColour || '';
    
    for (const key in itemData) {
        if (key === skipCustomKey) continue;
        
        const cartItem = itemData[key];
        if (typeof cartItem === 'object') {
            if (cartItem.size === targetSize && (cartItem.colour || '') === tCol) {
                total += cartItem.quantity || 0;
            }
        } else {
            if (key === targetSize && tCol === '') {
                total += cartItem;
            }
        }
    }
    return total;
};

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
   const inventoryItem = product.inventory.find(item => item.size === size && (item.colour || '') === '');
   if (!inventoryItem) {
       return res.json({success: false, message: "Size is out of stock."});
   }
   
   const usedQty = getCartVariantUsage(cartData, itemId, size, '');
   if (usedQty + quantity > inventoryItem.quantity) {
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

    const isCustomKey = size && size.startsWith('custom_');

    if (itemId === 'custom_standalone') {
        if (cartData[itemId] && cartData[itemId][size]) {
            cartData[itemId][size].quantity = quantity;
        }
    } else if (isCustomKey) {
        const cartItem = cartData[itemId] && cartData[itemId][size];
        if (cartItem) {
            const itemColour = cartItem.colour || '';
            const itemSize = cartItem.size;
            
            const product = await productModel.findById(itemId);
            if (!product) return res.json({success: false, message: "Product not found"});
            
            const variant = product.inventory?.find(i => i.size === itemSize && (i.colour || '') === itemColour);
            if (!variant) return res.json({success: false, message: "This variant is out of stock."});
            
            const usedQty = getCartVariantUsage(cartData, itemId, itemSize, itemColour, size);
            if (usedQty + quantity > variant.quantity) {
                return res.json({ success: false, message: `Only ${variant.quantity} units available for ${itemColour ? itemColour + ' / ' : ''}${itemSize}.` });
            }
            cartData[itemId][size].quantity = quantity;
        }
    } else {
        // Normal item inventory validation
        const product = await productModel.findById(itemId);
        if (!product) {
            return res.json({success: false, message: "Product not found"});
        }
        if (!product.inventory || product.inventory.length === 0) {
            return res.json({success: false, message: "Stock information is unavailable."});
        }
        const inventoryItem = product.inventory.find(item => item.size === size && (item.colour || '') === '');
        if (!inventoryItem) {
            return res.json({success: false, message: "Size is out of stock."});
        }
        
        const usedQty = getCartVariantUsage(cartData, itemId, size, '', size);
        if (usedQty + quantity > inventoryItem.quantity) {
            return res.json({success: false, message: `Only ${inventoryItem.quantity} items are available for size ${size}.`});
        }
        
        if (!cartData[itemId]) cartData[itemId] = {};
        cartData[itemId][size] = quantity;
    }

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


// add standalone customized t-shirt
const addStandaloneCustomized = async (req, res) => {
    try {
        const { userId, customKey, colour, customization, quantity = 1 } = req.body;
        
        if (quantity < 1 || isNaN(quantity)) {
            return res.json({ success: false, message: "Invalid quantity" });
        }
        
        // Basic validation
        if (!customization || !customization.objects || customization.objects.length === 0) {
            return res.json({ success: false, message: "Customization must have at least one object." });
        }

        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;
        
        if (!cartData['custom_standalone']) {
            cartData['custom_standalone'] = {};
        }

        const numObjects = customization.objects.length;
        const calculatedPrice = STANDALONE_CUSTOM_BASE_PRICE + (numObjects * STANDALONE_CUSTOM_OBJECT_PRICE);

        if (cartData['custom_standalone'][customKey]) {
            cartData['custom_standalone'][customKey].quantity += quantity;
            cartData['custom_standalone'][customKey].price = calculatedPrice;
        } else {
            cartData['custom_standalone'][customKey] = {
                quantity,
                colour,
                isCustomized: true,
                customization,
                price: calculatedPrice
            };
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Customized T-Shirt Added To Cart" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}

// update standalone customized t-shirt
const updateStandaloneCustomized = async (req, res) => {
    try {
        const { userId, oldCustomKey, newCustomKey, colour, customization, quantity = 1 } = req.body;

        if (quantity < 1 || isNaN(quantity)) {
            return res.json({ success: false, message: "Invalid quantity" });
        }
        
        if (!customization || !customization.objects || customization.objects.length === 0) {
            return res.json({ success: false, message: "Customization must have at least one object." });
        }

        const userData = await userModel.findById(userId);
        let cartData = await userData.cartData;
        
        if (!cartData['custom_standalone']) {
            cartData['custom_standalone'] = {};
        }

        // Remove old key locally
        if (cartData['custom_standalone'][oldCustomKey]) {
            delete cartData['custom_standalone'][oldCustomKey];
        }

        const numObjects = customization.objects.length;
        const calculatedPrice = STANDALONE_CUSTOM_BASE_PRICE + (numObjects * STANDALONE_CUSTOM_OBJECT_PRICE);

        if (cartData['custom_standalone'][newCustomKey]) {
            cartData['custom_standalone'][newCustomKey].quantity = quantity;
            cartData['custom_standalone'][newCustomKey].price = calculatedPrice;
        } else {
            cartData['custom_standalone'][newCustomKey] = {
                quantity,
                colour,
                isCustomized: true,
                customization,
                price: calculatedPrice
            };
        }

        await userModel.findByIdAndUpdate(userId, { cartData });
        res.json({ success: true, message: "Customized Cart Updated" });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
}


export { addToCart, updateCart, getUserCart, addStandaloneCustomized, updateStandaloneCustomized }