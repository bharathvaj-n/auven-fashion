import express from 'express';
import { getAllContent, createContent, updateContent, toggleStatus, deleteContent } from '../controllers/homepageContentController.js';
import adminAuth from '../middleware/adminAuth.js';
import upload from '../middleware/multer.js';

const adminHomepageContentRouter = express.Router();

adminHomepageContentRouter.get('/', adminAuth, getAllContent);
adminHomepageContentRouter.post('/', adminAuth, upload.single('image'), createContent);
adminHomepageContentRouter.put('/:id', adminAuth, upload.single('image'), updateContent);
adminHomepageContentRouter.put('/:id/toggle', adminAuth, toggleStatus);
adminHomepageContentRouter.delete('/:id', adminAuth, deleteContent);

export default adminHomepageContentRouter;
