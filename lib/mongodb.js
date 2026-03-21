import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env or .env.local');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

async function connectToDatabase() {
  // Return existing connection if available
  if (cached.conn) {
    if (process.env.NODE_ENV === 'development') {
      console.log('♻️ Using existing MongoDB connection');
    }
    return cached.conn;
  }

  // If no existing connection, create a new one
  if (!cached.promise) {
    if (process.env.NODE_ENV === 'development') {
      console.log('🔄 Creating new MongoDB connection...');
      console.log('📍 Connecting to:', MONGODB_URI.replace(/:[^:@]*@/, ':****@')); // Hide password in logs
    }
    
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10, // Maximum number of connections in the connection pool
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('✅ Successfully connected to MongoDB Atlas');
        console.log('📊 Database name:', mongoose.connection.name);
      }
      return mongoose;
    }).catch((error) => {
      if (process.env.NODE_ENV === 'development') {
        console.error('❌ MongoDB connection failed:', error.message);
      }
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    
    // Provide specific error guidance only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('💥 Failed to establish MongoDB connection:', e.message);
      if (e.message.includes('authentication failed')) {
        console.error('🔐 Authentication Error: Check your username and password');
      } else if (e.message.includes('timeout')) {
        console.error('⏰ Timeout Error: Check your network connection and MongoDB Atlas network access');
      } else if (e.message.includes('ENOTFOUND')) {
        console.error('🌐 DNS Error: Check your cluster URL');
      }
    }
    
    throw e;
  }

  return cached.conn;
}

export default connectToDatabase;
