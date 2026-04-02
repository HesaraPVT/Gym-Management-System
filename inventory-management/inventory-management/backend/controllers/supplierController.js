const Supplier = require('../models/Supplier');

// GET /api/suppliers
const getSuppliers = async (req, res) => {
  const suppliers = await Supplier.find({ isActive: { $ne: false } }).sort({ createdAt: -1 });
  res.json(suppliers);
};

// GET /api/suppliers/:id
const getSupplierById = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });
  res.json(supplier);
};

// POST /api/suppliers
const createSupplier = async (req, res) => {
  const { name, contactPerson, phone, email, address } = req.body;
  const supplier = new Supplier({ name, contactPerson, phone, email, address });
  const created = await supplier.save();
  res.status(201).json(created);
};

// PUT /api/suppliers/:id
const updateSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

  const { name, contactPerson, phone, email, address } = req.body;
  if (name !== undefined) supplier.name = name;
  if (contactPerson !== undefined) supplier.contactPerson = contactPerson;
  if (phone !== undefined) supplier.phone = phone;
  if (email !== undefined) supplier.email = email;
  if (address !== undefined) supplier.address = address;

  const updated = await supplier.save();
  res.json(updated);
};

// DELETE /api/suppliers/:id
const deleteSupplier = async (req, res) => {
  const supplier = await Supplier.findById(req.params.id);
  if (!supplier) return res.status(404).json({ message: 'Supplier not found' });

  // Soft delete instead of document.deleteOne()
  supplier.isActive = false;
  await supplier.save();
  
  res.json({ message: 'Supplier soft-deleted successfully' });
};

module.exports = { getSuppliers, getSupplierById, createSupplier, updateSupplier, deleteSupplier };
