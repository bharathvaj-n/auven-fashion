import express from 'express';
import { getPublicHomepageContent } from '../controllers/homepageContentController.js';

const homepageContentRouter = express.Router();

homepageContentRouter.get('/', getPublicHomepageContent);

export default homepageContentRouter;
