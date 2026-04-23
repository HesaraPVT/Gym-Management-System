import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Measurement from './models/Measurement.js';
import Workout from './models/Workout.js';
import User from './models/User.js';

dotenv.config();

async function testDatabase() {
  try {
    console.log('\n🧪 STARTING DATABASE TEST...\n');

    // Connect to MongoDB
    console.log('📍 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected\n');

    // Get database info
    const db = mongoose.connection;
    console.log('📊 Database Info:');
    console.log(`   - Name: ${db.name}`);
    console.log(`   - Host: ${db.host}`);
    console.log(`   - Port: ${db.port}`);

    // Check collections
    const collections = await db.db.listCollections().toArray();
    console.log(`\n📦 Collections in database (${collections.length}):`);
    collections.forEach(col => {
      console.log(`   - ${col.name}`);
    });

    // Count documents
    console.log('\n📈 Document Counts:');
    const userCount = await User.countDocuments();
    const measurementCount = await Measurement.countDocuments();
    const workoutCount = await Workout.countDocuments();

    console.log(`   - Users: ${userCount}`);
    console.log(`   - Measurements: ${measurementCount}`);
    console.log(`   - Workouts: ${workoutCount}`);

    // Show latest measurements
    if (measurementCount > 0) {
      console.log('\n📊 Latest Measurements (last 3):');
      const measurements = await Measurement.find().sort({ date: -1 }).limit(3);
      measurements.forEach((m, i) => {
        console.log(`   ${i + 1}. User: ${m.userId}, Weight: ${m.weight}kg, Body Fat: ${m.bodyFatPercentage}%, Date: ${m.date}`);
      });
    } else {
      console.log('\n   ⚠️  No measurements found');
    }

    // Show latest workouts
    if (workoutCount > 0) {
      console.log('\n💪 Latest Workouts (last 3):');
      const workouts = await Workout.find().sort({ date: -1 }).limit(3);
      workouts.forEach((w, i) => {
        console.log(`   ${i + 1}. User: ${w.userId}, Exercise: ${w.exercise}, Date: ${w.date}`);
      });
    } else {
      console.log('\n   ⚠️  No workouts found');
    }

    // Get a sample user with measurements
    if (userCount > 0 && measurementCount > 0) {
      console.log('\n👤 Users with Measurements:');
      const usersWithData = await Measurement.aggregate([
        { $group: { _id: '$userId', count: { $sum: 1 } } },
        { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'user' } },
        { $limit: 3 }
      ]);

      usersWithData.forEach((item, i) => {
        const userName = item.user[0]?.name || 'Unknown';
        console.log(`   ${i + 1}. ${userName}: ${item.count} measurements`);
      });
    }

    console.log('\n✅ DATABASE TEST COMPLETE\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.error(error);
    process.exit(1);
  }
}

testDatabase();
