import express from 'express';
import { protect } from '../middleware/auth.js';
import Measurement from '../models/Measurement.js';
import Workout from '../models/Workout.js';

const router = express.Router();

// ==================== MEASUREMENTS ====================

// @route   POST /api/progress/measurements
// @desc    Add a new measurement
// @access  Private
router.post('/measurements', protect, async (req, res) => {
  try {
    const { weight, chest, waist, arms, legs, shoulders, bodyFatPercentage, muscleMass, bmi, date, notes } = req.body;

    const measurement = await Measurement.create({
      userId: req.user.id,
      weight,
      chest,
      waist,
      arms,
      legs,
      shoulders,
      bodyFatPercentage,
      muscleMass,
      bmi,
      date: date || Date.now(),
      notes
    });

    res.status(201).json({
      success: true,
      measurement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/measurements/:userId
// @desc    Get all measurements for a user
router.get('/measurements/:userId', async (req, res) => {
  try {
    const measurements = await Measurement.find({ userId: req.params.userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: measurements.length,
      measurements
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/progress/measurements/:id
// @desc    Update a measurement
// @access  Private
router.put('/measurements/:id', protect, async (req, res) => {
  try {
    const measurement = await Measurement.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    res.status(200).json({
      success: true,
      measurement
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/progress/measurements/:id
// @desc    Delete a measurement
// @access  Private
router.delete('/measurements/:id', protect, async (req, res) => {
  try {
    const measurement = await Measurement.findByIdAndDelete(req.params.id);

    if (!measurement) {
      return res.status(404).json({
        success: false,
        message: 'Measurement not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Measurement deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== WORKOUTS ====================

// @route   POST /api/progress/workouts
// @desc    Add a new workout
// @access  Private
router.post('/workouts', protect, async (req, res) => {
  try {
    const { exerciseName, sets, reps, weight, duration, intensity, caloriesBurned, date, notes } = req.body;

    if (!exerciseName) {
      return res.status(400).json({
        success: false,
        message: 'Exercise name is required'
      });
    }

    const workout = await Workout.create({
      userId: req.user.id,
      exerciseName,
      sets,
      reps,
      weight,
      duration,
      intensity: intensity || 'Medium',
      caloriesBurned,
      date: date || Date.now(),
      notes
    });

    res.status(201).json({
      success: true,
      workout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   GET /api/progress/workouts/:userId
// @desc    Get all workouts for a user
router.get('/workouts/:userId', async (req, res) => {
  try {
    const workouts = await Workout.find({ userId: req.params.userId }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      count: workouts.length,
      workouts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   PUT /api/progress/workouts/:id
// @desc    Update a workout
// @access  Private
router.put('/workouts/:id', protect, async (req, res) => {
  try {
    const workout = await Workout.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.status(200).json({
      success: true,
      workout
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   DELETE /api/progress/workouts/:id
// @desc    Delete a workout
// @access  Private
router.delete('/workouts/:id', protect, async (req, res) => {
  try {
    const workout = await Workout.findByIdAndDelete(req.params.id);

    if (!workout) {
      return res.status(404).json({
        success: false,
        message: 'Workout not found'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Workout deleted'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
