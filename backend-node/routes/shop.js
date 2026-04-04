/*import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';

const router = express.Router();

// ==================== PRODUCTS ====================

// @route   GET /api/shop/products
// @desc    Get all products
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category) {
      query.category = category;
    }

    const products = await Product.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: products.length,
      products
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/shop/products/:id
// @desc    Get single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/shop/products
// @desc    Create a new product (Admin only)
// @access  Private/Admin
router.post('/products', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, description, price, category, quantity, image, rating } = req.body;

    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Name and price are required'
      });
    }

    const product = await Product.create({
      name,
      description,
      price,
      category: category || 'Other',
      quantity: quantity || 0,
      image,
      rating: rating || 0,
      inStock: quantity > 0
    });

    res.status(201).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/shop/products/:id
// @desc    Update product (Admin only)
// @access  Private/Admin
router.put('/products/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      product
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/shop/products/:id
// @desc    Delete product (Admin only)
// @access  Private/Admin
router.delete('/products/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Product deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== ORDERS ====================

// @route   POST /api/shop/orders
// @desc    Create a new order
// @access  Private
router.post('/orders', protect, async (req, res) => {
  try {
    const { items, shippingAddress, paymentMethod, notes } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Order must have at least one item'
      });
    }

    // Calculate total
    let totalAmount = 0;
    for (let item of items) {
      totalAmount += item.price * item.quantity;
    }

    const order = await Order.create({
      userId: req.user.id,
      items,
      totalAmount,
      shippingAddress,
      paymentMethod: paymentMethod || 'COD',
      notes
    });

    res.status(201).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/shop/orders/:userId
// @desc    Get user's orders
router.get('/orders/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/shop/orders
// @desc    Get all orders (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find().populate('userId', 'name email').sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/shop/orders/:id
// @desc    Update order status
// @access  Private/Admin
router.put('/orders/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { orderStatus, paymentStatus, trackingNumber } = req.body;

    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { orderStatus, paymentStatus, trackingNumber, updatedAt: Date.now() },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;*/




/*import express from 'express';
import multer from 'multer';
import path from 'path';
import Order from '../models/Order.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// Configure Multer for Bank Slip uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ storage: storage });

/**
 * @route   POST /api/shop/orders
 * @desc    Create a new order from Checkout.js
 *//*
router.post('/orders', upload.single('paymentSlip'), async (req, res) => {
  try {
    // 1. Parse the JSON strings from the FormData
    const itemsArray = JSON.parse(req.body.items);
    const delivery = JSON.parse(req.body.deliveryDetails);

    // 2. Map the items to avoid the BSON/ObjectId error
    const mappedItems = itemsArray.map(item => ({
      productId: String(item._id || item.id), // Ensure ID is a string
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    // 3. Prepare the final order object
    const newOrder = new Order({
      userId: req.user ? req.user.id : "Guest",
      items: mappedItems,
      totalAmount: req.body.totalAmount,
      shippingAddress: delivery,
      paymentMethod: req.body.paymentMethod,
      paymentSlip: req.file ? req.file.path : null,
      paymentStatus: req.body.paymentMethod === 'CARD' ? 'Completed' : 'Pending'
    });

    // 4. Save to MongoDB Compass
    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: savedOrder
    });

  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message
    });
  }
});

// GET user orders
router.get('/orders/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;*/




