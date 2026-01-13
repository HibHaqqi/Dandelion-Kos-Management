import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    // Only admins can access this endpoint
    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count open and in-progress complaints
    const openCount = await prisma.complaint.count({
      where: {
        status: {
          in: ['OPEN', 'IN_PROGRESS'], // Only active complaints
        },
      },
    });

    return NextResponse.json({ count: openCount });
  } catch (error) {
    console.error('Failed to fetch open complaints count:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
