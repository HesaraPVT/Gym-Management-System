import express from 'express';
import { protect } from '../middleware/auth.js';
import Message from '../models/Message.js';
import User from '../models/User.js';
import Trainer from '../models/Trainer.js';

const router = express.Router();

// Helper function to populate sender and receiver (checking both User and Trainer)
const populateUserData = async (userId) => {
  if (!userId) return null;
  
  // Try to find in User collection first
  let userData = await User.findById(userId).select('name email role _id');
  if (userData) return userData;
  
  // If not found, try Trainer collection
  userData = await Trainer.findById(userId).select('name email _id');
  if (userData) {
    return { ...userData.toObject(), role: 'trainer' };
  }
  
  return null;
};

// @route   POST /api/messages/send
// @desc    Send a message
// @access  Private
router.post('/send', protect, async (req, res) => {
  try {
    const { receiver_id, schedule_id, text } = req.body;

    if (!receiver_id || !schedule_id || !text || !text.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Receiver ID, schedule ID, and message text are required'
      });
    }

    // Validate sender is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User not found in token'
      });
    }

    const message = await Message.create({
      sender_id: req.user.id,
      receiver_id,
      schedule_id,
      text: text.trim()
    });

    if (!message) {
      return res.status(500).json({
        success: false,
        message: 'Failed to create message'
      });
    }

    // Fetch the created message and populate user data
    const populatedMessage = await Message.findById(message._id);
    
    if (!populatedMessage) {
      return res.status(500).json({
        success: false,
        message: 'Failed to retrieve created message'
      });
    }

    // Manually populate sender and receiver data
    const senderData = await populateUserData(populatedMessage.sender_id);
    const receiverData = await populateUserData(populatedMessage.receiver_id);

    const responseMessage = {
      _id: populatedMessage._id,
      sender_id: senderData,
      receiver_id: receiverData,
      schedule_id: populatedMessage.schedule_id,
      text: populatedMessage.text,
      isRead: populatedMessage.isRead,
      timestamp: populatedMessage.timestamp
    };

    res.status(201).json({
      success: true,
      message: responseMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/messages/:scheduleId
// @desc    Get all messages for a schedule conversation
// @access  Private
router.get('/:scheduleId', protect, async (req, res) => {
  try {
    const { scheduleId } = req.params;

    const messages = await Message.find({ schedule_id: scheduleId })
      .sort({ timestamp: 1 });

    // Manually populate sender and receiver data for each message
    const populatedMessages = await Promise.all(
      messages.map(async (msg) => {
        const senderData = await populateUserData(msg.sender_id);
        const receiverData = await populateUserData(msg.receiver_id);
        
        return {
          _id: msg._id,
          sender_id: senderData,
          receiver_id: receiverData,
          schedule_id: msg.schedule_id,
          text: msg.text,
          isRead: msg.isRead,
          timestamp: msg.timestamp
        };
      })
    );

    res.status(200).json({
      success: true,
      count: populatedMessages.length,
      messages: populatedMessages
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/messages/:messageId/read
// @desc    Mark a message as read
// @access  Private
router.put('/:messageId/read', protect, async (req, res) => {
  try {
    await Message.findByIdAndUpdate(
      req.params.messageId,
      { isRead: true },
      { new: true }
    );

    // Fetch the updated message
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    // Manually populate sender and receiver data
    const senderData = await populateUserData(message.sender_id);
    const receiverData = await populateUserData(message.receiver_id);

    const responseMessage = {
      _id: message._id,
      sender_id: senderData,
      receiver_id: receiverData,
      schedule_id: message.schedule_id,
      text: message.text,
      isRead: message.isRead,
      timestamp: message.timestamp
    };

    res.status(200).json({
      success: true,
      message: responseMessage
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/messages/conversations/inbox
// @desc    Get list of all conversations for current user
// @access  Private
router.get('/conversations/inbox', protect, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender_id: req.user.id },
        { receiver_id: req.user.id }
      ]
    })
      .populate('schedule_id', 'title')
      .sort({ timestamp: -1 });

    // Create a map of conversations (unique by the other user)
    const conversationsMap = new Map();

    // Process messages to build conversations
    for (const msg of messages) {
      const senderId = msg.sender_id.toString();
      const receiverId = msg.receiver_id.toString();
      const currentUserId = req.user.id.toString();

      const otherUserId = senderId === currentUserId ? receiverId : senderId;
      
      if (!conversationsMap.has(otherUserId)) {
        const otherUId = senderId === currentUserId ? msg.receiver_id : msg.sender_id;
        const otherUser = await populateUserData(otherUId);

        conversationsMap.set(otherUserId, {
          otherUser,
          scheduleId: msg.schedule_id._id,
          scheduleName: msg.schedule_id.title,
          lastMessage: msg.text,
          lastMessageTime: msg.timestamp,
          unreadCount: 0
        });
      }
    }

    // Count unread messages for each conversation
    for (const msg of messages) {
      const receiverId = msg.receiver_id.toString();
      const currentUserId = req.user.id.toString();

      if (receiverId === currentUserId && !msg.isRead) {
        const senderId = msg.sender_id.toString();
        const conv = conversationsMap.get(senderId);
        if (conv) {
          conv.unreadCount += 1;
        }
      }
    }

    const conversations = Array.from(conversationsMap.values());

    res.status(200).json({
      success: true,
      count: conversations.length,
      conversations
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
