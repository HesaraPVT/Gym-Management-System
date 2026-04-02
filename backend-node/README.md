# Gym Management System - MERN Backend

Complete Node.js + Express backend for the Gym Management System with MongoDB database integration.

## 📋 Features

### User Management
- User registration and login
- User profile management
- Membership status tracking
- User authentication with JWT

### Admin Features
- Admin dashboard
- Membership request approval/rejection
- Inventory management
- Order tracking
- Support ticket management
- User and complaint management

### Trainer Features
- Trainer registration and login
- Schedule management
- Member assignment
- Session tracking

### Progress Tracking
- Measurement tracking (weight, body metrics)
- Workout logging
- Progress history

### Memberships
- Membership package management
- Payment slip upload and storage
- Membership status tracking
- Approval workflow

### Shop
- Product catalog
- Shopping cart functionality
- Order management
- Payment tracking

### Inventory Management
- Product inventory tracking
- Reorder level alerts
- Expiry date tracking
- Supplier management
- Stock management

### Support System
- Complaint submission
- Support ticket tracking
- Priority assignment
- Admin assignment and management

### Scheduling
- Trainer schedule management
- Class enrollment
- Session tracking

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **File Upload**: Multer
- **Validation**: Express-validator
- **CORS**: Enabled for frontend integration

## 📦 Installation

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (Local or Atlas)
- npm or yarn

### Setup Steps

1. **Install Dependencies**
   ```bash
   cd backend-node
   npm install
   ```

2. **Configure Environment**
   ```bash
   # Create .env file with the following variables:
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/gym_management
   JWT_SECRET=your_jwt_secret_key_change_this_in_production
   JWT_EXPIRE=7d
   BCRYPT_ROUNDS=10
   UPLOAD_FOLDER=./uploads
   FRONTEND_URL=http://localhost:3000
   ```

3. **MongoDB Connection**
   - Local: Ensure MongoDB is running on `mongodb://localhost:27017`
   - Or use MongoDB Atlas: Update `MONGODB_URI` in .env

4. **Start Server**
   ```bash
   # Development mode with auto-reload
   npm run dev

   # Production mode
   npm start
   ```

The server will start on: `http://localhost:5000`

## 📚 API Endpoints

### Authentication
- `POST /api/auth/user/signup` - User registration
- `POST /api/auth/user/login` - User login
- `POST /api/auth/admin/signup` - Admin registration
- `POST /api/auth/admin/login` - Admin login
- `POST /api/auth/trainer/signup` - Trainer registration
- `POST /api/auth/trainer/login` - Trainer login
- `GET /api/auth/me` - Get current user (Protected)

### Users
- `GET /api/users/:id` - Get user profile
- `PUT /api/users/:id` - Update user profile (Protected)
- `GET /api/users` - Get all users (Admin only)

### Progress Tracking
- `POST /api/progress/measurements` - Add measurement (Protected)
- `GET /api/progress/measurements/:userId` - Get user measurements
- `PUT /api/progress/measurements/:id` - Update measurement (Protected)
- `DELETE /api/progress/measurements/:id` - Delete measurement (Protected)
- `POST /api/progress/workouts` - Add workout (Protected)
- `GET /api/progress/workouts/:userId` - Get user workouts
- `PUT /api/progress/workouts/:id` - Update workout (Protected)
- `DELETE /api/progress/workouts/:id` - Delete workout (Protected)

### Memberships
- `POST /api/memberships` - Create membership request (Protected)
- `GET /api/memberships/:userId` - Get user memberships
- `GET /api/memberships` - Get all memberships (Admin only)
- `PUT /api/memberships/:id/approve` - Approve membership (Admin only)
- `PUT /api/memberships/:id/reject` - Reject membership (Admin only)
- `GET /api/memberships/view/:id` - Get membership details

### Shop
- `GET /api/shop/products` - Get all products
- `GET /api/shop/products/:id` - Get single product
- `POST /api/shop/products` - Create product (Admin only)
- `PUT /api/shop/products/:id` - Update product (Admin only)
- `DELETE /api/shop/products/:id` - Delete product (Admin only)
- `POST /api/shop/orders` - Create order (Protected)
- `GET /api/shop/orders/:userId` - Get user orders
- `GET /api/shop/orders` - Get all orders (Admin only)
- `PUT /api/shop/orders/:id` - Update order status (Admin only)

