import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: List friends
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const user = await User.findById(session.user.id)
      .populate('friends', 'name email avatar bio faceRegistered')
      .lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ friends: user.friends || [] });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Add friend
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { friendId } = await request.json();

    if (!friendId) {
      return NextResponse.json({ error: 'friendId is required' }, { status: 400 });
    }

    if (friendId === session.user.id) {
      return NextResponse.json({ error: 'Cannot add yourself' }, { status: 400 });
    }

    const friend = await User.findById(friendId);
    if (!friend) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Add to both users' friend lists (mutual)
    await User.findByIdAndUpdate(session.user.id, {
      $addToSet: { friends: friendId }
    });
    await User.findByIdAndUpdate(friendId, {
      $addToSet: { friends: session.user.id }
    });

    return NextResponse.json({ message: 'Friend added!' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Remove friend
export async function DELETE(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { searchParams } = new URL(request.url);
    const friendId = searchParams.get('friendId');

    if (!friendId) {
      return NextResponse.json({ error: 'friendId is required' }, { status: 400 });
    }

    // Remove from both users
    await User.findByIdAndUpdate(session.user.id, {
      $pull: { friends: friendId }
    });
    await User.findByIdAndUpdate(friendId, {
      $pull: { friends: session.user.id }
    });

    return NextResponse.json({ message: 'Friend removed' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
