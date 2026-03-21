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
    const { postId, userId, otp } = await request.json();

    if (!postId || !userId || !otp) {
      return NextResponse.json(
        { error: 'postId, userId, and otp are required' },
        { status: 400 }
      );
    }

    // Find the OTP record
    const otpRecord = await OTP.findOne({
      userId,
      postId,
      verified: false,
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'No pending OTP found. It may have expired.' },
        { status: 404 }
      );
    }

    // Check if expired
    if (new Date() > otpRecord.expiresAt) {
      await OTP.findByIdAndDelete(otpRecord._id);
      return NextResponse.json(
        { error: 'OTP has expired. Please request a new one.' },
        { status: 410 }
      );
    }

    // Verify OTP
    if (otpRecord.otp !== otp) {
      return NextResponse.json(
        { error: 'Invalid OTP' },
        { status: 400 }
      );
    }

    // Mark OTP as verified
    otpRecord.verified = true;
    await otpRecord.save();

    // Update the post's detected face approval
    const post = await Post.findById(postId);
    if (post) {
      const faceEntry = post.detectedFaces.find(
        f => f.userId.toString() === userId
      );
      if (faceEntry) {
        faceEntry.approved = true;
      }

      // Check if all faces are approved
      const allApproved = post.detectedFaces.every(f => f.approved);
      if (allApproved) {
        post.status = 'published';
      }

      await post.save();

      return NextResponse.json({
        message: 'OTP verified successfully!',
        allApproved,
        postStatus: post.status,
      });
    }

    return NextResponse.json({
      message: 'OTP verified but post not found',
      allApproved: false,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('OTP verify error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
