import express from 'express';
import { getCoupons, createCoupon, updateCoupon, toggleCouponStatus, deleteCoupon } from '../controllers/adminCouponController.js';
import adminAuth from '../middleware/adminAuth.js';

const adminCouponRouter = express.Router();

adminCouponRouter.get('/', adminAuth, getCoupons);
adminCouponRouter.post('/', adminAuth, createCoupon);
adminCouponRouter.put('/:id', adminAuth, updateCoupon);
adminCouponRouter.put('/:id/toggle', adminAuth, toggleCouponStatus);
adminCouponRouter.delete('/:id', adminAuth, deleteCoupon);

export default adminCouponRouter;
