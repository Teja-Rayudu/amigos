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

    const user = await User.findById(session.user.id)
      .populate('friendRequests.from', 'name email avatar bio faceRegistered')
      .lean();

    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Valid requests where the 'from' user still exists
    const validRequests = (user.friendRequests || []).filter(r => r.from != null).map(r => ({
      _id: r._id, // request ID
      from: r.from,
      createdAt: r.createdAt
    }));

    return NextResponse.json({ requests: validRequests });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Get requests error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { fromUserId } = await request.json();

    if (!fromUserId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    const currentUser = await User.findById(session.user.id);
    const fromUser = await User.findById(fromUserId);

    if (!currentUser || !fromUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verify request exists
    const hasRequest = currentUser.friendRequests.some(r => r.from.toString() === fromUserId.toString());
    if (!hasRequest) {
      return NextResponse.json({ error: 'Friend request not found' }, { status: 404 });
    }

    // Add to friends and remove from requests
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { friends: fromUserId },
      $pull: { friendRequests: { from: fromUserId } }
    });

    await User.findByIdAndUpdate(fromUserId, {
      $addToSet: { friends: session.user.id }
    });

    return NextResponse.json({ message: 'Friend request accepted' });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Accept request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const fromUserId = searchParams.get('fromUserId');

    if (!fromUserId) return NextResponse.json({ error: 'User ID required' }, { status: 400 });

    // Remove from requests
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { friendRequests: { from: fromUserId } }
    });

    return NextResponse.json({ message: 'Friend request declined' });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Decline request error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
