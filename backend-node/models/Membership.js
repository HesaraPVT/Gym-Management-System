import mongoose from 'mongoose';

const membershipSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  packageName: {
    type: String,
    enum: ['Monthly', 'Quarterly', 'Yearly'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  durationUnit: {
    type: String,
    enum: ['days', 'months'],
    default: 'months'
  },
  paymentMethod: {
    type: String,
    enum: ['CreditCard', 'DebitCard', 'BankTransfer'],
    required: true
  },
  paymentSlip: {
    fileName: String,
    fileSize: Number,
    fileType: String,
    fileData: String // Base64 encoded
  },
  transactionReference: String,
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  adminNotes: String,
  startDate: Date,
  endDate: Date,
  isActive: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  approvedAt: Date,
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
});

export default mongoose.model('Membership', membershipSchema);
