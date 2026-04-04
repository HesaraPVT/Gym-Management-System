import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
  sender_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiver_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  schedule_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Schedule',
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isRead: {
    type: Boolean,
    default: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Message', messageSchema);
