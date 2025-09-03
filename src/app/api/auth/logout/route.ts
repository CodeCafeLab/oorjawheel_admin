import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    
    // Create a response with CORS headers
    const response = NextResponse.json(
      { success: true, message: 'Logged out successfully' },
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': isProduction 
            ? 'https://your-production-domain.com' 
            : 'http://localhost:3000',
          'Access-Control-Allow-Credentials': 'true',
        }
      }
    );
    
    // Clear cookies by setting them to expire in the past
    response.cookies.set({
      name: 'auth_token',
      value: '',
      path: '/',
      expires: new Date(0)
    });
    
    response.cookies.set({
      name: 'user_data',
      value: '',
      path: '/',
      expires: new Date(0)
    });
    
    return response;
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { success: false, message: 'Error logging out' },
      { status: 500 }
    );
  }
}