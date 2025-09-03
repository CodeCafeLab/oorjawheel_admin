import { NextResponse } from 'next/server';
// @ts-ignore
import jwt from 'jsonwebtoken';

// Use the same secret as your backend
const JWT_SECRET = 'your-secret-key'; // Make sure this matches your backend's JWT_SECRET

// Test user data - match this with your actual user data structure
const testUser = {
  id: 1,
  email: 'admin@example.com',
  role: 'admin',
  status: 'active'
};

export async function GET() {
  try {
    // Generate a token that expires in 1 day
    const token = jwt.sign(
      { 
        id: testUser.id,
        email: testUser.email,
        role: testUser.role,
        status: testUser.status
      },
      JWT_SECRET,
      { expiresIn: '1d' }
    );

    return NextResponse.json({
      success: true,
      token,
      user: testUser
    });
  } catch (error) {
    console.error('Error generating token:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate token' },
      { status: 500 }
    );
  }
}
