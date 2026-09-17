import express from 'express';
import { getDashboardData } from '../controllers/dashboardController.js';
import adminAuth from '../middleware/adminAuth.js';

const dashboardRouter = express.Router();

dashboardRouter.get('/', adminAuth, getDashboardData);

export default dashboardRouter;
