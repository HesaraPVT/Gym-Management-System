/*import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    quantity: Number,
    price: Number
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  paymentMethod: {
    type: String,
    enum: ['CreditCard', 'DebitCard', 'BankTransfer', 'COD'],
    default: 'COD'
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  trackingNumber: String,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Order', orderSchema);*/




/*import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  // userId is optional to allow guest checkouts during testing
  userId: {
    type: mongoose.Schema.Types.Mixed, 
    required: false 
  },
  items: [{
    _id: false, // 👈 CRITICAL: Prevents Mongoose from validating sub-document IDs
    productId: {
      type: String, // 👈 Allows "7" or any other ID format
      required: true
    },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: {
    type: Number,
    required: true
  },
  shippingAddress: {
    type: mongoose.Schema.Types.Mixed // 👈 Allows the full deliveryDetails object
  },
  paymentMethod: {
    type: String,
    enum: ['CARD', 'BANK', 'COD'],
    default: 'COD'
  },
  paymentSlip: {
    type: String // Stores the path to the uploaded image
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
    default: 'Pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);*/





/*import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.Mixed, required: false },
  items: [{
    productId: String,
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: Number,
  shippingAddress: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, default: 'pending' }, // Field name standardized
  riderLocation: {
    lat: { type: Number, default: 6.9271 },
    lng: { type: Number, default: 79.8612 }
  }
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);*/



import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema({
  userId: { 
    type: mongoose.Schema.Types.Mixed, 
    required: false 
  },
  items: [{
    _id: false, 
    productId: { type: String, required: true },
    name: String,
    price: Number,
    quantity: Number,
    image: String
  }],
  totalAmount: { type: Number, required: true },
  shippingAddress: { type: mongoose.Schema.Types.Mixed },
  
  // ==================== UPDATED FIELDS ====================
  // 1. Added 'status' as an alias for 'orderStatus' to match Admin Tracking logic
  status: { 
    type: String, 
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'], 
    default: 'pending' 
  },
  
  // 2. CRITICAL: Added riderLocation for the Live GPS Map to work
  riderLocation: {
    lat: { type: Number, default: 6.9271 },
    lng: { type: Number, default: 79.8612 }
  },
  // ========================================================

  paymentMethod: { type: String, enum: ['CARD', 'BANK', 'COD'], default: 'COD' },
  paymentSlip: { type: String },
  paymentStatus: { type: String, enum: ['Pending', 'Completed', 'Failed'], default: 'Pending' },
  
}, { timestamps: true });

export default mongoose.model('Order', orderSchema);