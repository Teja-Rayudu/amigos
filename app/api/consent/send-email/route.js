import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import { sendConsentEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { postId, detectedUserIds } = await request.json();

    if (!postId || !detectedUserIds || !Array.isArray(detectedUserIds)) {
      return NextResponse.json(
        { error: 'postId and detectedUserIds are required' },
        { status: 400 }
      );
    }

    // Get uploader info
    const uploader = await User.findById(session.user.id);
    if (!uploader) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get detected users' info
    const detectedUsers = await User.find({
      _id: { $in: detectedUserIds },
    }).select('email name totpEnabled');

    // Send emails only to users with 2FA enabled
    const emailResults = [];
    const pendingConsentFrom = [];
    for (const user of detectedUsers) {
      if (!user.totpEnabled) {
        emailResults.push({
          userId: user._id,
          sent: false,
          reason: '2FA not enabled - cannot verify',
        });
        continue;
      }

      const sent = await sendConsentEmail(
        user.email,
        user.name,
        uploader.name,
        postId
      );

      emailResults.push({
        userId: user._id,
        sent,
      });

      if (sent) {
        pendingConsentFrom.push(user._id);
      }
    }

    // Update post with pending consent
    await Post.findByIdAndUpdate(
      postId,
      {
        pendingConsentFrom,
      },
      { new: true }
    );

    const failedCount = emailResults.filter((result) => !result.sent).length;

    return NextResponse.json({
      message: 'Consent emails sent',
      emailResults,
      sentCount: pendingConsentFrom.length,
      failedCount,
    });
  } catch (error) {
    console.error('Send consent email error:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}
