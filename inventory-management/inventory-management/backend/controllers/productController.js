const fs = require('fs');
const path = require('path');
const Product = require('../models/Product');

// GET /api/products
const getProducts = async (req, res) => {
  const products = await Product.find({ isActive: { $ne: false } }).populate('supplier', 'name').sort({ createdAt: -1 });
  res.json(products);
};

// GET /api/products/:id
const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id).populate('supplier', 'name');
  if (!product) return res.status(404).json({ message: 'Product not found' });
  res.json(product);
};

// POST /api/products
const createProduct = async (req, res) => {
  const { name, category, price, quantity, reorderLevel, expiryDate, supplier, description } = req.body;
  const photo = req.file ? req.file.filename : null;

  const product = new Product({
    name,
    category,
    price: Number(price),
    quantity: Number(quantity),
    reorderLevel: Number(reorderLevel),
    expiryDate: expiryDate || null,
    photo,
    supplier: supplier || null,
    description: description || '',
  });

  const created = await product.save();
  res.status(201).json(created);
};

// PUT /api/products/:id
const updateProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  const { name, category, price, quantity, reorderLevel, expiryDate, supplier, description, removePhoto } = req.body;

  // If a new photo is uploaded, delete the old one
  if (req.file) {
    if (product.photo) {
      const oldPath = path.join(__dirname, '..', 'uploads', product.photo);
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }
    product.photo = req.file.filename;
  } else if (removePhoto === 'true' && product.photo) {
    const oldPath = path.join(__dirname, '..', 'uploads', product.photo);
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    product.photo = ''; // Using empty string helps bypass any Mongoose null-check weirdness
    product.markModified('photo');
  }

  if (name !== undefined) product.name = name;
  if (category !== undefined) product.category = category;
  if (price !== undefined) product.price = Number(price);
  if (quantity !== undefined) product.quantity = Number(quantity);
  if (reorderLevel !== undefined) product.reorderLevel = Number(reorderLevel);
  if (expiryDate !== undefined) product.expiryDate = expiryDate || null;
  if (supplier !== undefined) product.supplier = supplier || null;
  if (description !== undefined) product.description = description;

  const updated = await product.save();
  res.json(updated);
};

// DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  const product = await Product.findById(req.params.id);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Soft Delete
  product.isActive = false;
  await product.save();
  res.json({ message: 'Product soft-deleted successfully' });
};

module.exports = { getProducts, getProductById, createProduct, updateProduct, deleteProduct };
