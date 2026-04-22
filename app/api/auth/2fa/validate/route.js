import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const MAX_TOTP_ATTEMPTS = 5;
const TOTP_LOCK_MINUTES = 10;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { postId, token } = await request.json();
    const normalizedToken = String(token || '').trim();

    if (!postId || !normalizedToken) {
      return NextResponse.json(
        { error: 'postId and token are required' },
        { status: 400 }
      );
    }

    // Get the user's TOTP secret
    const user = await User.findById(session.user.id);

    if (!user || !user.totpSecret || !user.totpEnabled) {
      return NextResponse.json(
        { error: 'User does not have TOTP 2FA enabled' },
        { status: 404 }
      );
    }

    if (user.totpLockUntil && user.totpLockUntil > new Date()) {
      return NextResponse.json(
        {
          error: 'Maximum TOTP attempts reached. Try again later.',
          remainingAttempts: 0,
          maxAttempts: MAX_TOTP_ATTEMPTS,
          lockedUntil: user.totpLockUntil,
        },
        { status: 429 }
      );
    }

    // Verify the TOTP token
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: normalizedToken,
      window: 4, // Allow for wider client/server clock skew in consent flow
    });

    if (!verified) {
      const failedAttempts = (user.totpFailedAttempts || 0) + 1;
      const shouldLock = failedAttempts >= MAX_TOTP_ATTEMPTS;
      const lockUntil = shouldLock
        ? new Date(Date.now() + TOTP_LOCK_MINUTES * 60 * 1000)
        : null;

      await User.findByIdAndUpdate(session.user.id, {
        totpFailedAttempts: failedAttempts,
        totpLockUntil: lockUntil,
      });

      return NextResponse.json(
        {
          error: shouldLock
            ? 'Maximum TOTP attempts reached. Try again later.'
            : 'Invalid TOTP token',
          remainingAttempts: Math.max(MAX_TOTP_ATTEMPTS - failedAttempts, 0),
          maxAttempts: MAX_TOTP_ATTEMPTS,
          shouldReload: !shouldLock,
          lockedUntil: lockUntil,
        },
        { status: shouldLock ? 429 : 401 }
      );
    }

    // Find the post and add user to consentGiven
    const post = await Post.findById(postId);
    if (!post) {
      return NextResponse.json({ error: 'Post not found' }, { status: 404 });
    }

    const sessionUserId = session.user.id.toString();
    const detectedUserIds = (post.detectedFaces || []).map((face) => face.userId.toString());

    // Only a user whose face is on the post can approve this post.
    if (!detectedUserIds.includes(sessionUserId)) {
      return NextResponse.json(
        { error: 'You are not authorized to approve this post' },
        { status: 403 }
      );
    }

    // Mark this user as having given consent
    if (!post.consentGiven) {
      post.consentGiven = [];
    }

    if (!post.consentGiven.some((id) => id.toString() === sessionUserId)) {
      post.consentGiven.push(session.user.id);
    }

    // Mark this specific detected face as approved.
    post.detectedFaces = post.detectedFaces.map((face) => ({
      ...face.toObject(),
      approved: face.userId.toString() === sessionUserId ? true : face.approved,
    }));

    // Check if all required consents have been received
    const allConsented = detectedUserIds.every((requiredId) =>
      post.consentGiven.some((id) => id.toString() === requiredId)
    );

    if (allConsented) {
      post.pendingConsentFrom = [];
      post.published = true;
      post.status = 'published';
    } else {
      post.status = 'pending';
    }

    await post.save();

    await User.findByIdAndUpdate(session.user.id, {
      totpFailedAttempts: 0,
      totpLockUntil: null,
    });

    return NextResponse.json({
      message: 'TOTP verified successfully. Consent recorded.',
      verified: true,
      postId: post._id,
    });
  } catch (error) {
    console.error('TOTP validation error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
