import { NextResponse } from 'next/server';
import speakeasy from 'speakeasy';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { token } = await request.json();

    if (!token) {
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

    // Verify the token
    const verified = speakeasy.totp.verify({
      secret: user.totpSecret,
      encoding: 'base32',
      token,
      window: 2, // Allow 30 seconds before/after for clock skew
    });

    if (!verified) {
      return NextResponse.json(
        { error: 'Invalid TOTP token' },
        { status: 401 }
      );
    }

    // Enable 2FA
    await User.findByIdAndUpdate(
      session.user.id,
      { totpEnabled: true },
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
