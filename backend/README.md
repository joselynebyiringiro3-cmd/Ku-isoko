# Ku-isoko Backend API

Multi-vendor e-commerce backend with Node.js, Express, and MongoDB.

## ✅ Features Implemented

### Authentication & Authorization
- ✅ Email/Password signup and login
- ✅ Two-Step Login Verification (OTP via Email)
- ✅ Google OAuth integration
- ✅ JWT-based authentication
- ✅ OTP-based password reset (10-minute expiry)
- ✅ Role-based access control (Client, Seller, Admin)
- ✅ Account activation/deactivation

### User Management
- ✅ User CRUD operations (Admin)
- ✅ Role assignment and changes
- ✅ User activation/deactivation
- ✅ Profile management

### Multi-Vendor System
- ✅ Seller profile management
- ✅ Seller status control (pending/active/blocked)
- ✅ Store information (name, description, logo)
- ✅ Seller-specific product management

### Product Management
- ✅ Full CRUD operations
- ✅ Image upload support
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Search functionality
- ✅ Related products
- ✅ Stock management
- ✅ Seller-specific views

### Shopping Cart
- ✅ Multi-vendor cart support
- ✅ Add/update/remove items
- ✅ Stock validation
- ✅ Price snapshot
- ✅ Total calculation

### Order Management
- ✅ Multi-vendor order creation
- ✅ Order status tracking (pending/paid/shipped/delivered/cancelled)
- ✅ Shipping status tracking
- ✅ Payment status tracking
- ✅ Customer order history
- ✅ Seller order filtering (only their products)
- ✅ Admin order management
- ✅ Automatic stock deduction

### Review System
- ✅ Product reviews with ratings (1-5)
- ✅ Purchase verification
- ✅ Automatic average rating calculation
- ✅ Review CRUD operations
- ✅ Admin review moderation

### Payment Integration
- ✅ MTN MoMo (Sandbox)
  - Payment initiation
  - Payment verification
  - Transaction tracking
- ✅ Stripe
  - Payment Intent creation
  - Payment verification
  - Webhook handling
- ✅ Dynamic shipping fee calculation

## 📁 Project Structure

```
backend/
├── config/
│   ├── db.js                 # MongoDB connection
│   └── passport.js           # Google OAuth config
├── controllers/
│   ├── authController.js     # Authentication logic
│   ├── userController.js     # User management
│   ├── sellerController.js   # Seller management
│   ├── productController.js  # Product CRUD
│   ├── cartController.js     # Cart operations
│   ├── orderController.js    # Order processing
│   ├── reviewController.js   # Review system
│   └── paymentController.js  # Payment processing
├── middleware/
│   ├── auth.js              # JWT authentication
│   ├── roleCheck.js         # Role-based access
│   ├── errorHandler.js      # Error handling
│   └── validate.js          # Input validation
├── models/
│   ├── User.js              # User schema
│   ├── SellerProfile.js     # Seller schema
│   ├── Product.js           # Product schema
│   ├── Cart.js              # Cart schema
│   ├── Order.js             # Order schema
│   ├── Review.js            # Review schema
│   └── OTP.js               # OTP schema
├── routes/
│   ├── auth.js              # Auth endpoints
│   ├── users.js             # User endpoints
│   ├── sellers.js           # Seller endpoints
│   ├── products.js          # Product endpoints
│   ├── cart.js              # Cart endpoints
│   ├── orders.js            # Order endpoints
│   ├── reviews.js           # Review endpoints
│   └── payments.js          # Payment endpoints
├── utils/
│   ├── jwt.js               # JWT utilities
│   ├── email.js             # Email sending
│   └── payment.js           # Payment utilities
├── .env.example             # Environment template
├── .gitignore
├── package.json
└── server.js                # Main entry point
```

## 🚀 Installation & Setup

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Variables

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Required environment variables:
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT tokens
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: Google OAuth credentials
- `EMAIL_USER` & `EMAIL_PASS`: SMTP credentials
- `MTN_MOMO_*`: MTN MoMo API credentials
- `STRIPE_SECRET_KEY`: Stripe secret key

### 3. Run Development Server

```bash
npm run dev
```

Server will start on `http://localhost:5000`

### 4. Run Production Server

```bash
npm start
```

## 📡 API Endpoints

