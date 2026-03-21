import { NextResponse } from 'next/server';
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

    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        faceDescriptor: descriptor,
        faceRegistered: true,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      message: 'Face registered successfully',
      faceRegistered: true,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Face registration error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
