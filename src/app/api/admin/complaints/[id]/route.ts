import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import prisma from '@/lib/db';

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getSession();

    if (!session || session.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id: complaintId } = await params;
    const body = await request.json();
    const { status, adminReply } = body;

    if (!complaintId) {
      return NextResponse.json(
        { error: 'Complaint ID is required' },
        { status: 400 }
      );
    }

    const validStatuses = ['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED'];

    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Update complaint
    const complaint = await prisma.complaint.update({
      where: { id: complaintId },
      data: {
        status,
        adminReply: adminReply || null,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Complaint updated successfully',
      complaint,
    });
  } catch (error) {
    console.error('Complaint update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
