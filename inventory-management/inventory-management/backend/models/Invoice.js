const mongoose = require('mongoose');
const Counter = require('./Counter');

const invoiceItemSchema = new mongoose.Schema(
  {
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product is required'],
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    unitCost: {
      type: Number,
      required: [true, 'Unit cost is required'],
      min: [0.01, 'Unit cost must be at least 0.01'],
    },
    expiryDate: {
      type: Date,
      default: null,
    },
  },
  { _id: false }
);

const invoiceSchema = new mongoose.Schema({
  invoiceNumber: {
    type: Number,
    unique: true,
    sparse: true,
  },
  supplier: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Supplier',
    required: [true, 'Supplier is required'],
  },
  invoiceDate: {
    type: Date,
    required: [true, 'Invoice date is required'],
  },
  items: {
    type: [invoiceItemSchema],
    validate: {
      validator: function (v) {
        return v && v.length > 0;
      },
      message: 'Invoice must have at least one item',
    },
  },
  totalCost: {
    type: Number,
    default: 0,
  },
  notes: {
    type: String,
    default: '',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Auto-calculate totalCost before saving
invoiceSchema.pre('save', async function () {
  this.totalCost = this.items.reduce((sum, item) => sum + item.quantity * item.unitCost, 0);

  if (this.isNew && !this.invoiceNumber) {
    const counter = await Counter.findByIdAndUpdate(
      { _id: 'invoiceId' },
      { $inc: { seq: 1 } },
      { new: true, upsert: true }
    );
    this.invoiceNumber = counter.seq;
  }
});

module.exports = mongoose.model('Invoice', invoiceSchema);
