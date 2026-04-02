const mongoose = require('mongoose');
const Counter = require('./Counter');

const supplierSchema = new mongoose.Schema({
  supplierCode: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Supplier name is required'],
    minlength: [2, 'Name must be at least 2 characters'],
    trim: true,
  },
  contactPerson: {
    type: String,
    required: [true, 'Contact person is required'],
    trim: true,
  },
  phone: {
    type: String,
    required: [true, 'Phone number is required'],
    match: [/^\d{10}$/, 'Phone must be exactly 10 digits'],
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    trim: true,
    lowercase: true,
  },
  address: {
    type: String,
    default: '',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

supplierSchema.pre('save', async function () {
  if (this.isNew && !this.supplierCode) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'supplierId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.supplierCode = counter.seq;
  }
});

module.exports = mongoose.model('Supplier', supplierSchema);
