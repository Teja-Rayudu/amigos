import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import OTP from '@/models/OTP';
import Post from '@/models/Post';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { postId, userId } = await request.json();

    if (!postId || !userId) {
      return NextResponse.json(
        { error: 'postId and userId are required' },
        { status: 400 }
      );
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTPs for this user/post combination
    await OTP.deleteMany({ userId, postId });

    const otp = new OTP({
      userId,
      postId,
      requestedBy: session.user.id,
      otp: otpCode,
      expiresAt: new Date(Date.now() + 5 * 60 * 1000),
    });

    await otp.save();

    // In production, this would send OTP via email/SMS
    // For prototype demo, we return the OTP
    return NextResponse.json({
      message: 'OTP generated successfully',
      otp: otpCode, // Remove this in production!
      expiresAt: otp.expiresAt,
      userId,
      postId,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('OTP generate error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
