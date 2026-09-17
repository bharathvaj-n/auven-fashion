import express from 'express';
import { loginUser, registerUser, adminLogin, getProfile, updateProfile, changePassword, addAddress, updateAddress, deleteAddress, setDefaultAddress } from '../controllers/userController.js';
import authUser from '../middleware/auth.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);

// Profile & Password routes
userRouter.get('/profile', authUser, getProfile);
userRouter.put('/profile', authUser, updateProfile);
userRouter.put('/change-password', authUser, changePassword);

// Address routes
userRouter.post('/addresses', authUser, addAddress);
userRouter.put('/addresses/:addressId', authUser, updateAddress);
userRouter.delete('/addresses/:addressId', authUser, deleteAddress);
userRouter.put('/addresses/:addressId/default', authUser, setDefaultAddress);

export default userRouter;
