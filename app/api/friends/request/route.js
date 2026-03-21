import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { targetUserId } = await request.json();

    if (!targetUserId) return NextResponse.json({ error: 'Target user ID required' }, { status: 400 });
    if (targetUserId === session.user.id) return NextResponse.json({ error: 'Cannot send request to yourself' }, { status: 400 });

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) return NextResponse.json({ error: 'Target user not found' }, { status: 404 });

    // Check if already friends
    if (targetUser.friends.includes(session.user.id)) {
      return NextResponse.json({ error: 'Already friends' }, { status: 400 });
    }

    // Check if request already exists
    const existingRequest = targetUser.friendRequests.find(r => r.from.toString() === session.user.id.toString());
    if (existingRequest) {
      return NextResponse.json({ error: 'Friend request already sent' }, { status: 400 });
    }

    // Add request
    await User.findByIdAndUpdate(targetUserId, {
      $push: {
        friendRequests: { from: session.user.id, createdAt: new Date() }
      }
    });

    return NextResponse.json({ message: 'Friend request sent successfully' });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Send request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
