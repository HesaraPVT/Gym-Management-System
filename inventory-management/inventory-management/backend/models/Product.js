const mongoose = require('mongoose');
const Counter = require('./Counter');

const productSchema = new mongoose.Schema({
  productCode: {
    type: Number,
    unique: true,
  },
  name: {
    type: String,
    required: [true, 'Product name is required'],
    minlength: [3, 'Name must be at least 3 characters'],
    maxlength: [100, 'Name must be at most 100 characters'],
    trim: true,
  },
  category: {
    type: String,
    enum: {
      values: ['Supplements', 'Equipment', 'Accessories', 'Other'],
      message: 'Category must be one of: Supplements, Equipment, Accessories, Other',
    },
    required: [true, 'Category is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price cannot be negative'],
  },
  costPrice: {
    type: Number,
    default: 0,
    min: [0, 'Cost price cannot be negative'],
  },
  batches: [{
    quantity: { type: Number, required: true },
    expiryDate: { type: Date, default: null },
    costPrice: { type: Number, default: 0 },
    addedAt: { type: Date, default: Date.now }
  }],
  quantity: {
    type: Number,
    required: [true, 'Quantity is required'],
    min: [0, 'Quantity cannot be negative'],
  },
  reorderLevel: {
    type: Number,
    required: [true, 'Reorder level is required'],
    min: [1, 'Reorder level must be at least 1'],
  },
  expiryDate: {
    type: Date,
    default: null,
  },
  photo: {
    type: String,
    default: null,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    default: null,
  },
  description: {
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

productSchema.pre('save', async function () {
  if (this.isNew && !this.productCode) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'productId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.productCode = counter.seq;
  }
});

module.exports = mongoose.model('Product', productSchema);
