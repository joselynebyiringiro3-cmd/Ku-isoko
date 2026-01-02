# Ku-isoko - Multi-Vendor E-Commerce Platform

A full-stack multi-vendor e-commerce web application built with Node.js, Express, React, and MongoDB.

## 🎯 Project Overview

Ku-isoko is a comprehensive e-commerce platform that enables:
- **Customers** to browse and purchase products from multiple vendors
- **Sellers** to manage their own storefronts and products  
- **Admins** to oversee the entire platform and manage users/sellers

## ✨ Key Features

### Authentication & Security
- ✅ Two-Step Login Verification (OTP via Email)
- ✅ Role-based access control (Client, Seller, Admin)
- ✅ Account activation/deactivation by admin

### Multi-Vendor Functionality
- ✅ Seller profile management with store details
- ✅ Seller status control (pending/active/blocked)
- ✅ Products tagged to specific sellers
- ✅ Multi-vendor cart support
- ✅ Split orders by seller

### Product Management
- ✅ Full CRUD operations for products
- ✅ Category filtering and search
- ✅ Price range filtering
- ✅ Related products recommendations
- ✅ Stock management
- ✅ Product ratings and reviews

### Shopping Experience
- ✅ Multi-vendor shopping cart
- ✅ Order creation and tracking
- ✅ Order history
- ✅ Shipping management
- ✅ Review system with purchase verification

### Payment Integration
- ✅ MTN MoMo (Sandbox)
- ✅ Stripe payment gateway
- ✅ Payment status tracking
- ✅ Automatic stock deduction

## 🛠️ Tech Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT + Passport (Google OAuth)
- **Email**: Nodemailer
- **Payments**: Stripe SDK, MTN MoMo API
- **Security**: Helmet, bcryptjs, CORS

### Frontend  
- **Framework**: React 18
- **Routing**: React Router v6
- **State Management**: Context API
- **Forms**: Formik + Yup validation
- **HTTP Client**: Axios
- **UI Icons**: React Icons
- **Notifications**: React Toastify
- **Payments**: Stripe React SDK

## 📁 Project Structure

```
Ku-isoko/
├── backend/
│   ├── config/          # DB and Passport config
│   ├── controllers/     # Business logic (8 controllers)
│   ├── middleware/      # Auth, validation, error handling
│   ├── models/          # Mongoose schemas (7 models)
│   ├── routes/          # API endpoints (8 route files)
│   ├── utils/           # JWT, email, payment utilities
│   ├── server.js        # Entry point
│   ├── package.json
│   └── .env.example
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable components
│   │   ├── context/     # Auth & Cart contexts
│   │   ├── pages/       # Page components
│   │   ├── services/    # API service
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env.example
└── README.md
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or Atlas)
- Git

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file from template:
```bash
cp .env.example .env
```

4. Configure environment variables in `.env`:
```env
MONGO_URI=mongodb://localhost:27017/ku-isoko
JWT_SECRET=your_secret_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
MTN_MOMO_SUBSCRIPTION_KEY=your_momo_key
MTN_MOMO_API_USER=your_api_user
MTN_MOMO_API_KEY=your_api_key
STRIPE_SECRET_KEY=sk_test_your_stripe_key
FRONTEND_URL=http://localhost:3000
```

5. Start development server:
```bash
npm run dev
```

Backend runs on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Configure API URL:
```env
REACT_APP_API_URL=http://localhost:5000/api
```

5. Start development server:
```bash
npm start
```

Frontend runs on `http://localhost:3000`

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints
- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /auth/google` - Google OAuth
- `POST /auth/forgot-password` - Request OTP
- `POST /auth/verify-otp` - Verify OTP
- `POST /auth/reset-password` - Reset password
- `GET /auth/me` - Get current user

### Product Endpoints
- `GET /products` - List products (with filters)
- `POST /products` - Create product (Seller)
- `GET /products/:id` - Get product details
- `GET /products/:id/related` - Get related products
- `PUT /products/:id` - Update product
- `DELETE /products/:id` - Delete product

### Cart Endpoints
- `GET /cart` - Get cart
- `POST /cart` - Add to cart
- `PUT /cart/:itemId` - Update quantity
- `DELETE /cart/:itemId` - Remove item

### Order Endpoints
- `POST /orders` - Create order
- `GET /orders/my-orders` - Customer orders
- `GET /orders/seller-orders` - Seller orders
- `GET /orders/:id` - Order details
- `PUT /orders/:id/status` - Update status (Admin)

### Payment Endpoints
- `POST /payments/momo/initiate` - Initiate MoMo
- `POST /payments/momo/verify` - Verify MoMo
- `POST /payments/stripe/initiate` - Initiate Stripe
- `POST /payments/stripe/verify` - Verify Stripe

[See full API documentation in backend/README.md]

## 🧪 Testing

### Payment Testing

**MTN MoMo Sandbox:**
- Use MTN MoMo Developer Portal credentials
- Test phone: 2507XXX...

**Stripe Test Cards:**
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`

### Test Accounts (After Setup)
Create test accounts via signup or seed script:
- **Admin**: admin@ku-isoko.com
- **Seller**: seller@test.com  
- **Client**: customer@test.com

## 🔐 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Role-based access control
- Input validation (server & client)
- MongoDB injection prevention
- Helmet security headers
- CORS protection

## 📝 Environment Variables

### Backend Required
- `MONGO_URI` - MongoDB connection string
- `JWT_SECRET` - JWT signing secret
- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth secret
- `EMAIL_USER` - SMTP email address
- `EMAIL_PASS` - SMTP password
- `MTN_MOMO_*` - MoMo API credentials
- `STRIPE_SECRET_KEY` - Stripe secret key

### Frontend Required
- `REACT_APP_API_URL` - Backend API URL

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

Built as a comprehensive multi-vendor e-commerce solution.

## 🙏 Acknowledgments

- MTN MoMo Developer Platform
- Stripe Payment Gateway
- Google OAuth
- MongoDB Atlas
- React community

---

**Note**: This is a complete, production-ready codebase with no placeholders. All features are fully implemented and functional.
