const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// GET /api/stock/movements
const getMovements = async (req, res) => {
  const movements = await StockMovement.find()
    .populate('product', 'name')
    .sort({ date: -1 });
  res.json(movements);
};

// POST /api/stock/in — Manual stock in
const stockIn = async (req, res) => {
  const { productId, quantity, reason } = req.body;

  if (!productId || !quantity || !reason) {
    return res.status(400).json({ message: 'productId, quantity, and reason are required' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  // Append manual restock to batches
  const newBatch = {
    quantity: Number(quantity),
    costPrice: product.costPrice || 0,
    expiryDate: product.expiryDate || null,
    addedAt: new Date()
  };
  product.batches.push(newBatch);

  product.quantity += Number(quantity);

  const activeBatches = product.batches.filter(b => b.quantity > 0);
  activeBatches.sort((a, b) => {
    let da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
    let db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
    return da - db;
  });
  product.expiryDate = activeBatches.length > 0 ? activeBatches[0].expiryDate : null;

  await product.save();

  const movement = await StockMovement.create({
    product: productId,
    type: 'IN',
    quantity: Number(quantity),
    reason,
  });

  res.status(201).json({ message: 'Stock updated', movement });
};

// POST /api/stock/out — Manual stock out
const stockOut = async (req, res) => {
  const { productId, quantity, reason } = req.body;

  if (!productId || !quantity || !reason) {
    return res.status(400).json({ message: 'productId, quantity, and reason are required' });
  }

  const product = await Product.findById(productId);
  if (!product) return res.status(404).json({ message: 'Product not found' });

  if (product.quantity < Number(quantity)) {
    return res.status(400).json({
      message: `Insufficient stock. Available: ${product.quantity}, Requested: ${quantity}`,
    });
  }

  // FIFO Deductions from Batches
  let remainingToDeduct = Number(quantity);
  product.batches.sort((a, b) => {
    let da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
    let db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
    return da - db;
  });

  for (let batch of product.batches) {
    if (remainingToDeduct === 0) break;
    if (batch.quantity > 0) {
      let deduct = Math.min(batch.quantity, remainingToDeduct);
      batch.quantity -= deduct;
      remainingToDeduct -= deduct;
    }
  }

  // Clean empty batches
  product.batches = product.batches.filter(b => b.quantity > 0);
  
  if (product.batches.length > 0) {
    product.expiryDate = product.batches[0].expiryDate;
    product.costPrice = product.batches[0].costPrice; // acting current cost
  } else {
    product.expiryDate = null;
  }

  product.quantity -= Number(quantity);
  await product.save();

  const movement = await StockMovement.create({
    product: productId,
    type: 'OUT',
    quantity: Number(quantity),
    reason,
  });

  res.status(201).json({ message: 'Stock updated', movement });
};

module.exports = { getMovements, stockIn, stockOut };
