import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';

// Euclidean distance between two descriptor arrays
function euclideanDistance(a, b) {
  if (a.length !== b.length) return Infinity;
  let sum = 0;
  for (let i = 0; i < a.length; i++) {
    sum += (a[i] - b[i]) ** 2;
  }
  return Math.sqrt(sum);
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { descriptors } = await request.json();

    if (!descriptors || !Array.isArray(descriptors) || descriptors.length === 0) {
      return NextResponse.json(
        { error: 'No face descriptors provided' },
        { status: 400 }
      );
    }

    // Get all users with registered faces (including uploader)
    const allUsers = await User.find({
      faceRegistered: true,
    }).select('_id name faceDescriptor');

    const THRESHOLD = 0.5; // More lenient for better face matching
    const matchedUsers = [];
    let unrecognizedFaces = 0;

    for (const desc of descriptors) {
      if (!Array.isArray(desc) || desc.length !== 128) continue;

      let matched = false;
      for (const user of allUsers) {
        if (!user.faceDescriptor || user.faceDescriptor.length !== 128) continue;

        const distance = euclideanDistance(desc, user.faceDescriptor);
        
        if (distance < THRESHOLD) {
          matched = true;
          // Only prompt for consent if the matched face is NOT the current user
          if (user._id.toString() !== session.user.id) {
            // Avoid duplicates
            if (!matchedUsers.find(m => m.userId === user._id.toString())) {
              matchedUsers.push({
                userId: user._id.toString(),
                userName: user.name,
                distance: Math.round(distance * 1000) / 1000,
              });
            }
          }
          break; // Move to the next detected face
        }
      }
      
      if (!matched) {
        unrecognizedFaces++;
      }
    }

    return NextResponse.json({
      facesDetected: descriptors.length,
      matchedUsers,
      unrecognizedFaces,
      requiresConsent: matchedUsers.length > 0,
    });
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error('Face detect error:', error);
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
