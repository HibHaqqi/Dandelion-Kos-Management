import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count pending payments with receipts
    const pendingCount = await prisma.transaction.count({
      where: {
        type: 'revenue',
        status: 'PENDING',
        receiptUrl: {
          not: null,
        },
      },
    });

    return NextResponse.json({ count: pendingCount });
  } catch (error) {
    console.error('Error fetching pending payments count:', error);
    return NextResponse.json(
      { error: 'Failed to fetch pending payments count' },
      { status: 500 }
    );
  }
}
