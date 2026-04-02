import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import InventoryProduct from '../models/InventoryProduct.js';
import Supplier from '../models/Supplier.js';

const router = express.Router();

// ==================== INVENTORY PRODUCTS ====================

// @route   POST /api/inventory/products
// @desc    Add a new inventory product (Admin only)
// @access  Private/Admin
router.post('/products', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, category, price, quantity, reorderLevel, expiryDate, description, supplier } = req.body;

    if (!name ||!price || !reorderLevel) {
      return res.status(400).json({
        success: false,
        message: 'Name, price, and reorder level are required'
      });
    }

    const product = await InventoryProduct.create({
      name,
      category: category || 'Other',
      price,
      quantity: quantity || 0,
      reorderLevel,
      expiryDate,
      description,
      supplier,
      productCode: `PRD-${Date.now()}`
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

// @route   GET /api/inventory/products
// @desc    Get all inventory products
router.get('/products', async (req, res) => {
  try {
    const { category } = req.query;
    let query = {};

    if (category && category !== 'All') {
      query.category = category;
    }

    const products = await InventoryProduct.find(query)
      .populate('supplier', 'name email phone')
      .sort({ createdAt: -1 });

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

// @route   GET /api/inventory/products/:id
// @desc    Get single inventory product
router.get('/products/:id', async (req, res) => {
  try {
    const product = await InventoryProduct.findById(req.params.id).populate('supplier');

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

// @route   PUT /api/inventory/products/:id
// @desc    Update inventory product (Admin only)
// @access  Private/Admin
router.put('/products/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await InventoryProduct.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
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

// @route   DELETE /api/inventory/products/:id
// @desc    Delete inventory product (Admin only)
// @access  Private/Admin
router.delete('/products/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const product = await InventoryProduct.findByIdAndDelete(req.params.id);

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

// ==================== SUPPLIERS ====================

// @route   POST /api/inventory/suppliers
// @desc    Add a new supplier (Admin only)
// @access  Private/Admin
router.post('/suppliers', protect, authorize('admin'), async (req, res) => {
  try {
    const supplier = await Supplier.create(req.body);

    res.status(201).json({
      success: true,
      supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/inventory/suppliers
// @desc    Get all suppliers
router.get('/suppliers', async (req, res) => {
  try {
    const suppliers = await Supplier.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: suppliers.length,
      suppliers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/inventory/suppliers/:id
// @desc    Update supplier (Admin only)
// @access  Private/Admin
router.put('/suppliers/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedAt: Date.now() },
      { new: true }
    );

    if (!supplier) {
      return res.status(404).json({
        success: false,
        message: 'Supplier not found'
      });
    }

    res.status(200).json({
      success: true,
      supplier
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