### Authentication (`/api/auth`)
- **POST** `/signup` - Register new user
- **POST** `/login` - User login
- **GET** `/google` - Google OAuth initiate
- **GET** `/google/callback` - Google OAuth callback
- **POST** `/forgot-password` - Request OTP
- **POST** `/verify-otp` - Verify OTP
- **POST** `/reset-password` - Reset password
- **GET** `/me` - Get current user (Protected)

### Users (`/api/users`) - Admin Only
- **GET** `/` - List all users
- **GET** `/:id` - Get user by ID
- **PUT** `/:id/role` - Update user role
- **PUT** `/:id/toggle-active` - Activate/deactivate user

### Sellers (`/api/sellers`)
- **GET** `/` - List sellers (Public)
- **GET** `/profile/me` - Get own profile (Seller)
- **PUT** `/profile` - Update own profile (Seller)
- **GET** `/:id` - Get seller by ID (Public)
- **PUT** `/:id/status` - Update seller status (Admin)

### Products (`/api/products`)
- **GET** `/` - List products (Public, with filters)
- **POST** `/` - Create product (Seller)
- **GET** `/my-products` - Own products (Seller)
- **GET** `/:id` - Get product details (Public)
- **GET** `/:id/related` - Related products (Public)
- **PUT** `/:id` - Update product (Seller/Admin)
- **DELETE** `/:id` - Delete product (Seller/Admin)

### Cart (`/api/cart`) - Customer Only
- **GET** `/` - Get cart
- **POST** `/` - Add to cart
- **PUT** `/:itemId` - Update quantity
- **DELETE** `/:itemId` - Remove item
- **DELETE** `/` - Clear cart

### Orders (`/api/orders`)
- **POST** `/` - Create order (Customer)
- **GET** `/my-orders` - Own orders (Customer)
- **GET** `/seller-orders` - Seller's orders (Seller)
- **GET** `/` - All orders (Admin)
- **GET** `/:id` - Order details (Customer/Seller/Admin)
- **PUT** `/:id/status` - Update status (Admin)

### Reviews (`/api/reviews`)
- **GET** `/products/:productId` - Get reviews (Public)
- **POST** `/products/:productId` - Create review (Customer)
- **PUT** `/:id` - Update review (Customer)
- **DELETE** `/:id` - Delete review (Customer/Admin)

### Payments (`/api/payments`)
- **POST** `/momo/initiate` - Initiate MoMo payment
- **POST** `/momo/verify` - Verify MoMo payment
- **POST** `/stripe/initiate` - Initiate Stripe payment
- **POST** `/stripe/verify` - Verify Stripe payment
- **POST** `/stripe/webhook` - Stripe webhook
- **GET** `/:orderId/status` - Payment status

## 🔒 Security Features

- Password hashing with bcrypt (12 rounds)
- JWT token authentication
- Role-based access control
- Input validation
- MongoDB injection prevention
- Helmet security headers
- CORS protection
- Session security

## 🧪 Testing

### Health Check

```bash
curl http://localhost:5000/health
```

### Test Credentials (After seeding)

**Admin:**
- Email: admin@ku-isoko.com
- Password: Admin@123

**Client:**
- Email: customer@test.com
- Password: Customer@123

**Seller:**
- Email: seller@test.com
- Password: Seller@123

## 📝 Payment Testing

### MTN MoMo Sandbox
- Use sandbox credentials from MTN MoMo Developer portal
- Test phone: 2507XXX...

### Stripe Test Cards
- Success: `4242 4242 4242 4242`
- Decline: `4000 0000 0000 0002`
- 3D Secure: `4000 0025 0000 3155`

## 🔧 Error Handling

All errors return consistent JSON format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [] // Optional array of validation errors
}
```

## 📦 Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **jsonwebtoken**: JWT authentication
- **bcryptjs**: Password hashing
- **passport**: OAuth authentication
- **nodemailer**: Email sending
- **stripe**: Stripe payment gateway
- **axios**: HTTP client (for MoMo API)
- **helmet**: Security middleware
- **cors**: CORS handling
- **morgan**: HTTP logger

## 🚀 Next Steps

1. Create database seed script for initial data
2. Add comprehensive API tests
3. Implement rate limiting
4. Add file upload for images
5. Implement caching with Redis
6. Add API documentation (Swagger)
7. Set up CI/CD pipeline

## 📄 License

MIT
