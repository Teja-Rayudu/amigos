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
    
    // Find current user to exclude their friends and themselves
    const currentUser = await User.findById(session.user.id);
    if (!currentUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const excludedIds = [
      session.user.id,
      ...(currentUser.friends || []),
      ...(currentUser.friendRequests?.map(r => r.from) || [])
    ];

    const users = await User.find({
      _id: { $nin: excludedIds }
    }).select('name email avatar bio faceRegistered friendRequests').lean();

    // Filter out users who already have a pending request from the current user
    const suggestedUsers = users.filter(u => {
      // Check if current user's ID is in the target user's friendRequests
      const hasPendingRequest = u.friendRequests?.some(r => r.from.toString() === session.user.id.toString());
      return !hasPendingRequest;
    }).map(u => {
      // Delete friendRequests array from response for security
      const { friendRequests, ...safeUser } = u;
      return safeUser;
    });

    return NextResponse.json({ users: suggestedUsers });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Users API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
