import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.customerId) {
      return NextResponse.json({ error: 'Customer not found' }, { status: 404 });
    }

    // Get recent payments
    const recentPayments = await prisma.transaction.findMany({
      where: {
        customerId: session.customerId,
        type: 'revenue',
      },
      orderBy: { date: 'desc' },
      take: 5,
      select: {
        id: true,
        amount: true,
        date: true,
        status: true,
        receiptUrl: true,
      },
    });

    // Convert dates to ISO strings for JSON serialization
    const formattedPayments = recentPayments.map(payment => ({
      ...payment,
      date: payment.date.toISOString(),
    }));

    // Get total paid
    const totalPaid = await prisma.transaction.aggregate({
      where: {
        customerId: session.customerId,
        type: 'revenue',
        isVerified: true,
      },
      _sum: {
        amount: true,
      },
    });

    return NextResponse.json({
      recentPayments: formattedPayments,
      totalPaid: totalPaid._sum.amount || 0,
    });
  } catch (error) {
    console.error('Error fetching dashboard payments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch payment data' },
      { status: 500 }
    );
  }
}
