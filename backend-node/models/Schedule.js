import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  trainerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Trainer',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  description: String,
  startTime: {
    type: Date,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  sessionType: {
    type: String,
    enum: ['One-on-One', 'Group Class', 'Workshop'],
    default: 'Group Class'
  },
  maxParticipants: Number,
  enrolledMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  location: String,
  status: {
    type: String,
    enum: ['Scheduled', 'InProgress', 'Completed', 'Cancelled'],
    default: 'Scheduled'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Schedule', scheduleSchema);
