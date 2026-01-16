import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

// GET - Fetch all tenant server apps configurations (admin only)
export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
      // Fetch all tenants' server apps
      const serverApps = await prisma.tenantServerApp.findMany({
        include: {
          tenant: {
            include: {
              customer: true,
            },
          },
          user: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: [
          { tenant: { customer: { name: 'asc' } } },
          { name: 'asc' },
        ],
      });

      return NextResponse.json(serverApps);
    } else {
      // Fetch server apps for specific tenant
      const serverApps = await prisma.tenantServerApp.findMany({
        where: { tenantId },
        include: {
          tenant: {
            include: {
              customer: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      });

      return NextResponse.json(serverApps);
    }
  } catch (error) {
    console.error('Error fetching tenant server apps:', error);
    return NextResponse.json({ error: 'Failed to fetch tenant server apps' }, { status: 500 });
  }
}

// POST - Create or update tenant server app (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tenantId, appId, name, url, icon, description, category, isActive } = body;

    if (!tenantId || !appId || !name || !url) {
      return NextResponse.json(
        { error: 'Tenant ID, App ID, name, and URL are required' },
        { status: 400 }
      );
    }

    // Verify tenant exists
    const tenant = await prisma.tenant.findUnique({
      where: { id: tenantId },
      include: { customer: true },
    });

    if (!tenant) {
      return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
    }

    // Upsert server app
    const serverApp = await prisma.tenantServerApp.upsert({
      where: {
        tenantId_appId: {
          tenantId,
          appId,
        },
      },
      update: {
        name,
        url,
        icon: icon || '🌐',
        description,
        category: category || 'other',
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
        updatedBy: session.userId,
      },
      create: {
        tenantId,
        appId,
        name,
        url,
        icon: icon || '🌐',
        description,
        category: category || 'other',
        isActive: isActive !== undefined ? isActive : true,
        updatedAt: new Date(),
        updatedBy: session.userId,
      },
    });

    return NextResponse.json(serverApp, { status: 201 });
  } catch (error) {
    console.error('Error creating/updating tenant server app:', error);
    return NextResponse.json(
      { error: 'Failed to save tenant server app: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    );
  }
}

// DELETE - Delete tenant server app (admin only)
export async function DELETE(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Server app ID is required' }, { status: 400 });
    }

    await prisma.tenantServerApp.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting tenant server app:', error);
    return NextResponse.json({ error: 'Failed to delete tenant server app' }, { status: 500 });
  }
}
