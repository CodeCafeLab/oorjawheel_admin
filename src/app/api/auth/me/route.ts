import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    const cookieStore = await cookies();
    console.log('Available cookies:', cookieStore.getAll().map(c => c.name));
    const token = cookieStore.get('auth_token')?.value;
    console.log('Token from cookies:', token ? 'Token exists' : 'No token found');

    if (!token) {
      return NextResponse.json(
        { error: 'No token provided' },
        { status: 401 }
      );
    }

    const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:9002'}/api/auth/me`;
    const headers = {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
    
    console.log('Making request to:', apiUrl);
    console.log('Headers:', JSON.stringify(headers, null, 2));
    
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
      credentials: 'include',
      cache: 'no-store',
    });
    
    console.log('Response status:', response.status);
    const responseText = await response.text();
    console.log('Response text:', responseText);

    if (!response.ok) {
      // If unauthorized, clear the cookies
      if (response.status === 401) {
        cookieStore.set('auth_token', '', { 
          expires: new Date(0),
          path: '/'
        });
        cookieStore.set('user_data', '', {
          expires: new Date(0),
          path: '/'
        });
      }
      const errorData = await response.json().catch(() => ({}));
      return NextResponse.json(
        { error: errorData.message || 'Not authenticated' },
        { status: response.status }
      );
    }

    const userData = await response.json();
    return NextResponse.json(userData);

  } catch (error) {
    console.error('Auth check failed:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic';