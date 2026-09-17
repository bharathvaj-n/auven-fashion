import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";

import productModel from "../models/productModel.js";

// Placing orders using COD Method

const placeOrder = async (req,res) => {
  try {
   const{ userId, items, amount, address} = req.body;

   // 1. Initial stock validation loop
   for (const item of items) {
       const product = await productModel.findById(item._id);
       if (!product || !product.inventory) {
          return res.json({success: false, message: `Product ${item.name} not found or stock information unavailable.`});
       }
       const inventoryItem = product.inventory.find(inv => inv.size === item.size);
       if (!inventoryItem || inventoryItem.quantity < item.quantity) {
          return res.json({success: false, message: `Insufficient stock for ${item.name} (Size: ${item.size}).`});
       }
   }
   
   // 2. Atomic stock deduction
   const deductedItems = [];
   for (const item of items) {
      const updateResult = await productModel.updateOne(
        { _id: item._id, "inventory.size": item.size, "inventory.quantity": { $gte: item.quantity } },
        { $inc: { "inventory.$.quantity": -item.quantity } }
      );
      
      if (updateResult.modifiedCount === 0) {
        // Rollback previous deductions if a race condition happened
        for (const deducted of deductedItems) {
            await productModel.updateOne(
              { _id: deducted._id, "inventory.size": deducted.size },
              { $inc: { "inventory.$.quantity": deducted.quantity } }
            );
        }
        return res.json({success: false, message: `Insufficient stock for ${item.name} (Size: ${item.size}) due to concurrent order.`});
      }
      deductedItems.push(item);
   }

   const orderData = {
    userId,
    items,
    address,
    amount,
    paymentMethod: 'Cash On Delivery',
    payment: 'false',
    date: Date.now()
   }
    const newOrder = new orderModel(orderData)
    await newOrder.save()

    await userModel.findByIdAndUpdate(userId, {cartData:{}})
    res.json({success: true, message: 'Order Placed'})

  } catch (error) {
    console.log(error)
    res.json({success:false, message:error.message})
  }

}


// All Orders data for Admin panel

const allOrders = async (req,res) => {
  try {     
    const orders = await orderModel.find({})
    res.json({success: true, orders})

  } catch (error) {
      console.log(error)
      res.json({success:false, message:error.message})
  }
}



// User Order Data for Frontend
const userOrders = async (req,res) => {
  try {
    const { userId } = req.body
    const orders = await orderModel.find({ userId })
    res.json({success: true, orders})
  } catch (error) {
      console.log(error)
      res.json({success:false, message:error.message})
  }
}



// update order status from Admin Panel
const updateStatus = async (req, res) => {
  try{
    const {orderId, status} = req.body
    await orderModel.findByIdAndUpdate(orderId, {status})
    res.json({success: true, message: "Order Status Updated"})
  } catch (error){
    console.log(error)
    res.json({success:false, message:error.message})
  }
}


export {placeOrder, allOrders, userOrders, updateStatus}