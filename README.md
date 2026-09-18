# AUVEN Fashion

AUVEN Fashion is a MERN-based customized T-shirt e-commerce platform that allows customers to browse products, design personalized T-shirts, preview their designs, manage carts, complete checkout and track orders. It also provides an administrative panel for product, inventory, order, customer, design, coupon and homepage management.

## Live Demo

- Customer Website: [https://auven-fashion.vercel.app/](https://auven-fashion.vercel.app/)
- Admin Panel: [https://auven-fashion-63a6.vercel.app/](https://auven-fashion-63a6.vercel.app/)
- Backend API: [https://auven-fashion-1.onrender.com/](https://auven-fashion-1.onrender.com/)
- GitHub: [https://github.com/bharathvaj-n/auven-fashion.git](https://github.com/bharathvaj-n/auven-fashion.git)

## Project Overview

The primary purpose of AUVEN Fashion is to provide a complete ecosystem for a customized clothing brand. The platform supports a customer storefront for browsing and buying products, an interactive T-shirt customization engine, cart management, secure checkout, and order tracking along with customer profile features. It also includes an admin management portal for store owners to manage the entire lifecycle of the store.

## Customer Features

- User registration and login
- Product browsing
- Product search
- Product filtering (by category and subcategory)
- Product details
- Size selection
- T-shirt customization
- Text customization
- Image upload
- Predefined design library
- Design positioning
- Design resizing
- Customization preview
- Customized cart items
- Cart quantity management
- Coupons
- Checkout
- Saved addresses
- Customer profile
- Order history
- Order status tracking
- Payment flow (Stripe & COD)

## T-Shirt Customizer

The core of AUVEN Fashion is an interactive T-shirt customization engine that allows customers to design their own apparel. 
- Standalone T-shirt customization
- T-shirt colour selection
- Size selection
- Text objects
- Text editing
- Image upload
- Multiple customization objects
- Object positioning
- Object resizing
- Object deletion
- Printable area restrictions
- Preview
- Add to cart

## Admin Panel

The dedicated admin panel empowers store managers with comprehensive operational control:
- **Admin authentication:** Secure login for authorized personnel.
- **Dashboard:** Overview of sales, order statistics, and recent activity.
- **Product management:** Full control over product listings, details, pricing, and images.
- **Inventory management:** Stock tracking and size-level inventory control.
- **Order management:** View and update the fulfillment status of customer orders.
- **Customer management:** View registered customers and their details.
- **Design Library:** Manage the predefined design assets available to customers in the customizer.
- **Coupon management:** Create and manage promotional discount codes.
- **Homepage content management:** Control dynamic banners and featured collections displayed on the storefront.

## Technology Stack

| Layer | Technology |
|------|------------|
| Frontend | React.js |
| Backend | Node.js, Express.js |
| Database | MongoDB, Mongoose |
| Authentication | JWT |
| Image Storage | Cloudinary |
| File Upload | Multer |
| API | REST |
| Customer Deployment | Vercel |
| Admin Deployment | Vercel |
| Backend Deployment | Render |

## System Architecture

Customer
   ↓
React Frontend
   ↓
Express REST API
   ↓
Node.js Backend
   ↓
MongoDB / Mongoose

Supporting services:
Cloudinary → Image Storage
Stripe → Online Payment
Vercel → Frontend/Admin Deployment
Render → Backend Deployment

## Project Structure

```
AUVEN/
├── admin/
│   └── src/
├── backend/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   └── server.js
├── documentation/
├── frontend/
│   └── src/
└── README.md
```

## REST API

The Node.js backend exposes structured REST endpoints to support all frontend and admin operations:
- Authentication
- Products
- Cart
- Customizer
- Orders
- Customers
- Dashboard
- Coupons
- Design Library
- Homepage Content

**Base API URL:** [https://auven-fashion-1.onrender.com/](https://auven-fashion-1.onrender.com/)

*Note: For complete details, please refer to the AUVEN API Documentation provided in the `documentation/` folder.*

## Database

MongoDB is used as the primary application database and Mongoose is used for schema and model management. The major models present in the project include:
- User
- Product
- Order
- Coupon
- Design
- Homepage Content

## Security & Backend Validation

The platform incorporates several security mechanisms to ensure safe transactions and data integrity:
- Authentication middleware
- Admin authorization
- Password hashing (bcrypt)
- JWT validation
- Server-side price calculation
- Server-side coupon validation
- Inventory validation
- File type/size validation
- Environment variables for secrets
- Protected admin routes
- Protected customer routes

## Customization Data

Customized cart items retain structured customization information throughout the checkout process, including:
- Base template / Product
- Colour
- Size
- Printable area
- Customization objects (text and images)

## Installation

### Clone

```bash
git clone https://github.com/bharathvaj-n/auven-fashion.git
cd auven-fashion
```

### Setup Backend

```bash
cd backend
npm install
npm run server
```

### Setup Frontend

```bash
cd ../frontend
npm install
npm run dev
```

### Setup Admin Panel

```bash
cd ../admin
npm install
npm run dev
```

## Environment Variables

To run this project locally, you will need to add the following environment variables. Copy the respective `.env.example` to `.env` in each directory.

**Backend (`backend/.env`):**
```
PORT=
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_SECRET_KEY=
ADMIN_EMAIL=
ADMIN_PASSWORD=
STRIPE_PUBLISHABLE_KEY=
STRIPE_SECRET_KEY=
```

**Frontend (`frontend/.env`):**
```
VITE_BACKEND_URL=
```

**Admin (`admin/.env`):**
```
VITE_BACKEND_URL=
```

## Deployment

- **Customer Frontend:** [https://auven-fashion.vercel.app/](https://auven-fashion.vercel.app/)
- **Admin Panel:** [https://auven-fashion-63a6.vercel.app/](https://auven-fashion-63a6.vercel.app/)
- **Backend API:** [https://auven-fashion-1.onrender.com/](https://auven-fashion-1.onrender.com/)

The customer frontend and admin panel are deployed on Vercel. The backend API is hosted on Render. MongoDB Atlas is used as the managed database, and Cloudinary is used for cloud media storage.

## Demo Credentials

**Customer:**
- Email: `<ADD DEMO CUSTOMER EMAIL>`
- Password: `<ADD DEMO CUSTOMER PASSWORD>`

**Admin:**
- Email: `<ADD DEMO ADMIN EMAIL>`
- Password: `<ADD DEMO ADMIN PASSWORD>`

## Documentation

- **User Documentation:** A comprehensive User Manual (`AUVEN_User_Documentation.pdf`) is available in the `documentation/` folder.
- **API Documentation:** Technical API Documentation (`AUVEN_API_Documentation.pdf`) is available in the `documentation/` folder.

## PRD Alignment

| Requirement Area | Implementation |
|---|---|
| MERN Stack | Implemented |
| Customer Storefront | Implemented |
| Product Browsing | Implemented |
| T-Shirt Customization | Implemented |
| Cart | Implemented |
| Checkout | Implemented |
| Orders | Implemented |
| Admin Panel | Implemented |
| Inventory | Implemented |
| Design Library | Implemented |
| Customer Management | Implemented |
| Coupons | Implemented |
| Homepage Content | Implemented |
| REST APIs | Implemented |
| MongoDB | Implemented |
| Deployment | Implemented |

## Customer Flow

Register/Login
↓
Browse Products
↓
Search / Filter
↓
View Product
↓
Customize T-shirt
↓
Select Size / Colour
↓
Add Text / Image / Design
↓
Preview
↓
Add to Cart
↓
Apply Coupon
↓
Checkout
↓
Payment / COD
↓
Order Confirmation
↓
Order History / Tracking

## Admin Flow

Admin Login
↓
Dashboard
↓
Products / Inventory
↓
Design Library
↓
Customers
↓
Orders
↓
Coupons
↓
Homepage Content

## Responsive Design

The platform is fully responsive and optimized for:
- Mobile
- Tablet
- Desktop

## Verification Notes

- Payment gateway availability depends on production Stripe configuration.
- Environment variables must be configured properly for local testing and deployment.
- Demo credentials should be provided separately for evaluation.
