import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  weight: {
    type: Number,
    required: true
  },
  height: {
    type: Number,
    required: true
  },
  chest: Number,
  waist: Number,
  arms: Number,
  legs: Number,
  shoulders: Number,
  bodyFatPercentage: Number,
  muscleMass: Number,
  bmi: Number,
  notes: String,
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Measurement', measurementSchema);
