import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000/api/command-logs";

export async function GET(req: NextRequest, { params }: any) {
  const res = await fetch(`${API_URL}/${params.id}`);
  const data = await res.json();
  return NextResponse.json(data);
}

export async function PUT(req: NextRequest, { params }: any) {
  const body = await req.json();
  const res = await fetch(`${API_URL}/${params.id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  return NextResponse.json(data);
}

export async function DELETE(req: NextRequest, { params }: any) {
  const res = await fetch(`${API_URL}/${params.id}`, { method: "DELETE" });
  const data = await res.json();
  return NextResponse.json(data);
}
