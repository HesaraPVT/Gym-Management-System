const Product = require('../models/Product');

// GET /api/dashboard/summary
const getSummary = async (req, res) => {
  const now = new Date();
  const in30Days = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

  const [products] = await Promise.all([
    Product.find({ isActive: { $ne: false } }),
  ]);

  const totalProducts = products.length;

  const lowStockCount = products.filter(
    (p) => p.quantity <= p.reorderLevel
  ).length;

  const expiringSoonCount = products.filter(
    (p) => p.expiryDate && p.expiryDate <= in30Days
  ).length;

  const expiredCount = products.filter(
    (p) => p.expiryDate && p.expiryDate <= now
  ).length;

  const totalInventoryValue = products.reduce(
    (sum, p) => sum + p.price * p.quantity,
    0
  );

  res.json({
    totalProducts,
    lowStockCount,
    expiringSoonCount,
    expiredCount,
    totalInventoryValue: Math.round(totalInventoryValue * 100) / 100,
  });
};

module.exports = { getSummary };
