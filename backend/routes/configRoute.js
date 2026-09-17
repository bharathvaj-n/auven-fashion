import express from 'express';
import { STANDALONE_CUSTOM_BASE_PRICE, STANDALONE_CUSTOM_OBJECT_PRICE } from '../config/constants.js';

const configRouter = express.Router();

configRouter.get('/constants', (req, res) => {
    res.json({
        success: true,
        constants: {
            STANDALONE_CUSTOM_BASE_PRICE,
            STANDALONE_CUSTOM_OBJECT_PRICE
        }
    });
});

export default configRouter;
