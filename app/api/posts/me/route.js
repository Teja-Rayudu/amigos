import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    await connectToDatabase();

    const posts = await Post.find({ author: session.user.id })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ posts });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') console.error('Get my posts error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
