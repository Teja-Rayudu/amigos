import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    
    const user = await User.findById(session.user.id).select('name email phone bio avatar').lean();
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    return NextResponse.json({ profile: user });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Get profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { profile } = await request.json();

    if (!profile) return NextResponse.json({ error: 'Profile data required' }, { status: 400 });

    // Ensure we only update allowed fields
    const updates = {};
    if (profile.name !== undefined) updates.name = profile.name.slice(0, 60);
    if (profile.phone !== undefined) updates.phone = profile.phone.slice(0, 20);
    if (profile.bio !== undefined) updates.bio = profile.bio.slice(0, 200);
    if (profile.avatar !== undefined) updates.avatar = profile.avatar; // Base64 string

    const updatedUser = await User.findByIdAndUpdate(
      session.user.id,
      { $set: updates },
      { new: true, runValidators: true }
    ).select('name email phone bio avatar');

    return NextResponse.json({ message: 'Profile updated successfully', profile: updatedUser });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Update profile error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
