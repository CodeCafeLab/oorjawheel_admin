import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();
    
    // Forward the login request to the backend
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9002'}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || 'Login failed' },
        { status: response.status }
      );
    }

    // Set secure HTTP-only cookie with the token
    const secure = process.env.NODE_ENV === 'production';
    const responseCookies = new NextResponse(JSON.stringify(data));
    
    if (data.data?.token) {
      responseCookies.cookies.set('auth_token', data.data.token, {
        httpOnly: true,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }

    if (data.data?.user) {
      responseCookies.cookies.set('user_data', JSON.stringify(data.data.user), {
        httpOnly: false,
        secure,
        sameSite: 'lax',
        path: '/',
        maxAge: 60 * 60 * 24 * 7, // 1 week
      });
    }
    
    return responseCookies;

    return NextResponse.json(data);
    
  } catch (error) {
    console.error('Login failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';
