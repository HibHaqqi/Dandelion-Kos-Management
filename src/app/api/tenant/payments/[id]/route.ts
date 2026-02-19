import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'TENANT') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!session.customerId) {
      return NextResponse.json(
        { error: 'Tenant profile not found' },
        { status: 404 }
      );
    }

    const { id: paymentId } = await params;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'Payment ID is required' },
        { status: 400 }
      );
    }

    // Get the payment
    const payment = await prisma.transaction.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      return NextResponse.json(
        { error: 'Payment not found' },
        { status: 404 }
      );
    }

    // Verify the payment belongs to this tenant
    if (payment.customerId !== session.customerId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this payment' },
        { status: 403 }
      );
    }

    // Only allow deletion of pending payments
    if (payment.status !== 'PENDING') {
      return NextResponse.json(
        {
          error: 'Cannot delete payment that has been verified or rejected. Please contact administrator.',
        },
        { status: 400 }
      );
    }

    // Delete the payment
    await prisma.transaction.delete({
      where: { id: paymentId },
    });

    // Revalidate paths
    revalidatePath('/tenant/payments');
    revalidatePath('/tenant/dashboard');

    return NextResponse.json({
      success: true,
      message: 'Payment deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Failed to delete payment' },
      { status: 500 }
    );
  }
}
