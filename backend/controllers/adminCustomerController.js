import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';

// Get list of all customers (with optional search)
const getCustomers = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};

        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { email: { $regex: search, $options: 'i' } }
                ]
            };
        }

        // Fetch users without sensitive fields
        const users = await userModel.find(query).select('-password -cartData').lean();

        // Calculate order counts for each user (for a small/medium DB this is acceptable, but could be optimized via aggregation)
        // Here we'll use aggregation to get order counts for all users at once
        const orderCounts = await orderModel.aggregate([
            { $group: { _id: "$userId", count: { $sum: 1 } } }
        ]);

        const orderCountMap = {};
        orderCounts.forEach(item => {
            orderCountMap[item._id] = item.count;
        });

        // Map data for response
        const customers = users.map(user => {
            // Extract join date from MongoDB ObjectId
            const joinedDate = user._id.getTimestamp();
            
            // Extract phone from first available address
            let phone = 'N/A';
            if (user.addresses && user.addresses.length > 0) {
                const defaultAddr = user.addresses.find(a => a.isDefault);
                phone = defaultAddr ? defaultAddr.phone : user.addresses[0].phone;
            }

            return {
                id: user._id,
                name: user.name,
                email: user.email,
                phone: phone,
                ordersCount: orderCountMap[user._id.toString()] || 0,
                joinedDate: joinedDate
            };
        });

        // Sort by joined date descending
        customers.sort((a, b) => b.joinedDate - a.joinedDate);

        res.json({ success: true, customers });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get single customer details + summary
const getCustomerDetails = async (req, res) => {
    try {
        const { id } = req.params;
        
        const user = await userModel.findById(id).select('-password -cartData');
        if (!user) {
            return res.json({ success: false, message: "Customer not found" });
        }

        const joinedDate = user._id.getTimestamp();

        // Calculate order summary
        const orders = await orderModel.find({ userId: id });
        
        const totalOrders = orders.length;
        const totalSpent = orders.reduce((sum, order) => sum + order.amount, 0);
        
        let latestOrderDate = null;
        if (orders.length > 0) {
            // Sort to find the latest
            orders.sort((a, b) => b.date - a.date);
            latestOrderDate = orders[0].date;
        }

        res.json({
            success: true,
            customer: {
                id: user._id,
                name: user.name,
                email: user.email,
                joinedDate: joinedDate,
                addresses: user.addresses || []
            },
            summary: {
                totalOrders,
                totalSpent,
                latestOrderDate
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// Get customer's orders
const getCustomerOrders = async (req, res) => {
    try {
        const { id } = req.params;
        
        const orders = await orderModel.find({ userId: id }).sort({ date: -1 });
        
        res.json({ success: true, orders });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getCustomers, getCustomerDetails, getCustomerOrders };
