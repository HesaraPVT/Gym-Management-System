import mongoose from 'mongoose';

const supplierSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    lowercase: true
  },
  phone: String,
  address: String,
  city: String,
  state: String,
  zipCode: String,
  country: String,
  website: String,
  bankDetails: {
    accountNumber: String,
    accountName: String,
    bankName: String,
    routingNumber: String
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Supplier', supplierSchema);
