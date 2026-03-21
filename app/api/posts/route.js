import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Fetch published posts for feed
export async function GET(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const posts = await Post.find({ status: 'published' })
      .populate('author', 'name avatar')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await Post.countDocuments({ status: 'published' });

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Get posts error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST: Create a new post
export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { imageUrl, caption, detectedFaces } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }

    // Determine status based on detected faces
    const hasDetectedFaces = detectedFaces && detectedFaces.length > 0;
    const status = hasDetectedFaces ? 'pending' : 'published';

    const post = new Post({
      author: session.user.id,
      imageUrl,
      caption: caption?.slice(0, 500) || '',
      detectedFaces: detectedFaces || [],
      status,
    });

    await post.save();

    // Populate author info
    await post.populate('author', 'name avatar');

    return NextResponse.json({
      message: hasDetectedFaces 
        ? 'Post created. Awaiting consent from detected users.' 
        : 'Post published successfully!',
      post,
      requiresConsent: hasDetectedFaces,
    }, { status: 201 });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Create post error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
