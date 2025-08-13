import { NextRequest, NextResponse } from 'next/server';
import { addDevice, updateDevice, deleteDevice } from '@/actions/devices-enhanced';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await addDevice(body);
    if (result.success) {
      return NextResponse.json({ message: result.message, deviceId: result.deviceId }, { status: 201 });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error('API POST /devices error:', error);
    return NextResponse.json({ error: 'Failed to add device.' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Device ID is required for update.' }, { status: 400 });
    }
    const result = await updateDevice(body.id, body);
    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error('API PUT /devices error:', error);
    return NextResponse.json({ error: 'Failed to update device.' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json();
    if (!body.id) {
      return NextResponse.json({ error: 'Device ID is required for deletion.' }, { status: 400 });
    }
    const result = await deleteDevice(body.id);
    if (result.success) {
      return NextResponse.json({ message: result.message }, { status: 200 });
    } else {
      return NextResponse.json({ error: result.message }, { status: 400 });
    }
  } catch (error) {
    console.error('API DELETE /devices error:', error);
    return NextResponse.json({ error: 'Failed to delete device.' }, { status: 500 });
  }
}
