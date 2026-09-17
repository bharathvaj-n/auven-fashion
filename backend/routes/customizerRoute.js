import express from 'express';
import { uploadCustomizerImage, getDesigns, getAdminDesigns, addAdminDesign, updateAdminDesign, deleteAdminDesign } from '../controllers/customizerController.js';
import upload from '../middleware/multer.js';
import authUser from '../middleware/auth.js';
import adminAuth from '../middleware/adminAuth.js';

const customizerRouter = express.Router();

// Route for customer image uploads (requires authentication)
customizerRouter.post('/upload', authUser, upload.single('image'), uploadCustomizerImage);

// Route for getting predefined designs
customizerRouter.get('/designs', getDesigns);



// Admin Routes for Design Library
customizerRouter.get('/admin/designs', adminAuth, getAdminDesigns);
customizerRouter.post('/admin/designs', adminAuth, upload.single('image'), addAdminDesign);
customizerRouter.put('/admin/designs/:id', adminAuth, upload.single('image'), updateAdminDesign);
customizerRouter.delete('/admin/designs/:id', adminAuth, deleteAdminDesign);

export default customizerRouter;
