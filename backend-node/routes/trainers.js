import express from 'express';
import { protect, authorize, generateToken } from '../middleware/auth.js';
import Trainer from '../models/Trainer.js';

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

    res.status(200).json({
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
    console.error('Trainer signin error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
