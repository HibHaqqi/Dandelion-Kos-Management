import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function POST(request: NextRequest) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.customerId || !session.tenantId) {
      return NextResponse.json(
        { error: 'Tenant profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { amount, date, receiptUrl } = body;

    // Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid payment amount' },
        { status: 400 }
      );
    }

    if (!date) {
      return NextResponse.json(
        { error: 'Payment date is required' },
        { status: 400 }
      );
    }

    if (!receiptUrl) {
      return NextResponse.json(
        { error: 'Payment receipt is required' },
        { status: 400 }
      );
    }

    // Get customer info
    const customer = await prisma.customer.findUnique({
      where: { id: session.customerId },
    });

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      );
    }

    // Create transaction with PENDING status
    const transaction = await prisma.transaction.create({
      data: {
        type: 'revenue',
        amount,
        date: new Date(date),
        description: `Payment from ${customer.name}`,
        category: 'Room Payment',
        roomNumber: customer.roomNumber,
        customerName: customer.name,
        customerId: customer.id,
        receiptUrl,
        isVerified: false,
        status: 'PENDING',
        userId: session.userId, // Links to tenant user
      },
    });

    // Update customer's last payment date
    await prisma.customer.update({
      where: { id: customer.id },
      data: { lastPayment: new Date(date) },
    });

    // Update room if customer has one
    if (customer.roomNumber) {
      await prisma.room.updateMany({
        where: { roomNumber: customer.roomNumber, userId: customer.userId },
        data: {
          status: 'occupied',
          lastPayment: new Date(date),
        },
      });
    }

    revalidatePath('/tenant/payments');
    revalidatePath('/tenant/dashboard');

    return NextResponse.json(
      {
        message: 'Payment submitted successfully',
        transaction: {
          id: transaction.id,
          amount: transaction.amount,
          date: transaction.date,
          status: transaction.status,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Payment submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
