import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Membership from '../models/Membership.js';
import User from '../models/User.js';

const router = express.Router();

// @route   POST /api/memberships
// @desc    Create a new membership request
// @access  Private
router.post('/', protect, async (req, res) => {
  try {
    const { packageName, amount, duration, durationUnit, paymentMethod, paymentSlip, transactionReference } = req.body;

    if (!packageName || !amount || !duration || !paymentMethod) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const membership = await Membership.create({
      userId: req.user.id,
      packageName,
      amount,
      duration,
      durationUnit: durationUnit || 'months',
      paymentMethod,
      paymentSlip,
      transactionReference,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      membership
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/memberships/:userId
// @desc    Get memberships for a user
router.get('/:userId', async (req, res) => {
  try {
    const memberships = await Membership.find({ userId: req.params.userId }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: memberships.length,
      memberships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/memberships
// @desc    Get all memberships (Admin only)
// @access  Private/Admin
router.get('/', protect, authorize('admin'), async (req, res) => {
  try {
    const memberships = await Membership.find()
      .populate('userId', 'name email phone')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: memberships.length,
      memberships
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/memberships/:id/approve
// @desc    Approve a membership request
// @access  Private/Admin
router.put('/:id/approve', protect, authorize('admin'), async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const membership = await Membership.findById(req.params.id);

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + membership.duration);

    // Update membership
    membership.status = 'Approved';
    membership.isActive = true;
    membership.startDate = startDate;
    membership.endDate = endDate;
    membership.approvedAt = Date.now();
    membership.approvedBy = req.user.id;
    membership.adminNotes = adminNotes || '';

    await membership.save();

    // Update user membership status
    await User.findByIdAndUpdate(membership.userId, {
      membershipStatus: 'active',
      membershipExpiry: endDate
    });

    res.status(200).json({
      success: true,
      membership
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/memberships/:id/reject
// @desc    Reject a membership request
// @access  Private/Admin
router.put('/:id/reject', protect, authorize('admin'), async (req, res) => {
  try {
    const { adminNotes } = req.body;
    const membership = await Membership.findByIdAndUpdate(
      req.params.id,
      {
        status: 'Rejected',
        adminNotes: adminNotes || '',
        updatedAt: Date.now()
      },
      { new: true }
    );

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }

    res.status(200).json({
      success: true,
      membership
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/memberships/:id
// @desc    Get membership details
router.get('/view/:id', async (req, res) => {
  try {
    const membership = await Membership.findById(req.params.id).populate('userId', 'name email phone');

    if (!membership) {
      return res.status(404).json({
        success: false,
        message: 'Membership not found'
      });
    }

    res.status(200).json({
      success: true,
      membership
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
