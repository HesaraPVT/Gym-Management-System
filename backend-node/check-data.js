#!/usr/bin/env node
import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

async function check() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection;
    
    const meas = await db.collection('measurements').countDocuments();
    const works = await db.collection('workouts').countDocuments();
    const users = await db.collection('users').countDocuments();
    
    console.log('Users:', users);
    console.log('Measurements:', meas);
    console.log('Workouts:', works);
    
    if (meas > 0) {
      const latest = await db.collection('measurements').findOne({}, { sort: { date: -1 } });
      console.log('Latest measurement:', JSON.stringify(latest, null, 2));
    }
    
    process.exit(0);
  } catch(e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

check();
