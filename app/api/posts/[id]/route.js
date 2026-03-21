import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// GET: Get single post
export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const post = await Post.findById(id)
      .populate('author', 'name avatar')
      .lean();

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT: Like/unlike or add comment
export async function PUT(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const { action, text } = await request.json();

    const post = await Post.findById(id);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (action === 'like') {
      const likeIndex = post.likes.indexOf(session.user.id);
      if (likeIndex > -1) {
        post.likes.splice(likeIndex, 1);
      } else {
        post.likes.push(session.user.id);
      }
    } else if (action === 'comment' && text) {
      post.comments.push({
        user: session.user.id,
        userName: session.user.name,
        text: text.slice(0, 500),
      });
    }

    await post.save();
    await post.populate('author', 'name avatar');

    return NextResponse.json({ post });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// DELETE: Delete a post (only by author)
export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = await params;
    const post = await Post.findById(id);

    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    if (post.author.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
    }

    await Post.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Post deleted' });
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
