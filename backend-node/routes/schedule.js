import express from 'express';
import { protect, authorize } from '../middleware/auth.js';
import Schedule from '../models/Schedule.js';

const router = express.Router();

const hasScheduleConflict = async (trainerId, startTime, endTime, excludeId = null) => {
  const query = {
    trainerId,
    ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    $or: [
      {
        startTime: { $lt: endTime },
        endTime: { $gt: startTime }
      }
    ]
  };
  return await Schedule.findOne(query);
};

// @route   POST /api/schedule
// @desc    Create a new schedule (Trainer only)
// @access  Private/Trainer
router.post('/', protect, authorize('trainer'), async (req, res) => {
  try {
    const { title, description, startTime, endTime, sessionType, maxParticipants, location, isRecurring, recurringFrequency, recurringDuration } = req.body;

    if (!title || !startTime || !endTime) {
      return res.status(400).json({
        success: false,
        message: 'Title, start time, and end time are required'
      });
    }

    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const conflict = await hasScheduleConflict(req.user.id, start, end);
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Schedule conflict detected for this trainer'
      });
    }

    const schedules = [];

    if (isRecurring && recurringFrequency && recurringDuration) {
      const duration = parseInt(recurringDuration, 10);
      let currentStart = new Date(start);
      let currentEnd = new Date(end);

      for (let i = 0; i < duration; i++) {
        // Check for conflicts for each recurring session
        const conflict = await hasScheduleConflict(req.user.id, currentStart, currentEnd);
        if (conflict) {
          return res.status(400).json({
            success: false,
            message: `Schedule conflict detected at ${currentStart.toLocaleDateString()} ${currentStart.toLocaleTimeString()}. Please adjust the recurring session.`
          });
        }

        const schedule = await Schedule.create({
          trainerId: req.user.id,
          title,
          description,
          startTime: currentStart.toISOString(),
          endTime: currentEnd.toISOString(),
          sessionType: sessionType || 'Group Class',
          maxParticipants,
          location,
          isRecurring: true,
          recurringFrequency,
          recurringSessionIndex: i
        });
        schedules.push(schedule);

        // Calculate next session date
        if (recurringFrequency === 'daily') {
          currentStart.setDate(currentStart.getDate() + 1);
          currentEnd.setDate(currentEnd.getDate() + 1);
        } else if (recurringFrequency === 'weekly') {
          currentStart.setDate(currentStart.getDate() + 7);
          currentEnd.setDate(currentEnd.getDate() + 7);
        } else if (recurringFrequency === 'biweekly') {
          currentStart.setDate(currentStart.getDate() + 14);
          currentEnd.setDate(currentEnd.getDate() + 14);
        }
      }
    } else {
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
      schedules.push(schedule);
    }

    res.status(201).json({
      success: true,
      schedule: schedules.length === 1 ? schedules[0] : undefined,
      schedules: schedules
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
      .populate('trainerId', '_id name specialization bio')
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

// @route   GET /api/schedule/my-bookings
// @desc    Get schedules the current user is enrolled in
// @access  Private
router.get('/my-bookings', protect, async (req, res) => {
  try {
    const schedules = await Schedule.find({ enrolledMembers: req.user.id })
      .populate('trainerId', '_id name specialization bio')
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
      .populate('trainerId', 'name specialization bio')
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
      .populate('trainerId', '_id name specialization bio')
      .populate('enrolledMembers', '_id name email');

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
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    if (schedule.trainerId.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: 'You are not authorized to update this schedule'
      });
    }

    const { startTime, endTime } = req.body;
    const start = new Date(startTime);
    const end = new Date(endTime);

    if (end <= start) {
      return res.status(400).json({
        success: false,
        message: 'End time must be after start time'
      });
    }

    const conflict = await hasScheduleConflict(req.user.id, start, end, req.params.id);
    if (conflict) {
      return res.status(400).json({
        success: false,
        message: 'Schedule conflict detected for this trainer'
      });
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('trainerId', '_id name specialization bio')
      .populate('enrolledMembers', '_id name email');

    res.status(200).json({
      success: true,
      schedule: updatedSchedule
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

    // Check if session is full
    if (schedule.maxParticipants && schedule.enrolledMembers.length >= schedule.maxParticipants) {
      return res.status(400).json({
        success: false,
        message: 'This session is full'
      });
    }

    schedule.enrolledMembers.push(req.user.id);
    await schedule.save();

    // Re-fetch with populated trainer info
    const populated = await Schedule.findById(schedule._id)
      .populate('trainerId', '_id name specialization bio')
      .populate('enrolledMembers', 'name email');

    res.status(200).json({
      success: true,
      message: 'Enrolled successfully',
      schedule: populated
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/schedule/:id/unenroll
// @desc    Unenroll (cancel booking) from a schedule
// @access  Private
router.put('/:id/unenroll', protect, async (req, res) => {
  try {
    const schedule = await Schedule.findById(req.params.id);

    if (!schedule) {
      return res.status(404).json({
        success: false,
        message: 'Schedule not found'
      });
    }

    const memberIndex = schedule.enrolledMembers.indexOf(req.user.id);
    if (memberIndex === -1) {
      return res.status(400).json({
        success: false,
        message: 'You are not enrolled in this schedule'
      });
    }

    schedule.enrolledMembers.splice(memberIndex, 1);
    await schedule.save();

    res.status(200).json({
      success: true,
      message: 'Booking cancelled successfully'
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
