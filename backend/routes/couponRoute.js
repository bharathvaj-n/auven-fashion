import express from 'express';
import { validateCoupon } from '../controllers/couponController.js';
import authUser from '../middleware/auth.js';

const couponRouter = express.Router();

couponRouter.post('/validate', authUser, validateCoupon);

export default couponRouter;
