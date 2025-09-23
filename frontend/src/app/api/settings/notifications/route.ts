import { NextRequest, NextResponse } from 'next/server'

const API_BASE =
  process.env.BACKEND_API_URL ||
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'http://localhost:4000/api'

export async function GET(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const res = await fetch(`${API_BASE}/settings/notifications`, {
    headers: { Authorization: auth },
    cache: 'no-store',
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

export async function PUT(req: NextRequest) {
  const auth = req.headers.get('authorization') || ''
  const body = await req.json().catch(() => ({}))
  const res = await fetch(`${API_BASE}/settings/notifications`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: auth,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}