/*import express from 'express';
import multer from 'multer';
import path from 'path';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==================== CONFIGURATION ====================

// Configure Multer to store Bank Slips in the 'uploads' folder
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Generates a unique filename: slip-1712151234567.png
    cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// ==================== PRODUCTS ====================

// @route   GET /api/shop/products
// @desc    Get all products (with optional category filter)
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};
    if (category) query.category = category;

    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @route   GET /api/shop/products/:id
// @desc    Get details for a single product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.status(200).json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDERS ====================

/**
 * @route   POST /api/shop/orders
 * @desc    Create a new order (Handles Multi-part FormData from Checkout.js)
 * @access  Public/Private
 *//*
router.post('/orders', upload.single('paymentSlip'), async (req, res) => {
  try {
    // 1. Parse strings back into Objects/Arrays (sent as strings via FormData)
    const itemsArray = JSON.parse(req.body.items);
    const delivery = JSON.parse(req.body.deliveryDetails);

    if (!itemsArray || itemsArray.length === 0) {
      return res.status(400).json({ success: false, message: 'Cart is empty' });
    }

    // 2. Map items to ensure ID consistency (Fixes BSON/ObjectId errors)
    const mappedItems = itemsArray.map(item => ({
      productId: String(item._id || item.id), 
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    // 3. Construct the Order object
    const newOrder = new Order({
      userId: req.user ? req.user.id : "Guest",
      items: mappedItems,
      totalAmount: req.body.totalAmount,
      shippingAddress: delivery,
      paymentMethod: req.body.paymentMethod,
      paymentSlip: req.file ? req.file.path : null, // Path to the uploaded image
      paymentStatus: req.body.paymentMethod === 'CARD' ? 'Completed' : 'Pending',
      orderStatus: 'Pending'
    });

    // 4. Save to MongoDB
    const savedOrder = await newOrder.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully!",
      order: savedOrder
    });

  } catch (error) {
    console.error("Order Creation Error:", error);
    res.status(500).json({
      success: false,
      message: "Server Error: " + error.message
    });
  }
});

// @route   GET /api/shop/order/:id
// @desc    Get a single order by ID (Used by TrackOrder.js)
router.get('/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({ 
        success: false, 
        message: 'Order not found' 
      });
    }

    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// @route   GET /api/shop/orders/user/:userId
// @desc    Get all orders for a specific user
router.get('/orders/user/:userId', async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: orders.length, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// @route   GET /api/shop/admin/orders
// @desc    Admin view for all system orders
router.get('/admin/orders', protect, authorize('admin'), async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;*/






/*import express from 'express';
import Order from '../models/Order.js';
const router = express.Router();

// ==================== CREATE ORDER ====================
router.post('/orders', async (req, res) => {
  try {
    const newOrder = new Order({
      ...req.body,
      status: 'pending',
      // Default to Colombo coordinates for the initial pin
      riderLocation: { lat: 6.9271, lng: 79.8612 } 
    });
    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== PUBLIC TRACKING ROUTE ====================
// CRITICAL: This allows the map to load for a specific customer!
router.get('/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADMIN ROUTES ====================
router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== UPDATE STATUS/GPS ====================
router.patch('/order/:id', async (req, res) => {
  try {
    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { $set: req.body }, 
      { new: true }
    );
    res.status(200).json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;*/





/*import express from 'express';
import multer from 'multer';
import path from 'path';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==================== CONFIGURATION ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// ==================== PRODUCTS ====================
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = category ? { category } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ORDERS ====================

// CREATE ORDER (Fixes the 404 Error)
router.post('/orders', upload.single('paymentSlip'), async (req, res) => {
  try {
    const itemsArray = JSON.parse(req.body.items);
    const delivery = JSON.parse(req.body.deliveryDetails);

    const mappedItems = itemsArray.map(item => ({
      productId: String(item._id || item.id), 
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    const newOrder = new Order({
      userId: req.user ? req.user.id : "Guest",
      items: mappedItems,
      totalAmount: req.body.totalAmount,
      shippingAddress: delivery,
      paymentMethod: req.body.paymentMethod,
      paymentSlip: req.file ? req.file.path : null,
      status: 'pending', // Matches your Mongoose Model
      riderLocation: { lat: 6.9271, lng: 79.8612 } // Initial Pin
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// GET SINGLE ORDER (For TrackOrder.js Map & Details)
router.get('/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// UPDATE ORDER (For Admin Dashboard Live GPS & Status)
router.patch('/order/:id', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ==================== ADMIN ROUTES ====================
router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;*/





