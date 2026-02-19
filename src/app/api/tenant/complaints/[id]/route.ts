import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function DELETE(
  _request: NextRequest,
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

    const { id: complaintId } = await params;

    if (!complaintId) {
      return NextResponse.json(
        { error: 'Complaint ID is required' },
        { status: 400 }
      );
    }

    // Check if complaint exists and belongs to this tenant
    const complaint = await prisma.complaint.findUnique({
      where: { id: complaintId },
    });

    if (!complaint) {
      return NextResponse.json(
        { error: 'Complaint not found' },
        { status: 404 }
      );
    }

    // Verify the complaint belongs to this tenant
    if (complaint.customerId !== session.customerId) {
      return NextResponse.json(
        { error: 'Unauthorized to delete this complaint' },
        { status: 403 }
      );
    }

    // Only allow deletion of OPEN complaints (not being processed)
    if (complaint.status !== 'OPEN') {
      return NextResponse.json(
        {
          error: 'Cannot delete complaint that is being processed or has been resolved. Please contact administrator.',
        },
        { status: 400 }
      );
    }

    // Delete complaint
    await prisma.complaint.delete({
      where: { id: complaintId },
    });

    // Revalidate paths
    revalidatePath('/tenant/complaints');
    revalidatePath('/admin/complaints');

    return NextResponse.json({
      success: true,
      message: 'Complaint deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting complaint:', error);
    return NextResponse.json(
      { error: 'Failed to delete complaint' },
      { status: 500 }
    );
  }
}
