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

    // Generate TOTP secret
    const secret = speakeasy.generateSecret({
      name: `Amigos (${session.user.email})`,
      issuer: 'Amigos - Deep Shield',
      length: 32,
    });

    // Store the secret temporarily (before verification)
    const user = await User.findByIdAndUpdate(
      session.user.id,
      {
        totpSecret: secret.base32,
      },
      { new: true }
    );

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      secret: secret.base32,
      qrCode: secret.otpauth_url,
      message: 'TOTP secret generated successfully',
    });
  } catch (error) {
    console.error('TOTP setup error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
