import express from 'express';
import { getCustomers, getCustomerDetails, getCustomerOrders } from '../controllers/adminCustomerController.js';
import adminAuth from '../middleware/adminAuth.js';

const adminCustomerRouter = express.Router();

adminCustomerRouter.get('/', adminAuth, getCustomers);
adminCustomerRouter.get('/:id', adminAuth, getCustomerDetails);
adminCustomerRouter.get('/:id/orders', adminAuth, getCustomerOrders);

export default adminCustomerRouter;
