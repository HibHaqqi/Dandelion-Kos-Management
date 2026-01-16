import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { transactionId, status, rejectionReason } = body;

    if (!transactionId || !status) {
      return NextResponse.json(
        { error: 'Transaction ID and status are required' },
        { status: 400 }
      );
    }

    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be VERIFIED or REJECTED' },
        { status: 400 }
      );
    }

    if (status === 'REJECTED' && !rejectionReason) {
      return NextResponse.json(
        { error: 'Rejection reason is required when rejecting a payment' },
        { status: 400 }
      );
    }

    // Get the original transaction
    const originalTransaction = await prisma.transaction.findUnique({
      where: { id: transactionId },
    });

    if (!originalTransaction) {
      return NextResponse.json(
        { error: 'Transaction not found' },
        { status: 404 }
      );
    }

    // Update transaction status
    const transaction = await prisma.transaction.update({
      where: { id: transactionId },
      data: {
        status,
        isVerified: status === 'VERIFIED',
        rejectionReason: status === 'REJECTED' ? rejectionReason : null,
      },
    });

    // If verified, update room and customer last payment dates
    if (status === 'VERIFIED') {
      // Update room and customer last payment dates
      if (originalTransaction.roomNumber) {
        await prisma.room.updateMany({
          where: { roomNumber: originalTransaction.roomNumber },
          data: {
            status: 'occupied',
            lastPayment: originalTransaction.date,
          },
        });
      }

      if (originalTransaction.customerId) {
        await prisma.customer.update({
          where: { id: originalTransaction.customerId },
          data: { lastPayment: originalTransaction.date },
        });
      }
    }

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json(
      { error: 'Failed to verify payment' },
      { status: 500 }
    );
  }
}
