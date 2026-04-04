import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { connectDB } from './config/database.js';
import errorHandler from './middleware/errorHandler.js';

// Route imports
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import adminRoutes from './routes/admins.js';
import trainerRoutes from './routes/trainers.js';
import progressRoutes from './routes/progress.js';
import membershipRoutes from './routes/memberships.js';
import shopRoutes from './routes/shop.js';
import inventoryRoutes from './routes/inventory.js';
import supportRoutes from './routes/support.js';
import scheduleRoutes from './routes/schedule.js';
import messageRoutes from './routes/messages.js';

// Load environment variables
dotenv.config();

// Get __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize express
const app = express();

// Connect to database
connectDB();

// Middleware
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
    process.env.FRONTEND_URL
  ].filter(Boolean),
  credentials: true
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Create uploads directory if it doesn't exist
import fs from 'fs';
const uploadsDir = process.env.UPLOAD_FOLDER || './uploads';
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Serve static files
app.use('/uploads', express.static(uploadsDir));

// ==================== ROUTES ====================

// Health check
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Test seed endpoint - Create test accounts for development
app.post('/api/seed-test-accounts', async (req, res) => {
  try {
    const User = (await import('./models/User.js')).default;
    const Admin = (await import('./models/Admin.js')).default;
    const Trainer = (await import('./models/Trainer.js')).default;

    // Test user
    const testUser = await User.findOneAndUpdate(
      { email: 'testuser@example.com' },
      {
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123',
        phone: '1234567890',
        membershipStatus: 'active'
      },
      { upsert: true, new: true }
    );

    // Test admin
    const testAdmin = await Admin.findOneAndUpdate(
      { email: 'testadmin@example.com' },
      {
        name: 'Test Admin',
        email: 'testadmin@example.com',
        password: 'admin123',
        phone: '0987654321',
        role: 'admin'
      },
      { upsert: true, new: true }
    );

    // Test trainer
    const testTrainer = await Trainer.findOneAndUpdate(
      { email: 'testtrainer@example.com' },
      {
        name: 'Test Trainer',
        email: 'testtrainer@example.com',
        password: 'trainer123',
        phone: '5555555555',
        specialization: 'Strength Training',
        experience: 5
      },
      { upsert: true, new: true }
    );

    res.status(200).json({
      success: true,
      message: 'Test accounts created successfully',
      accounts: [
        {
          role: 'User',
          email: 'testuser@example.com',
          password: 'password123'
        },
        {
          role: 'Admin',
          email: 'testadmin@example.com',
          password: 'admin123'
        },
        {
          role: 'Trainer',
          email: 'testtrainer@example.com',
          password: 'trainer123'
        }
      ]
    });
  } catch (error) {
    console.error('Seed error:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

// Admin routes
app.use('/api/admins', adminRoutes);

// Trainer routes
app.use('/api/trainers', trainerRoutes);

// Progress routes
app.use('/api/progress', progressRoutes);

// Membership routes
app.use('/api/memberships', membershipRoutes);

// Shop routes
app.use('/api/shop', shopRoutes);

// Inventory routes
app.use('/api/inventory', inventoryRoutes);

// Support routes
app.use('/api/support', supportRoutes);

// Schedule routes
app.use('/api/schedule', scheduleRoutes);

// Message routes
app.use('/api/messages', messageRoutes);

// ==================== ERROR HANDLING ====================

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use(errorHandler);

// ==================== START SERVER ====================

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════╗
║   Gym Management System API            ║
║   Server running on port ${PORT}      ║
║   Environment: ${NODE_ENV}           ║
║   API: http://localhost:${PORT}    ║
╚════════════════════════════════════════╝
  `);
});

export default app;
