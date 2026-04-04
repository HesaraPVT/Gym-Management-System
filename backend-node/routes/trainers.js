import express from 'express';
import { protect, authorize, generateToken } from '../middleware/auth.js';
import Trainer from '../models/Trainer.js';
import Schedule from '../models/Schedule.js';

const router = express.Router();

// @route   POST /api/trainers/signup
// @desc    Register a trainer
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, specialization, experience } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    const trainerExists = await Trainer.findOne({ email: normalizedEmail });
    if (trainerExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const trainer = await Trainer.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      specialization,
      experience
    });

    const token = generateToken(trainer._id, 'trainer');

    res.status(201).json({
      success: true,
      token,
      trainer: {
        id: trainer._id,
        name: trainer.name,
        email: trainer.email,
        specialization: trainer.specialization
      }
    });
  } catch (error) {
    console.error('Trainer signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/trainers/signin
// @desc    Login trainer
router.post('/signin', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const trainer = await Trainer.findOne({ email: normalizedEmail }).select('+password');

    if (!trainer) {
      console.log('Trainer not found:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await trainer.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch for trainer:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(trainer._id, 'trainer');

    const trainerData = {
      id: trainer._id,
      name: trainer.name,
      email: trainer.email,
      specialization: trainer.specialization
    };

    res.status(200).json({
      success: true,
      token,
      trainer: trainerData,
      user: trainerData
    });
  } catch (error) {
    console.error('Trainer signin error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/trainers/dashboard-stats
// @desc    Get trainer dashboard statistics
// @access  Private/Trainer
router.get('/dashboard-stats', protect, authorize('trainer'), async (req, res) => {
  try {
    const trainerId = req.user.id;

    // Get all schedules created by this trainer
    const allSchedules = await Schedule.find({ trainerId });

    // Calculate stats
    const totalSessions = allSchedules.length;
    const completedSessions = allSchedules.filter(schedule =>
      schedule.status === 'Completed'
    ).length;

    // Get upcoming bookings (schedules with enrolled members in the future)
    const now = new Date();
    const upcomingBookings = allSchedules.filter(schedule =>
      schedule.startTime > now && schedule.enrolledMembers.length > 0
    ).length;

    // Calculate total earnings (mock calculation - you can adjust based on your pricing)
    const totalEarnings = allSchedules.reduce((total, schedule) => {
      return total + (schedule.enrolledMembers.length * 50); // $50 per booking
    }, 0);

    res.status(200).json({
      success: true,
      stats: {
        totalSessions,
        completedSessions,
        upcomingBookings,
        totalEarnings
      }
    });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/trainers/upcoming-sessions
// @desc    Get trainer's upcoming sessions with enrolled members
// @access  Private/Trainer
router.get('/upcoming-sessions', protect, authorize('trainer'), async (req, res) => {
  try {
    const trainerId = req.user.id;
    const now = new Date();

    // Get upcoming schedules with enrolled members
    const upcomingSchedules = await Schedule.find({
      trainerId,
      startTime: { $gt: now },
      enrolledMembers: { $ne: [] } // Has at least one enrolled member
    })
    .populate('enrolledMembers', 'name email')
    .sort({ startTime: 1 })
    .limit(10); // Limit to 10 upcoming sessions

    res.status(200).json({
      success: true,
      sessions: upcomingSchedules
    });
  } catch (error) {
    console.error('Upcoming sessions error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
