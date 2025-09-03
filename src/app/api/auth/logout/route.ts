import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST() {
  try {
    const cookieStore = await cookies() // Wait for the cookies
    cookieStore.delete('token') // Now we can call delete
    return NextResponse.json({ message: 'Logged out successfully' })
  } catch (error) {
    return NextResponse.json(
      { message: 'Error logging out' },
      { status: 500 }
    )
  }
}