/*import express from 'express';
import multer from 'multer';
import path from 'path';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==================== CONFIGURATION (Multer for Payment Slips) ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// ==================== PRODUCTS ROUTE ====================
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = category ? { category } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== USER ORDER ROUTES ====================

// 1. CREATE ORDER
router.post('/orders', upload.single('paymentSlip'), async (req, res) => {
  try {
    const itemsArray = JSON.parse(req.body.items);
    const delivery = JSON.parse(req.body.deliveryDetails);

    const mappedItems = itemsArray.map(item => ({
      productId: String(item._id || item.id), 
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    const newOrder = new Order({
      userId: req.user ? req.user.id : "Guest",
      items: mappedItems,
      totalAmount: req.body.totalAmount,
      shippingAddress: delivery,
      paymentMethod: req.body.paymentMethod,
      paymentSlip: req.file ? req.file.path : null,
      status: 'pending', 
      riderLocation: { lat: 6.9271, lng: 79.8612 } // Initial Hub Location
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET SINGLE ORDER (For TrackOrder.js)
router.get('/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. DELETE/CANCEL ORDER (STRICT: Only if status is 'pending')
router.delete('/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Logic Gate: If Admin has moved status past 'pending', block deletion
    if (order.status !== 'pending') {
      return res.status(400).json({ 
        success: false, 
        message: "This order is already being processed and cannot be cancelled." 
      });
    }

    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Order cancelled successfully." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADMIN ROUTES ====================

// 1. UPDATE ORDER (For Dashboard: Changes Status or GPS Location)
router.patch('/order/:id', async (req, res) => {
  try {
    const updated = await Order.findByIdAndUpdate(
      req.params.id, 
      { $set: req.body }, 
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 2. GET ALL ORDERS (For Admin Dashboard Analytics & Table)
router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;*/





import express from 'express';
import multer from 'multer';
import path from 'path';
import Order from '../models/Order.js';
import Product from '../models/Product.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// ==================== CONFIGURATION (Multer for Payment Slips) ====================
const storage = multer.diskStorage({
  destination: (req, file, cb) => { cb(null, 'uploads/'); },
  filename: (req, file, cb) => {
    cb(null, `slip-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({ 
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 } 
});

// ==================== PRODUCTS ROUTING ====================
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = category ? { category } : {};
    const products = await Product.find(query).sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: products.length, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== USER ORDER ROUTES ====================

// 1. CREATE ORDER
router.post('/orders', upload.single('paymentSlip'), async (req, res) => {
  try {
    const itemsArray = JSON.parse(req.body.items);
    const delivery = JSON.parse(req.body.deliveryDetails);

    const mappedItems = itemsArray.map(item => ({
      productId: String(item._id || item.id), 
      name: item.name,
      price: item.price,
      quantity: item.quantity,
      image: item.image
    }));

    const newOrder = new Order({
      userId: req.user ? req.user.id : "Guest",
      items: mappedItems,
      totalAmount: req.body.totalAmount,
      shippingAddress: delivery,
      paymentMethod: req.body.paymentMethod,
      paymentSlip: req.file ? req.file.path : null,
      status: 'pending', 
      paymentStatus: 'Pending',
      riderLocation: { lat: 6.9271, lng: 79.8612 }
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({ success: true, order: savedOrder });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 2. GET SINGLE ORDER (For Tracking)
router.get('/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    res.status(200).json(order);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// 3. DELETE/CANCEL ORDER (Only if pending)
router.delete('/order/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ success: false, message: "Order not found" });
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: "Order is already being processed." });
    }
    await Order.findByIdAndDelete(req.params.id);
    res.status(200).json({ success: true, message: "Order cancelled." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// ==================== ADMIN & RE-UPLOAD ROUTES ====================

// 4. UPDATE ORDER (Handles Admin Rejection and User Re-uploads)
router.patch('/order/:id', upload.single('paymentSlip'), async (req, res) => {
  try {
    let updateData = { ...req.body };

    // Handle Admin Rejection Logic
    if (req.body.paymentStatus === 'Rejected') {
      updateData.paymentSlip = null; // Clear bad slip so user can re-upload
    }

    // Handle User Re-upload Logic
    if (req.file) {
      updateData.paymentSlip = req.file.path;
      updateData.paymentStatus = 'Pending'; // Reset to pending for re-review
    }

    const updated = await Order.findByIdAndUpdate(
      req.params.id, 
      { $set: updateData }, 
      { new: true }
    );
    res.status(200).json(updated);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// 5. ADMIN: GET ALL ORDERS
router.get('/admin/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

export default router;