import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Complaint from '../models/Complaint.js';

const router = express.Router();

// @route   POST /api/support/complaints
// @desc    Create a new complaint
// @access  Private
router.post('/complaints', protect, async (req, res) => {
  try {
    const { title, description, category, priority, attachments } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required'
      });
    }

    const complaint = await Complaint.create({
      userId: req.user.id,
      title,
      description,
      category: category || 'Other',
      priority: priority || 'Medium',
      attachments
    });

    res.status(201).json({
      success: true,
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/support/complaints/:userId
// @desc    Get user's complaints
router.get('/complaints/:userId', async (req, res) => {
  try {
    const complaints = await Complaint.find({ userId: req.params.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/support/complaints
// @desc    Get all complaints (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, priority } = req.query;
    let query = {};

    if (status) query.status = status;
    if (priority) query.priority = priority;

    const complaints = await Complaint.find(query)
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/support/complaints/view/:id
// @desc    Get single complaint
router.get('/view/:id', async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('assignedTo', 'name email');

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/support/complaints/:id
// @desc    Update complaint status (Admin only)
// @access  Private/Admin
router.put('/complaints/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { status, priority, adminNotes, assignedTo } = req.body;

    const updateData = { updatedAt: Date.now() };
    if (status) updateData.status = status;
    if (priority) updateData.priority = priority;
    if (adminNotes) updateData.adminNotes = adminNotes;
    if (assignedTo) updateData.assignedTo = assignedTo;
    
    if (status === 'Resolved' || status === 'Closed') {
      updateData.resolvedAt = Date.now();
    }

    const complaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      complaint
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/support/complaints/:id
// @desc    Delete complaint (Admin only)
// @access  Private/Admin
router.delete('/complaints/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({
        success: false,
        message: 'Complaint not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Complaint deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
