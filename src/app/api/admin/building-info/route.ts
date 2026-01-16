import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

// GET - Fetch all building information (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const buildingInfo = await prisma.buildingInfo.findMany({
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

    return NextResponse.json(buildingInfo);
  } catch (error) {
    console.error('Error fetching building info:', error);
    return NextResponse.json({ error: 'Failed to fetch building info' }, { status: 500 });
  }
}

// POST - Create or update building information (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { key, value, category, description, isActive } = body;

    if (!key || !value || !category) {
      return NextResponse.json(
        { error: 'Key, value, and category are required' },
        { status: 400 }
      );
    }

    // Upsert building info
    const buildingInfo = await prisma.buildingInfo.upsert({
      where: { key },
      update: {
        value,
        category,
        description,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
        updatedBy: session.userId,
      },
      create: {
        key,
        value,
        category,
        description,
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
        updatedBy: session.userId,
      },
    });

    return NextResponse.json(buildingInfo, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating building info:', error);
    return NextResponse.json({ error: 'Failed to save building info' }, { status: 500 });
  }
}

// DELETE - Delete building information (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const key = searchParams.get('key');

    if (!key) {
      return NextResponse.json({ error: 'Key is required' }, { status: 400 });
    }

    await prisma.buildingInfo.delete({
      where: { key },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting building info:', error);
    return NextResponse.json({ error: 'Failed to delete building info' }, { status: 500 });
  }
}
