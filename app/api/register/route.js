import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import User from '@/models/User';
import { rateLimit, getClientIdentifier } from '@/lib/rate-limit';

// Rate limiter: 5 registration attempts per hour per IP
const limiter = rateLimit({ maxRequests: 5, windowMs: 3600000 });

export async function POST(request) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request);
    const rateLimitResult = limiter(identifier);
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { 
          error: 'Too many registration attempts. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000)
        },
        { 
          status: 429,
          headers: {
            'Retry-After': Math.ceil((rateLimitResult.resetTime - Date.now()) / 1000).toString(),
            'X-RateLimit-Limit': rateLimitResult.limit.toString(),
            'X-RateLimit-Remaining': rateLimitResult.remaining.toString(),
            'X-RateLimit-Reset': new Date(rateLimitResult.resetTime).toISOString(),
          }
        }
      );
    }

    // Connect to database
    await connectToDatabase();

    // Parse request body
    const body = await request.json();
    const { name, email, phone, password, confirmPassword } = body;

    // Validate all fields exist and are strings
    if (!name || !email || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'Please provide all required fields' },
        { status: 400 }
      );
    }

    // Type validation
    if (typeof name !== 'string' || typeof email !== 'string' || typeof password !== 'string' || typeof confirmPassword !== 'string') {
      return NextResponse.json(
        { error: 'Invalid field types' },
        { status: 400 }
      );
    }

    // Sanitize inputs
    const sanitizedName = name.trim().slice(0, 60);
    const sanitizedEmail = email.trim().toLowerCase().slice(0, 255);

    // Validate name
    if (sanitizedName.length < 2) {
      return NextResponse.json(
        { error: 'Name must be at least 2 characters long' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(sanitizedEmail)) {
      return NextResponse.json(
        { error: 'Please provide a valid email address' },
        { status: 400 }
      );
    }

    // Password validation
    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // Stronger password requirements
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    
    if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
      return NextResponse.json(
        { error: 'Password must contain at least one uppercase letter, one lowercase letter, and one number' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: sanitizedEmail });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create new user with sanitized data
    const user = new User({
      name: sanitizedName,
      email: sanitizedEmail,
      phone: phone?.trim() || '',
      password,
    });

    // Save user to database
    await user.save();

    // Return success response (without password)
    const { password: _, ...userWithoutPassword } = user.toObject();

    return NextResponse.json(
      {
        message: 'User created successfully',
        user: userWithoutPassword,
      },
      { status: 201 }
    );

  } catch (error) {
    // Log error details only in development
    if (process.env.NODE_ENV === 'development') {
      console.error('Registration error:', error);
    }

    // Handle validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message);
      return NextResponse.json(
        { error: errors.join(', ') },
        { status: 400 }
      );
    }

    // Handle duplicate key error (shouldn't happen due to our check, but just in case)
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}