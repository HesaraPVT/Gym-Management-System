const Invoice = require('../models/Invoice');
const Product = require('../models/Product');
const StockMovement = require('../models/StockMovement');

// GET /api/invoices
const getInvoices = async (req, res) => {
  const invoices = await Invoice.find()
    .populate('supplier', 'name')
    .populate('items.product', 'name')
    .sort({ createdAt: -1 });
  res.json(invoices);
};

// GET /api/invoices/:id
const getInvoiceById = async (req, res) => {
  const invoice = await Invoice.findById(req.params.id)
    .populate('supplier', 'name contactPerson phone email address')
    .populate('items.product', 'name category price');
  if (!invoice) return res.status(404).json({ message: 'Invoice not found' });
  res.json(invoice);
};

// POST /api/invoices
const createInvoice = async (req, res) => {
  const { supplier, invoiceDate, items, notes } = req.body;

  if (!items || items.length === 0) {
    return res.status(400).json({ message: 'Invoice must have at least one item' });
  }

  // Validate all products exist
  for (const item of items) {
    const product = await Product.findById(item.product);
    if (!product) {
      return res.status(404).json({ message: `Product ${item.product} not found` });
    }
  }

  const invoice = new Invoice({ supplier, invoiceDate, items, notes });
  const saved = await invoice.save();

  // Update product quantities, create stock movements, and insert new batch records
  for (const item of items) {
    const product = await Product.findById(item.product);
    
    // Create new batch based on invoice incoming stock
    const newBatch = {
      quantity: item.quantity,
      costPrice: item.unitCost,
      expiryDate: item.expiryDate || null,
      addedAt: new Date()
    };
    
    product.batches.push(newBatch);
    product.quantity += item.quantity;
    product.costPrice = item.unitCost; // update acting cost price
    
    // Sort acting active batches (Earliest Expiry first)
    const activeBatches = product.batches.filter(b => b.quantity > 0);
    activeBatches.sort((a, b) => {
      let da = a.expiryDate ? new Date(a.expiryDate).getTime() : Infinity;
      let db = b.expiryDate ? new Date(b.expiryDate).getTime() : Infinity;
      return da - db;
    });
    
    product.expiryDate = activeBatches.length > 0 ? activeBatches[0].expiryDate : null;
    await product.save();
    
    await StockMovement.create({
      product: item.product,
      type: 'IN',
      quantity: item.quantity,
      reason: `Invoice #${saved._id}`,
    });
  }

  res.status(201).json(saved);
};

module.exports = { getInvoices, getInvoiceById, createInvoice };
