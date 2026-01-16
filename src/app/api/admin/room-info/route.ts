import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

// GET - Fetch room information by room number
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomNumber = searchParams.get('roomNumber');

    if (!roomNumber) {
      return NextResponse.json({ error: 'Room number is required' }, { status: 400 });
    }

    // If tenant, only allow fetching their own room info
    if (session.role === 'TENANT') {
      const tenant = await prisma.tenant.findUnique({
        where: { id: session.tenantId },
        include: { customer: true },
      });

      if (!tenant || tenant.customer.roomNumber !== roomNumber) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
      }
    }

    const roomInfo = await prisma.roomInfo.findMany({
      where: { roomNumber },
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
      include: {
        user: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(roomInfo);
  } catch (error) {
    console.error('Error fetching room info:', error);
    return NextResponse.json({ error: 'Failed to fetch room info' }, { status: 500 });
  }
}

// POST - Create or update room information (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { roomNumber, key, value, category, description } = body;

    if (!roomNumber || !key || !value || !category) {
      return NextResponse.json(
        { error: 'Room number, key, value, and category are required' },
        { status: 400 }
      );
    }

    console.log('📝 Creating/updating room info:', { roomNumber, key, value, category });

    // Upsert room info
    const roomInfo = await prisma.roomInfo.upsert({
      where: {
        roomNumber_key: {
          roomNumber,
          key,
        },
      },
      update: {
        value,
        category,
        description,
        updatedAt: new Date(),
        updatedBy: session.userId,
      },
      create: {
        roomNumber,
        key,
        value,
        category,
        description,
        updatedAt: new Date(),
        updatedBy: session.userId,
      },
    });

    console.log('✅ Room info saved successfully:', roomInfo);

    return NextResponse.json(roomInfo, { status: 201 });
  } catch (error) {
    console.error('❌ Error creating/updating room info:', error);
    return NextResponse.json(
      { error: 'Failed to save room info: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// DELETE - Delete room information (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const roomNumber = searchParams.get('roomNumber');
    const key = searchParams.get('key');

    if (!roomNumber || !key) {
      return NextResponse.json({ error: 'Room number and key are required' }, { status: 400 });
    }

    await prisma.roomInfo.deleteMany({
      where: {
        roomNumber,
        key,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting room info:', error);
    return NextResponse.json({ error: 'Failed to delete room info' }, { status: 500 });
  }
}
