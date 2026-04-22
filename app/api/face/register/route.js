import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { descriptor } = await request.json();

    // Ensure user ID is a valid MongoDB ObjectId
    const userId = new mongoose.Types.ObjectId(session.user.id);

    if (!descriptor || !Array.isArray(descriptor) || descriptor.length !== 128) {
      return NextResponse.json(
        { error: 'Invalid face descriptor. Expected 128-dimensional array.' },
        { status: 400 }
      );
    }

    // Validate all values are numbers
    if (!descriptor.every(v => typeof v === 'number' && isFinite(v))) {
      return NextResponse.json(
        { error: 'Face descriptor must contain only valid numbers.' },
        { status: 400 }
      );
    }

    // Update user with face descriptor
    const user = await User.findByIdAndUpdate(
      userId,
      {
        faceDescriptor: descriptor,
        faceRegistered: true,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ Face registered for user ${user._id}:`, {
        faceRegistered: user.faceRegistered,
        descriptorLength: user.faceDescriptor.length,
      });
    }

    return NextResponse.json({
      message: 'Face registered successfully',
      faceRegistered: user.faceRegistered,
      userId: user._id,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Face registration error:', error);
    }
    return NextResponse.json({ error: 'Internal server error', details: error.message }, { status: 500 });
  }
}
