import crypto from 'crypto';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Admin from './models/Admin.js';

dotenv.config();

const test = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Find the test admin
    const admin = await Admin.findOne({ email: 'testadmin123@example.com' });
    if (!admin) {
      console.log('Admin not found');
      process.exit(1);
    }
    
    console.log('Found admin:', admin.email);
    
    // Generate a test token
    const testToken = crypto.randomBytes(32).toString('hex');
    const hashedToken = crypto.createHash('sha256').update(testToken).digest('hex');
    
    // Store the hashed token in the database
    await Admin.updateOne(
      { _id: admin._id },
      {
        resetPasswordToken: hashedToken,
        resetPasswordExpire: new Date(Date.now() + 10 * 60 * 1000)
      }
    );
    
    console.log('Token stored in database');
    console.log('Use this token for testing:');
    console.log(testToken);
    
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

test();
