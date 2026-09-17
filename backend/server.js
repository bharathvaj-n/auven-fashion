import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connnectDB from './config/mongodb.js'
import connectCloudinary from './config/cloudinary.js'
import userRouter from './routes/userRoute.js'
import productRouter from './routes/productRoute.js'
import cartRouter from './routes/cartRoute.js'
import orderRouter from './routes/orderRoute.js'
import customizerRouter from './routes/customizerRoute.js'
import configRouter from './routes/configRoute.js'
import dashboardRouter from './routes/dashboardRoute.js'
import adminCustomerRouter from './routes/adminCustomerRoute.js'
import couponRouter from './routes/couponRoute.js'
import adminCouponRouter from './routes/adminCouponRoute.js'
import homepageContentRouter from './routes/homepageContentRoute.js'
import adminHomepageContentRouter from './routes/adminHomepageContentRoute.js'

// App Config

const app = express()
const Port = process.env.PORT || 4000
connnectDB()
connectCloudinary()

// Middleware
app.use(express.json())
app.use(cors())



// API Endpoints
app.use('/api/user', userRouter)
app.use('/api/product', productRouter)
app.use('/api/cart', cartRouter)
app.use('/api/order', orderRouter)
app.use('/api/customizer', customizerRouter)
app.use('/api/config', configRouter)
app.use('/api/admin/dashboard', dashboardRouter)
app.use('/api/admin/customers', adminCustomerRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/admin/coupons', adminCouponRouter)
app.use('/api/homepage', homepageContentRouter)
app.use('/api/admin/homepage', adminHomepageContentRouter)

app.get('/', (req,res) => {
    res.send('API Working')
})

app.listen(Port,() => console.log('Server is running on port : '+ Port))