### Inventory
- `POST /api/inventory/products` - Add inventory product (Admin only)
- `GET /api/inventory/products` - Get all inventory products
- `GET /api/inventory/products/:id` - Get single product
- `PUT /api/inventory/products/:id` - Update product (Admin only)
- `DELETE /api/inventory/products/:id` - Delete product (Admin only)
- `POST /api/inventory/suppliers` - Add supplier (Admin only)
- `GET /api/inventory/suppliers` - Get all suppliers
- `PUT /api/inventory/suppliers/:id` - Update supplier (Admin only)

### Support
- `POST /api/support/complaints` - Create complaint (Protected)
- `GET /api/support/complaints/:userId` - Get user complaints
- `GET /api/support/complaints` - Get all complaints (Admin only)
- `GET /api/support/view/:id` - Get complaint details
- `PUT /api/support/complaints/:id` - Update complaint (Admin only)
- `DELETE /api/support/complaints/:id` - Delete complaint (Admin only)

### Schedule
- `POST /api/schedule` - Create schedule (Trainer only)
- `GET /api/schedule` - Get all schedules
- `GET /api/schedule/trainer/:trainerId` - Get trainer schedules
- `GET /api/schedule/:id` - Get single schedule
- `PUT /api/schedule/:id` - Update schedule (Trainer only)
- `PUT /api/schedule/:id/enroll` - Enroll in schedule (Protected)
- `DELETE /api/schedule/:id` - Delete schedule (Trainer only)

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication:

1. **Register/Login** to get a token
2. **Include token** in Authorization header: `Authorization: Bearer <token>`
3. **Token expires** in 7 days (configurable)

### Example Request
```bash
curl -X GET http://localhost:5000/api/auth/me \
  -H "Authorization: Bearer your_token_here"
```

## 📁 Project Structure

```
backend-node/
├── config/
│   └── database.js          # MongoDB connection
├── models/
│   ├── User.js              # User model
│   ├── Admin.js             # Admin model
│   ├── Trainer.js           # Trainer model
│   ├── Measurement.js       # Progress measurement model
│   ├── Workout.js           # Workout model
│   ├── Schedule.js          # Trainer schedule model
│   ├── Product.js           # Shop product model
│   ├── Order.js             # Shop order model
│   ├── Membership.js        # Membership model
│   ├── Complaint.js         # Support complaint model
│   ├── InventoryProduct.js  # Inventory model
│   └── Supplier.js          # Supplier model
├── routes/
│   ├── auth.js              # Authentication routes
│   ├── users.js             # User routes
│   ├── progress.js          # Progress tracking routes
│   ├── memberships.js       # Membership routes
│   ├── shop.js              # Shop & orders routes
│   ├── inventory.js         # Inventory routes
│   ├── support.js           # Support routes
│   └── schedule.js          # Schedule routes
├── middleware/
│   ├── auth.js              # JWT authentication
│   └── errorHandler.js      # Error handling
├── server.js                # Main server file
├── .env                     # Environment variables
├── .gitignore               # Git ignore file
├── package.json             # Dependencies
└── README.md                # Documentation
```

## 🚀 Deployment

### Heroku
```bash
npm install -g heroku-cli
heroku login
heroku create your-app-name
git push heroku main
```

### Railway/Render
- Connect GitHub repository
- Add environment variables
- Deploy

### AWS/Azure/DigitalOcean
- Set up Node.js server
- Configure environment variables
- Use PM2 for process management

## 🔧 Development

### Run in Development Mode
```bash
npm run dev
```

Uses nodemon for auto-reload on file changes.

### Environment Variables

Create `.env` file with:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/gym_management
JWT_SECRET=dev_secret_key
JWT_EXPIRE=7d
BCRYPT_ROUNDS=10
UPLOAD_FOLDER=./uploads
FRONTEND_URL=http://localhost:3000
```

## 🐛 Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running: `mongod`
- Check connection string in `.env`
- Verify network access (if using Atlas)

### Port Already in Use
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# macOS/Linux
lsof -i :5000
kill -9 <PID>
```

### CORS Errors
- Ensure `FRONTEND_URL` is set correctly in `.env`
- Check frontend origin matches

## 📝 License

ISC

## 👨‍💻 Support

For issues or questions, please create an issue or contact support.

---

**Happy Coding! 🎉**
