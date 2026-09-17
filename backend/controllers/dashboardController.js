import productModel from '../models/productModel.js';
import userModel from '../models/userModel.js';
import orderModel from '../models/orderModel.js';

const getDashboardData = async (req, res) => {
    try {
        const LOW_STOCK_THRESHOLD = 5;

        // Fetch counts
        const totalProducts = await productModel.countDocuments();
        
        // Count users (excluding admin if admin uses same collection, but here admins are hardcoded in .env, so all users in collection are customers)
        const totalCustomers = await userModel.countDocuments();
        const totalOrders = await orderModel.countDocuments();

        // Calculate Revenue (Sum of 'amount' across all orders)
        const revenueResult = await orderModel.aggregate([
            { $group: { _id: null, total: { $sum: "$amount" } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Order Statuses
        // Pending: Order Placed
        // Processing: Packing, Shipped, Out for delivery
        // Delivered: Delivered
        const pending = await orderModel.countDocuments({ status: "Order Placed" });
        const processing = await orderModel.countDocuments({ status: { $in: ["Packing", "Shipped", "Out for delivery"] } });
        const delivered = await orderModel.countDocuments({ status: "Delivered" });

        // Recent Orders
        const recentOrders = await orderModel.find()
            .sort({ date: -1 })
            .limit(10)
            .select('_id address.firstName address.lastName amount status paymentMethod date');

        // Low Stock Products
        // Query products where at least one inventory item has quantity <= LOW_STOCK_THRESHOLD
        const allProducts = await productModel.find({ 'inventory.quantity': { $lte: LOW_STOCK_THRESHOLD } }, 'name inventory');
        
        const lowStockProducts = [];
        allProducts.forEach(product => {
            product.inventory.forEach(variant => {
                if (variant.quantity <= LOW_STOCK_THRESHOLD) {
                    lowStockProducts.push({
                        productId: product._id,
                        name: product.name,
                        size: variant.size,
                        colour: variant.colour,
                        stock: variant.quantity
                    });
                }
            });
        });

        res.json({
            success: true,
            dashboard: {
                statistics: {
                    totalProducts,
                    totalCustomers,
                    totalOrders,
                    totalRevenue
                },
                orderStatus: {
                    pending,
                    processing,
                    delivered
                },
                recentOrders,
                lowStockProducts
            }
        });

    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { getDashboardData };
