import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a product name'],
    trim: true
  },
  description: String,
  price: {
    type: Number,
    required: true,
    min: 0
  },
  category: {
    type: String,
    enum: ['Supplements', 'Equipment', 'Accessories', 'Clothing', 'Other'],
    default: 'Other'
  },
  quantity: {
    type: Number,
    default: 0,
    min: 0
  },
  image: String,
  rating: {
    type: Number,
    min: 0,
    max: 5,
    default: 0
  },
  reviews: Number,
  inStock: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Product', productSchema);
