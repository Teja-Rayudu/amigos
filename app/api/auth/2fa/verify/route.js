import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
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
    const { token } = await request.json();
    const normalizedToken = String(token || '').trim();

    if (!normalizedToken) {
      return NextResponse.json(
        { error: 'TOTP token is required' },
        { status: 400 }
      );
    }

    const user = await User.findById(session.user.id);

    if (!user || !user.totpSecret) {
      return NextResponse.json(
        { error: 'User does not have a TOTP secret configured' },
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

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token: normalizedToken,
      window: 4, // Allow for wider client/server clock skew
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

    // Enable 2FA
    await User.findByIdAndUpdate(
      session.user.id,
      {
        totpEnabled: true,
        totpFailedAttempts: 0,
        totpLockUntil: null,
      },
      { new: true }
    );

    return NextResponse.json({
      message: 'TOTP verified successfully',
      totpEnabled: true,
    });
  } catch (error) {
    console.error('TOTP verification error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
