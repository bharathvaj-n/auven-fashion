# AUVEN Fashion

Customized T-Shirt E-Commerce Platform

## Features

### Customer
- Registration/Login
- Product browsing
- Search
- Filters
- T-shirt customization
- Text customization
- Image upload
- Design library
- Cart
- Coupons
- Checkout
- Payment
- Order tracking
- Profile
- Saved addresses

### Admin
- Dashboard
- Product management
- Inventory
- Orders
- Customers
- Coupons
- Design Library
- Homepage Content

## Tech Stack
- React
- Vite
- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT
- Cloudinary
- Stripe / Razorpay (Payment Gateways)

---

## Project Structure

- `frontend/` - Customer facing application
- `backend/` - Node.js REST API
- `admin/` - Admin dashboard application

---

## Local Development

### 1. Installation

From the project root, install dependencies for each component:

```bash
cd backend
npm install

cd ../frontend
npm install

cd ../admin
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` in the following directories and fill in the required values:
- `backend/`
- `frontend/`
- `admin/`

### 3. Start Servers

Open three separate terminals and run:

**Backend:**
```bash
cd backend
npm run server
```

**Frontend:**
```bash
cd frontend
npm run dev
```

**Admin:**
```bash
cd admin
npm run dev
```
