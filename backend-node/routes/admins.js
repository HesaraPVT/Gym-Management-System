import express from 'express';
import { protect, authorize, generateToken } from '../middleware/auth.js';
import Admin from '../models/Admin.js';

const router = express.Router();

// @route   POST /api/admins/signup
// @desc    Register an admin
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Normalize email
    const normalizedEmail = email.toLowerCase().trim();

    const adminExists = await Admin.findOne({ email: normalizedEmail });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const admin = await Admin.create({
      name,
      email: normalizedEmail,
      password,
      phone,
      role: role || 'admin'
    });

    const token = generateToken(admin._id, 'admin');

    res.status(201).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin signup error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/admins/signin
// @desc    Login admin
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
    const admin = await Admin.findOne({ email: normalizedEmail }).select('+password');

    if (!admin) {
      console.log('Admin not found:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      console.log('Password mismatch for admin:', normalizedEmail);
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(admin._id, 'admin');

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    console.error('Admin signin error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

export default router;
