import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

const MAX_TOTP_ATTEMPTS = 5;

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    const existingUser = await User.findById(session.user.id);

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (existingUser.totpLockUntil && existingUser.totpLockUntil > new Date()) {
      return NextResponse.json(
        {
          error: 'Too many failed attempts. Try again later.',
          remainingAttempts: 0,
          maxAttempts: MAX_TOTP_ATTEMPTS,
          lockedUntil: existingUser.totpLockUntil,
        },
        { status: 429 }
      );
    }

    let base32Secret = existingUser.totpSecret;
    let otpAuthUrl = null;
    let message = 'TOTP secret retrieved successfully';

    if (!base32Secret) {
      const secret = speakeasy.generateSecret({
        name: `Amigos (${session.user.email})`,
        issuer: 'Amigos - Deep Shield',
        length: 32,
      });

      base32Secret = secret.base32;
      otpAuthUrl = secret.otpauth_url;

      await User.findByIdAndUpdate(
        session.user.id,
        {
          totpSecret: base32Secret,
        }
      );

      message = 'TOTP secret generated successfully';
    } else {
      otpAuthUrl = speakeasy.otpauthURL({
        secret: base32Secret,
        label: `Amigos (${session.user.email})`,
        issuer: 'Amigos - Deep Shield',
        encoding: 'base32',
      });
    }

    const user = await User.findById(session.user.id);

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      secret: base32Secret,
      qrCode: otpAuthUrl,
      message,
      remainingAttempts: Math.max(MAX_TOTP_ATTEMPTS - (user.totpFailedAttempts || 0), 0),
      maxAttempts: MAX_TOTP_ATTEMPTS,
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
