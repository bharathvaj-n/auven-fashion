import express from 'express'
import { addToCart, getUserCart, updateCart, addStandaloneCustomized, updateStandaloneCustomized } from '../controllers/cartController.js'
import authUser from '../middleware/auth.js'


const cartRouter = express.Router()

cartRouter.post('/get', authUser, getUserCart)
cartRouter.post('/add', authUser, addToCart)

cartRouter.post('/update', authUser, updateCart)
cartRouter.post('/addStandaloneCustomized', authUser, addStandaloneCustomized)
cartRouter.post('/updateStandaloneCustomized', authUser, updateStandaloneCustomized)

export default cartRouter