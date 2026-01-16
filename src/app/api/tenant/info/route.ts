import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

// GET - Fetch all information for the logged-in tenant
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.customerId || !session.tenantId) {
      return NextResponse.json({ error: 'Tenant profile not found' }, { status: 404 });
    }

    // Get tenant's customer info
    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
    });

    if (!customer || !customer.roomNumber) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }

    // Fetch building info (shared by all)
    const buildingInfo = await prisma.buildingInfo.findMany({
      where: { isActive: true },
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
      select: {
        key: true,
        value: true,
        category: true,
        description: true,
      },
    });

    // Fetch room-specific info (private to this room)
    const roomInfo = await prisma.roomInfo.findMany({
      where: { roomNumber: customer.roomNumber },
      orderBy: [{ category: 'asc' }, { key: 'asc' }],
      select: {
        key: true,
        value: true,
        category: true,
        description: true,
      },
    });

    // Fetch tenant's custom server apps
    const tenantServerApps = await prisma.tenantServerApp.findMany({
      where: {
        tenantId: session.tenantId,
        isActive: true,
      },
      orderBy: { name: 'asc' },
    });

    // Format response
    const formattedBuildingInfo = buildingInfo.reduce((acc, item) => {
      acc[item.key] = {
        value: item.value,
        category: item.category,
        description: item.description,
      };
      return acc;
    }, {} as Record<string, any>);

    const formattedRoomInfo = roomInfo.reduce((acc, item) => {
      acc[item.key] = {
        value: item.value,
        category: item.category,
        description: item.description,
      };
      return acc;
    }, {} as Record<string, any>);

    return NextResponse.json({
      roomNumber: customer.roomNumber,
      entryDate: customer.entryDate,
      buildingInfo: formattedBuildingInfo,
      roomInfo: formattedRoomInfo,
      serverApps: tenantServerApps,
    });
  } catch (error) {
    console.error('Error fetching tenant info:', error);
    return NextResponse.json({ error: 'Failed to fetch info' }, { status: 500 });
  }
}
