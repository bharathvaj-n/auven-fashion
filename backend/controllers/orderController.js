import orderModel from "../models/orderModel.js";
import userModel from "../models/userModel.js";
import productModel from "../models/productModel.js";
import Stripe from 'stripe';
import crypto from 'crypto';
import { STANDALONE_CUSTOM_BASE_PRICE, STANDALONE_CUSTOM_OBJECT_PRICE } from "../config/constants.js";

// Placing orders using COD Method

const placeOrder = async (req,res) => {
  try {
   const{ userId, items, amount, address} = req.body;

   // 1. Initial stock validation loop
   for (const item of items) {
       if (item._id === 'custom_standalone') continue;
       
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
      if (item._id === 'custom_standalone') continue;
      
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
        res.json({success:false, message:error.message});
    }
}

// Placing orders using Stripe Method
const placeOrderStripe = async (req,res) => {
    try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
        
        const { userId, items, address } = req.body;
        const { origin } = req.headers;

        const delivery_fee = 10;
        let totalAmount = 0;
        
        // Calculate authoritative amount and prepare line items
        const line_items = [];
        
        for (const item of items) {
            let itemName = item.name;
            let itemPrice = 0;
            
            if (item._id === 'custom_standalone') {
                const numObjects = item.customization?.objects?.length || 0;
                itemPrice = STANDALONE_CUSTOM_BASE_PRICE + (numObjects * STANDALONE_CUSTOM_OBJECT_PRICE);
                itemName = "Customized T-Shirt (Size: " + item.size + ")";
            } else {
                const product = await productModel.findById(item._id);
                if (!product) {
                    return res.json({success: false, message: `Product ${item.name} not found.`});
                }
                itemPrice = product.price;
                itemName = item.name + " (Size: " + item.size + ")";
            }
            
            totalAmount += itemPrice * item.quantity;
            
            line_items.push({
                price_data: {
                    currency: 'inr',
                    product_data: {
                        name: itemName,
                    },
                    unit_amount: itemPrice * 100, // paise
                },
                quantity: item.quantity,
            });
        }
        
        totalAmount += delivery_fee;
        
        // Add delivery fee as a line item
        line_items.push({
            price_data: {
                currency: 'inr',
                product_data: {
                    name: 'Delivery Fee',
                },
                unit_amount: delivery_fee * 100,
            },
            quantity: 1,
        });
        
        const orderData = {
            userId,
            items,
            address,
            amount: totalAmount,
            paymentMethod: 'Stripe',
            payment: false,
            date: Date.now()
        };
        
        const newOrder = new orderModel(orderData);
        await newOrder.save();
        
        const session = await stripe.checkout.sessions.create({
            success_url: `${origin}/verify?success=true&orderId=${newOrder._id}`,
            cancel_url: `${origin}/verify?success=false&orderId=${newOrder._id}`,
            line_items,
            mode: 'payment',
        });
        
        res.json({success: true, session_url: session.url});
        
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
    }
}

// Verify Stripe
const verifyStripe = async (req,res) => {
    try {
        const { orderId, success, userId } = req.body;
        
        if (success === "true") {
            // deduct inventory
            const order = await orderModel.findById(orderId);
            if(order) {
                // strict inventory deduction
                for (const item of order.items) {
                    if (item._id === 'custom_standalone') continue;
                    await productModel.updateOne(
                        { _id: item._id, "inventory.size": item.size },
                        { $inc: { "inventory.$.quantity": -item.quantity } }
                    );
                }
            }
            await orderModel.findByIdAndUpdate(orderId, { payment: true, paymentStatus: 'paid' });
            await userModel.findByIdAndUpdate(userId, { cartData: {} });
            res.json({success: true, message: "Payment Successful"});
        } else {
            await orderModel.findByIdAndDelete(orderId);
            res.json({success: false, message: "Payment was cancelled"});
        }
        
    } catch (error) {
        console.log(error);
        res.json({success:false, message:error.message});
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


export {placeOrder, placeOrderStripe, verifyStripe, allOrders, userOrders, updateStatus}