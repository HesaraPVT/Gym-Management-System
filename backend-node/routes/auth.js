import express from 'express';
import crypto from 'crypto';
import bcrypt from 'bcryptjs';
import { generateToken, protect, authorize } from '../middleware/auth.js';
import User from '../models/User.js';
import Admin from '../models/Admin.js';
import Trainer from '../models/Trainer.js';
import { sendPasswordResetEmail } from '../utils/emailService.js';

const router = express.Router();

// ==================== USER AUTH ====================

// @route   POST /api/auth/user/signup
// @desc    Register a user
router.post('/user/signup', async (req, res) => {
  try {
    const { name, email, password, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    // Create user
    const user = await User.create({
      name,
      email,
      password,
      phone
    });

    // Generate token
    const token = generateToken(user._id, 'user');

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        membershipStatus: user.membershipStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/user/login
// @desc    Login user
router.post('/user/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const token = generateToken(user._id, 'user');

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        membershipStatus: user.membershipStatus
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== ADMIN AUTH ====================

// @route   POST /api/auth/admin/signup
// @desc    Register an admin
router.post('/admin/signup', async (req, res) => {
  try {
    const { name, email, password, phone, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const adminExists = await Admin.findOne({ email });
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const admin = await Admin.create({
      name,
      email,
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/admin/login
// @desc    Login admin
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const admin = await Admin.findOne({ email }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== TRAINER AUTH ====================

// @route   POST /api/auth/trainer/signup
// @desc    Register a trainer
router.post('/trainer/signup', async (req, res) => {
  try {
    const { name, email, password, phone, specialization, experience } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields'
      });
    }

    const trainerExists = await Trainer.findOne({ email });
    if (trainerExists) {
      return res.status(400).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const trainer = await Trainer.create({
      name,
      email,
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// @route   POST /api/auth/trainer/login
// @desc    Login trainer
router.post('/trainer/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    const trainer = await Trainer.findOne({ email }).select('+password');

    if (!trainer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }

    const isMatch = await trainer.matchPassword(password);
    if (!isMatch) {
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
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== PASSWORD RECOVERY ====================

// @route   POST /api/auth/user/forgot-password
// @desc    Send password reset token to user email
router.post('/user/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User with this email does not exist'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Update only the reset token fields without triggering full validation
    await User.updateOne(
      { _id: user._id },
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
      }
    );

    // Send email asynchronously (don't wait for it)
    sendPasswordResetEmail(user.email, resetToken, 'user').catch(err => {
      console.error('❌ Background email error:', err.message);
    });

    // Return success immediately
    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process password reset request'
    });
  }
});

// @route   POST /api/auth/user/reset-password
// @desc    Reset user password with token
router.post('/user/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash the provided token to match with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with valid reset token
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password and clear reset token fields (without triggering validation)
    await User.updateOne(
      { _id: user._id },
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      }
    );

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    let user;
    
    if (req.user.role === 'user') {
      user = await User.findById(req.user.id);
    } else if (req.user.role === 'admin') {
      user = await Admin.findById(req.user.id);
    } else if (req.user.role === 'trainer') {
      user = await Trainer.findById(req.user.id).populate('assignedMembers');
    }

    res.status(200).json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// ==================== ADMIN PASSWORD RECOVERY ====================

// @route   POST /api/auth/admin/forgot-password
// @desc    Send password reset token to admin email
router.post('/admin/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email'
      });
    }

    const admin = await Admin.findOne({ email });
    if (!admin) {
      return res.status(404).json({
        success: false,
        message: 'Admin with this email does not exist'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Update only the reset token fields without triggering full validation
    await Admin.updateOne(
      { _id: admin._id },
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
      }
    );

    // Send email asynchronously (don't wait for it)
    sendPasswordResetEmail(admin.email, resetToken, 'admin').catch(err => {
      console.error('❌ Background email error:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Admin forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process password reset request'
    });
  }
});

// @route   POST /api/auth/admin/reset-password
// @desc    Reset admin password with token
router.post('/admin/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash the provided token to match with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find admin with valid reset token
    const admin = await Admin.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password and clear reset token fields
    await Admin.updateOne(
      { _id: admin._id },
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      }
    );

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Admin reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
});

// ==================== TRAINER PASSWORD RECOVERY ====================

// @route   POST /api/auth/trainer/forgot-password
// @desc    Send password reset token to trainer email
router.post('/trainer/forgot-password', async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email'
      });
    }

    const trainer = await Trainer.findOne({ email });
    if (!trainer) {
      return res.status(404).json({
        success: false,
        message: 'Trainer with this email does not exist'
      });
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    
    // Update only the reset token fields
    await Trainer.updateOne(
      { _id: trainer._id },
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes expiry
      }
    );

    // Send email asynchronously (don't wait for it)
    sendPasswordResetEmail(trainer.email, resetToken, 'trainer').catch(err => {
      console.error('❌ Background email error:', err.message);
    });

    res.status(200).json({
      success: true,
      message: 'Password reset link has been sent to your email',
      resetToken: process.env.NODE_ENV === 'development' ? resetToken : undefined
    });
  } catch (error) {
    console.error('Trainer forgot password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to process password reset request'
    });
  }
});

// @route   POST /api/auth/trainer/reset-password
// @desc    Reset trainer password with token
router.post('/trainer/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide token and new password'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters'
      });
    }

    // Hash the provided token to match with database
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find trainer with valid reset token
    const trainer = await Trainer.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!trainer) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired password reset token'
      });
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_ROUNDS) || 10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    
    // Update password and clear reset token fields
    await Trainer.updateOne(
      { _id: trainer._id },
      {
        password: hashedPassword,
        resetPasswordToken: undefined,
        resetPasswordExpire: undefined
      }
    );

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully'
    });
  } catch (error) {
    console.error('Trainer reset password error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to reset password'
    });
  }
});

export default router;
