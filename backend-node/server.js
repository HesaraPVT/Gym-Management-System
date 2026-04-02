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
import progressRoutes from './routes/progress.js';
import membershipRoutes from './routes/memberships.js';
import shopRoutes from './routes/shop.js';
import inventoryRoutes from './routes/inventory.js';
import supportRoutes from './routes/support.js';
import scheduleRoutes from './routes/schedule.js';

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
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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

// Auth routes
app.use('/api/auth', authRoutes);

// User routes
app.use('/api/users', userRoutes);

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
