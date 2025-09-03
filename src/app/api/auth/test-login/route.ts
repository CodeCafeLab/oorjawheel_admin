import { NextResponse } from 'next/server';
// @ts-ignore
import jwt from 'jsonwebtoken';

// This is a test endpoint to bypass login
// WARNING: Only use this for development/testing

export async function POST() {
  try {
    // Test user data
    const testUser = {
      id: 1,
      email: 'admin@example.com',
      role: 'admin',
      status: 'active'
    };

    // Generate token
    const token = jwt.sign(
      { 
        id: testUser.id,
        email: testUser.email,
        role: testUser.role,
        status: testUser.status
      },
      'your-secret-key', // Must match your backend's JWT_SECRET
      { expiresIn: '1d' }
    );

    // Create response with user data
    const response = NextResponse.json({
      success: true,
      user: testUser
    });

    // Set auth token cookie
    response.cookies.set({
      name: 'auth_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    // Set user data cookie (not httpOnly so it can be read by the client)
    response.cookies.set({
      name: 'user_data',
      value: JSON.stringify(testUser),
      httpOnly: false,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;

  } catch (error) {
    console.error('Test login error:', error);
    return NextResponse.json(
      { success: false, error: 'Test login failed' },
      { status: 500 }
    );
  }
}
