import mongoose from 'mongoose';

const measurementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  weight: Number,
  chest: Number,
  waist: Number,
  arms: Number,
  legs: Number,
  shoulders: Number,
  bodyFatPercentage: Number,
  muscleMass: Number,
  bmi: Number,
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Measurement', measurementSchema);
