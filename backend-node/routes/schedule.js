import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Schedule from '../models/Schedule.js';

const router = express.Router();

// @route   POST /api/schedule
// @desc    Create a new schedule (Trainer only)
// @access  Private/Trainer
router.post('/', protect, authorize('trainer'), async (req, res) => {
  try {
    const { title, description, startTime, endTime, sessionType, maxParticipants, location } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Title, start time, and end time are required'
      });
    }

    const schedule = await Schedule.create({
      trainerId: req.user.id,
      title,
      description,
      startTime,
      endTime,
      sessionType: sessionType || 'Group Class',
      maxParticipants,
      location
    });

    res.status(201).json({
      success: true,
      schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/schedule
// @desc    Get all schedules
router.get('/', async (req, res) => {
  try {
    const schedules = await Schedule.find()
      .populate('trainerId', 'name specialization')
      .populate('enrolledMembers', 'name email')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/schedule/trainer/:trainerId
// @desc    Get schedules for a trainer
router.get('/trainer/:trainerId', async (req, res) => {
  try {
    const schedules = await Schedule.find({ trainerId: req.params.trainerId })
      .populate('enrolledMembers', 'name email')
      .sort({ startTime: 1 });

    res.status(200).json({
      success: true,
      count: schedules.length,
      schedules
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/schedule/:id
// @desc    Get single schedule
router.get('/:id', async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id)
      .populate('trainerId', 'name specialization bio')
      .populate('enrolledMembers', 'name email');

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/schedule/:id
// @desc    Update schedule (Trainer only)
// @access  Private/Trainer
router.put('/:id', protect, authorize('trainer'), async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/schedule/:id/enroll
// @desc    Enroll in a schedule
// @access  Private
router.put('/:id/enroll', protect, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    if (schedule.enrolledMembers.includes(req.user.id)) {
      return res.status(400).json({
        success: false,
        message: 'Already enrolled in this schedule'
      });
    }

    schedule.enrolledMembers.push(req.user.id);
    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Enrolled successfully',
      schedule
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/schedule/:id
// @desc    Delete schedule (Trainer only)
// @access  Private/Trainer
router.delete('/:id', protect, authorize('trainer'), async (req, res) => {
  try {
    const schedule = await Schedule.findByIdAndDelete(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Schedule deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
