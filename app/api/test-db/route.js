import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  if (process.env.NODE_ENV === 'development') {
    console.log('🧪 Testing database connection...');
  }
  
  try {
    // Test the connection
    const connection = await connectToDatabase();
    
    // Get connection details
    const dbName = mongoose.connection.name;
    const readyState = mongoose.connection.readyState;
    const host = mongoose.connection.host;
    
    const readyStateMap = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    if (process.env.NODE_ENV === 'development') {
      console.log('✅ Database test successful');
    }
    
    // Also test User model
    const User = (await import('@/models/User')).default;
    const userCount = await User.countDocuments();
    
    return NextResponse.json(
      { 
        success: true,
        message: '✅ Database connection successful!',
        userCount: userCount,
        details: {
          database: dbName,
          host: host,
          readyState: readyStateMap[readyState] || 'unknown',
          timestamp: new Date().toISOString(),
          mongooseVersion: mongoose.version
        }
      },
      { status: 200 }
    );
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('❌ Database test failed:', error);
    }
    
    // Provide specific error messages
    let errorType = 'Unknown Error';
    let solution = 'Check your MongoDB configuration';
    
    if (error.message.includes('authentication failed')) {
      errorType = 'Authentication Error';
      solution = 'Check your MongoDB Atlas username and password';
    } else if (error.message.includes('timeout')) {
      errorType = 'Connection Timeout';
      solution = 'Check your network connection and MongoDB Atlas network access settings';
    } else if (error.message.includes('ENOTFOUND')) {
      errorType = 'DNS Resolution Error';
      solution = 'Check your MongoDB Atlas cluster URL';
    } else if (error.message.includes('MongoServerError')) {
      errorType = 'MongoDB Server Error';
      solution = 'Check your MongoDB Atlas cluster status';
    }
    
    return NextResponse.json(
      { 
        success: false,
        error: `❌ ${errorType}`,
        message: error.message,
        solution: solution,
        details: {
          timestamp: new Date().toISOString(),
          mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
          errorType: errorType
        }
      },
      { status: 500 }
    );
  }
}